import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { readFile } from "fs/promises";
import path from "path";

const FILES = [
  { file: "FantasyPros_Fantasy_Football_Projections_QB.csv", pos: "QB" },
  { file: "FantasyPros_Fantasy_Football_Projections_RB.csv", pos: "RB" },
  { file: "FantasyPros_Fantasy_Football_Projections_WR.csv", pos: "WR" },
  { file: "FantasyPros_Fantasy_Football_Projections_TE.csv", pos: "TE" },
] as const;

function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/'/g, "")
    .replace(/\b(jr|sr|iii|ii|iv)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function num(v: string | undefined): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(String(v).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      if (row.some((x) => x.trim() !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    if (row.some((x) => x.trim() !== "")) rows.push(row);
  }
  return rows;
}

function rowToPatch(pos: string, cells: string[]) {
  if (pos === "QB") {
    return {
      fp_pass_att: num(cells[2]),
      fp_pass_cmp: num(cells[3]),
      fp_pass_yds: num(cells[4]),
      fp_pass_tds: num(cells[5]),
      fp_pass_ints: num(cells[6]),
      fp_rush_att: num(cells[7]),
      fp_rush_yds: num(cells[8]),
      fp_rush_tds: num(cells[9]),
      fp_rec: null,
      fp_rec_yds: null,
      fp_rec_tds: null,
    };
  }
  if (pos === "RB") {
    return {
      fp_pass_att: null,
      fp_pass_cmp: null,
      fp_pass_yds: null,
      fp_pass_tds: null,
      fp_pass_ints: null,
      fp_rush_att: num(cells[2]),
      fp_rush_yds: num(cells[3]),
      fp_rush_tds: num(cells[4]),
      fp_rec: num(cells[5]),
      fp_rec_yds: num(cells[6]),
      fp_rec_tds: num(cells[7]),
    };
  }
  if (pos === "WR") {
    return {
      fp_pass_att: null,
      fp_pass_cmp: null,
      fp_pass_yds: null,
      fp_pass_tds: null,
      fp_pass_ints: null,
      fp_rush_att: num(cells[5]),
      fp_rush_yds: num(cells[6]),
      fp_rush_tds: num(cells[7]),
      fp_rec: num(cells[2]),
      fp_rec_yds: num(cells[3]),
      fp_rec_tds: num(cells[4]),
    };
  }
  return {
    fp_pass_att: null,
    fp_pass_cmp: null,
    fp_pass_yds: null,
    fp_pass_tds: null,
    fp_pass_ints: null,
    fp_rush_att: null,
    fp_rush_yds: null,
    fp_rush_tds: null,
    fp_rec: num(cells[2]),
    fp_rec_yds: num(cells[3]),
    fp_rec_tds: num(cells[4]),
  };
}

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Missing Supabase env" }, { status: 500 });
  }

  const week = Number(new URL(req.url).searchParams.get("week") || "1");
  const supabase = createClient(url, serviceKey);
  const now = new Date().toISOString();

  const { data: ourRows, error: ourErr } = await supabase
    .from("nfl_prop_projections")
    .select("id, player_name, pos")
    .eq("week", week);

  if (ourErr) {
    return NextResponse.json({ error: ourErr.message }, { status: 500 });
  }

  const byPos = new Map<string, Map<string, string>>();
  for (const r of ourRows || []) {
    if (!byPos.has(r.pos)) byPos.set(r.pos, new Map());
    byPos.get(r.pos)!.set(normalize(r.player_name), r.id);
  }

  let updated = 0;
  const unmatched: string[] = [];
  const perPos: Record<string, { csv: number; matched: number }> = {};

  for (const { file, pos } of FILES) {
    const full = path.join(process.cwd(), "data", "fp", file);
    let text: string;
    try {
      text = await readFile(full, "utf8");
    } catch {
      return NextResponse.json(
        { error: "Missing file data/fp/" + file },
        { status: 400 }
      );
    }

    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

    const rows = parseCsv(text);
    const dataRows = rows
      .slice(1)
      .filter((r) => r[0] && r[0].trim() && r[0].trim() !== "\u00a0");

    perPos[pos] = { csv: dataRows.length, matched: 0 };
    const nameMap = byPos.get(pos) || new Map();

    for (const cells of dataRows) {
      const player = (cells[0] || "").trim();
      if (!player) continue;

      const id = nameMap.get(normalize(player));
      if (!id) {
        unmatched.push(player + " (" + pos + ")");
        continue;
      }

      const patch = {
        ...rowToPatch(pos, cells),
        fp_updated_at: now,
      };

      const { error: upErr } = await supabase
        .from("nfl_prop_projections")
        .update(patch)
        .eq("id", id);

      if (upErr) {
        unmatched.push(player + " (" + pos + ") UPDATE: " + upErr.message);
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
    unmatchedSample: unmatched.slice(0, 40),
  });
}