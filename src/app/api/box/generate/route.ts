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

  const key = process.env.XAI_API_KEY;
  if (key && (previews || depth)) {
    try {
      const prompt = `You project a ${sport} box score.
Rules:
- Use CURRENT rosters from the depth chart / previews. Do not use transferred or graduated players.
- Practical football scores (3s and 7s). No 34.5-30.9.
- Do not pick a huge underdog to win unless the model spread is under 7.
- Model home spread: ${modelSpread} (negative = home favored). Model total: ${modelTotal}.
- Market spread: ${marketSpread}. Market total: ${marketTotal}.
- Week 1 / early season: slightly suppress totals vs market.
Return ONLY JSON:
{"awayScore":n,"homeScore":n,"passing":[{"name","team","cmp","att","yds","td","int"}],"rushing":[{"name","team","att","yds","td"}],"receiving":[{"name","team","rec","yds","td"}],"lean":"string"}
Away: ${away}
Home: ${home}
DEPTH CHART:
${depth}
PREVIEWS:
${previews.slice(0, 24000)}`;

      const r = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "grok-4.3",
          temperature: 0.4,
          messages: [
            {
              role: "system",
              content:
                "You are Twin Parlay box-score projector. JSON only. Current rosters only.",
            },
            { role: "user", content: prompt },
          ],
        }),
      });
      const j = await r.json();
      const text = j?.choices?.[0]?.message?.content || "";
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        box = {
          away,
          home,
          awayScore: parsed.awayScore,
          homeScore: parsed.homeScore,
          passing: parsed.passing || [],
          rushing: parsed.rushing || [],
          receiving: parsed.receiving || [],
          lean: parsed.lean || "",
        };
        used = "llm";
      }
    } catch {
      box = null;
    }
  }

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
