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

/** Realistic CFB finals — prefer common “football” numbers. */
const COMMON_SCORES = [
  7, 10, 13, 14, 17, 20, 21, 24, 27, 28, 31, 34, 35, 38, 41, 42, 45, 48, 49, 52, 56,
];

function nearestCommon(x: number): number {
  let best = COMMON_SCORES[0];
  let bestDist = Math.abs(x - best);
  for (const s of COMMON_SCORES) {
    const d = Math.abs(x - s);
    if (d < bestDist) {
      best = s;
      bestDist = d;
    }
  }
  return best;
}

/**
 * homeSpread: model home line (neg = home favored)
 * marketSpread: market home line
 * modelTotal / marketTotal: optional; used to push scoring up/down
 */
function practicalPrediction(
  homeTeam: string,
  awayTeam: string,
  homeSpread: number,
  modelTotal: number,
  marketSpread: number | null,
  marketTotal: number | null
): string {
  const mkt = marketSpread ?? homeSpread;
  const mktTot = marketTotal ?? modelTotal;
  const spreadDisagreement = mkt - homeSpread; // >0 model likes home more than market

  let homeRaw = (modelTotal - homeSpread) / 2;
  let awayRaw = (modelTotal + homeSpread) / 2;

  // Push scoring up when model total is clearly over market
  const totalBump = Math.max(0, modelTotal - mktTot);
  if (totalBump >= 2) {
    const extra = Math.min(7, totalBump * 1.2);
    homeRaw += extra * 0.45;
    awayRaw += extra * 0.55;
  }

  // Narrative ATS lean ONLY in non-blowout games
  if (Math.abs(homeSpread) < 10 && Math.abs(spreadDisagreement) >= 2.5) {
    if (spreadDisagreement > 0) {
      homeRaw += 2.5;
      awayRaw -= 1.0;
    } else {
      awayRaw += 2.5;
      homeRaw -= 1.0;
    }
  }

  // Close games: occasional "take a shot" — still only if |spread| < 3
  if (Math.abs(homeSpread) < 3) {
    if (spreadDisagreement < -1) {
      awayRaw += 3.5;
      homeRaw -= 1.5;
    } else if (spreadDisagreement > 1) {
      homeRaw += 3.5;
      awayRaw -= 1.5;
    } else if (homeSpread < 0) {
      homeRaw += 2;
    } else {
      awayRaw += 2;
    }
  }

  // Hard rule: double-digit dogs do NOT win outright
  if (homeSpread <= -10) {
    // home is favorite by 10+ → home must win
    if (homeRaw <= awayRaw) {
      const mid = (homeRaw + awayRaw) / 2;
      homeRaw = mid + Math.max(7, Math.abs(homeSpread) * 0.35);
      awayRaw = mid - Math.max(3, Math.abs(homeSpread) * 0.2);
    }
  } else if (homeSpread >= 10) {
    // home is dog by 10+ → away must win
    if (awayRaw <= homeRaw) {
      const mid = (homeRaw + awayRaw) / 2;
      awayRaw = mid + Math.max(7, Math.abs(homeSpread) * 0.35);
      homeRaw = mid - Math.max(3, Math.abs(homeSpread) * 0.2);
    }
  }

  let homePts = nearestCommon(homeRaw);
  let awayPts = nearestCommon(awayRaw);

  // Enforce favorite win again after snapping (catches edge cases)
  if (homeSpread <= -10 && homePts <= awayPts) {
    homePts = nearestCommon(awayPts + Math.max(7, Math.round(Math.abs(homeSpread) * 0.4)));
    if (homePts <= awayPts) homePts = awayPts + 7;
  }
  if (homeSpread >= 10 && awayPts <= homePts) {
    awayPts = nearestCommon(homePts + Math.max(7, Math.round(Math.abs(homeSpread) * 0.4)));
    if (awayPts <= homePts) awayPts = homePts + 7;
  }

  // Avoid ties
  if (homePts === awayPts) {
    if (homeSpread <= 0) homePts = awayPts + 7;
    else awayPts = homePts + 7;
  }

  // Avoid ugly 1–3 point finals unless it was a true pick'em
  if (Math.abs(homePts - awayPts) <= 3 && Math.abs(homeSpread) >= 1) {
    if (homePts > awayPts) homePts = awayPts + 7;
    else awayPts = homePts + 7;
  }

  // Keep true blowouts looking like blowouts
  if (homeSpread <= -20 && homePts - awayPts < 17) {
    homePts = awayPts + 21;
  }
  if (homeSpread >= 20 && awayPts - homePts < 17) {
    awayPts = homePts + 21;
  }

  const winner = homePts > awayPts ? homeTeam : awayTeam;
  return `${winner} ${Math.max(homePts, awayPts)}-${Math.min(homePts, awayPts)}`;
}

function EdgeBadge({
  value,
  lean,
}: {
  value: number | null;
  lean: string | null;
}) {
  if (value === null) return <span className="text-zinc-500">—</span>;
  const abs = Math.abs(value);
  const color =
    abs >= 5
      ? "text-emerald-400"
      : abs >= 3
        ? "text-yellow-400"
        : "text-zinc-300";
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
              .select(
                `
                id, week, neutral, market_spread, market_total,
                away:away_team_id(name, conference),
                home:home_team_id(name, conference),
                projections(model_spread, spread_edge, spread_lean, model_total, total_edge, total_lean)
              `
              )
              .eq("status", "scheduled")
              .order("week");

      if (!data) {
        setLoading(false);
        return;
      }

      const rows: GameRow[] = data.map((g: any) => {
        const proj = Array.isArray(g.projections)
          ? g.projections[0]
          : g.projections;
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
          <h1 className="text-3xl font-bold mt-4">CFB Weekly Projections</h1>
          <p className="text-zinc-400 mt-2">
            Model spreads & totals stay exact. Practical Prediction is a
            realistic score call.
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
          <>
            <div className="rounded-xl border border-zinc-800 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-900 text-zinc-400">
                  <tr>
                    <th className="text-left px-3 py-3">Matchup</th>
                    <th className="text-left px-3 py-3">Week</th>
                    <th className="text-left px-3 py-3">Practical Prediction</th>
                    <th className="text-right px-3 py-3">Mkt Spread</th>
                    <th className="text-right px-3 py-3">Model</th>
                    <th className="text-right px-3 py-3">ATS Edge</th>
                    <th className="text-right px-3 py-3">Mkt Total</th>
                    <th className="text-right px-3 py-3">Model Tot</th>
                    <th className="text-right px-3 py-3">Tot Edge</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((g) => {
                    const pred =
                      g.model_spread != null && g.model_total != null
                        ? practicalPrediction(
                            g.home,
                            g.away,
                            g.model_spread,
                            g.model_total,
                            g.market_spread,
                            g.market_total
                          )
                        : "—";
                    return (
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
                        <td className="px-3 py-2.5 font-medium text-amber-300 whitespace-nowrap">
                          {pred}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          {g.market_spread != null
                            ? (g.market_spread > 0 ? "+" : "") +
                              g.market_spread
                            : "—"}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          {g.model_spread != null
                            ? (g.model_spread > 0 ? "+" : "") +
                              g.model_spread.toFixed(1)
                            : "—"}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <EdgeBadge
                            value={g.spread_edge}
                            lean={g.spread_lean}
                          />
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          {g.market_total ?? "—"}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          {g.model_total?.toFixed(1) ?? "—"}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <EdgeBadge
                            value={g.total_edge}
                            lean={g.total_lean}
                          />
                        </td>
                      </tr>
                    );
                  })}
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