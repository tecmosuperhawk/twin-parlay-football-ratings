export type Sport = "CFB" | "NFL";

export type PlayerLine = {
  name: string;
  team: string;
  att?: number;
  cmp?: number;
  rec?: number;
  yds: number;
  td: number;
  int?: number;
};

export type BoxScore = {
  away: string;
  home: string;
  awayScore: number;
  homeScore: number;
  passing: PlayerLine[];
  rushing: PlayerLine[];
  receiving: PlayerLine[];
  lean: string;
};

const COMMON = [
  7, 10, 13, 14, 17, 20, 21, 24, 27, 28, 31, 34, 35, 38, 41, 42, 45,
];

function snap(x: number) {
  let best = COMMON[0];
  let d = Math.abs(x - best);
  for (const s of COMMON) {
    const n = Math.abs(x - s);
    if (n < d) {
      best = s;
      d = n;
    }
  }
  return best;
}

function splitScores(total: number, homeSpread: number) {
  const margin = Math.max(3, Math.abs(homeSpread));
  let home = (total + (homeSpread < 0 ? margin : -margin)) / 2;
  let away = total - home;
  let hs = snap(home);
  let as = snap(away);
  if (homeSpread < 0 && hs <= as) hs = as + 7;
  if (homeSpread > 0 && as <= hs) as = hs + 7;
  return { awayScore: as, homeScore: hs };
}

function cleanName(s: string) {
  return s
    .replace(/\([^)]*\)/g, "")
    .replace(/\b(jr|sr|iii|ii|iv)\.?$/i, (m) => m)
    .replace(/^[\d.#\-\s]+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function grabAfter(label: RegExp, text: string, max = 5) {
  const lines = text.split(/\n/);
  const out: string[] = [];
  for (const line of lines) {
    if (!label.test(line)) continue;
    const rest = line.replace(label, " ");
    rest
      .split(/[,|/]| or /i)
      .map(cleanName)
      .filter((n) => n.split(" ").length >= 2 && n.length < 40)
      .forEach((n) => {
        if (!out.includes(n) && out.length < max) out.push(n);
      });
  }
  return out;
}

export function extractRoster(text: string) {
  const t = text || "";
  const qbs = [
    ...grabAfter(/\b(qb|quarterback)\b[:\s-]+/i, t, 3),
    ...grabAfter(/\bstarter\b[:\s-]+/i, t, 2),
  ];
  const rbs = grabAfter(/\b(rb|running back|hb|tb)\b[:\s-]+/i, t, 4);
  const wrs = [
    ...grabAfter(/\b(wr|wide receiver|x|z|slot|sl)\b[:\s-]+/i, t, 6),
    ...grabAfter(/\b(te|tight end)\b[:\s-]+/i, t, 3),
  ];
  return {
    qb: qbs[0] || "",
    rbs: rbs.join(", "),
    wrs: wrs.join(", "),
  };
}

export function heuristicBox(input: {
  sport: Sport;
  away: string;
  home: string;
  modelSpread: number;
  modelTotal: number;
  marketSpread?: number | null;
  marketTotal?: number | null;
  homeQB: string;
  awayQB: string;
  homeRBs: string;
  awayRBs: string;
  homeWRs: string;
  awayWRs: string;
}): BoxScore {
  const { awayScore, homeScore } = splitScores(
    input.modelTotal,
    input.modelSpread
  );
  const homeFav = input.modelSpread < 0;
  const passShareOfTotal = input.sport === "NFL" ? 0.62 : 0.58;
  const totalOffYds = input.modelTotal * 14.2;
  const homeYds = totalOffYds * (homeFav ? 0.58 : 0.42);
  const awayYds = totalOffYds - homeYds;
  const homePass = Math.round(homeYds * passShareOfTotal);
  const awayPass = Math.round(awayYds * passShareOfTotal);
  const homeRush = Math.round(homeYds - homePass);
  const awayRush = Math.round(awayYds - awayPass);

  const parseList = (s: string) =>
    s
      .split(/[,|\n]/)
      .map((x) => x.trim())
      .filter(Boolean);

  const hRBs = parseList(input.homeRBs);
  const aRBs = parseList(input.awayRBs);
  const hWRs = parseList(input.homeWRs);
  const aWRs = parseList(input.awayWRs);
  const rushSplit = [0.52, 0.28, 0.2];
  const recSplit = [0.32, 0.24, 0.18, 0.14, 0.12];

  const rushing: PlayerLine[] = [];
  hRBs.slice(0, 3).forEach((n, i) => {
    rushing.push({
      name: n,
      team: input.home,
      att: Math.round((homeFav ? 28 : 22) * rushSplit[i]),
      yds: Math.round(homeRush * rushSplit[i]),
      td: i === 0 && homeScore >= 24 ? 1 : 0,
    });
  });
  aRBs.slice(0, 3).forEach((n, i) => {
    rushing.push({
      name: n,
      team: input.away,
      att: Math.round((homeFav ? 20 : 26) * rushSplit[i]),
      yds: Math.round(awayRush * rushSplit[i]),
      td: i === 0 && awayScore >= 21 ? 1 : 0,
    });
  });

  const homePassTd = Math.max(1, Math.round(homeScore / 17));
  const awayPassTd = Math.max(0, Math.round(awayScore / 21));

  const passing: PlayerLine[] = [
    {
      name: input.homeQB || `${input.home} QB`,
      team: input.home,
      cmp: homeFav ? 20 : 17,
      att: homeFav ? 31 : 29,
      yds: homePass,
      td: homePassTd,
      int: 0,
    },
    {
      name: input.awayQB || `${input.away} QB`,
      team: input.away,
      cmp: homeFav ? 16 : 19,
      att: homeFav ? 29 : 32,
      yds: awayPass,
      td: awayPassTd,
      int: 1,
    },
  ];

  const receiving: PlayerLine[] = [];
  hWRs.slice(0, 5).forEach((n, i) => {
    receiving.push({
      name: n,
      team: input.home,
      rec: Math.max(2, 6 - i),
      yds: Math.round(homePass * recSplit[i]),
      td: i === 0 ? 1 : i === 1 && homePassTd > 1 ? 1 : 0,
    });
  });
  aWRs.slice(0, 5).forEach((n, i) => {
    receiving.push({
      name: n,
      team: input.away,
      rec: Math.max(2, 5 - i),
      yds: Math.round(awayPass * recSplit[i]),
      td: i === 0 && awayPassTd > 0 ? 1 : 0,
    });
  });

  const leanBits = [];
  if (input.marketSpread != null) {
    const edge = input.marketSpread - input.modelSpread;
    leanBits.push(
      Math.abs(edge) >= 2
        ? edge > 0
          ? `${input.away} +${Math.abs(input.marketSpread)}`
          : `${input.home} ${input.marketSpread}`
        : "PASS ATS"
    );
  }
  if (input.marketTotal != null) {
    leanBits.push(input.modelTotal < input.marketTotal ? "UNDER" : "OVER");
  }

  return {
    away: input.away,
    home: input.home,
    awayScore,
    homeScore,
    passing,
    rushing,
    receiving,
    lean: leanBits.join(" • ") || "Model only",
  };
}