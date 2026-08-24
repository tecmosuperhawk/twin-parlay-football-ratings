import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const key = process.env.FANTASYPROS_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "FANTASYPROS_API_KEY is not set" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const week = searchParams.get("week") ?? "1";
  const position = searchParams.get("position") ?? "QB"; // QB | RB | WR | TE | ALL
  const season = searchParams.get("season") ?? "2026";

  const url = new URL(
    `https://api.fantasypros.com/public/v2/json/nfl/${season}/projections`
  );
  url.searchParams.set("week", week);
  if (position && position !== "ALL") {
    url.searchParams.set("position", position);
  }

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "x-api-key": key,
        Accept: "application/json",
      },
      // avoid caching stale weekly numbers in dev
      cache: "no-store",
    });

    const text = await res.text();
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text.slice(0, 500) };
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: "FantasyPros request failed", status: res.status, body },
        { status: res.status }
      );
    }

    return NextResponse.json(body);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}