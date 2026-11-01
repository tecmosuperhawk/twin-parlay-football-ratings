"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

type Game = {
  id: string;
  tipoff: string;
  away: string;
  home: string;
  awayRec: string;
  homeRec: string;
  venue: string;
  tv: string;
  spread: string;
  status: string;
};

export default function GroupPicks() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [games, setGames] = useState<Game[]>([]);
  const [picks, setPicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const supabase = createClient();

      const ymd = date.replace(/-/g, "");
      const res = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?dates=${ymd}&groups=50`
      );
      const data = await res.json();

      const parsed: Game[] = (data.events || []).map((e: any) => {
        const c = e.competitions[0];
        const home = c.competitors.find((x: any) => x.homeAway === "home");
        const away = c.competitors.find((x: any) => x.homeAway === "away");
        return {
          id: e.id,
          tipoff: e.date,
          away: away?.team.shortDisplayName || "?",
          home: home?.team.shortDisplayName || "?",
          awayRec: away?.records?.[0]?.summary || "0-0",
          homeRec: home?.records?.[0]?.summary || "0-0",
          venue: c.venue?.fullName || "—",
          tv: c.broadcasts?.[0]?.names?.[0] || "—",
          spread: c.odds?.[0]?.details || "—",
          status: e.status?.type?.state || "pre",
        };
      });
      setGames(parsed);

      if (parsed.length) {
        const { data: existing } = await supabase
          .from("cbb_picks")
          .select("*")
          .in(
            "game_id",
            parsed.map((g) => g.id)
          );
        setPicks(existing || []);
      } else {
        setPicks([]);
      }
      setLoading(false);
    }
    load();
  }, [date]);

  const now = new Date();

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <a href="/" className="text-zinc-400 text-sm hover:text-white">
              ← Dashboard
            </a>
            <h1 className="text-3xl font-bold mt-2">Group Picks</h1>
          </div>
          <div className="flex gap-2">
            <a
              href="/cbb"
              className="text-sm px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700"
            >
              Make Picks
            </a>
            <a
              href="/cbb/standings"
              className="text-sm px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700"
            >
              Standings
            </a>
          </div>
        </div>

        <div className="mb-6">
          <label className="text-xs text-zinc-500">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="block mt-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm"
          />
        </div>

        {loading && <p className="text-zinc-500">Loading…</p>}

        <div className="space-y-4">
          {games.map((g) => {
            const tip = new Date(g.tipoff);
            const locked = now >= tip || g.status !== "pre";
            const gamePicks = picks.filter((p) => p.game_id === g.id);

            return (
              <div
                key={g.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
              >
                <div className="font-semibold">
                  {g.away} ({g.awayRec}) @ {g.home} ({g.homeRec})
                </div>
                <div className="text-xs text-zinc-400 mt-1">
                  {tip.toLocaleString([], {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}{" "}
                  · {g.venue} · {g.tv}
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">Line: {g.spread}</div>

                {locked ? (
                  gamePicks.length > 0 ? (
                    <div className="text-sm text-zinc-300 mt-3 border-t border-zinc-800 pt-2">
                      {gamePicks.map((p) => `${p.player}: ${p.pick}`).join(" · ")}
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-600 mt-2">No picks</div>
                  )
                ) : (
                  <div className="text-xs text-zinc-600 mt-2">
                    Picks hidden until tipoff
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