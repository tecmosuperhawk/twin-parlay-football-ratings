import ratings from "@/data/ratings-2026.json";

export default function RatingsPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <a href="/" className="text-zinc-400 hover:text-white text-sm">
            &larr; Back to Dashboard
          </a>
          <h1 className="text-3xl font-bold mt-4">Power Ratings</h1>
          <p className="text-zinc-400 mt-2">
            Blended ratings from Makinen, Phil Steele, ESPN SP+, and Massey
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900 text-zinc-400">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">#</th>
                  <th className="text-left px-4 py-3 font-medium">Team</th>
                  <th className="text-right px-4 py-3 font-medium">Blended</th>
                  <th className="text-right px-4 py-3 font-medium">Makinen</th>
                  <th className="text-right px-4 py-3 font-medium">Steele</th>
                  <th className="text-right px-4 py-3 font-medium">SP+</th>
                  <th className="text-right px-4 py-3 font-medium">Massey</th>
                  <th className="text-right px-4 py-3 font-medium">HFA</th>
                </tr>
              </thead>
              <tbody>
                {ratings.map((r) => (
                  <tr
                    key={r.team_key}
                    className="border-t border-zinc-800 hover:bg-zinc-900/60"
                  >
                    <td className="px-4 py-2.5 text-zinc-500">{r.rank}</td>
                    <td className="px-4 py-2.5 font-medium">{r.team}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-emerald-400">
                      {r.blended_z > 0 ? "+" : ""}
                      {r.blended_z}
                    </td>
                    <td className="px-4 py-2.5 text-right text-zinc-300">
                      {r.makinen}
                    </td>
                    <td className="px-4 py-2.5 text-right text-zinc-300">
                      {r.steele ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right text-zinc-300">
                      {r.sp_plus ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right text-zinc-300">
                      {r.massey ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right text-zinc-500">
                      {r.hfa}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-zinc-500 text-xs mt-4">
          Blended column is a normalized z-score average of the four sources.
          Higher is better.
        </p>
      </div>
    </main>
  );
}
