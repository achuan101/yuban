let generation = 0
export function stopSpeaking() { generation += 1; globalThis.speechSynthesis?.cancel() }
function preferredVoice(voices, chinese) {
  if (chinese) return voices.find(v => /^zh[-_]/i.test(v.lang) && /natural|xiaoxiao|yunxi|tingting|meijia/i.test(v.name)) || voices.find(v => /^zh[-_]/i.test(v.lang)) || null
  const english = voices.filter(v => /^en[-_]/i.test(v.lang))
  return english.find(v => /natural|premium|samantha|aria|jenny|google.*english/i.test(v.name)) || english[0] || null
}
export function speakText(text, { rate = .85, pitch = 1.0, onEnd, onError, onBoundary } = {}) {
  const synth = globalThis.speechSynthesis
  if (!synth) { onError?.('当前浏览器不支持朗读'); return }
  const token = ++generation
  synth.cancel()
  const chinese = (String(text).match(/[\u4e00-\u9fff]/g) || []).length >= 2
  const start = () => {
    if (token !== generation) return
    const voice = preferredVoice(synth.getVoices(), chinese)
    const u = new SpeechSynthesisUtterance(text)
    u.lang = voice?.lang || (chinese ? 'zh-CN' : 'en-US'); u.voice = voice; u.rate = rate; u.pitch = pitch
    u.onend = () => { if (token === generation) onEnd?.() }
    u.onerror = e => { if (token === generation && !['canceled', 'interrupted'].includes(e.error)) onError?.('设备朗读没有完成，请重试') }
    u.onboundary = e => { if (token === generation) onBoundary?.(e) }
    synth.speak(u)
  }
  if (synth.getVoices().length) { setTimeout(start, 40); return }
  const timer = setTimeout(start, 350)
  const ready = () => { synth.removeEventListener?.('voiceschanged', ready); clearTimeout(timer); setTimeout(start, 40) }
  synth.addEventListener?.('voiceschanged', ready)
}
export function feedbackSound(correct) {
  const Context = globalThis.AudioContext || globalThis.webkitAudioContext
  if (!Context) return
  const c = new Context(), o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = correct ? 620 : 280; g.gain.setValueAtTime(.025, c.currentTime); g.gain.exponentialRampToValueAtTime(.0001, c.currentTime+.15); o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime+.15); o.onended = () => c.close()
}
