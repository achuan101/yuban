<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLearnerStore } from '@/stores/learner'
import { WORD_BANK } from '@/data/wordbank'
import {
  buildVisualAid,
  detectVisualNeed,
  generateCompanionReply,
  speakText,
  stopSpeaking,
} from '@/services/companion'

const route = useRoute()
const router = useRouter()
const learner = useLearnerStore()

const input = ref('')
const sending = ref(false)
const listening = ref(false)
const showSubtitle = ref(true)
const visual = ref(null)
const threadEl = ref(null)
const recognition = ref(null)

const topic = computed(() => route.query.topic || learner.topics[0] || '自由聊天')

const messages = ref([])
const newWords = ref([])
const turnCount = ref(0)

const rate = computed(() => {
  const map = { slow: 0.85, normal: 0.95, natural: 1.05 }
  return map[learner.aiConstraints.speechRate] || 0.95
})

onMounted(async () => {
  const opener =
    learner.level <= 2
      ? `Hi ${learner.displayName}! Today we can talk about “${topic.value}”. Are you ready?`
      : `Hey ${learner.displayName}! Let’s chat about “${topic.value}”. What comes to mind first?`
  messages.value.push({ id: id(), role: 'ai', text: opener })
  speakText(opener, { rate: rate.value })
  await scrollBottom()
})

onBeforeUnmount(() => {
  stopSpeaking()
  stopListen()
})

function id() {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

async function scrollBottom() {
  await nextTick()
  if (threadEl.value) threadEl.value.scrollTop = threadEl.value.scrollHeight
}

async function send(text) {
  const content = (text ?? input.value).trim()
  if (!content || sending.value) return

  input.value = ''
  messages.value.push({ id: id(), role: 'user', text: content })
  turnCount.value += 1
  sending.value = true
  await scrollBottom()

  if (/太难|difficult|too hard/i.test(content)) {
    learner.adjustLevel(-1, '根据反馈下调难度')
  } else if (/太简单|too easy|boring/i.test(content)) {
    learner.adjustLevel(1, '根据反馈上调难度')
  }

  const reply = await generateCompanionReply({
    userText: content,
    level: learner.level,
    name: learner.displayName,
    constraints: learner.aiConstraints,
  })

  messages.value.push({ id: id(), role: 'ai', text: reply })
  speakText(reply, { rate: rate.value })

  const need = detectVisualNeed(content, reply)
  if (need) {
    visual.value = buildVisualAid(need.word, need.meaning)
    learner.markVisualWord(need.word)
    if (!newWords.value.includes(need.word)) newWords.value.push(need.word)
  }

  sending.value = false
  await scrollBottom()
}

function requestVisual() {
  const lastAi = [...messages.value].reverse().find((m) => m.role === 'ai')
  const wordGuess = (lastAi?.text.match(/\b([a-zA-Z]{3,})\b/g) || [])
    .map((w) => w.toLowerCase())
    .reverse()
    .map((w) => WORD_BANK.find((item) => item.word === w))
    .find(Boolean) || WORD_BANK.find((item) => item.word === 'understand')
  visual.value = buildVisualAid(wordGuess.word, wordGuess.meaning)
  learner.markVisualWord(wordGuess.word)
  if (!newWords.value.includes(wordGuess.word)) {
    newWords.value.push(wordGuess.word)
  }
}

function toggleListen() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SR) {
    alert('当前浏览器不支持语音识别，请使用文字输入，或在 Chrome 中尝试。')
    return
  }

  if (listening.value) {
    stopListen()
    return
  }

  recognition.value = new SR()
  recognition.value.lang = 'zh-CN'
  recognition.value.interimResults = false
  recognition.value.onresult = (event) => {
    const text = event.results[0][0].transcript
    input.value = text
    listening.value = false
    send(text)
  }
  recognition.value.onerror = () => {
    listening.value = false
  }
  recognition.value.onend = () => {
    listening.value = false
  }
  listening.value = true
  recognition.value.start()
}

function stopListen() {
  try {
    recognition.value?.stop()
  } catch {
    /* ignore */
  }
  listening.value = false
}

function endChat() {
  stopSpeaking()
  stopListen()
  learner.addSessionSummary({
    topic: topic.value,
    turns: turnCount.value,
    newWords: [...newWords.value],
    level: learner.level,
  })
  router.push('/review')
}
</script>

<template>
  <section class="chat">
    <header class="top">
      <button class="btn btn-ghost" type="button" @click="endChat">结束</button>
      <div class="title">
        <strong>{{ learner.companionName }}</strong>
        <span class="muted">{{ topic }} · L{{ learner.level }}</span>
      </div>
      <label class="sub-toggle">
        <input v-model="showSubtitle" type="checkbox" />
        字幕
      </label>
    </header>

    <div class="stage panel">
      <div class="avatar-wrap" :class="{ talking: sending || listening }">
        <div class="avatar" />
        <p>{{ listening ? '正在听你说…' : sending ? '语伴思考中…' : '点下方麦克风或输入文字' }}</p>
      </div>

      <aside v-if="visual" class="visual">
        <img :src="visual.imageUrl" :alt="visual.word" />
        <div>
          <h3>{{ visual.word }}</h3>
          <p>{{ visual.meaning }}</p>
          <small>{{ visual.captionZh }}</small>
        </div>
        <button class="btn btn-ghost close" type="button" @click="visual = null">关闭</button>
      </aside>
    </div>

    <div v-show="showSubtitle" ref="threadEl" class="thread panel">
      <div
        v-for="m in messages"
        :key="m.id"
        class="msg"
        :class="m.role"
      >
        <span>{{ m.role === 'ai' ? '语伴' : '我' }}</span>
        <p>{{ m.text }}</p>
      </div>
    </div>

    <footer class="composer panel">
      <button class="btn btn-secondary" type="button" @click="requestVisual">看图理解</button>
      <button
        class="mic"
        type="button"
        :class="{ on: listening }"
        :aria-pressed="listening"
        @click="toggleListen"
      >
        {{ listening ? '停止' : '语音' }}
      </button>
      <input
        v-model="input"
        type="text"
        placeholder="用中文或英文回复…"
        @keydown.enter.prevent="send()"
      />
      <button class="btn btn-primary" type="button" :disabled="sending" @click="send()">发送</button>
    </footer>
  </section>
</template>

<style scoped>
.chat {
  max-width: 900px;
  margin: 0 auto;
  display: grid;
  gap: 0.85rem;
  min-height: calc(100vh - 2rem);
  grid-template-rows: auto auto 1fr auto;
  padding-top: 0.5rem;
}

.top {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.5rem;
}

.title {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.sub-toggle {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.9rem;
  color: var(--ink-muted);
}

.stage {
  position: relative;
  min-height: 220px;
  padding: 1.25rem;
  display: grid;
  place-items: center;
  overflow: hidden;
  background:
    radial-gradient(circle at 20% 20%, rgba(232, 163, 23, 0.18), transparent 40%),
    linear-gradient(160deg, rgba(26, 107, 90, 0.08), rgba(255, 252, 247, 0.9));
}

.avatar-wrap {
  text-align: center;
}

.avatar {
  width: 110px;
  height: 110px;
  margin: 0 auto 0.75rem;
  border-radius: 50%;
  background:
    radial-gradient(circle at 35% 30%, #fff1d1, transparent 40%),
    linear-gradient(145deg, #1a6b5a, #2f8f6b);
  box-shadow: 0 16px 40px rgba(15, 74, 61, 0.25);
  transition: transform 0.25s ease;
}

.avatar-wrap.talking .avatar {
  animation: talk 1.1s ease-in-out infinite;
}

.avatar-wrap p {
  margin: 0;
  color: var(--ink-muted);
  font-weight: 600;
}

.visual {
  position: absolute;
  right: 0.8rem;
  top: 0.8rem;
  bottom: 0.8rem;
  width: min(46%, 280px);
  background: rgba(255, 252, 247, 0.96);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 0.75rem;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 0.5rem;
  animation: slideIn 0.35s ease;
}

.visual img {
  width: 100%;
  border-radius: 10px;
  display: block;
}

.visual h3 {
  margin: 0;
  font-family: var(--font-display);
}

.visual p {
  margin: 0.2rem 0;
  font-weight: 600;
}

.visual small {
  color: var(--ink-muted);
  line-height: 1.4;
}

.visual .close {
  justify-self: start;
  padding: 0.35rem 0.7rem;
}

.thread {
  padding: 0.9rem;
  overflow: auto;
  max-height: 280px;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.msg span {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--ink-muted);
  margin-bottom: 0.2rem;
}

.msg p {
  margin: 0;
  padding: 0.7rem 0.85rem;
  border-radius: 12px;
  line-height: 1.5;
  max-width: 85%;
}

.msg.ai p {
  background: var(--brand-soft);
}

.msg.user {
  align-self: flex-end;
  text-align: right;
}

.msg.user p {
  margin-left: auto;
  background: #fff;
  border: 1px solid var(--line);
}

.composer {
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  gap: 0.55rem;
  padding: 0.75rem;
  align-items: center;
}

.composer input {
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 0.8rem 1rem;
  outline: none;
}

.composer input:focus {
  border-color: var(--brand);
}

.mic {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  border: none;
  background: var(--brand);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.mic.on {
  background: var(--danger);
  animation: pulse 1s ease infinite;
}

@keyframes talk {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.06);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(12px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  50% {
    transform: scale(1.05);
  }
}

@media (max-width: 720px) {
  .visual {
    position: static;
    width: 100%;
  }
  .composer {
    grid-template-columns: auto 1fr auto;
  }
  .composer .btn-secondary {
    display: none;
  }
}
</style>
