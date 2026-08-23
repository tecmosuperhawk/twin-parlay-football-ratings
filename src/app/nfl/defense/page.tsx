"use client";

import { useMemo, useState } from "react";
import { NFL_DEFENSE_2026 } from "@/data/nflDefense2026";

type SortKey = "def_rk" | "pa_pg";

export default function NflDefensePage() {
  const [sortKey, setSortKey] = useState<SortKey>("def_rk");
  const [sortAsc, setSortAsc] = useState(true); // rank 1 first

  const rows = useMemo(() => {
    const list = [...NFL_DEFENSE_2026];
    list.sort((a, b) =>
      sortAsc ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]
    );
    return list;
  }, [sortKey, sortAsc]);

  function toggle(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(key === "def_rk"); // default asc for rank, desc for PA
    }
  }

  function arrow(key: SortKey) {
    if (sortKey !== key) return "";
    return sortAsc ? " ▲" : " ▼";
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <a href="/" className="text-zinc-400 hover:text-white text-sm">
            ← Back to Dashboard
          </a>
          <h1 className="text-3xl font-bold mt-4">NFL Team Defense Rankings</h1>
          <p className="text-zinc-400 mt-2">
            Mike Clay 2026 projections. Def Rank 1 = best. PA/G = points
            allowed per game. Pass/rush yards allowed will be layered in from
            other sources later.
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
                  onClick={() => toggle("def_rk")}
                >
                  Def Rank{arrow("def_rk")}
                </th>
                <th
                  className="text-right px-4 py-3 cursor-pointer hover:text-white"
                  onClick={() => toggle("pa_pg")}
                >
                  PA/G{arrow("pa_pg")}
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
                    {r.def_rk}
                  </td>
                  <td className="px-4 py-2.5 text-right">{r.pa_pg.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-zinc-500 mt-4">
          Source: Mike Clay ESPN projections (8/19/2026). Lower Def Rank and
          lower PA/G = stronger defense.
        </p>
      </div>
    </main>
  );
}