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
        <p className="text-stone-500">Loading…</p>
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
          ← Dashboard
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
            Quadrants are based on the opponent’s current rank in this system and the game
            location. FCS 