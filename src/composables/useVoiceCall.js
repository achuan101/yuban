import { ref, onBeforeUnmount } from 'vue'
import { speakText, stopSpeaking } from '@/services/audio'

export function useVoiceCall({ onUtterance, onError, getVoiceOptions }) {
  const active = ref(false)
  const phase = ref('idle')
  const live = ref('')
  const lang = ref('en-US')
  const supported = Boolean(globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition)
  let recognition = null
  let silenceTimer = 0
  let queue = []
  let pumping = false
  let turnOpen = false

  function clearSilence() { clearTimeout(silenceTimer); silenceTimer = 0 }
  function halt() {
    clearSilence()
    const current = recognition
    recognition = null
    try { current?.abort?.() } catch { /* already closed */ }
    try { current?.stop?.() } catch { /* already closed */ }
  }
  function commit(text) {
    const spoken = text.trim()
    if (!active.value || phase.value !== 'listening' || !spoken) return
    phase.value = 'thinking'
    live.value = ''
    halt()
    onUtterance(spoken)
  }
  function startRecognition() {
    const SR = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition
    if (!SR || !active.value) return
    halt()
    const next = new SR()
    recognition = next
    next.lang = lang.value
    next.continuous = true
    next.interimResults = true
    next.onresult = event => {
      if (recognition !== next || !active.value || phase.value !== 'listening') return
      const text = Array.from(event.results).map(result => result[0].transcript).join(' ').trim()
      live.value = text
      clearSilence()
      if (text) silenceTimer = setTimeout(() => commit(text), 1000)
    }
    next.onerror = event => {
      if (recognition !== next || !active.value) return
      if (event.error === 'aborted' || event.error === 'no-speech') return
      if (event.error === 'not-allowed') { hangup(); onError?.('未获得麦克风权限，请在浏览器设置中允许后重试。'); return }
      onError?.('语音识别中断了，正在重新听。')
      if (phase.value === 'listening') setTimeout(() => { if (active.value && phase.value === 'listening') startRecognition() }, 300)
    }
    next.onend = () => {
      if (recognition !== next || !active.value || phase.value !== 'listening') return
      if (live.value.trim()) commit(live.value)
      else setTimeout(() => { if (recognition === next && active.value && phase.value === 'listening') startRecognition() }, 200)
    }
    phase.value = 'listening'
    try { next.start() } catch { onError?.('语音识别没有启动，请重试。') }
  }
  function listen() {
    if (!active.value) return
    turnOpen = false
    queue = []
    pumping = false
    stopSpeaking()
    live.value = ''
    startRecognition()
  }
  function pump() {
    if (pumping || !active.value) return
    const next = queue.shift()
    if (!next) { if (!turnOpen) listen(); return }
    pumping = true
    phase.value = 'speaking'
    const vOpt = typeof getVoiceOptions === 'function' ? getVoiceOptions() : (getVoiceOptions || {})
    speakText(next, {
      rate: vOpt?.rate ?? .92,
      pitch: vOpt?.pitch ?? 1.0,
      onEnd: () => { pumping = false; if (active.value) pump() },
      onError: message => { onError?.(message); pumping = false; if (active.value) pump() },
    })
  }
  function startTurn() {
    if (!active.value) return
    queue = []
    pumping = false
    turnOpen = true
    phase.value = 'thinking'
    stopSpeaking()
  }
  function say(sentence) {
    const text = String(sentence || '').trim()
    if (!active.value || !turnOpen || !text) return
    queue.push(text)
    pump()
  }
  function finishTurn() {
    turnOpen = false
    if (!active.value || phase.value === 'listening') return
    if (!pumping && !queue.length) listen()
  }
  function start() {
    if (active.value) return
    if (!supported) { onError?.('当前浏览器不支持实时语音识别。请用 Chrome 或 Edge 打开这个页面。'); return }
    active.value = true
    live.value = ''
    startRecognition()
  }
  function hangup() {
    active.value = false
    phase.value = 'idle'
    live.value = ''
    turnOpen = false
    queue = []
    pumping = false
    halt()
    stopSpeaking()
  }
  function applyLang() { live.value = ''; if (active.value && phase.value === 'listening') startRecognition() }
  onBeforeUnmount(hangup)
  return { active, phase, live, lang, supported, start, hangup, listen, startTurn, say, finishTurn, applyLang }
}
