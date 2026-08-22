"use client";

import { useState, useMemo } from "react";

const games = [
  // Week 0
  {
    week: "Week 0",
    away: "North Carolina",
    home: "TCU",
    neutral: true,
    model_spread: -8.1,
    market_spread: -7.5,
    spread_edge: 0.6,
    spread_lean: "PASS",
    model_total: 53.2,
    market_total: 47.5,
    total_edge: 5.7,
    total_lean: "OVER",
  },
  {
    week: "Week 0",
    away: "San José State",
    home: "USC",
    neutral: false,
    model_spread: -34.5,
    market_spread: -38.5,
    spread_edge: -4.0,
    spread_lean: "San José State",
    model_total: 58.4,
    market_total: 60.5,
    total_edge: -2.1,
    total_lean: "UNDER",
  },
  {
    week: "Week 0",
    away: "NC State",
    home: "Virginia",
    neutral: false,
    model_spread: -3.8,
    market_spread: -5.5,
    spread_edge: -1.7,
    spread_lean: "NC State",
    model_total: 55.4,
    market_total: 53.5,
    total_edge: 1.9,
    total_lean: "OVER",
  },
  {
    week: "Week 0",
    away: "Jacksonville State",
    home: "North Dakota State",
    neutral: false,
    model_spread: -10.0,
    market_spread: -7.0,
    spread_edge: 3.0,
    spread_lean: "North Dakota State",
    model_total: 54.6,
    market_total: 47.5,
    total_edge: 7.1,
    total_lean: "OVER",
  },
  {
    week: "Week 0",
    away: "Sacramento State",
    home: "Eastern Michigan",
    neutral: false,
    model_spread: -10.5,
    market_spread: -8.5,
    spread_edge: 2.0,
    spread_lean: "Eastern Michigan",
    model_total: 55.7,
    market_total: 52.5,
    total_edge: 3.2,
    total_lean: "OVER",
  },
  {
    week: "Week 0",
    away: "Hawai'i",
    home: "Stanford",
    neutral: false,
    model_spread: -2.4,
    market_spread: -5.5,
    spread_edge: -3.1,
    spread_lean: "Hawai'i",
    model_total: 55.0,
    market_total: 49.5,
    total_edge: 5.5,
    total_lean: "OVER",
  },
  {
    week: "Week 0",
    away: "New Mexico State",
    home: "Florida State",
    neutral: false,
    model_spread: -27.7,
    market_spread: -31.5,
    spread_edge: -3.8,
    spread_lean: "New Mexico State",
    model_total: 54.0,
    market_total: 53.5,
    total_edge: 0.5,
    total_lean: "PASS",
  },
  {
    week: "Week 0",
    away: "Memphis",
    home: "UNLV",
    neutral: false,
    model_spread: -4.7,
    market_spread: -6.0,
    spread_edge: -1.3,
    spread_lean: "PASS",
    model_total: 59.4,
    market_total: 57.5,
    total_edge: 1.9,
    total_lean: "OVER",
  },
  // Week 1
  {
    week: "Week 1",
    away: "North Texas",
    home: "Indiana",
    neutral: false,
    model_spread: -34.7,
    market_spread: -40.5,
    spread_edge: -5.8,
    spread_lean: "North Texas",
    model_total: 61.1,
    market_total: 55.5,
    total_edge: 5.6,
    total_lean: "OVER",
  },
  {
    week: "Week 1",
    away: "East Carolina",
    home: "Alabama",
    neutral: false,
    model_spread: -22.7,
    market_spread: -28.5,
    spread_edge: -5.8,
    spread_lean: "East Carolina",
    model_total: 54.0,
    market_total: 54.5,
    total_edge: -0.5,
    total_lean: "PASS",
  },
  {
    week: "Week 1",
    away: "Ohio",
    home: "Nebraska",
    neutral: false,
    model_spread: -18.5,
    market_spread: -23.5,
    spread_edge: -5.0,
    spread_lean: "Ohio",
    model_total: 50.6,
    market_total: 47.5,
    total_edge: 3.1,
    total_lean: "OVER",
  },
  {
    week: "Week 1",
    away: "Western Michigan",
    home: "Michigan",
    neutral: false,
    model_spread: -23.8,
    market_spread: -27.5,
    spread_edge: -3.7,
    spread_lean: "Western Michigan",
    model_total: 54.7,
    market_total: 48.5,
    total_edge: 6.2,
    total_lean: "OVER",
  },
  {
    week: "Week 1",
    away: "Northern Illinois",
    home: "Iowa",
    neutral: false,
    model_spread: -35.0,
    market_spread: -31.5,
    spread_edge: 3.5,
    spread_lean: "Iowa",
    model_total: 53.1,
    market_total: 45.5,
    total_edge: 7.6,
    total_lean: "OVER",
  },
  {
    week: "Week 1",
    away: "Clemson",
    home: "LSU",
    neutral: false,
    model_spread: -7.4,
    market_spread: -9.5,
    spread_edge: -2.1,
    spread_lean: "Clemson",
    model_total: 53.5,
    market_total: 51.5,
    total_edge: 2.0,
    total_lean: "OVER",
  },
  {
    week: "Week 1",
    away: "Boise State",
    home: "Oregon",
    neutral: false,
    model_spread: -22.1,
    market_spread: -24.5,
    spread_edge: -2.4,
    spread_lean: "Boise State",
    model_total: 58.2,
    market_total: 52.5,
    total_edge: 5.7,
    total_lean: "OVER",
  },
];

type SortKey = "default" | "spread_edge" | "total_edge";

function EdgeBadge({ lean, edge }: { lean: string; edge: number }) {
  if (lean === "PASS") {
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
  const [sortKey, setSortKey] = useState<SortKey>("spread_edge");

  const sortedGames = useMemo(() => {
    const copy = [...games];
    if (sortKey === "spread_edge") {
      copy.sort((a, b) => Math.abs(b.spread_edge) - Math.abs(a.spread_edge));
    } else if (sortKey === "total_edge") {
      copy.sort((a, b) => Math.abs(b.total_edge) - Math.abs(a.total_edge));
    }
    // "default" keeps original order
    return copy;
  }, [sortKey]);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <a href="/" className="text-zinc-400 hover:text-white text-sm">
            &larr; Back to Dashboard
          </a>
          <h1 className="text-3xl font-bold mt-4">Weekly Projections</h1>
          <p className="text-zinc-400 mt-2">
            Model spreads & totals vs market • Week 0 / Week 1
          </p>
        </div>

        {/* Sort controls */}
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
            Biggest Total Edge
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

        <div className="space-y-4">
          {sortedGames.map((g, i) => (
            <div
              key={`${g.away}-${g.home}-${i}`}
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
                {/* Spread */}
                <div>
                  <div className="text-zinc-500 mb-1">Spread</div>
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="font-medium">
                      Model: {g.home} {g.model_spread > 0 ? "+" : ""}
                      {g.model_spread}
                    </span>
                    <span className="text-zinc-500">
                      Mkt: {g.home} {g.market_spread > 0 ? "+" : ""}
                      {g.market_spread}
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <EdgeBadge lean={g.spread_lean} edge={g.spread_edge} />
                  </div>
                </div>

                {/* Total */}
                <div>
                  <div className="text-zinc-500 mb-1">Total</div>
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="font-medium">Model: {g.model_total}</span>
                    <span className="text-zinc-500">
                      Mkt: {g.market_total}
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
      </div>
    </main>
  );
}