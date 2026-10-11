export function stopSpeaking() { globalThis.speechSynthesis?.cancel() }
export function speakText(text, { rate = .85, onEnd, onError, onBoundary } = {}) {
  stopSpeaking()
  if (!globalThis.speechSynthesis) { onError?.('当前浏览器不支持朗读'); return }
  const voices = speechSynthesis.getVoices().filter(v => /^en[-_]/i.test(v.lang))
  const voice = voices.find(v => /natural|premium|samantha|aria|jenny|google.*english/i.test(v.name)) || voices[0]
  const u = new SpeechSynthesisUtterance(text); u.lang = voice?.lang || 'en-US'; u.voice = voice || null; u.rate = rate
  u.onend = () => onEnd?.(); u.onerror = e => { if (!['canceled','interrupted'].includes(e.error)) onError?.('设备朗读没有完成，请重试') }; u.onboundary = e => onBoundary?.(e); speechSynthesis.speak(u)
}
export function feedbackSound(correct) {
  const Context = globalThis.AudioContext || globalThis.webkitAudioContext
  if (!Context) return
  const c = new Context(), o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = correct ? 620 : 280; g.gain.setValueAtTime(.025, c.currentTime); g.gain.exponentialRampToValueAtTime(.0001, c.currentTime+.15); o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime+.15); o.onended = () => c.close()
}
