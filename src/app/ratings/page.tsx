"use client";

import { useEffect, useState } from "react";

type Game = {
  week: number;
  opponent: string;
  opponent_rank: number | null;
  location: string;
  result: string;
  score: string;
  quadrant: number;
  conference_game: boolean;
};

type TeamData = {
  rank: number;
  hybrid: number;
  records: {
    overall: { wins: number; losses: number };
    conference: { wins: number; losses: number };
    home: { wins: number; losses: number };
    away: { wins: number; losses: number };
    neutral: { wins: number; losses: number };
    q1: { wins: number; losses: number };
    q2: { wins: number; losses: number };
    q3: { wins: number; losses: number };
    q4: { wins: number; losses: number };
  };
  schedule: Game[];
};

type DataMap = Record<string, TeamData>;

function rec(r: { wins: number; losses: number }) {
  return `${r.wins}-${r.losses}`;
}

export default function RatingsPage() {
  const [data, setData] = useState<DataMap | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/cfb_detailed.json")
      .then((r) => {
        if (!r.ok) throw new Error("Could not load data");
        return r.json();
      })
      .then(setData)
      .catch(() => setError("Failed to load rankings data."));
  }, []);

  if (error) {
    return (
      <main className="min-h-screen bg-stone-100 text-stone-900 p-8">
        <p className="text-red-700">{error}</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-stone-100 text-stone-900 p-8">
        <p className="text-stone-500">Loading…</p>
      </main>
    );
  }

  const teams = Object.entries(data)
    .map(([name, d]) => ({ name, ...d }))
    .sort((a, b) => a.rank - b.rank);

  const detail = selected ? { name: selected, ...data[selected] } : null;

  return (
    <main className="min-h-screen bg-stone-100 text-stone-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <a href="/" className="text-stone-500 text-sm hover:text-stone-900">
          ← Dashboard
        </a>
        <h1 className="text-3xl font-bold mt-4 tracking-tight">CFB Power Ratings</h1>
        <p className="text-stone-500 mt-1 text-sm">Hybrid ranking · 2026</p>

        <div className="mt-6 overflow-x-auto rounded-lg border border-stone-300 bg-white shadow-sm">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-stone-200 text-stone-600 text-xs uppercase tracking-wide">
                <th className="text-left px-3 py-3 border border-stone-300 w-12">#</th>
                <th className="text-left px-3 py-3 border border-stone-300">Team</th>
                <th className="text-right px-3 py-3 border border-stone-300">Hybrid</th>
                <th className="text-center px-3 py-3 border border-stone-300">Record</th>
                <th className="text-center px-3 py-3 border border-stone-300 bg-stone-100">Q1</th>
                <th className="text-center px-3 py-3 border border-stone-300 bg-stone-100">Q2</th>
                <th className="text-center px-3 py-3 border border-stone-300 bg-stone-100">Q3</th>
                <th className="text-center px-3 py-3 border border-stone-300 bg-stone-100">Q4</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((t) => (
                <tr
                  key={t.name}
                  className={`hover:bg-amber-50 cursor-pointer ${
                    selected === t.name ? "bg-amber-100" : ""
                  }`}
                  onClick={() => setSelected(selected === t.name ? null : t.name)}
                >
                  <td className="px-3 py-2 border border-stone-200 tabular-nums text-stone-500">
                    {t.rank}
                  </td>
                  <td className="px-3 py-2 border border-stone-200 font-medium text-stone-900 underline decoration-stone-300 underline-offset-2">
                    {t.name}
                  </td>
                  <td className="px-3 py-2 border border-stone-200 text-right tabular-nums">
                    {t.hybrid.toFixed(4)}
                  </td>
                  <td className="px-3 py-2 border border-stone-200 text-center">
                    {rec(t.records.overall)}
                  </td>
                  <td className="px-3 py-2 border border-stone-200 text-center bg-stone-50">
                    {rec(t.records.q1)}
                  </td>
                  <td className="px-3 py-2 border border-stone-200 text-center bg-stone-50">
                    {rec(t.records.q2)}
                  </td>
                  <td className="px-3 py-2 border border-stone-200 text-center bg-stone-50">
                    {rec(t.records.q3)}
                  </td>
                  <td className="px-3 py-2 border border-stone-200 text-center bg-stone-50">
                    {rec(t.records.q4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {detail && (
          <div className="mt-8 rounded-lg border border-stone-300 bg-white shadow-sm p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{detail.name}</h2>
                <p className="text-stone-500 text-sm mt-1">
                  Rank #{detail.rank} · Hybrid {detail.hybrid.toFixed(4)}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-sm text-stone-500 hover:text-stone-900"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              {[
                ["Overall", detail.records.overall],
                ["Conference", detail.records.conference],
                ["Home", detail.records.home],
                ["Away", detail.records.away],
                ["Neutral", detail.records.neutral],
                ["Q1", detail.records.q1],
                ["Q2", detail.records.q2],
                ["Q3", detail.records.q3],
                ["Q4", detail.records.q4],
              ].map(([label, r]) => (
                <div
                  key={label as string}
                  className="rounded border border-stone-200 bg-stone-50 px-3 py-2 text-center"
                >
                  <div className="text-xs text-stone-500 uppercase tracking-wide">
                    {label as string}
                  </div>
                  <div className="text-lg font-semibold mt-0.5">
                    {rec(r as { wins: number; losses: number })}
                  </div>
                </div>
              ))}
            </div>

            <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500 mt-8 mb-2">
              Schedule
            </h3>
            <div className="overflow-x-auto rounded border border-stone-300">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-stone-200 text-stone-600 text-xs uppercase">
                    <th className="text-left px-3 py-2 border border-stone-300">Wk</th>
                    <th className="text-left px-3 py-2 border border-stone-300">Opponent</th>
                    <th className="text-center px-3 py-2 border border-stone-300">Rk</th>
                    <th className="text-center px-3 py-2 border border-stone-300">Loc</th>
                    <th className="text-center px-3 py-2 border border-stone-300">Result</th>
                    <th className="text-center px-3 py-2 border border-stone-300">Score</th>
                    <th className="text-center px-3 py-2 border border-stone-300">Q</th>
                    <th className="text-center px-3 py-2 border border-stone-300">Conf</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.schedule.map((g, i) => (
                    <tr key={i} className="hover:bg-stone-50">
                      <td className="px-3 py-1.5 border border-stone-200">{g.week}</td>
                      <td className="px-3 py-1.5 border border-stone-200">{g.opponent}</td>
                      <td className="px-3 py-1.5 border border-stone-200 text-center text-stone-500">
                        {g.opponent_rank ?? "—"}
                      </td>
                      <td className="px-3 py-1.5 border border-stone-200 text-center capitalize text-stone-600">
                        {g.location === "home" ? "vs" : g.location === "away" ? "@" : "N"}
                      </td>
                      <td
                        className={`px-3 py-1.5 border border-stone-200 text-center font-medium ${
                          g.result === "W" ? "text-emerald-700" : "text-red-700"
                        }`}
                      >
                        {g.result}
                      </td>
                      <td className="px-3 py-1.5 border border-stone-200 text-center">{g.score}</td>
                      <td className="px-3 py-1.5 border border-stone-200 text-center">{g.quadrant}</td>
                      <td className="px-3 py-1.5 border border-stone-200 text-center text-stone-500">
                        {g.conference_game ? "Y" : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}