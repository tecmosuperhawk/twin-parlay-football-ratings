import { NextRequest, NextResponse } from "next/server";
import {
  extractRoster,
  heuristicBox,
  type BoxScore,
  type Sport,
} from "@/lib/boxScore";
import { createClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const sport: Sport = body.sport === "NFL" ? "NFL" : "CFB";
  const away = String(body.away || "").trim();
  const home = String(body.home || "").trim();
  if (!away || !home) {
    return NextResponse.json({ error: "Need away and home" }, { status: 400 });
  }

  const modelSpread = Number(body.modelSpread ?? -3);
  const modelTotal = Number(body.modelTotal ?? 48);
  const marketSpread =
    body.marketSpread === "" || body.marketSpread == null
      ? null
      : Number(body.marketSpread);
  const marketTotal =
    body.marketTotal === "" || body.marketTotal == null
      ? null
      : Number(body.marketTotal);

  const previews = String(body.previews || "");
  const depth = String(body.depth || "");

  let box: BoxScore | null = null;
  let used = "heuristic";

  if (!box) {
    const parsed = extractRoster(`${depth}\n${previews}`);
    box = heuristicBox({
      sport,
      away,
      home,
      modelSpread,
      modelTotal,
      marketSpread,
      marketTotal,
      homeQB: body.homeQB || parsed.qb,
      awayQB: body.awayQB || parsed.qb,
      homeRBs: body.homeRBs || parsed.rbs,
      awayRBs: body.awayRBs || parsed.rbs,
      homeWRs: body.homeWRs || parsed.wrs,
      awayWRs: body.awayWRs || parsed.wrs,
    });
    used = "heuristic";
  }

  const supabase = createClient();
  await supabase.from("box_projections").insert({
    sport,
    week: body.week || null,
    away,
    home,
    venue: body.venue || null,
    market_spread: marketSpread,
    market_total: marketTotal,
    model_spread: modelSpread,
    model_total: modelTotal,
    pred_away_score: box.awayScore,
    pred_home_score: box.homeScore,
    box,
    sources: [previews, depth]
      .filter(Boolean)
      .join("\n\n---\n\n")
      .slice(0, 8000),
    notes: used,
  });

  return NextResponse.json({ used, box });
}