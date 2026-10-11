import { WORD_BANK } from '@/data/wordbank'

const ABSTRACT_HINTS = [
  'understand', 'remember', 'problem', 'beautiful', 'important',
  'trouble', 'chance', 'afraid', 'question', 'heart',
]

const REPLIES = {
  1: [
    'Good. I like that. What do you want?',
    'Come and see. Do you know this?',
    'Take your time. Look, and tell me.',
  ],
  2: [
    'Please tell me about your day at home.',
    'Sorry, I want to help. Do you love your work?',
    'People need money and a name. What is your name?',
  ],
  3: [
    'Hello! Are you happy today with your family?',
    'Listen. Do you understand your friend?',
    'I remember your mother and your house.',
  ],
  4: [
    'I hope school is not a problem tomorrow.',
    'Do you like music? Drink some water and eat.',
    'Call the doctor if you need to change the plan.',
  ],
  5: [
    'This question is important. What is the reason?',
    'Do not be afraid. Sleep well and speak slowly.',
    'This week you have a chance. Is it easy or different?',
  ],
}

function findTriggerWord(text) {
  const lower = text.toLowerCase()
  const hit = ABSTRACT_HINTS.find((w) => lower.includes(w))
  if (hit) return WORD_BANK.find((w) => w.word === hit) || { word: hit, meaning: hit }
  // 学生问「什么意思」时，从最近常见抽象词挑一个演示
  if (/什么意思|看不懂|什么是|what does|mean\?|explain/i.test(text)) {
    return WORD_BANK.find((w) => w.word === 'understand')
  }
  return null
}

export function detectVisualNeed(userText, aiText) {
  const fromUser = findTriggerWord(userText)
  if (fromUser) return { word: fromUser.word, meaning: fromUser.meaning, reason: 'student_ask' }
  const fromAi = ABSTRACT_HINTS.find((w) => aiText.toLowerCase().includes(w))
  if (fromAi && Math.random() > 0.45) {
    const meta = WORD_BANK.find((w) => w.word === fromAi)
    return { word: fromAi, meaning: meta?.meaning || fromAi, reason: 'abstract_term' }
  }
  return null
}

/** 演示用：根据等级生成语伴回复 */
export async function generateCompanionReply({ userText, level, name, constraints }) {
  await wait(600 + Math.random() * 500)
  const pool = REPLIES[level] || REPLIES[2]
  let reply = pool[Math.floor(Math.random() * pool.length)]

  if (/你好|hello|hi\b/i.test(userText)) {
    reply =
      level <= 2
        ? `Hi ${name}! I’m Yuban. How are you today?`
        : `Hey ${name}! Great to see you. What’s on your mind today?`
  } else if (/太难|difficult|hard/i.test(userText)) {
    reply = 'No problem. I’ll speak more slowly and use simpler words. Shall we try again?'
  } else if (/太简单|easy|boring/i.test(userText)) {
    reply = 'Got it! Let’s raise the challenge a little. Can you explain your idea with one reason?'
  }

  if (constraints?.sentenceLength === 'short') {
    // 取第一个句子（结尾带标点）；不用 lookbehind，保证旧版移动 Safari/WebView 可解析
    const match = reply.match(/^[\s\S]*?[.!?]/)
    reply = match ? match[0].trim() : reply.trim()
  }

  return reply
}

export function buildVisualAid(word, meaning) {
  // 用渐变 SVG data URL 模拟「生图」，避免依赖外部 API
  const palette = ['#1A6B5A', '#2F8F6B', '#E8A317', '#4A7C8C']
  const c1 = palette[word.length % palette.length]
  const c2 = palette[(word.length + 1) % palette.length]
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="640" height="400" rx="28" fill="url(#g)"/>
  <circle cx="520" cy="90" r="70" fill="rgba(255,255,255,0.12)"/>
  <circle cx="120" cy="320" r="90" fill="rgba(255,255,255,0.10)"/>
  <text x="48" y="160" fill="#fff" font-family="Georgia, serif" font-size="54" font-weight="700">${escapeXml(word)}</text>
  <text x="48" y="220" fill="rgba(255,255,255,0.92)" font-family="Segoe UI, sans-serif" font-size="28">${escapeXml(meaning)}</text>
  <text x="48" y="340" fill="rgba(255,255,255,0.75)" font-family="Segoe UI, sans-serif" font-size="18">Visual aid · 语伴</text>
</svg>`
  return {
    word,
    meaning,
    imageUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    captionEn: `Think of “${word}” as a feeling or idea you can picture.`,
    captionZh: `用画面帮助理解「${word}」：${meaning}。试着用它造一句简单的话。`,
  }
}

function escapeXml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

export function speakText(text, { rate = 0.95 } = {}) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-US'
  u.rate = rate
  window.speechSynthesis.speak(u)
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
}
