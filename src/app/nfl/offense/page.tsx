"use client";

import { useMemo, useState } from "react";
import { NFL_OFFENSE_2026, type NflOffenseRow } from "@/data/nflOffense2026";

type SortKey = "total_pg" | "pass_pg" | "rush_pg" | "ppg";

export default function NflOffensePage() {
  const [sortKey, setSortKey] = useState<SortKey>("total_pg");
  const [sortAsc, setSortAsc] = useState(false);

  const rows = useMemo(() => {
    const list = [...NFL_OFFENSE_2026];
    list.sort((a, b) =>
      sortAsc ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]
    );
    return list;
  }, [sortKey, sortAsc]);

  function toggle(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  function arrow(key: SortKey) {
    if (sortKey !== key) return "";
    return sortAsc ? " ▲" : " ▼";
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <a href="/" className="text-zinc-400 hover:text-white text-sm">
            ← Back to Dashboard
          </a>
          <h1 className="text-3xl font-bold mt-4">NFL Team Offense Rankings</h1>
          <p className="text-zinc-400 mt-2">
            Mike Clay 2026 projections (per game, 17-game season). Sort by any
            column. VSiN/BetUS 2025 form will be used later as small bumps only.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900 text-zinc-400">
              <tr>
                <th className="text-left px-4 py-3">#</th>
                <th className="text-left px-4 py-3">Team</th>
                <th
                  className="text-right px-4 py-3 cursor-pointer hover:text-white"
                  onClick={() => toggle("total_pg")}
                >
                  Total Yds/G{arrow("total_pg")}
                </th>
                <th
                  className="text-right px-4 py-3 cursor-pointer hover:text-white"
                  onClick={() => toggle("pass_pg")}
                >
                  Pass Yds/G{arrow("pass_pg")}
                </th>
                <th
                  className="text-right px-4 py-3 cursor-pointer hover:text-white"
                  onClick={() => toggle("rush_pg")}
                >
                  Rush Yds/G{arrow("rush_pg")}
                </th>
                <th
                  className="text-right px-4 py-3 cursor-pointer hover:text-white"
                  onClick={() => toggle("ppg")}
                >
                  PPG{arrow("ppg")}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.team}
                  className="border-t border-zinc-800 hover:bg-zinc-900/50"
                >
                  <td className="px-4 py-2.5 text-zinc-500">{i + 1}</td>
                  <td className="px-4 py-2.5 font-medium">{r.team}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-emerald-400">
                    {r.total_pg.toFixed(1)}
                  </td>
                  <td className="px-4 py-2.5 text-right">{r.pass_pg.toFixed(1)}</td>
                  <td className="px-4 py-2.5 text-right">{r.rush_pg.toFixed(1)}</td>
                  <td className="px-4 py-2.5 text-right">{r.ppg.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-zinc-500 mt-4">
          Source: Mike Clay ESPN Fantasy projections (updated 8/19/2026). Pass =
          team pass yards; Rush = RB + QB rush.
        </p>
      </div>
    </main>
  );
}