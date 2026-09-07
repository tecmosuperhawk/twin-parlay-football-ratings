/** Common-ish CFB final scores (multiples of 3/7 combinations, not exhaustive). */
const COMMON_SCORES = [
  0, 3, 6, 7, 9, 10, 13, 14, 16, 17, 19, 20, 21, 23, 24, 26, 27, 28,
  30, 31, 33, 34, 35, 37, 38, 40, 41, 42, 44, 45, 48, 49, 52, 55, 56,
];

function nearestCommon(x: number): number {
  let best = COMMON_SCORES[0];
  let bestDist = Math.abs(x - best);
  for (const s of COMMON_SCORES) {
    const d = Math.abs(x - s);
    if (d < bestDist) {
      best = s;
      bestDist = d;
    }
  }
  return best;
}

/**
 * homeSpread: home team's line (negative = home favored), e.g. -3.7
 * total: model total, e.g. 55.4
 */
export function practicalPrediction(
  homeTeam: string,
  awayTeam: string,
  homeSpread: number,
  total: number
): { text: string; homePts: number; awayPts: number } {
  // Raw split from model
  let homeRaw = (total - homeSpread) / 2;
  let awayRaw = (total + homeSpread) / 2;

  // Light narrative lean on close games only (|spread| < 4):
  // bump favorite by ~1 point of "conviction" — still not a huge upset engine
  if (Math.abs(homeSpread) < 4) {
    if (homeSpread < 0) {
      homeRaw += 0.6;
      awayRaw -= 0.3;
    } else if (homeSpread > 0) {
      awayRaw += 0.6;
      homeRaw -= 0.3;
    }
  }

  // Never flip a dog of 10+ into an outright win
  const margin = homeRaw - awayRaw;
  if (homeSpread <= -10 && margin < 0) {
    // force home still wins
    const mid = (homeRaw + awayRaw) / 2;
    homeRaw = mid + Math.abs(homeSpread) / 2;
    awayRaw = mid - Math.abs(homeSpread) / 2;
  }
  if (homeSpread >= 10 && margin > 0) {
    const mid = (homeRaw + awayRaw) / 2;
    awayRaw = mid + Math.abs(homeSpread) / 2;
    homeRaw = mid - Math.abs(homeSpread) / 2;
  }

  let homePts = nearestCommon(homeRaw);
  let awayPts = nearestCommon(awayRaw);

  // Avoid ties — nudge winner
  if (homePts === awayPts) {
    if (homeSpread <= 0) homePts = nearestCommon(homePts + 3);
    else awayPts = nearestCommon(awayPts + 3);
    if (homePts === awayPts) {
      if (homeSpread <= 0) homePts += 1;
      else awayPts += 1;
    }
  }

  // Prefer not to land on awkward 1-point games too often; if 1-pt, try +2 on winner
  if (Math.abs(homePts - awayPts) === 1) {
    if (homePts > awayPts) homePts = nearestCommon(homePts + 2);
    else awayPts = nearestCommon(awayPts + 2);
  }

  const winner = homePts > awayPts ? homeTeam : awayTeam;
  const text = `${winner} ${Math.max(homePts, awayPts)}-${Math.min(homePts, awayPts)}`;

  return { text, homePts, awayPts };
}