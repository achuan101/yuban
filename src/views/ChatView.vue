<script setup>
import { computed, ref, nextTick, onBeforeUnmount } from 'vue'
import { useLearnerStore } from '@/stores/learner'
import { coach } from '@/services/llm'
import { pullSentences } from '@/domain/speakable.mjs'
import { speakText, stopSpeaking } from '@/services/audio'
import { useRecording } from '@/composables/useRecording'
import { useVoiceCall } from '@/composables/useVoiceCall'
const learner = useLearnerStore()
const input = ref('')
const busy = ref(false)
const messages = ref([{ role: 'assistant', content: '我是Alex。想问语法、练一句表达，还是用你的生活写一篇文章？你说就好。' }])
const status = ref('')
const bottom = ref(null)
let controller, silentAbort = false
const mic = useRecording(t => { input.value = t })
const { recording, error } = mic
const call = useVoiceCall({ onUtterance: text => send(text), onError: message => { status.value = message } })
const ideas = ['用简单英语和我聊家人，一次问一个问题', '解释 this is 和 there is 的区别', '写一篇适合我的自我介绍，附中文翻译']
const phaseText = computed(() => ({ listening: '正在听，说完停一下', thinking: 'Alex 正在想怎么接', speaking: 'Alex 正在说' })[call.phase.value] || '')
function coachPayload() {
  return { messages: messages.value.slice(-12), profile: { name: learner.displayName, ageGroup: learner.profile.ageGroup, goal: learner.profile.goal }, estimate: learner.placementDone ? learner.summary : null, scene: learner.settings.scene, needsHelp: learner.model.outputGaps.filter(g => !g.resolved).slice(0, 5).map(g => g.word), voice: call.active.value }
}
async function send(spoken) {
  const fromCall = typeof spoken === 'string'
  const text = (fromCall ? spoken : input.value).trim()
  if (!text || busy.value) { if (fromCall) call.listen(); return }
  if (!fromCall) mic.stop()
  input.value = ''
  messages.value.push({ role: 'user', content: text })
  const payload = coachPayload()
  busy.value = true
  status.value = call.active.value ? '' : 'Alex正在思考…'
  silentAbort = false
  controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 25000)
  let voiceBubble = null
  try {
    if (call.active.value) {
      voiceBubble = { role: 'assistant', content: '' }
      messages.value.push(voiceBubble)
      call.startTurn()
      let pending = ''
      let spokenCount = 0
      const take = flush => {
        const pulled = pullSentences(pending, flush)
        pending = pulled.rest
        for (const sentence of pulled.sentences) { if (spokenCount < 2) { spokenCount += 1; call.say(sentence) } }
      }
      await coach(payload, controller.signal, delta => { if (silentAbort) return; voiceBubble.content += delta; pending += delta; take(false) })
      if (silentAbort) return
      take(true)
      if (!voiceBubble.content.trim()) throw new Error('AI没有返回有效内容，请重试')
      status.value = ''
      call.finishTurn()
    } else {
      const data = await coach(payload, controller.signal)
      messages.value.push({ role: 'assistant', content: data.reply })
      status.value = ''
    }
  } catch (e) {
    if (silentAbort) { if (voiceBubble && !voiceBubble.content.trim()) messages.value.pop(); status.value = ''; return }
    status.value = e.name === 'AbortError' ? '等待超时，可以稍后重试。' : e.message
    if (call.active.value) { if (voiceBubble && !voiceBubble.content.trim()) messages.value.pop(); call.listen(); return }
    input.value = text
    messages.value.pop()
  } finally { clearTimeout(timer); busy.value = false; await nextTick(); bottom.value?.scrollIntoView({ block: 'nearest' }) }
}
function toggleCall() {
  if (call.active.value) { silentAbort = true; controller?.abort(); call.hangup(); return }
  mic.stop()
  status.value = ''
  call.start()
}
function interrupt() { silentAbort = true; controller?.abort(); call.listen() }
onBeforeUnmount(() => { silentAbort = true; controller?.abort(); stopSpeaking() })
</script>
<template>
  <section class="chat">
    <header class="page-head">
      <div class="chat-brand"><img src="/assets/alex-mentor.png" alt="Alex"/><div><h1>Alex 智能陪练</h1><p>可以打字，也可以直接开口。说完停一下，Alex 会接话并朗读。</p></div></div>
      <RouterLink to="/learn" class="btn btn-secondary">回到文章</RouterLink>
    </header>
    <div class="panel conversation">
      <div class="messages">
        <article v-for="(m,i) in messages" :key="i" class="bubble" :class="m.role">
          <span class="role">{{ m.role === 'user' ? '你' : 'Alex' }}</span>
          <p>{{ m.content }}</p>
          <button v-if="m.role === 'assistant' && i" class="btn btn-ghost" @click="speakText(m.content)">听回复</button>
        </article>
        <div ref="bottom"/>
      </div>
      <div class="composer">
        <div v-if="call.active.value" class="call-bar" role="status">
          <i class="pulse" :class="call.phase.value"/>
          <div><strong>{{ phaseText }}</strong><p v-if="call.live.value">{{ call.live.value }}</p></div>
          <button v-if="call.phase.value === 'speaking' || call.phase.value === 'thinking'" class="btn btn-ghost" @click="interrupt">打断</button>
          <select v-model="call.lang.value" aria-label="识别语言" @change="call.applyLang">
            <option value="en-US">说英语</option>
            <option value="zh-CN">说中文</option>
          </select>
        </div>
        <div v-if="messages.length === 1" class="suggestions"><button v-for="idea in ideas" :key="idea" @click="input = idea">{{ idea }}</button></div>
        <label class="sr-only" for="chat-input">对Alex说</label>
        <textarea id="chat-input" v-model="input" rows="3" maxlength="4000" placeholder="想聊什么，或想让Alex为你做什么？" @keydown.ctrl.enter.prevent="send()" @keydown.meta.enter.prevent="send()"/>
        <div class="compose-actions">
          <button class="btn btn-secondary" :disabled="busy || call.active.value" @click="mic.start">{{ recording ? '停止录音' : '语音输入' }}</button>
          <button class="btn" :class="call.active.value ? 'btn-end' : 'btn-primary'" @click="toggleCall">{{ call.active.value ? '结束通话' : '语音通话' }}</button>
          <span class="muted">{{ call.active.value ? '停顿约一秒后自动发送' : '语音通话会开口回复' }}</span>
          <button class="btn btn-primary" :disabled="busy || !input.trim()" @click="send()">{{ busy ? '正在回复…' : '发送' }}</button>
        </div>
        <p v-if="status || error" role="status" class="notice">{{ status || error }}</p>
      </div>
    </div>
  </section>
</template>
<style scoped>
.chat{max-width:960px;margin:auto}.chat-brand{display:flex;align-items:center;gap:18px}.chat-brand img{width:52px}.chat-brand h1{font-size:30px}.conversation{overflow:hidden}.messages{min-height:300px;max-height:60vh;overflow:auto;padding:28px;display:flex;flex-direction:column;gap:20px}.bubble{max-width:88%;border-radius:16px;background:#f2f7f3;padding:17px 22px}.bubble.user{align-self:flex-end;background:#edf3fa}.bubble p{white-space:pre-wrap;line-height:1.85;font-size:15px;margin:6px 0}.role{font-size:11px;color:var(--ink-muted)}.bubble .btn{font-size:11px;min-height:30px;padding:0}.composer{border-top:1px solid var(--line);padding:22px}.suggestions{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}.suggestions button{border:1px solid var(--line);background:#fff;border-radius:20px;padding:7px 11px;font-size:11px}.compose-actions{display:flex;align-items:center;gap:12px;margin-top:12px;flex-wrap:wrap}.compose-actions span{font-size:11px;flex:1}.call-bar{display:flex;align-items:center;gap:12px;margin-bottom:14px;padding:12px 14px;border-radius:14px;background:#f0f7f2;border:1px solid #dce9de}.call-bar strong{font-size:13px}.call-bar p{margin:2px 0 0;font-size:14px}.call-bar select{margin-left:auto;min-height:36px}.pulse{width:10px;height:10px;border-radius:50%;background:var(--brand);flex:none}.pulse.speaking{background:var(--blue)}.pulse.thinking{background:#c4a35a}.btn.btn-end{background:#ad4851;color:#fff}.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}@media (prefers-reduced-motion:no-preference){.pulse.listening{animation:pulse 1.4s ease-out infinite}}@keyframes pulse{50%{transform:scale(1.35);opacity:.55}}@media(max-width:750px){.messages{padding:16px}.bubble{max-width:100%;padding:15px}.compose-actions span{display:none}.compose-actions .btn:last-child{margin-left:auto}.chat-brand h1{font-size:24px}.call-bar{align-items:flex-start;flex-wrap:wrap}.call-bar select{margin-left:0}}
</style>
