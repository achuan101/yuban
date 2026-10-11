import { defineStore } from 'pinia'
import bank from '@/data/scene850.json'
import { createLearnerModel, recordEvidence, addOutputGap } from '@/domain/learning-engine.mjs'
import { summarizeWords, progression } from '@/domain/progress.mjs'
const KEY = 'yuban-alex-v2'
const defaults = () => ({ libraryId: bank.meta.library_id, onboardingDone: false, placementDone: false, profile: { name: '', ageGroup: 'child', goal: 'speaking', selfLevel: 'new', dailyMinutes: 15 }, summary: { low: 0, median: 100, high: 250 }, workingLevel: 100, responses: [], model: createLearnerModel(bank.rows), sessions: [], lesson: null, settings: { scene: 'family', length: 'short', challenge: 'just-right' }, articleSerial: 0, guideSeen: false, companionName: 'Alex', storageError: '' })
function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (saved?.libraryId === bank.meta.library_id && saved?.model?.words) return { ...defaults(), ...saved, storageError: '' }
    const old = JSON.parse(localStorage.getItem('alex850Model') || localStorage.getItem('yuban-learner-v1') || 'null')
    // Old Ogden / demo estimates do not describe the new scene vocabulary.
    if (old) return { ...defaults(), profile: { ...defaults().profile, ...old.profile }, onboardingDone: Boolean(old.profile), sessions: (old.sessions || []).map(s => ({ ...s, type: 'legacy' })) }
  } catch { /* corrupted storage never blocks first use */ }
  return defaults()
}
export const useLearnerStore = defineStore('learner', {
  state: load,
  getters: { displayName: s => s.profile.name || '朋友', counts: s => summarizeWords(bank.rows, s.model), topics: () => ['家人与生活','自我介绍','学校与朋友','购物','食物','社区','运动','心情','出行'], nextStep: s => progression(s.sessions, s.workingLevel) },
  actions: {
    persist() { try { localStorage.setItem(KEY, JSON.stringify({ ...this.$state, storageError: '' })); this.storageError = '' } catch { this.storageError = '浏览器存储空间不足，请到“我的”导出学习档案。' } },
    saveOnboarding(form) { this.profile = { ...this.profile, ...form }; this.onboardingDone = true; this.persist() },
    applyPlacement(result) { this.summary = result.summary; this.responses = result.responses; this.model = createLearnerModel(bank.rows, result.responses); this.workingLevel = Math.max(50, result.summary.low); this.placementDone = true; this.lesson = null; this.persist() },
    evidence(word, evidence) { if (this.model.words[word]) { recordEvidence(this.model, word, evidence); this.persist() } },
    needHelp(word, scene) {
      this.evidence(word, { clicks: 1, exposures: 1, scene }); const r = this.model.words[word]
      if (r) { r.state = 'learning'; r.confidence = Math.min(r.confidence, .45) }
      if (!this.model.outputGaps.some(g => !g.resolved && g.word === word)) addOutputGap(this.model, { word, scene, detail: `${word} 在上下文中还需要解释` })
      this.persist()
    },
    saveLesson(lesson) { this.lesson = lesson; this.persist() },
    addSession(summary) { this.sessions.unshift({ id: crypto.randomUUID(), at: new Date().toISOString(), ...summary }); this.sessions = this.sessions.slice(0, 80); this.persist() },
    advance() { if (this.nextStep.ready) { this.workingLevel = this.nextStep.next; this.persist() } },
    resetAll() { this.$patch(defaults()); this.persist() },
    importArchive(raw) {
      const s = JSON.parse(raw).state
      if (s?.libraryId !== bank.meta.library_id || !s.model?.words || !Number.isFinite(s.summary?.median) || s.summary.median < 0 || s.summary.median > 850) throw new Error('档案的词库版本不同，请按当前场景词库重新测评')
      const base = defaults()
      for (const row of bank.rows) { const r = s.model.words[row.lookup]; if (r && typeof r === 'object') base.model.words[row.lookup] = { ...base.model.words[row.lookup], ...r } }
      base.model.outputGaps = Array.isArray(s.model.outputGaps) ? s.model.outputGaps.slice(0, 40) : []
      this.$patch({ ...base, profile: { ...base.profile, ...s.profile }, summary: s.summary, workingLevel: Math.max(50, Math.min(850, s.workingLevel || s.summary.low || 100)), responses: s.responses || [], sessions: s.sessions || [], onboardingDone: true, placementDone: true }); this.persist()
    },
  },
})
