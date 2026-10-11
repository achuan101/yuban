const sentencePattern = /^[\s\S]*?[.!?。！？]["”']?\s*/

export function pullSentences(buffer, flush = false) {
  const sentences = []
  let rest = String(buffer || '')
  while (rest) {
    const match = rest.match(sentencePattern)
    if (!match) break
    const sentence = match[0].trim()
    if (sentence) sentences.push(sentence)
    rest = rest.slice(match[0].length)
  }
  if (flush && rest.trim()) {
    sentences.push(rest.trim())
    rest = ''
  }
  return { sentences, rest }
}
