export const tokens = text => String(text || '').toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) || []
export function compareText(expected, actual) {
  const a = tokens(expected), b = tokens(actual)
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0))
  for (let i = 0; i <= a.length; i++) dp[i][0] = i
  for (let j = 0; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  let i = a.length, j = b.length; const words = [], extras = []
  while (i || j) {
    if (i && j && a[i - 1] === b[j - 1]) { words.unshift({ word: a[i - 1], ok: true }); i--; j-- }
    else if (i && j && dp[i][j] === dp[i - 1][j - 1] + 1) { words.unshift({ word: a[i - 1], ok: false, heard: b[j - 1] }); i--; j-- }
    else if (j && (!i || dp[i][j] === dp[i][j - 1] + 1)) { extras.unshift(b[j - 1]); j-- }
    else { words.unshift({ word: a[i - 1], ok: false }); i-- }
  }
  const score = a.length ? Math.round(Math.max(0, 1 - dp[a.length][b.length] / Math.max(a.length, b.length)) * 100) : 0
  return { score, words, extras, matched: words.filter(w => w.ok).map(w => w.word) }
}
export function progression(sessions, current) {
  const recent = sessions.filter(s => s.type === 'lesson').slice(0, 3)
  const ready = current < 850 && recent.length === 3 && new Set(recent.map(s => s.lessonId)).size === 3 && recent.every(s => s.lessonId && s.level === current && s.wholePractice && s.comprehension === 'easy' && s.textScore >= 90 && s.supportRatio <= .05) && new Set(recent.map(s => s.scene)).size >= 2
  return { ready, next: ready ? Math.min(850, current + 100) : current }
}
export function summarizeWords(rows, model) {
  const counts = { recognized: 0, learning: 0, stable: 0, untested: 0 }
  for (const row of rows) {
    const r = model?.words?.[row.lookup]
    if (!r || r.state === 'untested') counts.untested++
    else if (r.state === 'stable') counts.stable++
    else if (['reading','listening','pronunciation','dictation','active'].includes(r.state) && !r.clicks) counts.recognized++
    else counts.learning++
  }
  return counts
}
