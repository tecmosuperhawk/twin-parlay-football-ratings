export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-zinc-400 mt-2">
            College Football Power Ratings • Projections • Edges
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <a
            href="/ratings"
            className="block rounded-xl border border-zinc-800 bg-zinc-900 p-6 hover:border-zinc-600 transition"
          >
            <h2 className="text-xl font-semibold mb-2">Power Ratings</h2>
            <p className="text-zinc-400 text-sm">
              Full blended ratings from Makinen, Steele, SP+, and Massey.
            </p>
          </a>

          <a
            href="/projections"
            className="block rounded-xl border border-zinc-800 bg-zinc-900 p-6 hover:border-zinc-600 transition"
          >
            <h2 className="text-xl font-semibold mb-2">Weekly Projections</h2>
            <p className="text-zinc-400 text-sm">
              Game-by-game spreads, totals, and edges vs the market.
            </p>
          </a>
        </div>

        <div className="mt-10 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold mb-2">Current Focus</h2>
          <p className="text-zinc-400 text-sm">
            Week 0 / Week 1 board is live. Strongest early edges include several
            large underdogs and multiple Over leaners.
          </p>
        </div>
      </div>
    </main>
  );
}