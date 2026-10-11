export const WORD_STATES = Object.freeze(["untested", "unknown", "learning", "reading", "listening", "pronunciation", "dictation", "active", "stable"]);
const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, Number(value) || 0));

const emptyRecord = () => ({ state: "untested", confidence: 0, exposures: 0, clicks: 0, reading: 0, listening: 0, speaking: 0, dictation: 0, activeUse: 0, scenes: [] });

export function createLearnerModel(rows, responses = []) {
  const words = Object.fromEntries(rows.map((row) => [row.lookup, emptyRecord()]));
  responses.forEach(({ item, word, outcome }) => {
    const record = words[word || item?.lookup];
    if (!record) return;
    record.state = outcome === "correct" ? "reading" : outcome === "unknown" ? "unknown" : "learning";
    record.confidence = outcome === "correct" ? 0.58 : outcome === "unknown" ? 0.08 : 0.2;
    record.reading = outcome === "correct" ? 1 : 0;
  });
  return { version: 2, words, outputGoals: [], outputGaps: [], sessions: [] };
}

export function recordEvidence(model, word, evidence = {}) {
  const key = String(word || "").toLowerCase();
  const record = model.words[key] || (model.words[key] = emptyRecord());
  for (const field of ["exposures", "clicks", "reading", "listening", "speaking", "dictation", "activeUse"]) record[field] += Number(evidence[field] || 0);
  if (evidence.scene && !record.scenes.includes(evidence.scene)) record.scenes.push(evidence.scene);
  const score = record.reading * .14 + record.listening * .16 + record.speaking * .2 + record.dictation * .16 + record.activeUse * .22 + Math.min(3, record.scenes.length) * .04;
  record.confidence = Math.max(record.confidence, clamp(score / 2.1));
  if (record.activeUse >= 2 && record.scenes.length >= 3 && record.confidence >= .85) record.state = "stable";
  else if (record.activeUse) record.state = "active";
  else if (record.dictation) record.state = "dictation";
  else if (record.speaking) record.state = "pronunciation";
  else if (record.listening) record.state = "listening";
  else if (record.reading) record.state = "reading";
  else if (record.exposures || record.clicks) record.state = "learning";
  return record;
}

export function addOutputGap(model, gap) {
  const normalized = { ...gap, createdAt: Date.now(), resolved: false };
  model.outputGaps.unshift(normalized);
  model.outputGaps = model.outputGaps.slice(0, 40);
  return normalized;
}

export function knownWords(model) {
  return Object.entries(model.words).filter(([, record]) => ["reading", "listening", "pronunciation", "dictation", "active", "stable"].includes(record.state)).map(([word]) => word);
}

export function selectTargets(rows, model, estimatedKnown, limit = 4) {
  const comfortable = rows.filter((row) => row.rank <= Math.min(850, estimatedKnown + 100));
  const priority = (record = {}) => record.state === "unknown" ? 0 : record.state === "learning" ? 1 : record.state === "untested" ? 2 : record.state === "stable" ? 5 : 3;
  return comfortable.sort((a, b) => priority(model.words[a.lookup]) - priority(model.words[b.lookup]) || (model.words[a.lookup]?.exposures || 0) - (model.words[b.lookup]?.exposures || 0) || a.rank - b.rank).slice(0, limit);
}

export const OUTPUT_LADDER = Object.freeze([
  { max: 150, mode: "指图＋跟读＋补一个词", seconds: 10 },
  { max: 300, mode: "替换人物或物品说一句", seconds: 15 },
  { max: 500, mode: "看图回答并复述2—3句", seconds: 25 },
  { max: 700, mode: "根据提示介绍一个场景", seconds: 35 },
  { max: 850, mode: "连续表达与角色对话", seconds: 45 },
]);

export function outputPlan(estimatedKnown, scene = "family") {
  const rung = OUTPUT_LADDER.find((item) => estimatedKnown <= item.max) || OUTPUT_LADDER.at(-1);
  const goals = { family: "介绍一位家人", self: "完成简短自我介绍", school: "介绍学校里的一天", shopping: "完成一次简单购物", food: "说出喜欢的食物和原因", neighborhood: "介绍家附近的一个地方", sport: "介绍喜欢的运动", emotion: "表达今天的感受和原因", travel: "说出一次出行计划" };
  return { scene, goal: goals[scene] || "描述眼前的生活场景", ...rung };
}

export function lessonBasis({ workingLevel, settings = {}, model = {}, sessions = [] } = {}) {
  const words = Object.entries(model.words || {})
    .filter(([, record]) => record && (record.state !== "untested" || record.clicks))
    .map(([word, record]) => `${word}:${record.state}:${record.clicks || 0}`)
    .sort();
  const gaps = (model.outputGaps || []).filter((gap) => !gap.resolved).map((gap) => `${gap.word}:${gap.scene || ""}`);
  const latest = sessions[0];
  return JSON.stringify({
    workingLevel,
    scene: settings.scene,
    length: settings.length,
    challenge: settings.challenge,
    words,
    gaps,
    session: latest ? `${latest.id || ""}:${latest.comprehension || ""}:${latest.lessonId || ""}` : "",
  });
}

export function articlePolicy(estimatedKnown, lengthChoice = "short", challenge = "just-right") {
  const lengths = { short: estimatedKnown <= 200 ? 45 : 70, medium: estimatedKnown <= 300 ? 90 : 130, long: estimatedKnown <= 500 ? 160 : 230 };
  const ratios = { easier: 3, "just-right": 5, challenge: 10 };
  return { targetWords: lengths[lengthChoice] || lengths.short, challengePercent: ratios[challenge] || 5, targetDistinct: ratios[challenge] >= 10 ? 5 : 3 };
}

export function outputScore(expectedText, transcript, pronunciation = 80) {
  const tokens = (value) => String(value || "").toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) || [];
  const expected = [...new Set(tokens(expectedText))];
  const said = [...new Set(tokens(transcript))];
  const overlap = expected.filter((word) => said.includes(word)).length;
  const completeness = expected.length ? Math.round(overlap / expected.length * 100) : 0;
  const accuracy = said.length ? Math.round(overlap / said.length * 100) : 0;
  const fluency = Math.round(clamp(said.length / Math.max(1, expected.length)) * 100);
  const rhythm = Number(pronunciation) || 0;
  const total = Math.round(completeness * .35 + accuracy * .3 + fluency * .2 + rhythm * .15);
  return { total, completeness, accuracy, fluency, rhythm: Math.round(rhythm) };
}
