import test from 'node:test'
import assert from 'node:assert/strict'
import { BUDDIES, DEFAULT_BUDDY_ID, getBuddyById } from '../src/data/buddies.js'

test('buddies list has 5 unique, well-defined companion personas', () => {
  assert.equal(BUDDIES.length, 5)
  const ids = BUDDIES.map(b => b.id)
  assert.equal(new Set(ids).size, 5)

  for (const b of BUDDIES) {
    assert(b.id, 'must have id')
    assert(b.name, 'must have name')
    assert(b.chineseName, 'must have chineseName')
    assert(b.tagline, 'must have tagline')
    assert(b.desc, 'must have desc')
    assert(b.sampleVoiceText, 'must have sampleVoiceText')
    assert(b.greeting, 'must have greeting')
    assert(b.bgGradient, 'must have bgGradient')
    assert(b.systemPrompt, 'must have systemPrompt')
    assert(typeof b.voiceRate === 'number', 'voiceRate must be number')
    assert(typeof b.voicePitch === 'number', 'voicePitch must be number')
  }
})

test('getBuddyById returns companion or falls back to default', () => {
  assert.equal(DEFAULT_BUDDY_ID, 'orbit')
  const orbit = getBuddyById('orbit')
  assert.equal(orbit.name, 'Orbit')

  const sunny = getBuddyById('sunny')
  assert.equal(sunny.name, 'Sunny')

  const fallback = getBuddyById('unknown-id')
  assert.equal(fallback.id, 'orbit')
})
