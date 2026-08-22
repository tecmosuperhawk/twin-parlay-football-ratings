"use client";

import { useState, useMemo } from "react";

const ratings = [
  { rank: 1, team: "Ohio State", blended_z: 2.26, makinen: 71.0, steele: 66.3, sp_plus: 32.7, massey: 80.5, hfa: 3.5 },
  { rank: 2, team: "Oregon", blended_z: 2.04, makinen: 68.5, steele: 65.9, sp_plus: 29.2, massey: 76.1, hfa: 3.5 },
  { rank: 3, team: "Notre Dame", blended_z: 2.01, makinen: 68.5, steele: 66.0, sp_plus: 26.5, massey: 76.8, hfa: 3.5 },
  { rank: 4, team: "Indiana", blended_z: 1.98, makinen: 66.0, steele: 65.6, sp_plus: 25.8, massey: 79.0, hfa: 3.5 },
  { rank: 5, team: "Georgia", blended_z: 1.91, makinen: 67.5, steele: 65.0, sp_plus: 26.4, massey: 74.2, hfa: 2.5 },
  { rank: 6, team: "Texas", blended_z: 1.74, makinen: 66.0, steele: 64.7, sp_plus: 22.8, massey: 71.1, hfa: 3.5 },
  { rank: 7, team: "Miami", blended_z: 1.61, makinen: 63.0, steele: 62.8, sp_plus: 22.0, massey: 70.5, hfa: 3.0 },
  { rank: 8, team: "Texas Tech", blended_z: 1.54, makinen: 61.5, steele: 60.8, sp_plus: 21.8, massey: 70.8, hfa: 3.5 },
  { rank: 9, team: "Texas A&M", blended_z: 1.47, makinen: 62.5, steele: 60.5, sp_plus: 20.9, massey: 67.8, hfa: 2.0 },
  { rank: 10, team: "Alabama", blended_z: 1.45, makinen: 61.0, steele: 60.0, sp_plus: 17.6, massey: 71.7, hfa: 3.5 },
  { rank: 11, team: "Ole Miss", blended_z: 1.43, makinen: 60.5, steele: null, sp_plus: 16.5, massey: 72.0, hfa: 2.0 },
  { rank: 12, team: "Oklahoma", blended_z: 1.42, makinen: 61.0, steele: 61.5, sp_plus: 18.8, massey: 67.7, hfa: 3.0 },
  { rank: 13, team: "USC", blended_z: 1.39, makinen: 60.0, steele: 60.8, sp_plus: 17.7, massey: 68.7, hfa: 3.0 },
  { rank: 14, team: "Michigan", blended_z: 1.34, makinen: 59.0, steele: 58.6, sp_plus: 17.0, massey: 70.2, hfa: 3.5 },
  { rank: 15, team: "LSU", blended_z: 1.31, makinen: 60.5, steele: 58.7, sp_plus: 20.4, massey: 64.5, hfa: 2.5 },
  { rank: 16, team: "Penn State", blended_z: 1.31, makinen: 57.0, steele: 58.2, sp_plus: 16.2, massey: 71.6, hfa: 3.5 },
  { rank: 17, team: "Tennessee", blended_z: 1.23, makinen: 57.0, steele: 56.9, sp_plus: 17.3, massey: 68.2, hfa: 3.0 },
  { rank: 18, team: "Washington", blended_z: 1.22, makinen: 56.5, steele: 58.7, sp_plus: 15.8, massey: 68.2, hfa: 3.5 },
  { rank: 19, team: "BYU", blended_z: 1.16, makinen: 57.5, steele: 58.5, sp_plus: 14.9, massey: 65.4, hfa: 3.5 },
  { rank: 20, team: "Iowa", blended_z: 1.14, makinen: 55.5, steele: 57.0, sp_plus: 14.6, massey: 67.7, hfa: 3.5 },
  { rank: 21, team: "Utah", blended_z: 1.06, makinen: 54.5, steele: 55.8, sp_plus: 9.8, massey: 70.4, hfa: 2.5 },
  { rank: 22, team: "SMU", blended_z: 1.01, makinen: 55.5, steele: 56.7, sp_plus: 12.1, massey: 64.3, hfa: 3.5 },
  { rank: 23, team: "Missouri", blended_z: 0.98, makinen: 54.5, steele: 52.9, sp_plus: 15.4, massey: 64.8, hfa: 3.5 },
  { rank: 24, team: "Florida", blended_z: 0.97, makinen: 55.5, steele: 54.7, sp_plus: 15.2, massey: 62.0, hfa: 2.0 },
  { rank: 25, team: "Clemson", blended_z: 0.96, makinen: 54.0, steele: 55.7, sp_plus: 13.1, massey: 63.7, hfa: 2.0 },
];

type SortKey = "rank" | "blended_z" | "makinen" | "steele" | "sp_plus" | "massey" | "hfa";

export default function RatingsPage() {
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sorted = useMemo(() => {
    const copy = [...ratings];
    copy.sort((a, b) => {
      const aVal = a[sortKey] ?? -999;
      const bVal = b[sortKey] ?? -999;
      if (sortDir === "asc") return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    });
    return copy;
  }, [sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      // Rank ascending by default, everything else descending (higher = better)
      setSortDir(key === "rank" ? "asc" : "desc");
    }
  }

  function SortHeader({ label, field }: { label: string; field: SortKey }) {
    const active = sortKey === field;
    return (
      <th
        className="text-right px-4 py-3 font-medium cursor-pointer select-none hover:text-white"
        onClick={() => handleSort(field)}
      >
        <span className="inline-flex items-center gap-1">
          {label}
          {active && (
            <span className="text-emerald-400 text-xs">
              {sortDir === "asc" ? "▲" : "▼"}
            </span>
          )}
        </span>
      </th>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <a href="/" className="text-zinc-400 hover:text-white text-sm">
            &larr; Back to Dashboard
          </a>
          <h1 className="text-3xl font-bold mt-4">Power Ratings</h1>
          <p className="text-zinc-400 mt-2">
            Blended ratings from Makinen, Phil Steele, ESPN SP+, and Massey (Top 25)
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900 text-zinc-400">
                <tr>
                  <th
                    className="text-left px-4 py-3 font-medium cursor-pointer select-none hover:text-white"
                    onClick={() => handleSort("rank")}
                  >
                    <span className="inline-flex items-center gap-1">
                      #
                      {sortKey === "rank" && (
                        <span className="text-emerald-400 text-xs">
                          {sortDir === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </span>
                  </th>
                  <th className="text-left px-4 py-3 font-medium">Team</th>
                  <SortHeader label="Blended" field="blended_z" />
                  <SortHeader label="Makinen" field="makinen" />
                  <SortHeader label="Steele" field="steele" />
                  <SortHeader label="SP+" field="sp_plus" />
                  <SortHeader label="Massey" field="massey" />
                  <SortHeader label="HFA" field="hfa" />
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr key={r.rank} className="border-t border-zinc-800 hover:bg-zinc-900/60">
                    <td className="px-4 py-2.5 text-zinc-500">{r.rank}</td>
                    <td className="px-4 py-2.5 font-medium">{r.team}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-emerald-400">
                      {r.blended_z > 0 ? "+" : ""}
                      {r.blended_z}
                    </td>
                    <td className="px-4 py-2.5 text-right text-zinc-300">{r.makinen}</td>
                    <td className="px-4 py-2.5 text-right text-zinc-300">{r.steele ?? "—"}</td>
                    <td className="px-4 py-2.5 text-right text-zinc-300">{r.sp_plus ?? "—"}</td>
                    <td className="px-4 py-2.5 text-right text-zinc-300">{r.massey ?? "—"}</td>
                    <td className="px-4 py-2.5 text-right text-zinc-500">{r.hfa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-zinc-500 text-xs mt-4">
          Click any column header to sort. Click again to reverse direction.
        </p>
      </div>
    </main>
  );
}