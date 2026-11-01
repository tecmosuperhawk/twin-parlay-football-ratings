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

const STORAGE_KEY = "cbb_pin_session";

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

export default function CbbPickem() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [games, setGames] = useState<Game[]>([]);
  const [myPicks, setMyPicks] = useState<Record<string, string>>({});
  const [allPicks, setAllPicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [selectedName, setSelectedName] = useState<Player | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const { player: saved, expires } = JSON.parse(raw);
      if (saved && expires && Date.now() < expires) {
        setPlayer(saved as Player);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {}
  }, []);

  async function load() {
    if (!player) return;
    setLoading(true);
    setMessage("");
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
  const awayScore = away?.score ? Number(away.score) : null;
  const homeScore = home?.score ? Number(home.score) : null;
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
    awayScore,
    homeScore,
    clock: e.status?.displayClock || "",
    period: e.status?.period || 0,
  };
});
    setGames(parsed);

    if (parsed.length) {
        const gameRows = parsed.map((g) => {
        let winner: string | null = null;
        if (g.status === "post" && g.awayScore != null && g.homeScore != null) {
            winner = g.awayScore > g.homeScore ? g.away : g.home;
        }
        return {
            id: g.id,
            game_date: date,
            tipoff: g.tipoff,
            away_name: g.away,
            home_name: g.home,
            away_record: g.awayRec,
            home_record: g.homeRec,
            venue: g.venue,
            tv: g.tv,
            spread: g.spread,
            status: g.status,
            winner,
        };
        });
      await supabase.from("cbb_games").upsert(gameRows, { onConflict: "id" });

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
    if (player) load();
  }, [date, player]);

  function tryUnlock(name: Player) {
    setSelectedName(name);
    setPinInput("");
    setPinError("");
  }

  function confirmPin() {
    if (!selectedName) return;
    if (pinInput === PINS[selectedName]) {
      setPlayer(selectedName);
      setPinError("");
      setSelectedName(null);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          player: selectedName,
          expires: Date.now() + 60 * 60 * 1000,
        })
      );
    } else {
      setPinError("Wrong PIN");
    }
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setPlayer(null);
    setMyPicks({});
    setAllPicks([]);
  }

  function toggle(gameId: string, team: string) {
    setMyPicks((prev) => ({ ...prev, [gameId]: team }));
  }

  function getFavorite(g: Game): string | null {
    if (!g.spread || g.spread === "—") return null;
    const m = g.spread.match(/^([A-Z&]+)\s*-\d/);
    if (!m) return null;
    const abbr = m[1];
    if (
      g.home.toUpperCase().includes(abbr) ||
      (abbr.length >= 3 && g.home.toUpperCase().startsWith(abbr.slice(0, 3)))
    )
      return g.home;
    if (
      g.away.toUpperCase().includes(abbr) ||
      (abbr.length >= 3 && g.away.toUpperCase().startsWith(abbr.slice(0, 3)))
    )
      return g.away;
    return g.home;
  }

  function applyPreset(kind: "home" | "away" | "fav" | "dog") {
    const next: Record<string, string> = { ...myPicks };
    const now = new Date();
    games.forEach((g) => {
      const tip = new Date(g.tipoff);
      if (now >= tip || g.status !== "pre") return;
      let pick: string | null = null;
      if (kind === "home") pick = g.home;
      if (kind === "away") pick = g.away;
      if (kind === "fav") pick = getFavorite(g);
      if (kind === "dog") {
        const fav = getFavorite(g);
        if (fav) pick = fav === g.home ? g.away : g.home;
      }
      if (pick) next[g.id] = pick;
    });
    setMyPicks(next);
  }

  async function submitAll() {
    if (!player || !Object.keys(myPicks).length) return;
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

if (!player) {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-md mx-auto px-4 py-16">
        <a href="/" className="text-zinc-400 text-sm hover:text-white">
          ← Dashboard
        </a>
        <h1 className="text-3xl font-bold mt-4 mb-2">CBB Pick'em</h1>

        <div className="flex gap-2 mb-6">
          <a
            href="/cbb/picks"
            className="text-sm px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700"
          >
            Group Picks
          </a>
          <a
            href="/cbb/standings"
            className="text-sm px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700"
          >
            Standings
          </a>
        </div>

        <p className="text-zinc-400 text-sm mb-4">
          Select your name and enter your PIN to make picks
        </p>

        <div className="flex gap-2 mb-4">
          {PLAYERS.map((p) => (
            <button
              key={p}
              onClick={() => tryUnlock(p)}
              className={`px-4 py-2 rounded text-sm ${
                selectedName === p
                  ? "bg-white text-zinc-950"
                  : "bg-zinc-800 text-zinc-300"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {selectedName && (
          <div className="flex items-center gap-2">
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="PIN"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmPin()}
              className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm w-28"
              autoFocus
            />
            <button
              onClick={confirmPin}
              className="px-4 py-2 rounded bg-emerald-600 text-sm"
            >
              OK
            </button>
            {pinError && (
              <span className="text-xs text-red-400">{pinError}</span>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <a href="/" className="text-zinc-400 text-sm hover:text-white">
              ← Dashboard
            </a>
            <h1 className="text-3xl font-bold mt-2">CBB Pick'em</h1>
            <p className="text-zinc-400 text-sm">Signed in as {player}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={logout}
              className="text-sm px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700"
            >
              Switch
            </button>
            <a
              href="/cbb/picks"
              className="text-sm px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700"
            >
              Group Picks
            </a>
            <a
              href="/cbb/standings"
              className="text-sm px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700"
            >
              Standings
            </a>
          </div>
        </div>

        <div className="flex gap-4 mb-4 flex-wrap items-end">
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

        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => applyPreset("home")}
            className="px-3 py-1.5 rounded bg-zinc-800 text-sm hover:bg-zinc-700"
          >
            All Home
          </button>
          <button
            onClick={() => applyPreset("away")}
            className="px-3 py-1.5 rounded bg-zinc-800 text-sm hover:bg-zinc-700"
          >
            All Away
          </button>
          <button
            onClick={() => applyPreset("fav")}
            className="px-3 py-1.5 rounded bg-zinc-800 text-sm hover:bg-zinc-700"
          >
            All Favorites
          </button>
          <button
            onClick={() => applyPreset("dog")}
            className="px-3 py-1.5 rounded bg-zinc-800 text-sm hover:bg-zinc-700"
          >
            All Underdogs
          </button>
        </div>

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
                  <div className="text-xs text-zinc-300 mt-3 border-t border-zinc-800 pt-2">
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