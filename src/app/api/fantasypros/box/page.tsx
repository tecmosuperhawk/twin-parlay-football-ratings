"use client";

import { useMemo, useState } from "react";
import type { BoxScore } from "@/lib/boxScore";

export default function BoxStudioPage() {
  const [sport, setSport] = useState<"CFB" | "NFL">("CFB");
  const [away, setAway] = useState("");
  const [home, setHome] = useState("");
  const [venue, setVenue] = useState("");
  const [week, setWeek] = useState("1");
  const [modelSpread, setModelSpread] = useState("-7");
  const [modelTotal, setModelTotal] = useState("48");
  const [marketSpread, setMarketSpread] = useState("");
  const [marketTotal, setMarketTotal] = useState("");
  const [awayQB, setAwayQB] = useState("");
  const [homeQB, setHomeQB] = useState("");
  const [awayRBs, setAwayRBs] = useState("");
  const [homeRBs, setHomeRBs] = useState("");
  const [awayWRs, setAwayWRs] = useState("");
  const [homeWRs, setHomeWRs] = useState("");
  const [depth, setDepth] = useState("");
  const [previews, setPreviews] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [box, setBox] = useState<BoxScore | null>(null);
  const [used, setUsed] = useState("");

  const canRun = useMemo(() => away && home, [away, home]);

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/box/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sport,
          week,
          away,
          home,
          venue,
          modelSpread,
          modelTotal,
          marketSpread,
          marketTotal,
          awayQB,
          homeQB,
          awayRBs,
          homeRBs,
          awayWRs,
          homeWRs,
          depth,
          previews,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setBox(data.box);
      setUsed(data.used);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <a href="/" className="text-zinc-400 hover:text-white text-sm">
          &larr; Back to Dashboard
        </a>
        <h1 className="text-3xl font-bold mt-4">Box Score Studio</h1>
        <p className="text-zinc-400 mt-2">
          Paste previews and depth charts. We blend those with the model line
          into a practical projected box.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="flex gap-2">
              {(["CFB", "NFL"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSport(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm border ${
                    sport === s
                      ? "border-amber-400 text-amber-300"
                      : "border-zinc-700 text-zinc-400"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Away" value={away} onChange={setAway} />
              <Field label="Home" value={home} onChange={setHome} />
              <Field label="Venue" value={venue} onChange={setVenue} />
              <Field label="Week" value={week} onChange={setWeek} />
              <Field
                label="Model spread (home)"
                value={modelSpread}
                onChange={setModelSpread}
              />
              <Field
                label="Model total"
                value={modelTotal}
                onChange={setModelTotal}
              />
              <Field
                label="Market spread"
                value={marketSpread}
                onChange={setMarketSpread}
              />
              <Field
                label="Market total"
                value={marketTotal}
                onChange={setMarketTotal}
              />
            </div>

            <Field label="Away QB" value={awayQB} onChange={setAwayQB} />
            <Field label="Home QB" value={homeQB} onChange={setHomeQB} />
            <Field
              label="Away RBs (comma list)"
              value={awayRBs}
              onChange={setAwayRBs}
            />
            <Field
              label="Home RBs (comma list)"
              value={homeRBs}
              onChange={setHomeRBs}
            />
            <Field
              label="Away WRs/TEs"
              value={awayWRs}
              onChange={setAwayWRs}
            />
            <Field
              label="Home WRs/TEs"
              value={homeWRs}
              onChange={setHomeWRs}
            />

            <label className="block text-sm text-zinc-400">
              Depth chart
              <textarea
                className="mt-1 w-full h-28 rounded-lg bg-zinc-900 border border-zinc-800 p-3 text-sm"
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
                placeholder="Paste two-deep or Ourlads / official chart"
              />
            </label>
            <label className="block text-sm text-zinc-400">
              Previews (one or more)
              <textarea
                className="mt-1 w-full h-40 rounded-lg bg-zinc-900 border border-zinc-800 p-3 text-sm"
                value={previews}
                onChange={(e) => setPreviews(e.target.value)}
                placeholder="Paste Covers, Action, Rotowire, CBS, etc."
              />
            </label>

            <button
              disabled={!canRun || loading}
              onClick={generate}
              className="w-full rounded-lg bg-amber-500 text-black font-semibold py-2.5 disabled:opacity-40"
            >
              {loading ? "Projecting…" : "Generate box score"}
            </button>
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            {!box && (
              <p className="text-zinc-500 text-sm">
                Fill the matchup and paste source material. Starter names help
                even without an API key.
              </p>
            )}
            {box && (
              <div>
                <p className="text-xs uppercase tracking-widest text-amber-400">
                  Twin Parlay • {sport} {used}
                </p>
                <h2 className="text-4xl font-bold mt-2">
                  {box.home} {box.homeScore}
                </h2>
                <h3 className="text-2xl text-zinc-400">
                  {box.away} {box.awayScore}
                </h3>
                <p className="text-sm text-zinc-500 mt-2">{box.lean}</p>

                <Section title="Passing" rows={box.passing} kind="pass" />
                <Section title="Rushing" rows={box.rushing} kind="rush" />
                <Section title="Receiving" rows={box.receiving} kind="rec" />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-sm text-zinc-400">
      {label}
      <input
        className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Section({
  title,
  rows,
  kind,
}: {
  title: string;
  rows: BoxScore["passing"];
  kind: "pass" | "rush" | "rec";
}) {
  return (
    <div className="mt-6">
      <h4 className="text-amber-400 text-sm font-semibold mb-2">{title}</h4>
      <div className="space-y-1 text-sm">
        {rows.map((r, i) => (
          <div
            key={`${r.name}-${i}`}
            className="flex justify-between border-b border-zinc-800 py-1"
          >
            <span>
              {r.name}{" "}
              <span className="text-zinc-500">({r.team})</span>
            </span>
            <span className="text-zinc-300">
              {kind === "pass" &&
                `${r.cmp}-${r.att}, ${r.yds} yds, ${r.td} TD, ${r.int} INT`}
              {kind === "rush" && `${r.att} att, ${r.yds} yds, ${r.td} TD`}
              {kind === "rec" && `${r.rec} rec, ${r.yds} yds, ${r.td} TD`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}