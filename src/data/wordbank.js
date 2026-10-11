/** Top 高频词分级词库（演示子集，按 L1–L5 分布） */
export const LEVELS = [
  { id: 1, key: 'L1', label: '基础日常', cefr: 'Pre-A1', range: '1–100' },
  { id: 2, key: 'L2', label: '常见生活', cefr: 'A1', range: '101–200' },
  { id: 3, key: 'L3', label: '进阶日常', cefr: 'A2', range: '201–300' },
  { id: 4, key: 'L4', label: '场景扩展', cefr: 'A2+', range: '301–400' },
  { id: 5, key: 'L5', label: '高频进阶', cefr: 'B1-', range: '401–500' },
]

export const WORD_BANK = [
  // L1
  { id: 'w1', word: 'hello', meaning: '你好', level: 1, pos: 'int.' },
  { id: 'w2', word: 'name', meaning: '名字', level: 1, pos: 'n.' },
  { id: 'w3', word: 'water', meaning: '水', level: 1, pos: 'n.' },
  { id: 'w4', word: 'eat', meaning: '吃', level: 1, pos: 'v.' },
  { id: 'w5', word: 'friend', meaning: '朋友', level: 1, pos: 'n.' },
  { id: 'w6', word: 'school', meaning: '学校', level: 1, pos: 'n.' },
  { id: 'w7', word: 'happy', meaning: '开心的', level: 1, pos: 'adj.' },
  { id: 'w8', word: 'today', meaning: '今天', level: 1, pos: 'n./adv.' },
  // L2
  { id: 'w9', word: 'breakfast', meaning: '早餐', level: 2, pos: 'n.' },
  { id: 'w10', word: 'weather', meaning: '天气', level: 2, pos: 'n.' },
  { id: 'w11', word: 'hobby', meaning: '爱好', level: 2, pos: 'n.' },
  { id: 'w12', word: 'usually', meaning: '通常', level: 2, pos: 'adv.' },
  { id: 'w13', word: 'weekend', meaning: '周末', level: 2, pos: 'n.' },
  { id: 'w14', word: 'library', meaning: '图书馆', level: 2, pos: 'n.' },
  { id: 'w15', word: 'practice', meaning: '练习', level: 2, pos: 'v./n.' },
  { id: 'w16', word: 'because', meaning: '因为', level: 2, pos: 'conj.' },
  // L3
  { id: 'w17', word: 'confident', meaning: '自信的', level: 3, pos: 'adj.' },
  { id: 'w18', word: 'schedule', meaning: '日程安排', level: 3, pos: 'n.' },
  { id: 'w19', word: 'improve', meaning: '提升', level: 3, pos: 'v.' },
  { id: 'w20', word: 'conversation', meaning: '对话', level: 3, pos: 'n.' },
  { id: 'w21', word: 'suggest', meaning: '建议', level: 3, pos: 'v.' },
  { id: 'w22', word: 'environment', meaning: '环境', level: 3, pos: 'n.' },
  { id: 'w23', word: 'challenge', meaning: '挑战', level: 3, pos: 'n./v.' },
  { id: 'w24', word: 'memory', meaning: '记忆', level: 3, pos: 'n.' },
  // L4
  { id: 'w25', word: 'abstract', meaning: '抽象的', level: 4, pos: 'adj.' },
  { id: 'w26', word: 'perspective', meaning: '视角/看法', level: 4, pos: 'n.' },
  { id: 'w27', word: 'responsibility', meaning: '责任', level: 4, pos: 'n.' },
  { id: 'w28', word: 'opportunity', meaning: '机会', level: 4, pos: 'n.' },
  { id: 'w29', word: 'celebrate', meaning: '庆祝', level: 4, pos: 'v.' },
  { id: 'w30', word: 'curious', meaning: '好奇的', level: 4, pos: 'adj.' },
  { id: 'w31', word: 'community', meaning: '社区', level: 4, pos: 'n.' },
  { id: 'w32', word: 'encourage', meaning: '鼓励', level: 4, pos: 'v.' },
  // L5
  { id: 'w33', word: 'resilience', meaning: '韧性/恢复力', level: 5, pos: 'n.' },
  { id: 'w34', word: 'empathy', meaning: '共情', level: 5, pos: 'n.' },
  { id: 'w35', word: 'negotiate', meaning: '协商', level: 5, pos: 'v.' },
  { id: 'w36', word: 'sustainable', meaning: '可持续的', level: 5, pos: 'adj.' },
  { id: 'w37', word: 'metaphor', meaning: '隐喻', level: 5, pos: 'n.' },
  { id: 'w38', word: 'initiative', meaning: '主动性', level: 5, pos: 'n.' },
  { id: 'w39', word: 'appreciate', meaning: '欣赏/感激', level: 5, pos: 'v.' },
  { id: 'w40', word: 'collaborate', meaning: '协作', level: 5, pos: 'v.' },
]

const DISTRACTORS = [
  '快乐', '跑步', '城市', '音乐', '家庭', '旅行', '安静', '明亮',
  '问题', '答案', '故事', '颜色', '动物', '季节', '早晨', '夜晚',
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function wordsByLevel(level) {
  return WORD_BANK.filter((w) => w.level === level)
}

/** 为指定等级生成选择题 */
export function buildQuestion(word, type = 'meaning') {
  const wrong = shuffle(
    DISTRACTORS.filter((d) => d !== word.meaning).concat(
      WORD_BANK.filter((w) => w.id !== word.id).map((w) => w.meaning),
    ),
  ).slice(0, 3)

  const options = shuffle([word.meaning, ...wrong]).map((text, i) => ({
    id: `${word.id}-opt-${i}`,
    text,
  }))

  return {
    id: `${word.id}-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    wordId: word.id,
    word: word.word,
    level: word.level,
    type,
    prompt:
      type === 'listen'
        ? `听到单词后，选择正确含义`
        : `「${word.word}」的中文意思是？`,
    audioText: word.word,
    options,
    answer: word.meaning,
  }
}

/**
 * 自适应抽题：从 startLevel 开始，答对升档、答错降档
 * 返回题库生成器状态初始值
 */
export function createAdaptiveSession({ startLevel = 3, maxQuestions = 12 } = {}) {
  return {
    currentLevel: startLevel,
    maxQuestions,
    asked: 0,
    history: [],
    levelStats: { 1: { right: 0, total: 0 }, 2: { right: 0, total: 0 }, 3: { right: 0, total: 0 }, 4: { right: 0, total: 0 }, 5: { right: 0, total: 0 } },
    usedWordIds: new Set(),
  }
}

export function nextAdaptiveQuestion(session) {
  if (session.asked >= session.maxQuestions) return null

  let pool = wordsByLevel(session.currentLevel).filter((w) => !session.usedWordIds.has(w.id))
  if (!pool.length) {
    pool = WORD_BANK.filter((w) => !session.usedWordIds.has(w.id))
  }
  if (!pool.length) return null

  const word = pool[Math.floor(Math.random() * pool.length)]
  session.usedWordIds.add(word.id)
  const type = session.asked % 3 === 1 ? 'listen' : 'meaning'
  return buildQuestion(word, type)
}

export function applyAnswer(session, question, chosen) {
  const correct = chosen === question.answer
  session.asked += 1
  session.levelStats[question.level].total += 1
  if (correct) session.levelStats[question.level].right += 1
  session.history.push({
    wordId: question.wordId,
    word: question.word,
    level: question.level,
    correct,
    answer: question.answer,
    chosen,
  })

  if (correct) {
    session.currentLevel = Math.min(5, session.currentLevel + 1)
  } else {
    session.currentLevel = Math.max(1, session.currentLevel - 1)
  }

  return correct
}

/** 根据答题历史估算等级 */
export function scorePlacement(session) {
  const { history, levelStats } = session
  if (!history.length) {
    return {
      level: 2,
      cefr: 'A1',
      label: '常见生活',
      confidence: 0.4,
      weakTags: ['未完成测评'],
      accuracyByLevel: levelStats,
      wrongWords: [],
    }
  }

  // 以最高连续答对可达档与整体正确率综合
  let best = 1
  for (let lv = 5; lv >= 1; lv -= 1) {
    const s = levelStats[lv]
    if (s.total >= 1 && s.right / s.total >= 0.5) {
      best = lv
      break
    }
  }

  // 末题附近水平加权
  const recent = history.slice(-4)
  const recentAvg =
    recent.reduce((sum, h) => sum + (h.correct ? h.level : Math.max(1, h.level - 1)), 0) /
    recent.length
  const level = Math.round((best * 0.55 + recentAvg * 0.45))
  const clamped = Math.min(5, Math.max(1, level))
  const meta = LEVELS.find((l) => l.id === clamped)

  const wrongWords = history.filter((h) => !h.correct).map((h) => h.word)
  const listenWrong = history.filter((h) => !h.correct && h.word).length
  const weakTags = []
  if (wrongWords.length / history.length > 0.4) weakTags.push('词汇识别偏弱')
  if (listenWrong > 2) weakTags.push('听力需加强')
  if (!weakTags.length) weakTags.push('基础扎实，可轻挑战')

  const totalRight = history.filter((h) => h.correct).length
  return {
    level: clamped,
    cefr: meta.cefr,
    label: meta.label,
    confidence: Math.min(0.95, 0.45 + totalRight / history.length / 2),
    weakTags,
    accuracyByLevel: levelStats,
    wrongWords,
    sampleSpeech: sampleSpeechForLevel(clamped),
  }
}

export function sampleSpeechForLevel(level) {
  const samples = {
    1: 'Hi! My name is Yuban. How are you today?',
    2: 'What do you usually do on the weekend? I like reading.',
    3: 'I suggest we practice a short conversation about your hobbies.',
    4: 'From my perspective, small daily talks can really improve your confidence.',
    5: 'When we collaborate with curiosity, learning becomes more sustainable and fun.',
  }
  return samples[level] || samples[2]
}

export function topicsForLevel(level) {
  const map = {
    1: ['自我介绍', '喜欢的食物', '我的家人'],
    2: ['周末计划', '天气与心情', '学校生活'],
    3: ['兴趣爱好', '如何练习英语', '一次小挑战'],
    4: ['社区与朋友', '责任与习惯', '一次机会'],
    5: ['共情与理解', '可持续生活', '团队合作'],
  }
  return map[level] || map[2]
}
