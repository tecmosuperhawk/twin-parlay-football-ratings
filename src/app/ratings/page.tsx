"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";

type RatingRow = {
  team: string;
  conference: string | null;
  blended: number | null;
  makinen: number | null;
  steele: number | null;
  sp_plus: number | null;
  massey: number | null;
  rank: number | null;
};

const CONFERENCES = [
  "All",
  "SEC",
  "Big Ten",
  "Big 12",
  "ACC",
  "American",
  "CUSA",
  "MAC",
  "Mountain West",
  "Pac-12",
  "Sun Belt",
  "Independent",
];

export default function RatingsPage() {
  const [rows, setRows] = useState<RatingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [confFilter, setConfFilter] = useState("All");
  const [sortKey, setSortKey] = useState<"blended" | "makinen" | "steele" | "sp_plus" | "massey">("blended");
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: teams } = await supabase
        .from("teams")
        .select("id, name, conference");

      const { data: ratings } = await supabase
        .from("ratings")
        .select("team_id, source, value, rank");

      if (!teams || !ratings) {
        setLoading(false);
        return;
      }

      const byTeam: Record<string, RatingRow> = {};
      for (const t of teams) {
        byTeam[t.id] = {
          team: t.name,
          conference: t.conference,
          blended: null,
          makinen: null,
          steele: null,
          sp_plus: null,
          massey: null,
          rank: null,
        };
      }

      for (const r of ratings) {
        const row = byTeam[r.team_id];
        if (!row) continue;
        if (r.source === "blended") {
          row.blended = r.value;
          row.rank = r.rank;
        } else if (r.source === "makinen") row.makinen = r.value;
        else if (r.source === "steele") row.steele = r.value;
        else if (r.source === "sp_plus") row.sp_plus = r.value;
        else if (r.source === "massey") row.massey = r.value;
      }

      setRows(Object.values(byTeam).filter((r) => r.blended !== null));
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = rows;
    if (confFilter !== "All") {
      list = list.filter((r) => r.conference === confFilter);
    }
    list = [...list].sort((a, b) => {
      const av = a[sortKey] ?? -999;
      const bv = b[sortKey] ?? -999;
      return sortAsc ? av - bv : bv - av;
    });
    return list;
  }, [rows, confFilter, sortKey, sortAsc]);

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  function fmt(n: number | null) {
    if (n === null) return "—";
    return n.toFixed(1);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <a href="/" className="text-zinc-400 hover:text-white text-sm">
            ← Back to Dashboard
          </a>
          <h1 className="text-3xl font-bold mt-4">Power Ratings</h1>
          <p className="text-zinc-400 mt-2">
            Blended ratings from Makinen, Phil Steele, ESPN SP+, and Massey
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <label className="text-sm text-zinc-400">Conference</label>
          <select
            value={confFilter}
            onChange={(e) => setConfFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
          >
            {CONFERENCES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <span className="text-sm text-zinc-500 ml-2">
            {filtered.length} teams
          </span>
        </div>

        {loading ? (
          <p className="text-zinc-400">Loading…</p>
        ) : (
          <div className="rounded-xl border border-zinc-800 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900 text-zinc-400">
                <tr>
                  <th className="text-left px-4 py-3">#</th>
                  <th className="text-left px-4 py-3">Team</th>
                  <th className="text-left px-4 py-3">Conf</th>
                  <th
                    className="text-right px-4 py-3 cursor-pointer hover:text-white"
                    onClick={() => toggleSort("blended")}
                  >
                    Blended {sortKey === "blended" ? (sortAsc ? "▲" : "▼") : ""}
                  </th>
                  <th
                    className="text-right px-4 py-3 cursor-pointer hover:text-white"
                    onClick={() => toggleSort("makinen")}
                  >
                    Makinen {sortKey === "makinen" ? (sortAsc ? "▲" : "▼") : ""}
                  </th>
                  <th
                    className="text-right px-4 py-3 cursor-pointer hover:text-white"
                    onClick={() => toggleSort("steele")}
                  >
                    Steele {sortKey === "steele" ? (sortAsc ? "▲" : "▼") : ""}
                  </th>
                  <th
                    className="text-right px-4 py-3 cursor-pointer hover:text-white"
                    onClick={() => toggleSort("sp_plus")}
                  >
                    SP+ {sortKey === "sp_plus" ? (sortAsc ? "▲" : "▼") : ""}
                  </th>
                  <th
                    className="text-right px-4 py-3 cursor-pointer hover:text-white"
                    onClick={() => toggleSort("massey")}
                  >
                    Massey {sortKey === "massey" ? (sortAsc ? "▲" : "▼") : ""}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr
                    key={r.team}
                    className="border-t border-zinc-800 hover:bg-zinc-900/50"
                  >
                    <td className="px-4 py-2.5 text-zinc-500">{i + 1}</td>
                    <td className="px-4 py-2.5 font-medium">{r.team}</td>
                    <td className="px-4 py-2.5 text-zinc-400">{r.conference ?? "—"}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-emerald-400">
                      {fmt(r.blended)}
                    </td>
                    <td className="px-4 py-2.5 text-right">{fmt(r.makinen)}</td>
                    <td className="px-4 py-2.5 text-right">{fmt(r.steele)}</td>
                    <td className="px-4 py-2.5 text-right">{fmt(r.sp_plus)}</td>
                    <td className="px-4 py-2.5 text-right">{fmt(r.massey)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}