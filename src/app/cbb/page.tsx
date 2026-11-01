"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

const PLAYERS = ["Andy", "Brett", "Brayden"] as const;
type Player = (typeof PLAYERS)[number];

type Game = {
  id: string;
  date: string;
  tipoff: string;
  away: string;
  home: string;
  awayRec: string;
  homeRec: string;
  venue: string;
  tv: string;
  spread: string;
  status: string;
  winner?: string;
};

export default function CbbPickem() {
  const [player, setPlayer] = useState<Player>("Andy");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [games, setGames] = useState<Game[]>([]);
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [allPicks, setAllPicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const supabase = createClient();

    // Pull from ESPN
    const ymd = date.replace(/-/g, "");
    const res = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?dates=${ymd}`
    );
    const data = await res.json();

    const parsed: Game[] = (data.events || []).map((e: any) => {
      const c = e.competitions[0];
      const home = c.competitors.find((x: any) => x.homeAway === "home");
      const away = c.competitors.find((x: any) => x.homeAway === "away");
      const broadcast = c.broadcasts?.[0]?.names?.[0] || "—";
      const odds = c.odds?.[0];
      return {
        id: e.id,
        date: e.date,
        tipoff: e.date,
        away: away?.team.shortDisplayName || "?",
        home: home?.team.shortDisplayName || "?",
        awayRec: away?.records?.[0]?.summary || "0-0",
        homeRec: home?.records?.[0]?.summary || "0-0",
        venue: c.venue?.fullName || "—",
        tv: broadcast,
        spread: odds?.details || "—",
        status: e.status?.type?.state || "pre",
      };
    });
    setGames(parsed);

    // Load existing picks for this date’s games
    if (parsed.length) {
      const { data: existing } = await supabase
        .from("cbb_picks")
        .select("*")
        .in("game_id", parsed.map((g) => g.id));
      setAllPicks(existing || []);
      const mine: Record<string, string> = {};
      (existing || [])
        .filter((p: any) => p.player === player)
        .forEach((p: any) => (mine[p.game_id] = p.pick));
      setPicks(mine);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [date, player]);

  async function submitPick(gameId: string, pick: string) {
    const supabase = createClient();
    await supabase.from("cbb_picks").upsert(
      { game_id: gameId, player, pick },
      { onConflict: "game_id,player" }
    );
    setPicks((prev) => ({ ...prev, [gameId]: pick }));
    load(); // refresh all picks
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <a href="/" className="text-zinc-400 text-sm hover:text-white">
          ← Dashboard
        </a>
        <h1 className="text-3xl font-bold mt-4">CBB Pick'em</h1>
        <p className="text-zinc-400 text-sm mb-6">
          Straight winner — Andy, Brett, Brayden
        </p>

        <div className="flex gap-4 mb-6 flex-wrap">
          <div>
            <label className="text-xs text-zinc-500">Who are you?</label>
            <div className="flex gap-2 mt-1">
              {PLAYERS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPlayer(p)}
                  className={`px-3 py-1.5 rounded text-sm ${
                    player === p
                      ? "bg-white text-zinc-950"
                      : "bg-zinc-800 text-zinc-300"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-500">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="block mt-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm"
            />
          </div>
        </div>

        {loading && <p className="text-zinc-500">Loading slate…</p>}

        <div className="space-y-4">
          {games.map((g) => {
            const myPick = picks[g.id];
            const others = allPicks.filter((p) => p.game_id === g.id);
            return (
              <div
                key={g.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="font-semibold">
                      {g.away} ({g.awayRec}) @ {g.home} ({g.homeRec})
                    </div>
                    <div className="text-xs text-zinc-400 mt-1">
                      {new Date(g.tipoff).toLocaleString([], {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}{" "}
                      · {g.venue} · {g.tv}
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      Line: {g.spread}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => submitPick(g.id, g.away)}
                      className={`px-3 py-1.5 rounded text-sm ${
                        myPick === g.away
                          ? "bg-emerald-600"
                          : "bg-zinc-800 hover:bg-zinc-700"
                      }`}
                    >
                      {g.away}
                    </button>
                    <button
                      onClick={() => submitPick(g.id, g.home)}
                      className={`px-3 py-1.5 rounded text-sm ${
                        myPick === g.home
                          ? "bg-emerald-600"
                          : "bg-zinc-800 hover:bg-zinc-700"
                      }`}
                    >
                      {g.home}
                    </button>
                  </div>
                </div>
                {others.length > 0 && (
                  <div className="text-xs text-zinc-500 mt-3">
                    {others
                      .map((p) => `${p.player}: ${p.pick}`)
                      .join(" · ")}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {games.length === 0 && !loading && (
          <p className="text-zinc-500 mt-8">No games on this date.</p>
        )}
      </div>
    </main>
  );
}