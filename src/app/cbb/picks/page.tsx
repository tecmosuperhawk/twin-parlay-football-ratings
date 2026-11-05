"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

const PLAYERS = ["Andy", "Brett", "Brayden"];

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
  awayScore: number | null;
  homeScore: number | null;
  clock: string;
  period: number;
};

function todayCT() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Chicago" });
}

export default function GroupPicks() {
  const [date, setDate] = useState(todayCT());
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
        const state = e.status?.type?.state || "pre";
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
          status: state,
          awayScore: away?.score ? Number(away.score) : null,
          homeScore: home?.score ? Number(home.score) : null,
          clock: e.status?.displayClock || "",
          period: e.status?.period || 0,
        };
      });
      setGames(parsed);

      if (parsed.length) {
        const now = new Date();
        const locked = parsed.filter(
          (g) => now >= new Date(g.tipoff) || g.status !== "pre"
        );

        if (locked.length) {
          const { data: existing } = await supabase
            .from("cbb_picks")
            .select("game_id, player")
            .in(
              "game_id",
              locked.map((g) => g.id)
            );

          const have = new Set(
            (existing || []).map((p: any) => `${p.game_id}:${p.player}`)
          );

          const defaults: any[] = [];
          for (const g of locked) {
            for (const name of PLAYERS) {
              if (!have.has(`${g.id}:${name}`)) {
                defaults.push({
                  game_id: g.id,
                  player: name,
                  pick: g.away,
                  is_default: true,
                });
              }
            }
          }

          if (defaults.length) {
            await supabase.from("cbb_picks").upsert(defaults, {
              onConflict: "game_id,player",
              ignoreDuplicates: true,
            });
          }
        }

        const { data: all } = await supabase
          .from("cbb_picks")
          .select("*")
          .in(
            "game_id",
            parsed.map((g) => g.id)
          );
        setPicks(all || []);
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

        <div className="mb-2">
          <label className="text-xs text-zinc-500">Date (Central)</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="block mt-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm"
          />
        </div>

        <p className="text-sm text-zinc-400 mb-4">
          {games.length} game{games.length === 1 ? "" : "s"}
        </p>

        {loading && <p className="text-zinc-500">Loading…</p>}

        <div className="space-y-4">
          {games.map((g) => {
            const tip = new Date(g.tipoff);
            const locked = now >= tip || g.status !== "pre";
            const gamePicks = picks.filter((p) => p.game_id === g.id);
            const submitted = new Set(gamePicks.map((p: any) => p.player));

            return (
              <div
                key={g.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
              >
                <div className="font-semibold">
                  {g.away} ({g.awayRec}) @ {g.home} ({g.homeRec})
                </div>
                <div className="text-xs text-zinc-400 mt-1">
                  {tip.toLocaleString("en-US", {
                    timeZone: "America/Chicago",
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}{" "}
                  CT · {g.venue} · {g.tv}
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">Line: {g.spread}</div>

                {(g.status === "in" || g.status === "post") &&
                  g.awayScore != null &&
                  g.homeScore != null && (
                    <div className="text-sm mt-1 font-medium">
                      {g.away} {g.awayScore} – {g.home} {g.homeScore}
                      {g.status === "in" && (
                        <span className="text-xs text-zinc-400 ml-2">
                          {g.period > 2 ? `OT${g.period - 2}` : `H${g.period}`} {g.clock}
                        </span>
                      )}
                      {g.status === "post" && (
                        <span className="text-xs text-zinc-500 ml-2">Final</span>
                      )}
                    </div>
                  )}

                {locked ? (
                  <div className="text-sm text-zinc-300 mt-3 border-t border-zinc-800 pt-2">
                    {PLAYERS.map((name) => {
                      const p = gamePicks.find((x: any) => x.player === name);
                      if (!p) return `${name}: ${g.away} (default)`;
                      return p.is_default
                        ? `${name}: ${p.pick} (default)`
                        : `${name}: ${p.pick}`;
                    }).join(" · ")}
                  </div>
                ) : (
                  <div className="text-xs text-zinc-400 mt-3 border-t border-zinc-800 pt-2">
                    {PLAYERS.map((name) =>
                      submitted.has(name) ? `${name}: submitted` : `${name}: not submitted`
                    ).join(" · ")}
                    <div className="text-zinc-600 mt-1">Picks hidden until tipoff</div>
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