"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

type FinalGame = {
  id: string;
  week: string | null;
  away_score: number | null;
  home_score: number | null;
  model_ats: string | null;
  model_ou: string | null;
  best_bet_ats: boolean | null;
  best_bet_ou: boolean | null;
  market_spread: number | null;
  market_total: number | null;
  away: { name: string; conference: string | null } | null;
  home: { name: string; conference: string | null } | null;
  projections:
    | {
        model_spread: number | null;
        model_total: number | null;
        spread_lean: string | null;
        total_lean: string | null;
      }[]
    | null;
};

type RecordRow = {
  week: string;
  ats_wins: number;
  ats_losses: number;
  ats_pushes: number;
  ou_wins: number;
  ou_losses: number;
  ou_pushes: number;
  best_bet_ats_wins: number;
  best_bet_ats_losses: number;
  best_bet_ou_wins: number;
  best_bet_ou_losses: number;
  notes: string | null;
};

function ResultPill({ value }: { value: string | null }) {
  if (!value) return <span className="text-zinc-500">—</span>;
  const color =
    value === "WIN"
      ? "text-emerald-400"
      : value === "LOSS"
        ? "text-red-400"
        : "text-zinc-300";
  return <span className={color}>{value}</span>;
}

export default function ResultsPage() {
  const [games, setGames] = useState<FinalGame[]>([]);
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [{ data: gameData }, { data: recordData }] = await Promise.all([
        supabase
          .from("games")
          .select(
            `
            id, week, away_score, home_score,
            model_ats, model_ou, best_bet_ats, best_bet_ou,
            market_spread, market_total,
            away:away_team_id(name, conference),
            home:home_team_id(name, conference),
            projections(model_spread, model_total, spread_lean, total_lean)
          `
          )
          .eq("status", "final")
          .order("week"),
        supabase.from("model_record").select("*").order("graded_at"),
      ]);
      setGames((gameData as unknown as FinalGame[]) ?? []);
      setRecords((recordData as unknown as RecordRow[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <a href="/" className="text-zinc-400 hover:text-white text-sm">
            &larr; Back to Dashboard
          </a>
          <h1 className="text-3xl font-bold mt-4">Results</h1>
          <p className="text-zinc-400 mt-2">
            Official model grades vs market. Practical Prediction is not used.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mb-8">
          {records.map((r) => (
            <div
              key={r.week}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
            >
              <h2 className="font-semibold mb-3">{r.week}</h2>
              <p className="text-sm text-zinc-300">
                All games ATS {r.ats_wins}-{r.ats_losses}
                {r.ats_pushes ? `-${r.ats_pushes}` : ""} · Totals {r.ou_wins}-
                {r.ou_losses}
                {r.ou_pushes ? `-${r.ou_pushes}` : ""}
              </p>
              <p className="text-sm text-zinc-300 mt-1">
                Best bets ATS {r.best_bet_ats_wins}-{r.best_bet_ats_losses} ·
                Totals {r.best_bet_ou_wins}-{r.best_bet_ou_losses}
              </p>
              {r.notes && (
                <p className="text-xs text-zinc-500 mt-3">{r.notes}</p>
              )}
            </div>
          ))}
        </div>

        {loading ? (
          <p className="text-zinc-500">Loading results…</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900 text-zinc-400">
                <tr>
                  <th className="text-left px-3 py-2">Game</th>
                  <th className="text-right px-3 py-2">Score</th>
                  <th className="text-right px-3 py-2">ATS</th>
                  <th className="text-right px-3 py-2">Total</th>
                  <th className="text-right px-3 py-2">Best bet</th>
                </tr>
              </thead>
              <tbody>
                {games.map((g) => (
                  <tr key={g.id} className="border-t border-zinc-800">
                    <td className="px-3 py-2.5">
                      {g.away?.name} @ {g.home?.name}
                      {g.week && (
                        <div className="text-xs text-zinc-500">{g.week}</div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {g.away_score ?? "—"}–{g.home_score ?? "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <ResultPill value={g.model_ats} />
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <ResultPill value={g.model_ou} />
                    </td>
                    <td className="px-3 py-2.5 text-right text-zinc-400">
                      {g.best_bet_ats ? "ATS" : ""}
                      {g.best_bet_ats && g.best_bet_ou ? " · " : ""}
                      {g.best_bet_ou ? "OU" : ""}
                      {!g.best_bet_ats && !g.best_bet_ou ? "—" : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}