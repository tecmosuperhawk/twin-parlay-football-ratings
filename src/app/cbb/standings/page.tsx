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

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const { data: games } = await supabase
        .from("cbb_games")
        .select("id, game_date, winner")
        .not("winner", "is", null);

      const { data: picks } = await supabase.from("cbb_picks").select("*");

      const safeGames = games ?? [];
      const safePicks = picks ?? [];

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());

      function calc(filterDate?: Date): Row[] {
        const filteredGames = safeGames.filter((g) =>
          filterDate ? new Date(g.game_date) >= filterDate : true
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
      setLoading(false);
    }
    load();
  }, []);

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
        <a href="/cbb" className="text-zinc-400 text-sm hover:text-white">
          ← Pick'em
        </a>
        <h1 className="text-3xl font-bold mt-2 mb-6">Standings</h1>
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