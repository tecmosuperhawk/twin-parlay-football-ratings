"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

type Row = {
  player: string;
  wins: number;
  losses: number;
  pct: string;
};

export default function Standings() {
  const [overall, setOverall] = useState<Row[]>([]);
  const [month, setMonth] = useState<Row[]>([]);
  const [week, setWeek] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);

  async function gradeRecent() {
    setGrading(true);
    const supabase = createClient();

    // Check the last 7 days
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().slice(0, 10).replace(/-/g, ""));
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

        await supabase.from("cbb_games").upsert(rows, { onConflict: "id" });
      } catch {}
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
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());

function calc(filterDate?: Date): Row[] {
  const cutoff = filterDate
    ? filterDate.toISOString().slice(0, 10)
    : null;

  const filteredGames = safeGames.filter((g) =>
    cutoff ? g.game_date >= cutoff : true
  );
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
    setWeek(calc(weekStart));
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
            <a href="/cbb" className="text-zinc-400 text-sm hover:text-white">
              ← Pick'em
            </a>
            <h1 className="text-3xl font-bold mt-2">Standings</h1>
          </div>
          <button
            onClick={refresh}
            disabled={loading || grading}
            className="text-sm px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50"
          >
            {grading ? "Grading…" : "Refresh"}
          </button>
        </div>
        {loading ? (
          <p className="text-zinc-500">Loading…</p>
        ) : (
          <>
            <Table title="This Week" rows={week} />
            <Table title="This Month" rows={month} />
            <Table title="Season" rows={overall} />
          </>
        )}
      </div>
    </main>
  );
}