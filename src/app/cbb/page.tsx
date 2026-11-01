"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

const PLAYERS = ["Andy", "Brett", "Brayden"] as const;
type Player = (typeof PLAYERS)[number];

const PINS: Record<Player, string> = {
  Andy: "3747",
  Brett: "2380",
  Brayden: "6910",
};

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

export default function CbbPickem() {
  const [player, setPlayer] = useState<Player>("Andy");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [games, setGames] = useState<Game[]>([]);
  const [myPicks, setMyPicks] = useState<Record<string, string>>({});
  const [allPicks, setAllPicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [pinPrompt, setPinPrompt] = useState<{ target: Player; value: string } | null>(null);
  const [pinError, setPinError] = useState("");

  async function load() {
    setLoading(true);
    setMessage("");
    const supabase = createClient();

    const ymd = date.replace(/-/g, "");
    const res = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?dates=${ymd}`
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
      setAllPicks(existing || []);

      const mine: Record<string, string> = {};
      (existing || [])
        .filter((p: any) => p.player === player)
        .forEach((p: any) => (mine[p.game_id] = p.pick));
      setMyPicks(mine);
    } else {
      setAllPicks([]);
      setMyPicks({});
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [date, player]);

  function trySwitch(target: Player) {
    if (target === player) return;
    setPinPrompt({ target, value: "" });
    setPinError("");
  }

  function confirmPin() {
    if (!pinPrompt) return;
    if (pinPrompt.value === PINS[pinPrompt.target]) {
      setPlayer(pinPrompt.target);
      setPinPrompt(null);
      setPinError("");
    } else {
      setPinError("Wrong PIN");
    }
  }

  function toggle(gameId: string, team: string) {
    setMyPicks((prev) => ({ ...prev, [gameId]: team }));
  }

  async function submitAll() {
    if (!Object.keys(myPicks).length) return;
    setSaving(true);
    setMessage("");
    const supabase = createClient();

    const rows = Object.entries(myPicks).map(([game_id, pick]) => ({
      game_id,
      player,
      pick,
    }));

    const { error } = await supabase.from("cbb_picks").upsert(rows, {
      onConflict: "game_id,player",
    });

    if (error) {
      setMessage("Save failed: " + error.message);
    } else {
      setMessage("Picks saved");
      await load();
    }
    setSaving(false);
  }

  const now = new Date();

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <a href="/" className="text-zinc-400 text-sm hover:text-white">
              ← Dashboard
            </a>
            <h1 className="text-3xl font-bold mt-2">CBB Pick'em</h1>
          </div>
          <a
            href="/cbb/standings"
            className="text-sm px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700"
          >
            Standings
          </a>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-end">
          <div>
            <label className="text-xs text-zinc-500">Who are you?</label>
            <div className="flex gap-2 mt-1">
              {PLAYERS.map((p) => (
                <button
                  key={p}
                  onClick={() => trySwitch(p)}
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
          <button
            onClick={submitAll}
            disabled={saving || !Object.keys(myPicks).length}
            className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-sm font-medium"
          >
            {saving ? "Saving…" : "Submit Picks"}
          </button>
        </div>

        {pinPrompt && (
          <div className="mb-4 p-3 rounded-lg border border-zinc-700 bg-zinc-900 inline-block">
            <div className="text-sm mb-2">PIN for {pinPrompt.target}</div>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pinPrompt.value}
              onChange={(e) =>
                setPinPrompt({ ...pinPrompt, value: e.target.value })
              }
              onKeyDown={(e) => e.key === "Enter" && confirmPin()}
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm w-24"
              autoFocus
            />
            <button
              onClick={confirmPin}
              className="ml-2 px-3 py-1.5 rounded bg-zinc-700 text-sm"
            >
              OK
            </button>
            {pinError && (
              <span className="ml-3 text-xs text-red-400">{pinError}</span>
            )}
          </div>
        )}

        {message && <p className="text-sm mb-4 text-zinc-300">{message}</p>}
        {loading && <p className="text-zinc-500">Loading…</p>}

        <div className="space-y-4">
          {games.map((g) => {
            const tip = new Date(g.tipoff);
            const locked = now >= tip || g.status !== "pre";
            const myPick = myPicks[g.id];
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
                      {tip.toLocaleString([], {
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
                  {!locked && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => toggle(g.id, g.away)}
                        className={`px-3 py-1.5 rounded text-sm ${
                          myPick === g.away
                            ? "bg-emerald-600"
                            : "bg-zinc-800 hover:bg-zinc-700"
                        }`}
                      >
                        {g.away}
                      </button>
                      <button
                        onClick={() => toggle(g.id, g.home)}
                        className={`px-3 py-1.5 rounded text-sm ${
                          myPick === g.home
                            ? "bg-emerald-600"
                            : "bg-zinc-800 hover:bg-zinc-700"
                        }`}
                      >
                        {g.home}
                      </button>
                    </div>
                  )}
                  {locked && myPick && (
                    <div className="text-sm text-emerald-400">You: {myPick}</div>
                  )}
                </div>

                {locked && others.length > 0 && (
                  <div className="text-xs text-zinc-400 mt-3 border-t border-zinc-800 pt-2">
                    {others.map((p) => `${p.player}: ${p.pick}`).join(" · ")}
                  </div>
                )}
                {!locked && (
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