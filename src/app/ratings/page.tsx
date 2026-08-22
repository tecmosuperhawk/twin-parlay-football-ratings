"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";

type RatingRow = {
  team: string;
  blended: number | null;
  makinen: number | null;
  steele: number | null;
  sp_plus: number | null;
  massey: number | null;
  hfa: number | null;
  rank: number | null;
};

type SortKey = "rank" | "blended" | "makinen" | "steele" | "sp_plus" | "massey" | "hfa";

export default function RatingsPage() {
  const [ratings, setRatings] = useState<RatingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    async function load() {
      // Get teams
      const { data: teams, error: teamsError } = await supabase
        .from("teams")
        .select("id, name, hfa");

      if (teamsError || !teams) {
        console.error(teamsError);
        setLoading(false);
        return;
      }

      // Get all ratings
      const { data: ratingRows, error: ratingsError } = await supabase
        .from("ratings")
        .select("team_id, source, value, rank");

      if (ratingsError || !ratingRows) {
        console.error(ratingsError);
        setLoading(false);
        return;
      }

      // Pivot into one row per team
      const mapped: RatingRow[] = teams.map((t) => {
        const teamRatings = ratingRows.filter((r) => r.team_id === t.id);
        const get = (source: string) =>
          teamRatings.find((r) => r.source === source)?.value ?? null;
        const rank =
          teamRatings.find((r) => r.source === "blended")?.rank ?? null;

        return {
          team: t.name,
          blended: get("blended"),
          makinen: get("makinen"),
          steele: get("steele"),
          sp_plus: get("sp_plus"),
          massey: get("massey"),
          hfa: t.hfa,
          rank,
        };
      });

      // Sort by rank by default
      mapped.sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
      setRatings(mapped);
      setLoading(false);
    }

    load();
  }, []);

  const sorted = useMemo(() => {
    const copy = [...ratings];
    copy.sort((a, b) => {
      const aVal = a[sortKey] ?? -999;
      const bVal = b[sortKey] ?? -999;
      if (sortDir === "asc") return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    });
    return copy;
  }, [ratings, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
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
          <h1 className="text-3xl font-bold">Power Ratings</h1>
          <p className="text-zinc-400 mt-2">
            Live blended ratings from Makinen, Phil Steele, ESPN SP+, and Massey
          </p>
        </div>

        {loading ? (
          <p className="text-zinc-400">Loading ratings…</p>
        ) : (
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
                    <SortHeader label="Blended" field="blended" />
                    <SortHeader label="Makinen" field="makinen" />
                    <SortHeader label="Steele" field="steele" />
                    <SortHeader label="SP+" field="sp_plus" />
                    <SortHeader label="Massey" field="massey" />
                    <SortHeader label="HFA" field="hfa" />
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((r) => (
                    <tr
                      key={r.team}
                      className="border-t border-zinc-800 hover:bg-zinc-900/60"
                    >
                      <td className="px-4 py-2.5 text-zinc-500">
                        {r.rank ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 font-medium">{r.team}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-emerald-400">
                        {r.blended != null
                          ? `${r.blended > 0 ? "+" : ""}${r.blended}`
                          : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right text-zinc-300">
                        {r.makinen ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right text-zinc-300">
                        {r.steele ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right text-zinc-300">
                        {r.sp_plus ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right text-zinc-300">
                        {r.massey ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right text-zinc-500">
                        {r.hfa ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <p className="text-zinc-500 text-xs mt-4">
          Data loaded live from Supabase. Click any column header to sort.
        </p>
      </div>
    </main>
  );
}