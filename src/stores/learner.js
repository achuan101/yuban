import { defineStore } from 'pinia'
import { topicsForLevel } from '@/data/wordbank'

const STORAGE_KEY = 'yuban-learner-v1'

function defaultState() {
  return {
    onboardingDone: false,
    placementDone: false,
    placementSkipped: false,
    profile: {
      name: '',
      ageGroup: 'teen',
      goal: 'speaking',
      motherTongue: 'zh',
      dailyMinutes: 15,
      preferMode: 'voice',
    },
    level: 2,
    cefr: 'A1',
    levelLabel: '常见生活',
    weakTags: [],
    wrongWords: [],
    wordMastery: {},
    visualAidWords: [],
    sessions: [],
    streak: 0,
    lastPracticeDate: null,
    companionName: 'Yuban',
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    return { ...defaultState(), ...JSON.parse(raw) }
  } catch {
    return defaultState()
  }
}

export const useLearnerStore = defineStore('learner', {
  state: () => load(),

  getters: {
    displayName: (s) => s.profile.name || '同学',
    topics: (s) => topicsForLevel(s.level),
    aiConstraints: (s) => ({
      maxLevel: Math.min(5, s.level + 1),
      speechRate: s.level <= 2 ? 'slow' : s.level <= 4 ? 'normal' : 'natural',
      sentenceLength: s.level <= 2 ? 'short' : s.level <= 4 ? 'medium' : 'flexible',
      correction: s.profile.ageGroup === 'child' ? 'soft' : 'balanced',
    }),
  },

  actions: {
    persist() {
      const { ...data } = this.$state
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    },

    saveOnboarding(form) {
      this.profile = { ...this.profile, ...form }
      this.onboardingDone = true
      this.persist()
    },

    applyPlacement(result) {
      this.level = result.level
      this.cefr = result.cefr
      this.levelLabel = result.label
      this.weakTags = result.weakTags
      this.wrongWords = result.wrongWords || []
      this.placementDone = true
      this.placementSkipped = false
      result.wrongWords?.forEach((w) => {
        this.wordMastery[w] = 'learning'
      })
      this.persist()
    },

    skipPlacement() {
      // 年龄粗估临时等级
      const map = { child: 1, teen: 2, adult: 3 }
      this.level = map[this.profile.ageGroup] || 2
      this.cefr = this.level === 1 ? 'A1' : this.level === 2 ? 'A1+' : 'A2'
      this.levelLabel = this.level === 1 ? '最常用口语' : this.level === 2 ? '高频生活词' : '常见交流词'
      this.weakTags = ['跳过测评，将加速校准']
      this.placementSkipped = true
      this.placementDone = false
      this.persist()
    },

    adjustLevel(delta, reason) {
      const next = Math.min(5, Math.max(1, this.level + delta))
      if (next === this.level) return
      this.level = next
      const labels = {
        1: ['A1', '最常用口语'],
        2: ['A1+', '高频生活词'],
        3: ['A2', '常见交流词'],
        4: ['A2+', '扩展日常词'],
        5: ['B1-', '前 500 词尾段'],
      }
      this.cefr = labels[next][0]
      this.levelLabel = labels[next][1]
      if (reason) this.weakTags = [reason, ...this.weakTags.filter((t) => t !== reason)].slice(0, 4)
      this.persist()
    },

    markVisualWord(word) {
      if (!this.visualAidWords.includes(word)) {
        this.visualAidWords.unshift(word)
        this.visualAidWords = this.visualAidWords.slice(0, 40)
      }
      this.wordMastery[word] = this.wordMastery[word] || 'learning'
      this.persist()
    },

    addSessionSummary(summary) {
      this.sessions.unshift({
        id: `s-${Date.now()}`,
        at: new Date().toISOString(),
        ...summary,
      })
      this.sessions = this.sessions.slice(0, 30)

      const today = new Date().toDateString()
      if (this.lastPracticeDate !== today) {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        this.streak = this.lastPracticeDate === yesterday.toDateString() ? this.streak + 1 : 1
        this.lastPracticeDate = today
      }
      this.persist()
    },

    resetAll() {
      localStorage.removeItem(STORAGE_KEY)
      this.$patch(defaultState())
    },
  },
})
