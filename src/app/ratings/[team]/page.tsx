"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

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

export default function TeamPage() {
  const params = useParams();
  const raw = Array.isArray(params.team) ? params.team[0] : params.team;
  const teamName = decodeURIComponent(raw || "");

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
        <p className="text-stone-500">Loading…</p>
      </main>
    );
  }

  const team = data[teamName];

  if (!team) {
    return (
      <main className="min-h-screen bg-stone-100 text-stone-900 p-6">
        <Link href="/ratings" className="text-stone-500 text-sm hover:text-stone-900">
          ← Back to ratings
        </Link>
        <p className="mt-4">Team not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-100 text-stone-900">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Link
          href="/ratings"
          className="inline-block text-sm px-3 py-1.5 rounded border border-stone-300 bg-white hover:bg-stone-50 text-stone-700"
        >
          ← Back
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold mt-4">{teamName}</h1>
        <p className="text-stone-500 text-sm mt-1">
          Rank #{team.rank} · Hybrid {team.hybrid.toFixed(4)}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
          {(
            [
              ["Overall", team.records.overall],
              ["Conference", team.records.conference],
              ["Home", team.records.home],
              ["Away", team.records.away],
              ["Neutral", team.records.neutral],
              ["Q1", team.records.q1],
              ["Q2", team.records.q2],
              ["Q3", team.records.q3],
              ["Q4", team.records.q4],
            ] as const
          ).map(([label, r]) => (
            <div
              key={label}
              className="rounded border border-stone-200 bg-white px-3 py-3 text-center shadow-sm"
            >
              <div className="text-xs text-stone-500 uppercase tracking-wide">{label}</div>
              <div className="text-xl font-semibold mt-0.5">{rec(r)}</div>
            </div>
          ))}
        </div>

        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500 mt-8 mb-2">
          Schedule
        </h2>
        <div className="overflow-x-auto rounded border border-stone-300 bg-white shadow-sm">
          <table className="w-full text-sm border-collapse min-w-[520px]">
            <thead>
              <tr className="bg-stone-200 text-stone-600 text-xs uppercase">
                <th className="text-left px-2 py-2 border border-stone-300">Wk</th>
                <th className="text-left px-2 py-2 border border-stone-300">Opponent</th>
                <th className="text-center px-2 py-2 border border-stone-300">Rk</th>
                <th className="text-center px-2 py-2 border border-stone-300">Loc</th>
                <th className="text-center px-2 py-2 border border-stone-300">Result</th>
                <th className="text-center px-2 py-2 border border-stone-300">Score</th>
                <th className="text-center px-2 py-2 border border-stone-300">Q</th>
                <th className="text-center px-2 py-2 border border-stone-300">Conf</th>
              </tr>
            </thead>
            <tbody>
              {team.schedule.map((g, i) => (
                <tr key={i}>
                  <td className="px-2 py-1.5 border border-stone-200">{g.week}</td>
                  <td className="px-2 py-1.5 border border-stone-200 whitespace-nowrap">
                    {g.opponent}
                  </td>
                  <td className="px-2 py-1.5 border border-stone-200 text-center text-stone-500">
                    {g.opponent_rank ?? "—"}
                  </td>
                  <td className="px-2 py-1.5 border border-stone-200 text-center text-stone-600">
                    {g.location === "home" ? "vs" : g.location === "away" ? "@" : "N"}
                  </td>
                  <td
                    className={`px-2 py-1.5 border border-stone-200 text-center font-medium ${
                      g.result === "W" ? "text-emerald-700" : "text-red-700"
                    }`}
                  >
                    {g.result}
                  </td>
                  <td className="px-2 py-1.5 border border-stone-200 text-center whitespace-nowrap">
                    {g.score}
                  </td>
                  <td className="px-2 py-1.5 border border-stone-200 text-center">{g.quadrant}</td>
                  <td className="px-2 py-1.5 border border-stone-200 text-center text-stone-500">
                    {g.conference_game ? "Y" : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}