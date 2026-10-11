export const TOTAL_WORDS = 850;
export const ABILITY_STEP = 25;
export const OUTCOMES = Object.freeze({ CORRECT: "correct", WRONG: "wrong", UNKNOWN: "unknown" });

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

export function normalize(weights) {
  const total = weights.reduce((sum, value) => sum + value, 0) || 1;
  return weights.map((value) => value / total);
}

export function createPrior(center = 300, sigma = 180) {
  const bins = Math.floor(TOTAL_WORDS / ABILITY_STEP) + 1;
  return normalize(Array.from({ length: bins }, (_, index) =>
    Math.exp(-0.5 * ((index * ABILITY_STEP - center) / sigma) ** 2) + 1e-8,
  ));
}

export function quantile(posterior, target) {
  let cumulative = 0;
  for (let index = 0; index < posterior.length; index += 1) {
    cumulative += posterior[index];
    if (cumulative >= target) return Math.min(TOTAL_WORDS, index * ABILITY_STEP);
  }
  return TOTAL_WORDS;
}

export function summarize(posterior) {
  return { low: quantile(posterior, 0.1), median: quantile(posterior, 0.5), high: quantile(posterior, 0.9) };
}

export function probabilityCorrect(ability, item) {
  const difficulty = Number(item.difficulty || item.rank || 1);
  const discrimination = clamp(Number(item.discrimination || 1), 0.55, 2.2);
  const guessing = clamp(Number(item.guessing ?? 0.25), 0, 0.35);
  const mastery = 1 / (1 + Math.exp((difficulty - ability) / (70 / discrimination)));
  return guessing + (1 - guessing) * mastery;
}

export function updatePosterior(posterior, item, outcome) {
  const kind = outcome === true ? OUTCOMES.CORRECT : outcome === false ? OUTCOMES.WRONG : outcome;
  return normalize(posterior.map((weight, index) => {
    const p = probabilityCorrect(index * ABILITY_STEP, item);
    const likelihood = kind === OUTCOMES.CORRECT ? p : kind === OUTCOMES.UNKNOWN ? (1 - p) * 1.12 : (1 - p);
    return weight * likelihood;
  }));
}

function entropy(probability) {
  if (probability <= 0 || probability >= 1) return 0;
  return -probability * Math.log(probability) - (1 - probability) * Math.log(1 - probability);
}

export function expectedInformation(posterior, item) {
  let predictive = 0;
  let conditional = 0;
  posterior.forEach((weight, index) => {
    const p = probabilityCorrect(index * ABILITY_STEP, item);
    predictive += weight * p;
    conditional += weight * entropy(p);
  });
  return entropy(predictive) - conditional;
}

export function selectNextQuestion(items, usedIds, posterior, categoryCounts = {}) {
  const target = summarize(posterior).median;
  const near = items.filter((item) => !usedIds.has(item.item_id) && Math.abs(item.rank - target) <= 180);
  const pool = near.length ? near : items.filter((item) => !usedIds.has(item.item_id));
  return pool.reduce((best, item) => {
    const diversity = 0.018 / (1 + (categoryCounts[item.source_category] || 0));
    const score = expectedInformation(posterior, item) + diversity;
    return !best || score > best.score ? { item, score } : best;
  }, null)?.item || null;
}

export function shouldStop(posterior, answered, categoryCounts = {}, maxQuestions = 28) {
  const { low, high } = summarize(posterior);
  const represented = Object.values(categoryCounts).filter(Boolean).length;
  return answered >= maxQuestions || (answered >= 18 && represented >= 4 && high - low <= 150);
}

export function estimateBreakdown(responses, summary) {
  const observed = { correct: 0, wrong: 0, unknown: 0 };
  responses.forEach((response) => { observed[response.outcome] += 1; });
  return {
    estimatedKnown: summary.median,
    estimatedUnknown: TOTAL_WORDS - summary.median,
    knownPercent: Math.round(summary.median / TOTAL_WORDS * 100),
    unknownPercent: Math.round((TOTAL_WORDS - summary.median) / TOTAL_WORDS * 100),
    observed,
    tested: responses.length,
    untested: Math.max(0, TOTAL_WORDS - responses.length),
  };
}

export function confidenceLabel(summary) {
  const width = summary.high - summary.low;
  return width <= 100 ? "较高" : width <= 175 ? "中等" : "初步";
}

