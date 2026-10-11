/**
 * 日常口语高频词（OpenSubtitles 2018 英语词频）。
 * L1–L5 对应词频名次 1–100、101–200、201–300、301–400、401–500。
 * 每档只收可考查的实词，不含虚词、缩写和脏话。
 * rank 为该词在口语词表中的名次。
 */
export const LEVELS = [
  { id: 1, key: 'L1', label: '最常用口语', cefr: 'A1', range: '词频 1–100' },
  { id: 2, key: 'L2', label: '高频生活词', cefr: 'A1+', range: '词频 101–200' },
  { id: 3, key: 'L3', label: '常见交流词', cefr: 'A2', range: '词频 201–300' },
  { id: 4, key: 'L4', label: '扩展日常词', cefr: 'A2+', range: '词频 301–400' },
  { id: 5, key: 'L5', label: '前 500 词尾段', cefr: 'B1-', range: '词频 401–500' },
]

export const WORD_BANK = [
  // L1 · 词频 1–100
  { id: 'w1', word: 'know', meaning: '知道', level: 1, rank: 33, pos: 'v.' },
  { id: 'w2', word: 'like', meaning: '喜欢', level: 1, rank: 43, pos: 'v.' },
  { id: 'w3', word: 'get', meaning: '得到', level: 1, rank: 45, pos: 'v.' },
  { id: 'w4', word: 'go', meaning: '去', level: 1, rank: 47, pos: 'v.' },
  { id: 'w5', word: 'come', meaning: '来', level: 1, rank: 58, pos: 'v.' },
  { id: 'w6', word: 'want', meaning: '想要', level: 1, rank: 66, pos: 'v.' },
  { id: 'w7', word: 'think', meaning: '认为', level: 1, rank: 67, pos: 'v.' },
  { id: 'w8', word: 'see', meaning: '看见', level: 1, rank: 69, pos: 'v.' },
  { id: 'w9', word: 'good', meaning: '好的', level: 1, rank: 71, pos: 'adj.' },
  { id: 'w10', word: 'time', meaning: '时间', level: 1, rank: 80, pos: 'n.' },
  { id: 'w11', word: 'look', meaning: '看', level: 1, rank: 84, pos: 'v.' },
  { id: 'w12', word: 'take', meaning: '拿', level: 1, rank: 90, pos: 'v.' },
  // L2 · 词频 101–200
  { id: 'w13', word: 'people', meaning: '人们', level: 2, rank: 118, pos: 'n.' },
  { id: 'w14', word: 'because', meaning: '因为', level: 2, rank: 120, pos: 'conj.' },
  { id: 'w15', word: 'please', meaning: '请', level: 2, rank: 122, pos: 'int.' },
  { id: 'w16', word: 'love', meaning: '爱', level: 2, rank: 123, pos: 'v./n.' },
  { id: 'w17', word: 'sorry', meaning: '对不起', level: 2, rank: 127, pos: 'adj.' },
  { id: 'w18', word: 'help', meaning: '帮助', level: 2, rank: 140, pos: 'v./n.' },
  { id: 'w19', word: 'day', meaning: '一天', level: 2, rank: 149, pos: 'n.' },
  { id: 'w20', word: 'work', meaning: '工作', level: 2, rank: 151, pos: 'n./v.' },
  { id: 'w21', word: 'home', meaning: '家', level: 2, rank: 168, pos: 'n.' },
  { id: 'w22', word: 'night', meaning: '夜晚', level: 2, rank: 169, pos: 'n.' },
  { id: 'w23', word: 'money', meaning: '钱', level: 2, rank: 186, pos: 'n.' },
  { id: 'w24', word: 'name', meaning: '名字', level: 2, rank: 189, pos: 'n.' },
  // L3 · 词频 201–300（hello / today / friend 在这一档，不在最前 100）
  { id: 'w25', word: 'hello', meaning: '你好', level: 3, rank: 203, pos: 'int.' },
  { id: 'w26', word: 'girl', meaning: '女孩', level: 3, rank: 206, pos: 'n.' },
  { id: 'w27', word: 'house', meaning: '房子', level: 3, rank: 213, pos: 'n.' },
  { id: 'w28', word: 'mother', meaning: '母亲', level: 3, rank: 226, pos: 'n.' },
  { id: 'w29', word: 'world', meaning: '世界', level: 3, rank: 228, pos: 'n.' },
  { id: 'w30', word: 'today', meaning: '今天', level: 3, rank: 232, pos: 'n.' },
  { id: 'w31', word: 'listen', meaning: '听', level: 3, rank: 233, pos: 'v.' },
  { id: 'w32', word: 'understand', meaning: '理解', level: 3, rank: 235, pos: 'v.' },
  { id: 'w33', word: 'remember', meaning: '记得', level: 3, rank: 237, pos: 'v.' },
  { id: 'w34', word: 'friend', meaning: '朋友', level: 3, rank: 260, pos: 'n.' },
  { id: 'w35', word: 'family', meaning: '家人', level: 3, rank: 271, pos: 'n.' },
  { id: 'w36', word: 'happy', meaning: '开心的', level: 3, rank: 296, pos: 'adj.' },
  // L4 · 词频 301–400（school / eat / water 在这一档）
  { id: 'w37', word: 'tomorrow', meaning: '明天', level: 4, rank: 316, pos: 'n.' },
  { id: 'w38', word: 'school', meaning: '学校', level: 4, rank: 328, pos: 'n.' },
  { id: 'w39', word: 'phone', meaning: '电话', level: 4, rank: 333, pos: 'n.' },
  { id: 'w40', word: 'problem', meaning: '问题', level: 4, rank: 338, pos: 'n.' },
  { id: 'w41', word: 'hope', meaning: '希望', level: 4, rank: 346, pos: 'v./n.' },
  { id: 'w42', word: 'heart', meaning: '心', level: 4, rank: 359, pos: 'n.' },
  { id: 'w43', word: 'music', meaning: '音乐', level: 4, rank: 366, pos: 'n.' },
  { id: 'w44', word: 'beautiful', meaning: '美丽的', level: 4, rank: 370, pos: 'adj.' },
  { id: 'w45', word: 'doctor', meaning: '医生', level: 4, rank: 371, pos: 'n.' },
  { id: 'w46', word: 'eat', meaning: '吃', level: 4, rank: 373, pos: 'v.' },
  { id: 'w47', word: 'water', meaning: '水', level: 4, rank: 378, pos: 'n.' },
  { id: 'w48', word: 'change', meaning: '改变', level: 4, rank: 393, pos: 'v./n.' },
  // L5 · 词频 401–500
  { id: 'w49', word: 'easy', meaning: '容易的', level: 5, rank: 408, pos: 'adj.' },
  { id: 'w50', word: 'different', meaning: '不同的', level: 5, rank: 414, pos: 'adj.' },
  { id: 'w51', word: 'afraid', meaning: '害怕的', level: 5, rank: 424, pos: 'adj.' },
  { id: 'w52', word: 'sleep', meaning: '睡觉', level: 5, rank: 425, pos: 'v./n.' },
  { id: 'w53', word: 'chance', meaning: '机会', level: 5, rank: 426, pos: 'n.' },
  { id: 'w54', word: 'party', meaning: '聚会', level: 5, rank: 433, pos: 'n.' },
  { id: 'w55', word: 'important', meaning: '重要的', level: 5, rank: 438, pos: 'adj.' },
  { id: 'w56', word: 'story', meaning: '故事', level: 5, rank: 441, pos: 'n.' },
  { id: 'w57', word: 'week', meaning: '星期', level: 5, rank: 450, pos: 'n.' },
  { id: 'w58', word: 'speak', meaning: '说（某种语言）', level: 5, rank: 472, pos: 'v.' },
  { id: 'w59', word: 'trouble', meaning: '麻烦', level: 5, rank: 485, pos: 'n.' },
  { id: 'w60', word: 'question', meaning: '提问', level: 5, rank: 495, pos: 'n.' },
]

/** 干扰项只从词库释义里抽，避免无关词把正确答案衬得过显眼 */

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
    WORD_BANK.filter((w) => w.id !== word.id && w.meaning !== word.meaning).map((w) => w.meaning),
  ).slice(0, 3)

  const options = shuffle([word.meaning, ...wrong]).map((text, i) => ({
    id: `${word.id}-opt-${i}`,
    text,
  }))

  return {
    id: `${word.id}-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    wordId: word.id,
    word: word.word,
    rank: word.rank,
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

  // 本档用完时只向相邻档借词，避免测 L1 时突然出现 L5
  let pool = []
  for (const delta of [0, -1, 1, -2, 2]) {
    const level = session.currentLevel + delta
    if (level < 1 || level > 5) continue
    pool = wordsByLevel(level).filter((w) => !session.usedWordIds.has(w.id))
    if (pool.length) break
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
    1: 'I want to know you. Do you like this? Come and see.',
    2: 'Please tell me about your day. Do you love your home?',
    3: 'Hello! Do you remember your friend? Are you happy today?',
    4: 'I hope school is not a problem. Do you like music and water?',
    5: 'Is this question important? Tell me the reason. Do not be afraid.',
  }
  return samples[level] || samples[2]
}

export function topicsForLevel(level) {
  const map = {
    1: ['你想去哪里', '你看见了什么', '现在几点'],
    2: ['今天的工作', '家里的夜晚', '请别人帮忙'],
    3: ['家人和朋友', '今天开不开心', '试着听懂对方'],
    4: ['学校里的问题', '喜欢的音乐', '明天的计划'],
    5: ['一件重要的事', '一个小麻烦', '这周的机会'],
  }
  return map[level] || map[2]
}
