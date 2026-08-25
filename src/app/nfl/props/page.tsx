"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";

type PropRow = {
  player: string;
  pos: "QB" | "RB" | "WR" | "TE";
  team: string;
  opponent: string;
  pass_yds: number;
  opp_pass_rk: number;
  rush_yds: number;
  opp_rush_rk: number;
  rec_yds: number;
  opp_rec_rk: number;
  fp_pass_yds: number | null;
  fp_rush_yds: number | null;
  fp_rec_yds: number | null;
  fp_pass_att: number | null;
  fp_pass_cmp: number | null;
  fp_pass_tds: number | null;
  fp_rush_att: number | null;
  fp_rush_tds: number | null;
  fp_rec: number | null;
  fp_rec_tds: number | null;
};

type SortKey =
  | "player"
  | "pass_yds"
  | "fp_pass_yds"
  | "opp_pass_rk"
  | "rush_yds"
  | "fp_rush_yds"
  | "opp_rush_rk"
  | "rec_yds"
  | "fp_rec_yds"
  | "opp_rec_rk"
  | "fp_pass_att"
  | "fp_pass_cmp"
  | "fp_pass_tds"
  | "fp_rush_att"
  | "fp_rush_tds"
  | "fp_rec"
  | "fp_rec_tds";

type PosFilter = "ALL" | "QB" | "RB" | "WR" | "TE";

function fmt(n: number | null | undefined, digits = 0) {
  if (n === null || n === undefined) return "—";
  return digits > 0 ? Number(n).toFixed(digits) : String(Math.round(Number(n)));
}

function delta(our: number, fp: number | null) {
  if (fp === null || fp === undefined) return null;
  return our - fp;
}

export default function NflPropsPage() {
  const [data, setData] = useState<PropRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pos, setPos] = useState<PosFilter>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("pass_yds");
  const [sortAsc, setSortAsc] = useState(false);
  const [week] = useState(1);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      const { data: rows, error: err } = await supabase
        .from("nfl_prop_projections")
        .select(
          `
          player_name,
          pos,
          pass_yds,
          rush_yds,
          rec_yds,
          opp_pass_rk,
          opp_rush_rk,
          opp_rec_rk,
          is_home,
          fp_pass_att,
          fp_pass_cmp,
          fp_pass_yds,
          fp_pass_tds,
          fp_pass_ints,
          fp_rush_att,
          fp_rush_yds,
          fp_rush_tds,
          fp_rec,
          fp_rec_yds,
          fp_rec_tds,
          team:team_id(name),
          opponent:opponent_id(name)
        `
        )
        .eq("week", week);

      if (err) {
        setError(err.message);
        setData([]);
        setLoading(false);
        return;
      }

      const mapped: PropRow[] = (rows || []).map((r: any) => {
        const teamName = r.team?.name ?? "?";
        const oppName = r.opponent?.name ?? "?";
        const opponent = r.is_home ? `vs. ${oppName}` : `@ ${oppName}`;
        return {
          player: r.player_name,
          pos: r.pos,
          team: teamName,
          opponent,
          pass_yds: r.pass_yds ?? 0,
          opp_pass_rk: r.opp_pass_rk ?? 0,
          rush_yds: r.rush_yds ?? 0,
          opp_rush_rk: r.opp_rush_rk ?? 0,
          rec_yds: r.rec_yds ?? 0,
          opp_rec_rk: r.opp_rec_rk ?? 0,
          fp_pass_yds: r.fp_pass_yds ?? null,
          fp_rush_yds: r.fp_rush_yds ?? null,
          fp_rec_yds: r.fp_rec_yds ?? null,
          fp_pass_att: r.fp_pass_att ?? null,
          fp_pass_cmp: r.fp_pass_cmp ?? null,
          fp_pass_tds: r.fp_pass_tds ?? null,
          fp_rush_att: r.fp_rush_att ?? null,
          fp_rush_tds: r.fp_rush_tds ?? null,
          fp_rec: r.fp_rec ?? null,
          fp_rec_tds: r.fp_rec_tds ?? null,
        };
      });

      setData(mapped);
      setLoading(false);
    }
    load();
  }, [week]);

  const rows = useMemo(() => {
    let list = [...data];
    if (pos !== "ALL") list = list.filter((r) => r.pos === pos);

    list.sort((a, b) => {
      const aRelevant =
        sortKey === "pass_yds" ||
        sortKey === "fp_pass_yds" ||
        sortKey === "opp_pass_rk" ||
        sortKey === "fp_pass_att" ||
        sortKey === "fp_pass_cmp" ||
        sortKey === "fp_pass_tds"
          ? a.pass_yds > 0 || (a.fp_pass_yds ?? 0) > 0
          : sortKey === "rush_yds" ||
              sortKey === "fp_rush_yds" ||
              sortKey === "opp_rush_rk" ||
              sortKey === "fp_rush_att" ||
              sortKey === "fp_rush_tds"
            ? a.rush_yds > 0 || (a.fp_rush_yds ?? 0) > 0
            : sortKey === "rec_yds" ||
                sortKey === "fp_rec_yds" ||
                sortKey === "opp_rec_rk" ||
                sortKey === "fp_rec" ||
                sortKey === "fp_rec_tds"
              ? a.rec_yds > 0 || (a.fp_rec_yds ?? 0) > 0
              : true;

      const bRelevant =
        sortKey === "pass_yds" ||
        sortKey === "fp_pass_yds" ||
        sortKey === "opp_pass_rk" ||
        sortKey === "fp_pass_att" ||
        sortKey === "fp_pass_cmp" ||
        sortKey === "fp_pass_tds"
          ? b.pass_yds > 0 || (b.fp_pass_yds ?? 0) > 0
          : sortKey === "rush_yds" ||
              sortKey === "fp_rush_yds" ||
              sortKey === "opp_rush_rk" ||
              sortKey === "fp_rush_att" ||
              sortKey === "fp_rush_tds"
            ? b.rush_yds > 0 || (b.fp_rush_yds ?? 0) > 0
            : sortKey === "rec_yds" ||
                sortKey === "fp_rec_yds" ||
                sortKey === "opp_rec_rk" ||
                sortKey === "fp_rec" ||
                sortKey === "fp_rec_tds"
              ? b.rec_yds > 0 || (b.fp_rec_yds ?? 0) > 0
              : true;

      if (aRelevant !== bRelevant) return aRelevant ? -1 : 1;

      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      if (typeof av === "string" && typeof bv === "string") {
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortAsc
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number);
    });
    return list;
  }, [data, pos, sortKey, sortAsc]);

  function toggle(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(key.includes("rk"));
    }
  }

  function arrow(key: SortKey) {
    if (sortKey !== key) return "";
    return sortAsc ? " ▲" : " ▼";
  }

  function setPosFilter(p: PosFilter) {
    setPos(p);
    if (p === "QB") setSortKey("pass_yds");
    else if (p === "RB") setSortKey("rush_yds");
    else if (p === "WR" || p === "TE") setSortKey("rec_yds");
    else setSortKey("pass_yds");
    setSortAsc(false);
  }

  const posBtns: PosFilter[] = ["ALL", "QB", "RB", "WR", "TE"];
  const fpCount = data.filter(
    (r) => r.fp_pass_yds != null || r.fp_rush_yds != null || r.fp_rec_yds != null
  ).length;

  const showPass = pos === "ALL" || pos === "QB";
  const showRush = pos === "ALL" || pos === "QB" || pos === "RB";
  const showRec = pos === "ALL" || pos === "RB" || pos === "WR" || pos === "TE";

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-[95rem] mx-auto px-4 py-10">
        <div className="mb-8">
          <a href="/" className="text-zinc-400 hover:text-white text-sm">
            ← Back to Dashboard
          </a>
          <h1 className="text-3xl font-bold mt-4">NFL Player Props</h1>
          <p className="text-zinc-400 mt-2">
            Week {week} — Our model (Clay + matchup) vs FantasyPros. Opp rank 1 =
            toughest defense.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 items-center">
          {posBtns.map((p) => (
            <button
              key={p}
              onClick={() => setPosFilter(p)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                pos === p
                  ? "bg-emerald-600 border-emerald-500 text-white"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
              }`}
            >
              {p}
            </button>
          ))}
          <span className="text-sm text-zinc-500 ml-2">
            {loading
              ? "Loading…"
              : `${rows.length} shown · ${fpCount} with FP data`}
          </span>
        </div>

        {error && <p className="text-red-400 text-sm mb-4">Error: {error}</p>}

        {loading ? (
          <p className="text-zinc-400">Loading projections…</p>
        ) : (
          <div className="rounded-xl border border-zinc-800 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900 text-zinc-400">
                <tr>
                  <th
                    className="text-left px-3 py-3 cursor-pointer hover:text-white whitespace-nowrap sticky left-0 bg-zinc-900"
                    onClick={() => toggle("player")}
                  >
                    Player{arrow("player")}
                  </th>
                  <th className="text-left px-2 py-3">Pos</th>
                  <th className="text-left px-2 py-3">Team</th>
                  <th className="text-left px-2 py-3">Opp</th>

                  {showPass && (
                    <>
                      <th
                        className="text-right px-2 py-3 cursor-pointer hover:text-white whitespace-nowrap"
                        onClick={() => toggle("pass_yds")}
                      >
                        Pass Our{arrow("pass_yds")}
                      </th>
                      <th
                        className="text-right px-2 py-3 cursor-pointer hover:text-white whitespace-nowrap"
                        onClick={() => toggle("fp_pass_yds")}
                      >
                        Pass FP{arrow("fp_pass_yds")}
                      </th>
                      <th className="text-right px-2 py-3 whitespace-nowrap">
                        Δ Pass
                      </th>
                      <th
                        className="text-right px-2 py-3 cursor-pointer hover:text-white whitespace-nowrap"
                        onClick={() => toggle("fp_pass_att")}
                      >
                        Att{arrow("fp_pass_att")}
                      </th>
                      <th
                        className="text-right px-2 py-3 cursor-pointer hover:text-white whitespace-nowrap"
                        onClick={() => toggle("fp_pass_cmp")}
                      >
                        Cmp{arrow("fp_pass_cmp")}
                      </th>
                      <th
                        className="text-right px-2 py-3 cursor-pointer hover:text-white whitespace-nowrap"
                        onClick={() => toggle("fp_pass_tds")}
                      >
                        Pass TD{arrow("fp_pass_tds")}
                      </th>
                    </>
                  )}

                  {showRush && (
                    <>
                      <th
                        className="text-right px-2 py-3 cursor-pointer hover:text-white whitespace-nowrap"
                        onClick={() => toggle("rush_yds")}
                      >
                        Rush Our{arrow("rush_yds")}
                      </th>
                      <th
                        className="text-right px-2 py-3 cursor-pointer hover:text-white whitespace-nowrap"
                        onClick={() => toggle("fp_rush_yds")}
                      >
                        Rush FP{arrow("fp_rush_yds")}
                      </th>
                      <th
                        className="text-right px-2 py-3 cursor-pointer hover:text-white whitespace-nowrap"
                        onClick={() => toggle("fp_rush_att")}
                      >
                        Ru Att{arrow("fp_rush_att")}
                      </th>
                      <th
                        className="text-right px-2 py-3 cursor-pointer hover:text-white whitespace-nowrap"
                        onClick={() => toggle("fp_rush_tds")}
                      >
                        Ru TD{arrow("fp_rush_tds")}
                      </th>
                    </>
                  )}

                  {showRec && (
                    <>
                      <th
                        className="text-right px-2 py-3 cursor-pointer hover:text-white whitespace-nowrap"
                        onClick={() => toggle("rec_yds")}
                      >
                        Rec Our{arrow("rec_yds")}
                      </th>
                      <th
                        className="text-right px-2 py-3 cursor-pointer hover:text-white whitespace-nowrap"
                        onClick={() => toggle("fp_rec_yds")}
                      >
                        Rec FP{arrow("fp_rec_yds")}
                      </th>
                      <th
                        className="text-right px-2 py-3 cursor-pointer hover:text-white whitespace-nowrap"
                        onClick={() => toggle("fp_rec")}
                      >
                        Rec{arrow("fp_rec")}
                      </th>
                      <th
                        className="text-right px-2 py-3 cursor-pointer hover:text-white whitespace-nowrap"
                        onClick={() => toggle("fp_rec_tds")}
                      >
                        Rec TD{arrow("fp_rec_tds")}
                      </th>
                    </>
                  )}

                  {showPass && (
                    <th
                      className="text-right px-2 py-3 cursor-pointer hover:text-white whitespace-nowrap"
                      onClick={() => toggle("opp_pass_rk")}
                    >
                      vs Pass{arrow("opp_pass_rk")}
                    </th>
                  )}
                  {showRush && (
                    <th
                      className="text-right px-2 py-3 cursor-pointer hover:text-white whitespace-nowrap"
                      onClick={() => toggle("opp_rush_rk")}
                    >
                      vs Rush{arrow("opp_rush_rk")}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const dPass = delta(r.pass_yds, r.fp_pass_yds);
                  return (
                    <tr
                      key={`${r.player}-${r.pos}`}
                      className="border-t border-zinc-800 hover:bg-zinc-900/50"
                    >
                      <td className="px-3 py-2.5 font-medium whitespace-nowrap sticky left-0 bg-zinc-950">
                        {r.player}
                      </td>
                      <td className="px-2 py-2.5 text-zinc-400">{r.pos}</td>
                      <td className="px-2 py-2.5 text-zinc-300 whitespace-nowrap text-xs">
                        {r.team}
                      </td>
                      <td className="px-2 py-2.5 text-zinc-400 whitespace-nowrap text-xs">
                        {r.opponent}
                      </td>

                      {showPass && (
                        <>
                          <td className="px-2 py-2.5 text-right font-semibold text-emerald-400">
                            {r.pass_yds || "—"}
                          </td>
                          <td className="px-2 py-2.5 text-right text-emerald-200/80">
                            {fmt(r.fp_pass_yds, 1)}
                          </td>
                          <td
                            className={`px-2 py-2.5 text-right text-xs ${
                              dPass === null
                                ? "text-zinc-600"
                                : dPass > 5
                                  ? "text-emerald-400"
                                  : dPass < -5
                                    ? "text-red-400"
                                    : "text-zinc-400"
                            }`}
                          >
                            {dPass === null
                              ? "—"
                              : `${dPass > 0 ? "+" : ""}${Math.round(dPass)}`}
                          </td>
                          <td className="px-2 py-2.5 text-right text-zinc-400">
                            {fmt(r.fp_pass_att, 1)}
                          </td>
                          <td className="px-2 py-2.5 text-right text-zinc-400">
                            {fmt(r.fp_pass_cmp, 1)}
                          </td>
                          <td className="px-2 py-2.5 text-right text-zinc-400">
                            {fmt(r.fp_pass_tds, 2)}
                          </td>
                        </>
                      )}

                      {showRush && (
                        <>
                          <td className="px-2 py-2.5 text-right font-semibold text-sky-400">
                            {r.rush_yds || "—"}
                          </td>
                          <td className="px-2 py-2.5 text-right text-sky-200/80">
                            {fmt(r.fp_rush_yds, 1)}
                          </td>
                          <td className="px-2 py-2.5 text-right text-zinc-400">
                            {fmt(r.fp_rush_att, 1)}
                          </td>
                          <td className="px-2 py-2.5 text-right text-zinc-400">
                            {fmt(r.fp_rush_tds, 2)}
                          </td>
                        </>
                      )}

                      {showRec && (
                        <>
                          <td className="px-2 py-2.5 text-right font-semibold text-amber-400">
                            {r.rec_yds || "—"}
                          </td>
                          <td className="px-2 py-2.5 text-right text-amber-200/80">
                            {fmt(r.fp_rec_yds, 1)}
                          </td>
                          <td className="px-2 py-2.5 text-right text-zinc-400">
                            {fmt(r.fp_rec, 1)}
                          </td>
                          <td className="px-2 py-2.5 text-right text-zinc-400">
                            {fmt(r.fp_rec_tds, 2)}
                          </td>
                        </>
                      )}

                      {showPass && (
                        <td className="px-2 py-2.5 text-right text-zinc-500">
                          {r.opp_pass_rk || "—"}
                        </td>
                      )}
                      {showRush && (
                        <td className="px-2 py-2.5 text-right text-zinc-500">
                          {r.opp_rush_rk || "—"}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-sm text-zinc-500 mt-4">
          Δ Pass = Our − FP. Columns change with position filter. Rank 1 =
          toughest defense.
        </p>
      </div>
    </main>
  );
}