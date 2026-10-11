<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  applyAnswer,
  createAdaptiveSession,
  nextAdaptiveQuestion,
  scorePlacement,
  LEVELS,
} from '@/data/wordbank'
import { speakText, stopSpeaking } from '@/services/companion'
import { useLearnerStore } from '@/stores/learner'

const router = useRouter()
const learner = useLearnerStore()

const phase = ref('intro') // intro | quiz | result
const session = ref(null)
const question = ref(null)
const selected = ref('')
const feedback = ref('')
const result = ref(null)
const answering = ref(false)

const progress = computed(() => {
  if (!session.value) return 0
  return Math.round((session.value.asked / session.value.maxQuestions) * 100)
})

onMounted(() => {
  stopSpeaking()
})

function begin() {
  session.value = createAdaptiveSession({ startLevel: 3, maxQuestions: 12 })
  question.value = nextAdaptiveQuestion(session.value)
  phase.value = 'quiz'
  selected.value = ''
  feedback.value = ''
}

function playAudio() {
  if (question.value?.audioText) {
    speakText(question.value.audioText, { rate: 0.9 })
  }
}

function choose(optionText) {
  if (answering.value || !question.value) return
  answering.value = true
  selected.value = optionText
  const ok = applyAnswer(session.value, question.value, optionText)
  feedback.value = ok ? '回答正确' : `正确答案：${question.value.answer}`

  setTimeout(() => {
    const next = nextAdaptiveQuestion(session.value)
    if (!next) {
      finish()
      return
    }
    question.value = next
    selected.value = ''
    feedback.value = ''
    answering.value = false
  }, 700)
}

function finish() {
  stopSpeaking()
  result.value = scorePlacement(session.value)
  learner.applyPlacement(result.value)
  phase.value = 'result'
  answering.value = false
}

function skip() {
  if (!confirm('跳过入学测后，将仅用基础信息给出临时等级，并在对话中加速校准。确定跳过？')) {
    return
  }
  learner.skipPlacement()
  router.push('/home')
}

function goHome() {
  router.push('/home')
}
</script>

<template>
  <section class="wrap">
    <div v-if="phase === 'intro'" class="panel card">
      <p class="eyebrow">入学测试</p>
      <h1 class="display">用高频词，找到适合你的难度</h1>
      <p class="muted">
        约 8–12 分钟。题库覆盖日常高频词分级（演示为精简词表）。测完后语伴会按你的水平说话。
      </p>
      <ul class="tips">
        <li v-for="lv in LEVELS" :key="lv.id">
          <strong>{{ lv.key }}</strong> {{ lv.label }} · {{ lv.cefr }}
        </li>
      </ul>
      <div class="actions">
        <button class="btn btn-primary" type="button" @click="begin">开始测评</button>
        <button class="btn btn-ghost" type="button" @click="skip">暂时跳过</button>
      </div>
    </div>

    <div v-else-if="phase === 'quiz'" class="panel card">
      <div class="progress-row">
        <span>进度 {{ session.asked }}/{{ session.maxQuestions }}</span>
        <span>当前探测 L{{ session.currentLevel }}</span>
      </div>
      <div class="bar"><i :style="{ width: progress + '%' }" /></div>

      <p class="q-type">{{ question.type === 'listen' ? '听力选义' : '词汇认读' }}</p>
      <h2 class="display q-prompt">{{ question.prompt }}</h2>

      <button
        v-if="question.type === 'listen'"
        class="btn btn-secondary audio-btn"
        type="button"
        @click="playAudio"
      >
        播放单词
      </button>
      <p v-else class="word-show">{{ question.word }}</p>

      <div class="options">
        <button
          v-for="opt in question.options"
          :key="opt.id"
          class="opt"
          type="button"
          :class="{
            chosen: selected === opt.text,
            correct: selected && opt.text === question.answer,
            wrong: selected === opt.text && opt.text !== question.answer,
          }"
          :disabled="answering"
          @click="choose(opt.text)"
        >
          {{ opt.text }}
        </button>
      </div>
      <p v-if="feedback" class="feedback" :class="{ ok: feedback.includes('正确') }">{{ feedback }}</p>
    </div>

    <div v-else class="panel card result">
      <p class="eyebrow">测评结果</p>
      <h1 class="display">你大约在 {{ result.cefr }} · L{{ result.level }}</h1>
      <p class="muted">{{ result.label }} · 匹配置信度 {{ Math.round(result.confidence * 100) }}%</p>

      <div class="tags">
        <span v-for="tag in result.weakTags" :key="tag" class="chip">{{ tag }}</span>
      </div>

      <div class="sample">
        <p class="sample-label">语伴会这样和你说话</p>
        <p class="sample-text">“{{ result.sampleSpeech }}”</p>
      </div>

      <button class="btn btn-primary" type="button" @click="goHome">开始和语伴聊天</button>
    </div>
  </section>
</template>

<style scoped>
.wrap {
  max-width: 640px;
  margin: 2rem auto 0;
}

.card {
  padding: 1.75rem;
}

h1 {
  margin: 0.35rem 0 0.75rem;
  font-size: clamp(1.7rem, 4vw, 2.2rem);
}

.tips {
  padding-left: 1.1rem;
  color: var(--ink-muted);
  line-height: 1.7;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 1.25rem;
}

.progress-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--ink-muted);
  margin-bottom: 0.5rem;
}

.bar {
  height: 8px;
  background: rgba(26, 107, 90, 0.12);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 1.25rem;
}

.bar i {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--brand), #2f8f6b);
  transition: width 0.3s ease;
}

.q-type {
  margin: 0;
  color: var(--brand);
  font-weight: 700;
  font-size: 0.85rem;
}

.q-prompt {
  margin: 0.4rem 0 1rem;
  font-size: 1.45rem;
}

.word-show {
  font-family: var(--font-display);
  font-size: 2.2rem;
  margin: 0 0 1rem;
  color: var(--brand-deep);
}

.audio-btn {
  margin-bottom: 1rem;
}

.options {
  display: grid;
  gap: 0.65rem;
}

.opt {
  text-align: left;
  padding: 0.95rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--line);
  background: #fff;
  cursor: pointer;
  font-weight: 600;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.opt:hover:not(:disabled) {
  border-color: var(--brand);
}

.opt.correct {
  background: #e5f6ee;
  border-color: var(--ok);
}

.opt.wrong {
  background: #fdeceb;
  border-color: var(--danger);
}

.feedback {
  margin: 0.9rem 0 0;
  font-weight: 600;
  color: var(--danger);
}

.feedback.ok {
  color: var(--ok);
}

.result .tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin: 1rem 0 1.25rem;
}

.sample {
  background: var(--brand-soft);
  border-radius: 14px;
  padding: 1rem 1.1rem;
  margin-bottom: 1.25rem;
}

.sample-label {
  margin: 0 0 0.35rem;
  font-size: 0.85rem;
  color: var(--brand-deep);
  font-weight: 700;
}

.sample-text {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.15rem;
  line-height: 1.5;
}
</style>
