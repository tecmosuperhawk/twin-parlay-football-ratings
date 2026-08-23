"use client";

import { useMemo, useState } from "react";
import { NFL_DEFENSE_2026 } from "@/data/nflDefense2026";

type SortKey = "typg" | "pypg" | "rypg" | "pa_pg" | "clay_def_rk";

export default function NflDefensePage() {
  const [sortKey, setSortKey] = useState<SortKey>("typg");
  const [sortAsc, setSortAsc] = useState(true); // lower = better

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
      setSortAsc(true);
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
          <h1 className="text-3xl font-bold mt-4">NFL Team Defense Rankings</h1>
          <p className="text-zinc-400 mt-2">
            Blended: VSiN 2025 yards allowed (primary) + Mike Clay 2026 def
            projection (soft adjustment). Lower is better.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900 text-zinc-400">
              <tr>
                <th className="text-left px-3 py-3">#</th>
                <th className="text-left px-3 py-3">Team</th>
                <th
                  className="text-right px-3 py-3 cursor-pointer hover:text-white"
                  onClick={() => toggle("typg")}
                >
                  Yds Allowed/G{arrow("typg")}
                </th>
                <th
                  className="text-right px-3 py-3 cursor-pointer hover:text-white"
                  onClick={() => toggle("pypg")}
                >
                  Pass Yds/G{arrow("pypg")}
                </th>
                <th
                  className="text-right px-3 py-3 cursor-pointer hover:text-white"
                  onClick={() => toggle("rypg")}
                >
                  Rush Yds/G{arrow("rypg")}
                </th>
                <th
                  className="text-right px-3 py-3 cursor-pointer hover:text-white"
                  onClick={() => toggle("pa_pg")}
                >
                  PA/G{arrow("pa_pg")}
                </th>
                <th
                  className="text-right px-3 py-3 cursor-pointer hover:text-white"
                  onClick={() => toggle("clay_def_rk")}
                >
                  Clay Rk{arrow("clay_def_rk")}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.team}
                  className="border-t border-zinc-800 hover:bg-zinc-900/50"
                >
                  <td className="px-3 py-2.5 text-zinc-500">{i + 1}</td>
                  <td className="px-3 py-2.5 font-medium">{r.team}</td>
                  <td className="px-3 py-2.5 text-right font-semibold text-emerald-400">
                    {r.typg.toFixed(1)}
                  </td>
                  <td className="px-3 py-2.5 text-right">{r.pypg.toFixed(1)}</td>
                  <td className="px-3 py-2.5 text-right">{r.rypg.toFixed(1)}</td>
                  <td className="px-3 py-2.5 text-right">{r.pa_pg.toFixed(1)}</td>
                  <td className="px-3 py-2.5 text-right text-zinc-400">
                    {r.clay_def_rk}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-zinc-500 mt-4">
          VSiN 2025 allowed yards weighted ~65–70%; Clay 2026 def rank/PA used
          as a capped adjustment. Sort any column. Example edge later: Bijan vs
          a high Rush Yds/G allowed defense.
        </p>
      </div>
    </main>
  );
}