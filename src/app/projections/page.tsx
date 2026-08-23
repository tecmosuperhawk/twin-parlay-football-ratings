"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";

type GameRow = {
  id: string;
  week: string;
  away: string;
  home: string;
  away_conf: string | null;
  home_conf: string | null;
  neutral: boolean;
  market_spread: number | null;
  market_total: number | null;
  model_spread: number | null;
  spread_edge: number | null;
  spread_lean: string | null;
  model_total: number | null;
  total_edge: number | null;
  total_lean: string | null;
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

function EdgeBadge({ value, lean }: { value: number | null; lean: string | null }) {
  if (value === null) return <span className="text-zinc-500">—</span>;
  const abs = Math.abs(value);
  const color =
    abs >= 5 ? "text-emerald-400" : abs >= 3 ? "text-yellow-400" : "text-zinc-300";
  return (
    <span className={color}>
      {value > 0 ? "+" : ""}
      {value.toFixed(1)}
      {lean && lean !== "PASS" ? ` → ${lean}` : ""}
    </span>
  );
}

export default function ProjectionsPage() {
  const [games, setGames] = useState<GameRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [confFilter, setConfFilter] = useState("All");
  const [sortKey, setSortKey] = useState<"default" | "ats" | "total">("default");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("games")
        .select(`
          id, week, neutral, market_spread, market_total,
          away:away_team_id(name, conference),
          home:home_team_id(name, conference),
          projections(model_spread, spread_edge, spread_lean, model_total, total_edge, total_lean)
        `)
        .order("week");

      if (!data) {
        setLoading(false);
        return;
      }

      const rows: GameRow[] = data.map((g: any) => {
        const proj = Array.isArray(g.projections) ? g.projections[0] : g.projections;
        return {
          id: g.id,
          week: g.week,
          away: g.away?.name ?? "?",
          home: g.home?.name ?? "?",
          away_conf: g.away?.conference ?? null,
          home_conf: g.home?.conference ?? null,
          neutral: g.neutral,
          market_spread: g.market_spread,
          market_total: g.market_total,
          model_spread: proj?.model_spread ?? null,
          spread_edge: proj?.spread_edge ?? null,
          spread_lean: proj?.spread_lean ?? null,
          model_total: proj?.model_total ?? null,
          total_edge: proj?.total_edge ?? null,
          total_lean: proj?.total_lean ?? null,
        };
      });
      setGames(rows);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = games;
    if (confFilter !== "All") {
      list = list.filter(
        (g) => g.away_conf === confFilter || g.home_conf === confFilter
      );
    }
    if (sortKey === "ats") {
      list = [...list].sort(
        (a, b) => Math.abs(b.spread_edge ?? 0) - Math.abs(a.spread_edge ?? 0)
      );
    } else if (sortKey === "total") {
      list = [...list].sort(
        (a, b) => Math.abs(b.total_edge ?? 0) - Math.abs(a.total_edge ?? 0)
      );
    }
    return list;
  }, [games, confFilter, sortKey]);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <a href="/" className="text-zinc-400 hover:text-white text-sm">
            ← Back to Dashboard
          </a>
          <h1 className="text-3xl font-bold mt-4">Weekly Projections</h1>
          <p className="text-zinc-400 mt-2">
            Model spreads, totals, and edges vs current market lines
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

          <button
            onClick={() => setSortKey("ats")}
            className={`px-3 py-2 rounded-lg text-sm border ${
              sortKey === "ats"
                ? "bg-emerald-900/40 border-emerald-600 text-emerald-300"
                : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
            }`}
          >
            Biggest ATS Edge
          </button>
          <button
            onClick={() => setSortKey("total")}
            className={`px-3 py-2 rounded-lg text-sm border ${
              sortKey === "total"
                ? "bg-emerald-900/40 border-emerald-600 text-emerald-300"
                : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
            }`}
          >
            Biggest Totals Edge
          </button>
          <button
            onClick={() => setSortKey("default")}
            className="px-3 py-2 rounded-lg text-sm border border-zinc-700 text-zinc-400 hover:border-zinc-500"
          >
            Default
          </button>

          <span className="text-sm text-zinc-500 ml-2">
            {filtered.length} games
          </span>
        </div>

        {loading ? (
          <p className="text-zinc-400">Loading…</p>
        ) : (
          <div className="rounded-xl border border-zinc-800 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900 text-zinc-400">
                <tr>
                  <th className="text-left px-3 py-3">Matchup</th>
                  <th className="text-left px-3 py-3">Week</th>
                  <th className="text-right px-3 py-3">Mkt Spread</th>
                  <th className="text-right px-3 py-3">Model</th>
                  <th className="text-right px-3 py-3">ATS Edge</th>
                  <th className="text-right px-3 py-3">Mkt Total</th>
                  <th className="text-right px-3 py-3">Model Tot</th>
                  <th className="text-right px-3 py-3">Tot Edge</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((g) => (
                  <tr
                    key={g.id}
                    className="border-t border-zinc-800 hover:bg-zinc-900/50"
                  >
                    <td className="px-3 py-2.5">
                      <span className="font-medium">{g.away}</span>
                      <span className="text-zinc-500 text-xs ml-1">
                        ({g.away_conf ?? "?"})
                      </span>
                      <span className="text-zinc-500 mx-1">
                        {g.neutral ? "vs" : "@"}
                      </span>
                      <span className="font-medium">{g.home}</span>
                      <span className="text-zinc-500 text-xs ml-1">
                        ({g.home_conf ?? "?"})
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-zinc-400">{g.week}</td>
                    <td className="px-3 py-2.5 text-right">
                      {g.market_spread != null
                        ? (g.market_spread > 0 ? "+" : "") + g.market_spread
                        : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {g.model_spread != null
                        ? (g.model_spread > 0 ? "+" : "") +
                          g.model_spread.toFixed(1)
                        : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <EdgeBadge value={g.spread_edge} lean={g.spread_lean} />
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {g.market_total ?? "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {g.model_total?.toFixed(1) ?? "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <EdgeBadge value={g.total_edge} lean={g.total_lean} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
            <p className="text-sm text-zinc-500 mt-4 text-right">
              Showing {filtered.length} of {games.length} games
            </p>
          </>
        )}
      </div>
    </main>
  );
}