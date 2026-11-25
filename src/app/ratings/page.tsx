"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type TeamData = {
  rank: number;
  hybrid: number;
  records: {
    overall: { wins: number; losses: number };
    q1: { wins: number; losses: number };
    q2: { wins: number; losses: number };
    q3: { wins: number; losses: number };
    q4: { wins: number; losses: number };
  };
};

type DataMap = Record<string, TeamData>;

function rec(r: { wins: number; losses: number }) {
  return `${r.wins}-${r.losses}`;
}

export default function RatingsPage() {
  const [data, setData] = useState<DataMap | null>(null);
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
      <main className="min-h-screen bg-stone-100 text-stone-900 p-6">
        <p className="text-red-700">{error}</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-stone-100 text-stone-900 p-6">
        <p className="text-stone-500">Loading...</p>
      </main>
    );
  }

  const teams = Object.entries(data)
    .map(([name, d]) => ({ name, ...d }))
    .sort((a, b) => a.rank - b.rank);

  return (
    <main className="min-h-screen bg-stone-100 text-stone-900">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6">
        <a href="/" className="text-stone-500 text-sm hover:text-stone-900">
          &larr; Dashboard
        </a>
        <h1 className="text-2xl sm:text-3xl font-bold mt-3 tracking-tight">
          CFB Power Ratings
        </h1>
        <p className="text-stone-500 mt-1 text-sm">Hybrid ranking · 2026</p>

        <div className="mt-6 rounded-lg border border-stone-300 bg-white p-4 sm:p-5 shadow-sm">
          <h2 className="font-semibold text-stone-900">
            Quadrant definitions for the CFB hybrid ranking
          </h2>
          <p className="text-sm text-stone-600 mt-2">
            Quadrants are based on the opponent's current rank in this system and the game location. FCS opponents are always Quad 4.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[360px]">
              <thead>
                <tr className="bg-stone-100 text-stone-600 text-xs uppercase">
                  <th className="text-left px-3 py-2 border border-stone-200">Quadrant</th>
                  <th className="text-center px-3 py-2 border border-stone-200">Home</th>
                  <th className="text-center px-3 py-2 border border-stone-200">Neutral</th>
                  <th className="text-center px-3 py-2 border border-stone-200">Away</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-3 py-2 border border-stone-200 font-medium">Q1</td>
                  <td className="px-3 py-2 border border-stone-200 text-center">1-14</td>
                  <td className="px-3 py-2 border border-stone-200 text-center">1-24</td>
                  <td className="px-3 py-2 border border-stone-200 text-center">1-34</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 border border-stone-200 font-medium">Q2</td>
                  <td className="px-3 py-2 border border-stone-200 text-center">15-35</td>
                  <td className="px-3 py-2 border border-stone-200 text-center">25-47</td>
                  <td className="px-3 py-2 border border-stone-200 text-center">35-61</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 border border-stone-200 font-medium">Q3</td>
                  <td className="px-3 py-2 border border-stone-200 text-center">36-70</td>
                  <td className="px-3 py-2 border border-stone-200 text-center">48-90</td>
                  <td className="px-3 py-2 border border-stone-200 text-center">62-105</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 border border-stone-200 font-medium">Q4</td>
                  <td className="px-3 py-2 border border-stone-200 text-center">71-138</td>
                  <td className="px-3 py-2 border border-stone-200 text-center">91-138</td>
                  <td className="px-3 py-2 border border-stone-200 text-center">106-138</td>
                </tr>
              </tbody>
            </table>
          </div>

          <ul className="mt-4 text-sm text-stone-600 space-y-1 list-disc list-inside">
            <li>
              <span className="font-medium text-stone-800">Q1</span> = highest-quality games
            </li>
            <li>
              <span className="font-medium text-stone-800">Q4</span> = lowest-quality games (including all FCS)
            </li>
            <li>
              Location matters: the same opponent can be a different quadrant depending on whether the game is home, neutral, or away.
            </li>
          </ul>
        </div>

        <div className="mt-5 overflow-x-auto rounded-lg border border-stone-300 bg-white shadow-sm">
          <table className="w-full text-sm border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-stone-200 text-stone-600 text-xs uppercase tracking-wide">
                <th className="text-left px-2 py-2.5 border border-stone-300 w-10">#</th>
                <th className="text-left px-2 py-2.5 border border-stone-300">Team</th>
                <th className="text-right px-2 py-2.5 border border-stone-300 whitespace-nowrap">Hybrid</th>
                <th className="text-center px-2 py-2.5 border border-stone-300 whitespace-nowrap">Record</th>
                <th className="text-center px-2 py-2.5 border border-stone-300 bg-stone-100 whitespace-nowrap">Q1</th>
                <th className="text-center px-2 py-2.5 border border-stone-300 bg-stone-100 whitespace-nowrap">Q2</th>
                <th className="text-center px-2 py-2.5 border border-stone-300 bg-stone-100 whitespace-nowrap">Q3</th>
                <th className="text-center px-2 py-2.5 border border-stone-300 bg-stone-100 whitespace-nowrap">Q4</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((t) => (
                <tr key={t.name} className="hover:bg-amber-50">
                  <td className="px-2 py-2 border border-stone-200 tabular-nums text-stone-500">{t.rank}</td>
                  <td className="px-2 py-2 border border-stone-200 font-medium whitespace-nowrap">
                    <Link
                      href={`/ratings/${encodeURIComponent(t.name)}`}
                      className="text-stone-900 underline decoration-stone-300 underline-offset-2 hover:decoration-stone-600"
                    >
                      {t.name}
                    </Link>
                  </td>
                  <td className="px-2 py-2 border border-stone-200 text-right tabular-nums whitespace-nowrap">{t.hybrid.toFixed(4)}</td>
                  <td className="px-2 py-2 border border-stone-200 text-center whitespace-nowrap">{rec(t.records.overall)}</td>
                  <td className="px-2 py-2 border border-stone-200 text-center bg-stone-50 whitespace-nowrap">{rec(t.records.q1)}</td>
                  <td className="px-2 py-2 border border-stone-200 text-center bg-stone-50 whitespace-nowrap">{rec(t.records.q2)}</td>
                  <td className="px-2 py-2 border border-stone-200 text-center bg-stone-50 whitespace-nowrap">{rec(t.records.q3)}</td>
                  <td className="px-2 py-2 border border-stone-200 text-center bg-stone-50 whitespace-nowrap">{rec(t.records.q4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-stone-400 mt-2 sm:hidden">Swipe sideways to see all columns.</p>
      </div>
    </main>
  );
}