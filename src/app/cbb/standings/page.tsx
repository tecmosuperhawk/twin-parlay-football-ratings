"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

type Row = {
  player: string;
  wins: number;
  losses: number;
  pct: string;
};

function todayCT() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Chicago" });
}

export default function Standings() {
  const [overall, setOverall] = useState<Row[]>([]);
  const [month, setMonth] = useState<Row[]>([]);
  const [today, setToday] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);

  async function gradeRecent() {
    setGrading(true);
    const supabase = createClient();

    const dates: string[] = [];
    for (let i = 0; i < 10; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ct = d.toLocaleDateString("en-CA", { timeZone: "America/Chicago" });
      dates.push(ct.replace(/-/g, ""));
    }

    for (const ymd of dates) {
      try {
        const res = await fetch(
          `https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?dates=${ymd}&groups=50`
        );
        const data = await res.json();
        const finals = (data.events || []).filter(
          (e: any) => e.status?.type?.state === "post"
        );
        if (!finals.length) continue;

        const rows = finals.map((e: any) => {
          const c = e.competitions[0];
          const home = c.competitors.find((x: any) => x.homeAway === "home");
          const away = c.competitors.find((x: any) => x.homeAway === "away");
          const hs = Number(home?.score || 0);
          const as_ = Number(away?.score || 0);
          const winner =
            as_ > hs
              ? away?.team.shortDisplayName
              : home?.team.shortDisplayName;
          return {
            id: e.id,
            game_date: `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`,
            tipoff: e.date,
            away_name: away?.team.shortDisplayName || "?",
            home_name: home?.team.shortDisplayName || "?",
            status: "post",
            winner,
          };
        });

        const { error } = await supabase
          .from("cbb_games")
          .upsert(rows, { onConflict: "id" });
        if (error) console.error("grade error", ymd, error);
      } catch (err) {
        console.error("grade fetch error", ymd, err);
      }
    }

    const { data: finished } = await supabase
      .from("cbb_games")
      .select("id, away_name")
      .eq("status", "post")
      .not("winner", "is", null)
      .not("away_name", "is", null);

    if (finished?.length) {
      const ids = finished.map((g: any) => g.id);
      const { data: existing } = await supabase
        .from("cbb_picks")
        .select("game_id, player")
        .in("game_id", ids);

      const have = new Set(
        (existing || []).map((p: any) => `${p.game_id}:${p.player}`)
      );

      const defaults: any[] = [];
      for (const g of finished) {
        for (const name of ["Andy", "Brett", "Brayden"]) {
          if (!have.has(`${g.id}:${name}`)) {
            defaults.push({
              game_id: g.id,
              player: name,
              pick: g.away_name,
              is_default: true,
            });
          }
        }
      }

      if (defaults.length) {
        await supabase.from("cbb_picks").upsert(defaults, {
          onConflict: "game_id,player",
          ignoreDuplicates: true,
        });
      }
    }

    setGrading(false);
  }

  async function loadStandings() {
    const supabase = createClient();

    const { data: games } = await supabase
      .from("cbb_games")
      .select("id, game_date, winner")
      .not("winner", "is", null);

    let allPicks: any[] = [];
    let from = 0;
    const pageSize = 1000;
    while (true) {
      const { data, error } = await supabase
        .from("cbb_picks")
        .select("*")
        .range(from, from + pageSize - 1);
      if (error || !data?.length) break;
      allPicks = allPicks.concat(data);
      if (data.length < pageSize) break;
      from += pageSize;
    }
    const safePicks = allPicks;
    const safeGames = games ?? [];

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const todayStr = todayCT();

    function calc(filter?: string | Date): Row[] {
      let cutoff: string | null = null;
      let exact: string | null = null;

      if (filter instanceof Date) {
        cutoff = filter.toISOString().slice(0, 10);
      } else if (typeof filter === "string") {
        exact = filter;
      }

      const filteredGames = safeGames.filter((g) => {
        if (exact) return g.game_date === exact;
        if (cutoff) return g.game_date >= cutoff;
        return true;
      });

      const gameMap = Object.fromEntries(
        filteredGames.map((g) => [g.id, g.winner])
      );

      const stats: Record<string, { w: number; l: number }> = {
        Andy: { w: 0, l: 0 },
        Brett: { w: 0, l: 0 },
        Brayden: { w: 0, l: 0 },
      };

      safePicks.forEach((p) => {
        const winner = gameMap[p.game_id];
        if (!winner) return;
        if (p.pick === winner) stats[p.player].w++;
        else stats[p.player].l++;
      });

      return Object.entries(stats)
        .map(([player, s]) => ({
          player,
          wins: s.w,
          losses: s.l,
          pct:
            s.w + s.l === 0
              ? "—"
              : ((s.w / (s.w + s.l)) * 100).toFixed(1) + "%",
        }))
        .sort((a, b) => b.wins - a.wins || a.losses - b.losses);
    }

    setOverall(calc());
    setMonth(calc(monthStart));
    setToday(calc(todayStr));
  }

  useEffect(() => {
    async function init() {
      await gradeRecent();
      await loadStandings();
      setLoading(false);
    }
    init();
  }, []);

  async function refresh() {
    setLoading(true);
    await gradeRecent();
    await loadStandings();
    setLoading(false);
  }

  function Table({ title, rows }: { title: string; rows: Row[] }) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900 text-zinc-400">
              <tr>
                <th className="text-left px-4 py-2">Player</th>
                <th className="text-right px-4 py-2">W</th>
                <th className="text-right px-4 py-2">L</th>
                <th className="text-right px-4 py-2">Pct</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.player} className="border-t border-zinc-800">
                  <td className="px-4 py-2">{r.player}</td>
                  <td className="text-right px-4 py-2">{r.wins}</td>
                  <td className="text-right px-4 py-2">{r.losses}</td>
                  <td className="text-right px-4 py-2">{r.pct}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <a href="/" className="text-zinc-400 text-sm hover:text-white">
              ← Dashboard
            </a>
            <h1 className="text-3xl font-bold mt-2">Standings</h1>
          </div>
          <div className="flex gap-2">
            <a
              href="/cbb"
              className="text-sm px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700"
            >
              Make Picks
            </a>
            <a
              href="/cbb/picks"
              className="text-sm px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700"
            >
              Group Picks
            </a>
            <button
              onClick={refresh}
              disabled={loading || grading}
              className="text-sm px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50"
            >
              {grading ? "Grading…" : "Refresh"}
            </button>
          </div>
        </div>
        {loading ? (
          <p className="text-zinc-500">Loading…</p>
        ) : (
          <>
            <Table title="Today" rows={today} />
            <Table title="This Month" rows={month} />
            <Table title="Season" rows={overall} />
          </>
        )}
      </div>
    </main>
  );
}