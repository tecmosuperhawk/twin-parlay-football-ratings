export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight">CFB Rankings</h1>
          <p className="text-zinc-400 mt-2">Hybrid power ratings and team resumes</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <a
            href="/ratings"
            className="block rounded-xl border border-zinc-800 bg-zinc-900 p-6 hover:border-zinc-600 transition"
          >
            <h2 className="text-xl font-semibold mb-2">Power Ratings</h2>
            <p className="text-zinc-400 text-sm">
              Hybrid ranking with Q1–Q4 records. Click a team for its full resume and schedule.
            </p>
          </a>
        </div>
      </div>
    </main>
  );
}