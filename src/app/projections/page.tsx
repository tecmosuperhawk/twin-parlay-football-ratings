"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";

type GameRow = {
  id: string;
  week: string;
  away: string;
  home: string;
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

type SortKey = "default" | "spread_edge" | "total_edge";

function EdgeBadge({ lean, edge }: { lean: string | null; edge: number | null }) {
  if (!lean || lean === "PASS" || edge == null) {
    return <span className="text-zinc-500 text-xs">PASS</span>;
  }
  const isStrong = Math.abs(edge) >= 3;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
        isStrong
          ? "bg-emerald-900/70 text-emerald-300"
          : "bg-zinc-800 text-zinc-300"
      }`}
    >
      {lean} ({edge > 0 ? "+" : ""}
      {edge})
    </span>
  );
}

export default function ProjectionsPage() {
  const [games, setGames] = useState<GameRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("spread_edge");

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("games")
        .select(`
          id,
          week,
          neutral,
          market_spread,
          market_total,
          away:away_team_id ( name ),
          home:home_team_id ( name ),
          projections (
            model_spread,
            spread_edge,
            spread_lean,
            model_total,
            total_edge,
            total_lean
          )
        `)
        .order("week");

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      const mapped: GameRow[] = (data || []).map((g: any) => {
        const proj = Array.isArray(g.projections) ? g.projections[0] : g.projections;
        return {
          id: g.id,
          week: g.week,
          away: g.away?.name ?? "TBD",
          home: g.home?.name ?? "TBD",
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

      setGames(mapped);
      setLoading(false);
    }

    load();
  }, []);

  const sortedGames = useMemo(() => {
    const copy = [...games];
    if (sortKey === "spread_edge") {
      copy.sort(
        (a, b) => Math.abs(b.spread_edge ?? 0) - Math.abs(a.spread_edge ?? 0)
      );
    } else if (sortKey === "total_edge") {
      copy.sort(
        (a, b) => Math.abs(b.total_edge ?? 0) - Math.abs(a.total_edge ?? 0)
      );
    }
    return copy;
  }, [games, sortKey]);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Weekly Projections</h1>
          <p className="text-zinc-400 mt-2">
            Model spreads & totals vs market • Live from Supabase
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSortKey("spread_edge")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              sortKey === "spread_edge"
                ? "bg-emerald-600 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            Biggest ATS Edge
          </button>
          <button
            onClick={() => setSortKey("total_edge")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              sortKey === "total_edge"
                ? "bg-emerald-600 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            Biggest Totals Edge
          </button>
          <button
            onClick={() => setSortKey("default")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              sortKey === "default"
                ? "bg-emerald-600 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            Original Order
          </button>
        </div>

        {loading ? (
          <p className="text-zinc-400">Loading projections…</p>
        ) : (
          <div className="space-y-4">
            {sortedGames.map((g) => (
              <div
                key={g.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                    {g.week}
                    {g.neutral ? " • Neutral" : ""}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="text-lg font-semibold">
                    {g.away} @ {g.home}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                  <div>
                    <div className="text-zinc-500 mb-1">Spread</div>
                    <div className="flex flex-wrap items-baseline gap-3">
                      <span className="font-medium">
                        Model: {g.home}{" "}
                        {g.model_spread != null
                          ? `${g.model_spread > 0 ? "+" : ""}${g.model_spread}`
                          : "—"}
                      </span>
                      <span className="text-zinc-500">
                        Mkt: {g.home}{" "}
                        {g.market_spread != null
                          ? `${g.market_spread > 0 ? "+" : ""}${g.market_spread}`
                          : "—"}
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <EdgeBadge lean={g.spread_lean} edge={g.spread_edge} />
                    </div>
                  </div>

                  <div>
                    <div className="text-zinc-500 mb-1">Total</div>
                    <div className="flex flex-wrap items-baseline gap-3">
                      <span className="font-medium">
                        Model: {g.model_total ?? "—"}
                      </span>
                      <span className="text-zinc-500">
                        Mkt: {g.market_total ?? "—"}
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <EdgeBadge lean={g.total_lean} edge={g.total_edge} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}