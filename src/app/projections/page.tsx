export default function ProjectionsPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <a href="/" className="text-zinc-400 hover:text-white text-sm">
            ← Back to Dashboard
          </a>
          <h1 className="text-3xl font-bold mt-4">Weekly Projections</h1>
          <p className="text-zinc-400 mt-2">
            Model spreads, totals, and edges vs current market lines
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-zinc-400 text-sm">
            Week 0 / Week 1 board will appear here next.
          </p>
        </div>
      </div>
    </main>
  );
}
