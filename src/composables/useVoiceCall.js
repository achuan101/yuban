import { ref, onBeforeUnmount } from 'vue'
import { speakText, stopSpeaking } from '@/services/audio'

export function useVoiceCall({ onUtterance, onError }) {
  const active = ref(false)
  const phase = ref('idle')
  const live = ref('')
  const lang = ref('en-US')
  const supported = Boolean(globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition)
  let recognition = null
  let silenceTimer = 0

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
    stopSpeaking()
    live.value = ''
    startRecognition()
  }
  function speak(text) {
    if (!active.value) return
    phase.value = 'speaking'
    live.value = ''
    speakText(text, { rate: .92, onEnd: () => { if (active.value && phase.value === 'speaking') listen() }, onError: message => { onError?.(message); if (active.value) listen() } })
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
    halt()
    stopSpeaking()
  }
  function applyLang() { live.value = ''; if (active.value && phase.value === 'listening') startRecognition() }
  onBeforeUnmount(hangup)
  return { active, phase, live, lang, supported, start, hangup, listen, speak, applyLang }
}
