"use client";

import { useMemo, useState } from "react";
import { NFL_PROPS_WEEK1, type PropRow } from "@/data/nflPropsWeek1";

type SortKey =
  | "player"
  | "pass_yds"
  | "opp_pass_rk"
  | "rush_yds"
  | "opp_rush_rk"
  | "rec_yds"
  | "opp_rec_rk";

type PosFilter = "ALL" | "QB" | "RB" | "WR" | "TE";

export default function NflPropsPage() {
  const [pos, setPos] = useState<PosFilter>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("pass_yds");
  const [sortAsc, setSortAsc] = useState(false);

  const rows = useMemo(() => {
    let list: PropRow[] = [...NFL_PROPS_WEEK1];
    if (pos !== "ALL") list = list.filter((r) => r.pos === pos);

    list.sort((a, b) => {
      // When sorting a yards or matchup column, push players with no
      // relevant projection to the bottom (e.g. RBs when sorting Pass).
      const aRelevant =
        sortKey === "pass_yds" || sortKey === "opp_pass_rk"
          ? a.pass_yds > 0
          : sortKey === "rush_yds" || sortKey === "opp_rush_rk"
            ? a.rush_yds > 0
            : sortKey === "rec_yds" || sortKey === "opp_rec_rk"
              ? a.rec_yds > 0
              : true;
      const bRelevant =
        sortKey === "pass_yds" || sortKey === "opp_pass_rk"
          ? b.pass_yds > 0
          : sortKey === "rush_yds" || sortKey === "opp_rush_rk"
            ? b.rush_yds > 0
            : sortKey === "rec_yds" || sortKey === "opp_rec_rk"
              ? b.rec_yds > 0
              : true;

      if (aRelevant !== bRelevant) return aRelevant ? -1 : 1;

      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "string" && typeof bv === "string") {
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortAsc
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number);
    });
    return list;
  }, [pos, sortKey, sortAsc]);

  function toggle(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      // ranks: low (tough) first by default; yards: high first
      setSortAsc(key.includes("rk"));
    }
  }

  function arrow(key: SortKey) {
    if (sortKey !== key) return "";
    return sortAsc ? " ▲" : " ▼";
  }

  const posBtns: PosFilter[] = ["ALL", "QB", "RB", "WR", "TE"];

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <a href="/" className="text-zinc-400 hover:text-white text-sm">
            ← Back to Dashboard
          </a>
          <h1 className="text-3xl font-bold mt-4">NFL Player Props</h1>
          <p className="text-zinc-400 mt-2">
            Week 1 projections — Clay baseline adjusted for opponent defense and
            home/road. Opp rank 1 = toughest defense.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {posBtns.map((p) => (
            <button
              key={p}
              onClick={() => setPos(p)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                pos === p
                  ? "bg-emerald-600 border-emerald-500 text-white"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-zinc-800 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900 text-zinc-400">
              <tr>
                <th
                  className="text-left px-3 py-3 cursor-pointer hover:text-white whitespace-nowrap"
                  onClick={() => toggle("player")}
                >
                  Player{arrow("player")}
                </th>
                <th className="text-left px-2 py-3">Pos</th>
                <th className="text-left px-2 py-3">Team</th>
                <th className="text-left px-2 py-3">Opponent</th>
                <th
                  className="text-right px-2 py-3 cursor-pointer hover:text-white whitespace-nowrap"
                  onClick={() => toggle("pass_yds")}
                >
                  Pass{arrow("pass_yds")}
                </th>
                <th
                  className="text-right px-2 py-3 cursor-pointer hover:text-white whitespace-nowrap"
                  onClick={() => toggle("opp_pass_rk")}
                >
                  vs Pass{arrow("opp_pass_rk")}
                </th>
                <th
                  className="text-right px-2 py-3 cursor-pointer hover:text-white whitespace-nowrap"
                  onClick={() => toggle("rush_yds")}
                >
                  Rush{arrow("rush_yds")}
                </th>
                <th
                  className="text-right px-2 py-3 cursor-pointer hover:text-white whitespace-nowrap"
                  onClick={() => toggle("opp_rush_rk")}
                >
                  vs Rush{arrow("opp_rush_rk")}
                </th>
                <th
                  className="text-right px-2 py-3 cursor-pointer hover:text-white whitespace-nowrap"
                  onClick={() => toggle("rec_yds")}
                >
                  Rec{arrow("rec_yds")}
                </th>
                <th
                  className="text-right px-2 py-3 cursor-pointer hover:text-white whitespace-nowrap"
                  onClick={() => toggle("opp_rec_rk")}
                >
                  vs Rec{arrow("opp_rec_rk")}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={`${r.player}-${r.pos}`}
                  className="border-t border-zinc-800 hover:bg-zinc-900/50"
                >
                  <td className="px-3 py-2.5 font-medium whitespace-nowrap">
                    {r.player}
                  </td>
                  <td className="px-2 py-2.5 text-zinc-400">{r.pos}</td>
                  <td className="px-2 py-2.5 text-zinc-300 whitespace-nowrap">
                    {r.team.replace(/^(Los Angeles|New York|New England|Green Bay|San Francisco|Tampa Bay|Kansas City)/, (m) =>
                      m === "Los Angeles" ? "LA" :
                      m === "New York" ? "NY" :
                      m === "New England" ? "NE" :
                      m === "Green Bay" ? "GB" :
                      m === "San Francisco" ? "SF" :
                      m === "Tampa Bay" ? "TB" :
                      m === "Kansas City" ? "KC" : m
                    )}
                  </td>
                  <td className="px-2 py-2.5 text-zinc-400 whitespace-nowrap text-xs">
                    {r.opponent}
                  </td>
                  <td className="px-2 py-2.5 text-right font-semibold text-emerald-400">
                    {r.pass_yds || "—"}
                  </td>
                  <td className="px-2 py-2.5 text-right text-zinc-500">
                    {r.opp_pass_rk}
                  </td>
                  <td className="px-2 py-2.5 text-right font-semibold text-sky-400">
                    {r.rush_yds || "—"}
                  </td>
                  <td className="px-2 py-2.5 text-right text-zinc-500">
                    {r.opp_rush_rk}
                  </td>
                  <td className="px-2 py-2.5 text-right font-semibold text-amber-400">
                    {r.rec_yds || "—"}
                  </td>
                  <td className="px-2 py-2.5 text-right text-zinc-500">
                    {r.opp_rec_rk}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-zinc-500 mt-4">
          Rank 1 = fewest yards allowed (hardest matchup). Pass/rush/rec yards are
          matchup-adjusted projections for Week 1 only. Soft spots: sort vs Pass or
          vs Rush descending (28–32).
        </p>
      </div>
    </main>
  );
}