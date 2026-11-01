import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const POSITIONS = ["QB", "RB", "WR", "TE"] as const;

function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/'/g, "")
    .replace(/\b(jr|sr|iii|ii|iv)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function num(v: unknown): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function POST(req: NextRequest) {
  const fpKey = process.env.FANTASYPROS_API_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!fpKey || !url || !serviceKey) {
    return NextResponse.json(
      { error: "Missing FANTASYPROS_API_KEY or Supabase env" },
      { status: 500 }
    );
  }

  const week = Number(new URL(req.url).searchParams.get("week") || "1");
  const supabase = createClient(url, serviceKey);
  const now = new Date().toISOString();

  // All our week rows
  const { data: ourRows, error: ourErr } = await supabase
    .from("nfl_prop_projections")
    .select("id, player_name, pos")
    .eq("week", week);

  if (ourErr) {
    return NextResponse.json({ error: ourErr.message }, { status: 500 });
  }

  // Map: pos -> normalize(name) -> id
  const byPos = new Map<string, Map<string, string>>();
  for (const r of ourRows || []) {
    if (!byPos.has(r.pos)) byPos.set(r.pos, new Map());
    byPos.get(r.pos)!.set(normalize(r.player_name), r.id);
  }

  let updated = 0;
  let unmatched: string[] = [];
  const perPos: Record<string, { fp: number; matched: number }> = {};

  for (const pos of POSITIONS) {
    const fpRes = await fetch(
      `https://api.fantasypros.com/public/v2/json/nfl/2026/projections?week=${week}&position=${pos}`,
      {
        headers: { "x-api-key": fpKey, Accept: "application/json" },
        cache: "no-store",
      }
    );

    if (!fpRes.ok) {
      return NextResponse.json(
        {
          error: `FP ${pos} failed`,
          status: fpRes.status,
          body: await fpRes.text(),
        },
        { status: 502 }
      );
    }

    const body = await fpRes.json();
    const players = body.players || [];
    perPos[pos] = { fp: players.length, matched: 0 };
    const nameMap = byPos.get(pos) || new Map();

    for (const p of players) {
      const stats = p.stats || {};
      const patch = {
        fp_pass_att: num(stats.pass_att),
        fp_pass_cmp: num(stats.pass_cmp),
        fp_pass_yds: num(stats.pass_yds),
        fp_pass_tds: num(stats.pass_tds),
        fp_pass_ints: num(stats.pass_ints),
        fp_rush_att: num(stats.rush_att),
        fp_rush_yds: num(stats.rush_yds),
        fp_rush_tds: num(stats.rush_tds),
        fp_rec: num(stats.rec),
        fp_rec_yds: num(stats.rec_yds),
        fp_rec_tds: num(stats.rec_tds),
        fp_updated_at: now,
      };

      const id = nameMap.get(normalize(p.name || ""));
      if (!id) {
        unmatched.push(`${p.name} (${pos})`);
        continue;
      }

      const { error: upErr } = await supabase
        .from("nfl_prop_projections")
        .update(patch)
        .eq("id", id);

      if (upErr) {
        unmatched.push(`${p.name} (${pos}) UPDATE: ${upErr.message}`);
        continue;
      }

      updated++;
      perPos[pos].matched++;
    }
  }

  return NextResponse.json({
    week,
    ourRows: (ourRows || []).length,
    updated,
    unmatchedCount: unmatched.length,
    perPos,
    unmatchedSample: unmatched.slice(0, 30),
  });
}