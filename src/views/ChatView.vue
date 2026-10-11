<script setup>
import { computed, ref, nextTick, onBeforeUnmount } from 'vue'
import { useLearnerStore } from '@/stores/learner'
import { coach } from '@/services/llm'
import { pullSentences } from '@/domain/speakable.mjs'
import { speakText, stopSpeaking } from '@/services/audio'
import { useRecording } from '@/composables/useRecording'
import { useVoiceCall } from '@/composables/useVoiceCall'
import { BUDDIES, getBuddyById } from '@/data/buddies'
import BuddyAvatarVisual from '@/components/BuddyAvatarVisual.vue'

const learner = useLearnerStore()
const activeCompanion = computed(() => learner.activeCompanion || getBuddyById('orbit'))

const showBuddyModal = ref(false)
const input = ref('')
const busy = ref(false)
const messages = ref([
  {
    role: 'assistant',
    content: activeCompanion.value.greeting,
    companionId: activeCompanion.value.id
  }
])
const status = ref('')
const bottom = ref(null)
let controller, silentAbort = false

const mic = useRecording(t => { input.value = t })
const { recording, error } = mic

const call = useVoiceCall({
  onUtterance: text => send(text),
  onError: message => { status.value = message },
  getVoiceOptions: () => ({
    rate: activeCompanion.value.voiceRate || 0.95,
    pitch: activeCompanion.value.voicePitch || 1.0
  })
})

const ideas = [
  '用简单的日常英语和我聊聊天，一次问一个问题',
  '解释一下 “live with” 和 “stay with” 的区别与用法',
  '为我写一段 50 词左右的英文自我介绍，附中文对照'
]

const phaseText = computed(() => ({
  listening: '正在倾听，说完停顿一下',
  thinking: `${activeCompanion.value.name} 正在思考怎么接`,
  speaking: `${activeCompanion.value.name} 正在回复`
})[call.phase.value] || '')

function coachPayload() {
  return {
    messages: messages.value.slice(-12),
    profile: {
      name: learner.displayName,
      ageGroup: learner.profile.ageGroup,
      goal: learner.profile.goal
    },
    estimate: learner.placementDone ? learner.summary : null,
    scene: learner.settings.scene,
    needsHelp: learner.model.outputGaps.filter(g => !g.resolved).slice(0, 5).map(g => g.word),
    voice: call.active.value,
    companion: activeCompanion.value
  }
}

async function send(spoken) {
  const fromCall = typeof spoken === 'string'
  const text = (fromCall ? spoken : input.value).trim()
  if (!text || busy.value) {
    if (fromCall) call.listen()
    return
  }
  if (!fromCall) mic.stop()
  input.value = ''
  messages.value.push({ role: 'user', content: text })

  const payload = coachPayload()
  busy.value = true
  status.value = call.active.value ? '' : `${activeCompanion.value.name} 正在思考…`
  silentAbort = false
  controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 25000)
  let voiceBubble = null

  try {
    if (call.active.value) {
      voiceBubble = {
        role: 'assistant',
        content: '',
        companionId: activeCompanion.value.id
      }
      messages.value.push(voiceBubble)
      call.startTurn()
      let pending = ''
      let spokenCount = 0
      const take = flush => {
        const pulled = pullSentences(pending, flush)
        pending = pulled.rest
        for (const sentence of pulled.sentences) {
          if (spokenCount < 2) {
            spokenCount += 1
            call.say(sentence)
          }
        }
      }
      await coach(payload, controller.signal, delta => {
        if (silentAbort) return
        voiceBubble.content += delta
        pending += delta
        take(false)
      })
      if (silentAbort) return
      take(true)
      if (!voiceBubble.content.trim()) throw new Error('AI没有返回有效内容，请重试')
      status.value = ''
      call.finishTurn()
    } else {
      const data = await coach(payload, controller.signal)
      messages.value.push({
        role: 'assistant',
        content: data.reply,
        companionId: activeCompanion.value.id
      })
      status.value = ''
    }
  } catch (e) {
    if (silentAbort) {
      if (voiceBubble && !voiceBubble.content.trim()) messages.value.pop()
      status.value = ''
      return
    }
    status.value = e.name === 'AbortError' ? '等待超时，可以稍后重试。' : e.message
    if (call.active.value) {
      if (voiceBubble && !voiceBubble.content.trim()) messages.value.pop()
      call.listen()
      return
    }
    input.value = text
    messages.value.pop()
  } finally {
    clearTimeout(timer)
    busy.value = false
    await nextTick()
    bottom.value?.scrollIntoView({ block: 'nearest' })
  }
}

function playSpeech(text) {
  stopSpeaking()
  speakText(text, {
    rate: activeCompanion.value.voiceRate || 0.95,
    pitch: activeCompanion.value.voicePitch || 1.0,
    onError: e => { status.value = e }
  })
}

function selectNewBuddy(buddy) {
  learner.setCompanion(buddy.id)
  showBuddyModal.value = false
  messages.value.push({
    role: 'assistant',
    content: `[已切换语伴为 ${buddy.name}（${buddy.chineseName}）] ${buddy.greeting}`,
    companionId: buddy.id
  })
  playSpeech(buddy.sampleVoiceText)
}

function toggleCall() {
  if (call.active.value) {
    silentAbort = true
    controller?.abort()
    call.hangup()
    return
  }
  mic.stop()
  status.value = ''
  call.start()
}

function interrupt() {
  silentAbort = true
  controller?.abort()
  call.listen()
}

onBeforeUnmount(() => {
  silentAbort = true
  controller?.abort()
  stopSpeaking()
})
</script>

<template>
  <section class="chat-container">
    <!-- Chat Header with Dynamic Active Buddy Info -->
    <header class="chat-header">
      <div class="chat-brand">
        <div
          class="buddy-badge-avatar"
          :style="{ background: activeCompanion.bgGradient }"
          title="当前陪伴语伴"
        >
          <BuddyAvatarVisual :buddy-id="activeCompanion.id" :size="48" />
        </div>
        <div class="chat-brand-meta">
          <div class="brand-title-line">
            <h1>
              {{ activeCompanion.name }}
              <small>（{{ activeCompanion.chineseName }}）</small>
            </h1>
            <button
              type="button"
              class="btn-switch-companion"
              @click="showBuddyModal = true"
            >
              <span>⇄ 换个语伴</span>
            </button>
          </div>
          <p>{{ activeCompanion.tagline }}</p>
        </div>
      </div>

      <div class="header-side-actions">
        <RouterLink to="/learn" class="btn btn-secondary">回到文章</RouterLink>
      </div>
    </header>

    <!-- Conversation Panel -->
    <div class="panel conversation-panel">
      <div class="messages-list">
        <article
          v-for="(m, i) in messages"
          :key="i"
          class="message-bubble"
          :class="m.role"
        >
          <div class="bubble-sender-row">
            <template v-if="m.role === 'assistant'">
              <div
                class="bubble-mini-avatar"
                :style="{ background: getBuddyById(m.companionId || activeCompanion.id).bgGradient }"
              >
                <BuddyAvatarVisual :buddy-id="m.companionId || activeCompanion.id" :size="20" />
              </div>
              <span class="sender-name">{{ getBuddyById(m.companionId || activeCompanion.id).name }}</span>
            </template>
            <template v-else>
              <span class="sender-name">{{ learner.displayName || '你' }}</span>
            </template>
          </div>

          <p class="bubble-content">{{ m.content }}</p>

          <div v-if="m.role === 'assistant' && i" class="bubble-actions">
            <button
              type="button"
              class="btn-listen-reply"
              @click="playSpeech(m.content)"
            >
              <span>🔊 听原声朗读</span>
            </button>
          </div>
        </article>

        <div ref="bottom" />
      </div>

      <!-- Composer Bar -->
      <div class="chat-composer">
        <!-- Live Voice Call Status Bar -->
        <div v-if="call.active.value" class="call-bar" role="status">
          <i class="pulse" :class="call.phase.value" />
          <div class="call-text">
            <strong>{{ phaseText }}</strong>
            <p v-if="call.live.value">{{ call.live.value }}</p>
          </div>
          <button
            v-if="call.phase.value === 'speaking' || call.phase.value === 'thinking'"
            type="button"
            class="btn btn-ghost interrupt-btn"
            @click="interrupt"
          >
            打断
          </button>
          <select
            v-model="call.lang.value"
            aria-label="识别语言"
            @change="call.applyLang"
          >
            <option value="en-US">说英语</option>
            <option value="zh-CN">说中文</option>
          </select>
        </div>

        <!-- Quick Starters Suggestions -->
        <div v-if="messages.length <= 2" class="suggestions-row">
          <button
            v-for="idea in ideas"
            :key="idea"
            type="button"
            class="suggestion-chip"
            @click="input = idea"
          >
            {{ idea }}
          </button>
        </div>

        <label class="sr-only" for="chat-input">对 {{ activeCompanion.name }} 说</label>
        <textarea
          id="chat-input"
          v-model="input"
          rows="3"
          maxlength="4000"
          :placeholder="`想聊什么，或想让 ${activeCompanion.name} 为你解答什么？`"
          @keydown.ctrl.enter.prevent="send()"
          @keydown.meta.enter.prevent="send()"
        />

        <div class="compose-actions-row">
          <button
            type="button"
            class="btn btn-secondary"
            :disabled="busy || call.active.value"
            @click="mic.start"
          >
            {{ recording ? '停止录音' : '🎤 语音输入' }}
          </button>

          <button
            type="button"
            class="btn"
            :class="call.active.value ? 'btn-end-call' : 'btn-call-toggle'"
            @click="toggleCall"
          >
            {{ call.active.value ? '结束通话' : '📞 实时语音通话' }}
          </button>

          <span class="call-hint-text">
            {{ call.active.value ? '说完停顿约1秒，语伴将直接开口接话' : '支持直接用麦克风与语伴双向畅聊' }}
          </span>

          <button
            type="button"
            class="btn btn-primary btn-send-msg"
            :disabled="busy || !input.trim()"
            @click="send()"
          >
            {{ busy ? '回复中…' : '发送' }}
          </button>
        </div>

        <p v-if="status || error" role="status" class="chat-status-notice">{{ status || error }}</p>
      </div>
    </div>

    <!-- Companion Selector Modal Dialog -->
    <Transition name="fade-slide">
      <div v-if="showBuddyModal" class="buddy-modal-backdrop" @click.self="showBuddyModal = false">
        <div class="buddy-modal-card">
          <div class="modal-head">
            <div>
              <h2>选择你的专属语伴</h2>
              <p>每一位语伴都有专属的音调、性格与对话风格，随时随地自由切换。</p>
            </div>
            <button type="button" class="btn-close-modal" @click="showBuddyModal = false">✕</button>
          </div>

          <div class="buddy-grid-select">
            <div
              v-for="buddy in BUDDIES"
              :key="buddy.id"
              class="buddy-option-item"
              :class="{ 'is-current': activeCompanion.id === buddy.id }"
              @click="selectNewBuddy(buddy)"
            >
              <div class="buddy-card-avatar" :style="{ background: buddy.bgGradient }">
                <BuddyAvatarVisual :buddy-id="buddy.id" :size="70" />
              </div>

              <div class="buddy-option-info">
                <div class="buddy-name-line">
                  <h4>{{ buddy.name }}</h4>
                  <small>（{{ buddy.chineseName }}）</small>
                  <span class="buddy-tag-cat">{{ buddy.category }}</span>
                </div>
                <p class="buddy-sub-tagline">{{ buddy.tagline }}</p>
                <p class="buddy-brief-desc">{{ buddy.desc }}</p>
              </div>

              <div class="buddy-action-col">
                <button
                  type="button"
                  class="btn-modal-choose"
                  :class="{ 'btn-chosen': activeCompanion.id === buddy.id }"
                >
                  {{ activeCompanion.id === buddy.id ? '当前陪伴' : '选择TA' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </section>
</template>

<style scoped>
.chat-container {
  max-width: 980px;
  margin: 0 auto;
  padding-bottom: 30px;
}

/* Chat Header */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0 24px;
}

.chat-brand {
  display: flex;
  align-items: center;
  gap: 16px;
}

.buddy-badge-avatar {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.25);
  flex-shrink: 0;
}

.chat-brand-meta {
  display: flex;
  flex-direction: column;
}

.brand-title-line {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.chat-brand h1 {
  font-family: var(--font-sans, sans-serif);
  font-size: 26px;
  font-weight: 700;
  margin: 0;
  color: var(--ink, #111827);
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.chat-brand h1 small {
  font-size: 15px;
  font-weight: normal;
  color: var(--ink-muted, #64748b);
}

.chat-brand p {
  margin: 4px 0 0;
  font-size: 13.5px;
  color: var(--ink-muted, #64748b);
}

.btn-switch-companion {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(37, 99, 235, 0.08);
  border: 1px solid rgba(37, 99, 235, 0.2);
  color: #2563eb;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-switch-companion:hover {
  background: rgba(37, 99, 235, 0.16);
  transform: translateY(-1px);
}

/* Conversation Panel */
.conversation-panel {
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--line, #e2e8f0);
  background: #ffffff;
}

.messages-list {
  min-height: 320px;
  max-height: 60vh;
  overflow-y: auto;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: #fbfcfd;
}

.message-bubble {
  max-width: 85%;
  border-radius: 20px;
  padding: 16px 22px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
}

.message-bubble.assistant {
  align-self: flex-start;
  background: #ffffff;
  border: 1px solid #eef2f6;
  border-top-left-radius: 4px;
}

.message-bubble.user {
  align-self: flex-end;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  border-top-right-radius: 4px;
}

.bubble-sender-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.bubble-mini-avatar {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sender-name {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--ink-muted, #64748b);
}

.bubble-content {
  margin: 0;
  font-size: 15px;
  line-height: 1.8;
  color: var(--ink, #1e293b);
  white-space: pre-wrap;
}

.bubble-actions {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid #f1f5f9;
}

.btn-listen-reply {
  background: transparent;
  border: none;
  color: #2563eb;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  padding: 2px 4px;
}

.btn-listen-reply:hover {
  text-decoration: underline;
}

/* Composer */
.chat-composer {
  border-top: 1px solid var(--line, #e2e8f0);
  padding: 22px 28px;
  background: #ffffff;
}

.suggestions-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.suggestion-chip {
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #475569;
  border-radius: 20px;
  padding: 7px 14px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggestion-chip:hover {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1d4ed8;
}

textarea#chat-input {
  width: 100%;
  border-radius: 14px;
  border: 1px solid #cbd5e1;
  padding: 12px 16px;
  font-size: 14.5px;
  line-height: 1.6;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
  font-family: inherit;
  transition: border-color 0.2s ease;
}

textarea#chat-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.compose-actions-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
  flex-wrap: wrap;
}

.call-hint-text {
  font-size: 12px;
  color: var(--ink-muted, #94a3b8);
  flex: 1;
}

.btn-call-toggle {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
  font-weight: 600;
}

.btn-call-toggle:hover {
  background: #dcfce7;
}

.btn-end-call {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
  font-weight: 600;
}

.btn-end-call:hover {
  background: #fecaca;
}

.btn-send-msg {
  padding: 11px 24px;
}

.chat-status-notice {
  margin-top: 12px;
  font-size: 13px;
  padding: 10px 14px;
  border-radius: 10px;
  background: #f8fafc;
  color: #64748b;
}

/* Call Bar */
.call-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  padding: 12px 16px;
  border-radius: 14px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.pulse {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #16a34a;
  flex: none;
}

.pulse.speaking { background: #2563eb; }
.pulse.thinking { background: #d97706; }

.call-text strong {
  font-size: 13.5px;
  color: #14532d;
}

.call-text p {
  margin: 2px 0 0;
  font-size: 14px;
  color: #166534;
}

.call-bar select {
  margin-left: auto;
  border-radius: 8px;
  border: 1px solid #bbf7d0;
  background: #ffffff;
  padding: 6px 10px;
  font-size: 12.5px;
}

/* Companion Switcher Modal */
.buddy-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.buddy-modal-card {
  width: 100%;
  max-width: 680px;
  background: #121524;
  color: #ffffff;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.7);
  padding: 28px 32px;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 22px;
}

.modal-head h2 {
  font-family: var(--font-serif, 'Playfair Display', Georgia, serif);
  font-size: 24px;
  margin: 0 0 6px;
  color: #ffffff;
}

.modal-head p {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.btn-close-modal {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close-modal:hover {
  background: rgba(255, 255, 255, 0.2);
}

.buddy-grid-select {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.buddy-option-item {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 14px 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
}

.buddy-option-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

.buddy-option-item.is-current {
  border-color: #38bdf8;
  background: rgba(56, 189, 248, 0.08);
}

.buddy-card-avatar {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
}

.buddy-option-info {
  flex: 1;
}

.buddy-name-line {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 2px;
}

.buddy-name-line h4 {
  font-size: 17px;
  font-weight: 700;
  margin: 0;
  color: #ffffff;
}

.buddy-name-line small {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.buddy-tag-cat {
  font-size: 10px;
  background: rgba(255, 255, 255, 0.15);
  padding: 2px 7px;
  border-radius: 8px;
  margin-left: 6px;
}

.buddy-sub-tagline {
  margin: 0 0 4px;
  font-size: 12px;
  color: #38bdf8;
  font-weight: 500;
}

.buddy-brief-desc {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.5;
}

.btn-modal-choose {
  padding: 8px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.btn-modal-choose.btn-chosen {
  background: #38bdf8;
  color: #090a10;
  border-color: #38bdf8;
}

@media (max-width: 680px) {
  .chat-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }
  .messages-list {
    padding: 16px;
  }
  .message-bubble {
    max-width: 100%;
  }
  .chat-composer {
    padding: 16px;
  }
  .compose-actions-row span {
    display: none;
  }
  .buddy-modal-card {
    padding: 20px 16px;
  }
  .buddy-option-item {
    flex-direction: column;
    align-items: flex-start;
  }
  .buddy-action-col {
    width: 100%;
  }
  .btn-modal-choose {
    width: 100%;
  }
}
</style>
