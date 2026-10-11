<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { BUDDIES } from '@/data/buddies'
import BuddyAvatarVisual from './BuddyAvatarVisual.vue'
import { speakText, stopSpeaking } from '@/services/audio'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'orbit'
  }
})

const emit = defineEmits(['update:modelValue', 'select'])

const hoverIndex = ref(null)
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)

function onResize() {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  if (typeof window !== 'undefined') window.addEventListener('resize', onResize)
})
onBeforeUnmount(() => {
  if (typeof window !== 'undefined') window.removeEventListener('resize', onResize)
})

const cardSpacing = computed(() => {
  if (windowWidth.value < 540) return 56
  if (windowWidth.value < 820) return 88
  return 124
})

const selectedId = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const activeBuddy = computed(() => {
  if (hoverIndex.value !== null) {
    return BUDDIES[hoverIndex.value]
  }
  return BUDDIES.find(b => b.id === selectedId.value) || BUDDIES[2]
})

function onCardHover(index) {
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(hover: none)').matches) {
    return
  }
  hoverIndex.value = index
}

function onCardLeave() {
  hoverIndex.value = null
}

function selectCard(buddy) {
  selectedId.value = buddy.id
  hoverIndex.value = null
  emit('select', buddy)
}

function playVoiceSample(buddy, e) {
  e?.stopPropagation?.()
  stopSpeaking()
  speakText(buddy.sampleVoiceText, {
    rate: buddy.voiceRate || 0.95,
    pitch: buddy.voicePitch || 1.0
  })
}

// Calculate the physics transform for card at index i
function getCardStyle(index) {
  const total = BUDDIES.length
  const center = Math.floor(total / 2) // index 2 ("orbit")
  const spacing = cardSpacing.value
  const delta = index - center
  const baseTx = delta * spacing
  const baseRot = delta * 7.5
  const baseTy = Math.abs(delta) * Math.abs(delta) * 5.5

  if (hoverIndex.value === null) {
    // Natural resting fan-out arc
    const isSelected = BUDDIES[index].id === selectedId.value
    const scale = isSelected ? 1.05 : (1 - Math.abs(delta) * 0.02)
    const z = 10 - Math.abs(delta)
    const liftY = isSelected ? -10 : 0

    return {
      transform: `translate3d(${baseTx}px, ${baseTy + liftY}px, 0) rotate(${baseRot}deg) scale(${scale})`,
      zIndex: isSelected ? 18 : z,
      opacity: 1,
      filter: isSelected
        ? 'drop-shadow(0 24px 38px rgba(0,0,0,0.55)) brightness(1.03)'
        : 'drop-shadow(0 14px 26px rgba(0,0,0,0.4))'
    }
  }

  // Active hover physics: card k is hovered!
  const k = hoverIndex.value
  const dist = index - k

  if (dist === 0) {
    // The hovered card: lifts up, enlarges, straightens, stays on top
    return {
      transform: `translate3d(${baseTx}px, -42px, 0) rotate(0deg) scale(1.18)`,
      zIndex: 40,
      opacity: 1,
      filter: 'drop-shadow(0 34px 52px rgba(0,0,0,0.7)) brightness(1.06)'
    }
  } else if (dist === -1) {
    // Immediate LEFT neighbor: pushed outward to left & tilted counter-clockwise
    const push = windowWidth.value < 540 ? -24 : -46
    return {
      transform: `translate3d(${baseTx + push}px, -6px, 0) rotate(-15deg) scale(0.96)`,
      zIndex: 25,
      opacity: 0.96,
      filter: 'drop-shadow(0 18px 28px rgba(0,0,0,0.45))'
    }
  } else if (dist === 1) {
    // Immediate RIGHT neighbor: pushed outward to right & tilted clockwise
    const push = windowWidth.value < 540 ? 24 : 46
    return {
      transform: `translate3d(${baseTx + push}px, -6px, 0) rotate(15deg) scale(0.96)`,
      zIndex: 25,
      opacity: 0.96,
      filter: 'drop-shadow(0 18px 28px rgba(0,0,0,0.45))'
    }
  } else if (dist < -1) {
    // Outer LEFT cards: pushed further left, tilted more, dimmed
    const push = windowWidth.value < 540 ? -38 : -64
    return {
      transform: `translate3d(${baseTx + push}px, 12px, 0) rotate(-22deg) scale(0.88)`,
      zIndex: 10 + dist,
      opacity: 0.65,
      filter: 'brightness(0.88) drop-shadow(0 10px 18px rgba(0,0,0,0.35))'
    }
  } else {
    // Outer RIGHT cards: pushed further right, tilted more, dimmed
    const push = windowWidth.value < 540 ? 38 : 64
    return {
      transform: `translate3d(${baseTx + push}px, 12px, 0) rotate(22deg) scale(0.88)`,
      zIndex: 10 - dist,
      opacity: 0.65,
      filter: 'brightness(0.88) drop-shadow(0 10px 18px rgba(0,0,0,0.35))'
    }
  }
}
</script>

<template>
  <div class="buddy-deck-wrapper">
    <!-- Ambient Typography Watermark in Background -->
    <div class="watermark-bg" aria-hidden="true">
      <span>YUBAN</span>
    </div>

    <!-- Interactive Card Fan Container -->
    <div
      class="fan-deck-container"
      role="region"
      aria-label="选择你的AI语伴"
      @mouseleave="onCardLeave"
    >
      <div
        v-for="(buddy, index) in BUDDIES"
        :key="buddy.id"
        class="buddy-card"
        :class="{
          'is-active': selectedId === buddy.id,
          'is-hovered': hoverIndex === index
        }"
        :style="[
          getCardStyle(index),
          { background: buddy.bgGradient }
        ]"
        tabindex="0"
        role="button"
        :aria-label="`${buddy.name} - ${buddy.category}`"
        @mouseenter="onCardHover(index)"
        @click="selectCard(buddy)"
        @keydown.enter="selectCard(buddy)"
        @keydown.space.prevent="selectCard(buddy)"
      >
        <!-- Card Gloss Light Overlay -->
        <div class="card-gloss" />

        <!-- Card Header Info -->
        <div class="card-header">
          <div class="buddy-titles">
            <h3 class="buddy-name">{{ buddy.name }}</h3>
            <span class="buddy-cat">{{ buddy.category }}</span>
          </div>
          <span
            v-if="selectedId === buddy.id"
            class="active-pill"
            title="已选定当前陪伴"
          >
            ✓ Active
          </span>
        </div>

        <!-- 3D Mascot Character (Pop-out bottom effect) -->
        <div class="mascot-anchor">
          <BuddyAvatarVisual :buddy-id="buddy.id" :size="170" />
        </div>
      </div>
    </div>

    <!-- Active Buddy Quick Highlight (Reference Style Bottom Bar) -->
    <div class="buddy-spotlight-bar">
      <div class="spotlight-badge-row">
        <span class="red-bar-indicator" />
        <span class="spotlight-kicker">专属陪伴角色</span>
        <span class="spotlight-tag">{{ activeBuddy.tagline }}</span>
      </div>

      <div class="spotlight-content">
        <div class="spotlight-text">
          <h4 class="spotlight-title">
            {{ activeBuddy.name }}
            <small class="spotlight-cn">（{{ activeBuddy.chineseName }}）</small>
          </h4>
          <p class="spotlight-desc">{{ activeBuddy.desc }}</p>
        </div>

        <div class="spotlight-actions">
          <button
            type="button"
            class="btn-voice-preview"
            :title="`试听 ${activeBuddy.name} 的声音`"
            @click="playVoiceSample(activeBuddy, $event)"
          >
            <span class="voice-icon">🔊</span>
            <span>试听原声</span>
          </button>

          <button
            type="button"
            class="btn-select-confirm"
            :class="{ 'btn-selected': selectedId === activeBuddy.id }"
            @click="selectCard(activeBuddy)"
          >
            {{ selectedId === activeBuddy.id ? '✓ 当前已选定' : `选定 ${activeBuddy.name}` }}
          </button>
        </div>
      </div>

      <!-- Interaction Tip (Echoing the reference annotation) -->
      <div class="interaction-tip">
        <span class="tip-dot" />
        <span>交互物理排斥：悬停任一卡片时，左邻右舍将自适应外推偏转，呈现纸牌拨开层深。</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.buddy-deck-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 40px 0 20px;
  perspective: 1200px;
}

/* Background Watermark */
.watermark-bg {
  position: absolute;
  top: 15%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: var(--font-serif, 'Playfair Display', Georgia, serif);
  font-size: clamp(80px, 16vw, 190px);
  font-weight: 900;
  letter-spacing: 0.18em;
  color: rgba(255, 255, 255, 0.028);
  user-select: none;
  pointer-events: none;
  white-space: nowrap;
  z-index: 1;
}

/* Fan Deck Container */
.fan-deck-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 900px;
  height: 380px;
  z-index: 5;
}

/* Buddy Card */
.buddy-card {
  position: absolute;
  width: 195px;
  height: 275px;
  border-radius: 30px;
  padding: 22px 20px;
  box-sizing: border-box;
  color: #ffffff;
  cursor: pointer;
  user-select: none;
  overflow: visible; /* Allows 3D character to pop out of frame */
  border: 1px solid rgba(255, 255, 255, 0.28);
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.45),
    0 16px 36px rgba(0, 0, 0, 0.45);
  transform-origin: center 85%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
  -webkit-tap-highlight-color: transparent;
  transition:
    transform 0.48s cubic-bezier(0.34, 1.56, 0.64, 1),
    filter 0.35s ease,
    opacity 0.35s ease,
    border-color 0.3s ease;
  will-change: transform;
  outline: none;
}

.buddy-card:focus-visible {
  border-color: #ffffff;
  box-shadow:
    0 0 0 3px rgba(255, 255, 255, 0.5),
    0 20px 40px rgba(0, 0, 0, 0.6);
}

.card-gloss {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  border-top-left-radius: 29px;
  border-top-right-radius: 29px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.22) 0%,
    rgba(255, 255, 255, 0) 100%
  );
  pointer-events: none;
}

/* Header Inside Card */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  z-index: 2;
}

.buddy-titles {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.buddy-name {
  margin: 0;
  font-family: var(--font-sans, sans-serif);
  font-size: 24px;
  font-weight: 750;
  letter-spacing: -0.02em;
  line-height: 1.1;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.buddy-cat {
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.88);
  letter-spacing: 0.02em;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
}

.active-pill {
  font-size: 10px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(8px);
  padding: 4px 8px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  letter-spacing: 0.03em;
}

/* 3D Mascot Pop-Out Placement */
.mascot-anchor {
  position: absolute;
  bottom: -24px;
  left: 50%;
  transform: translateX(-50%);
  width: 175px;
  height: 175px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 3;
}

/* Selected Status Highlight */
.buddy-card.is-active {
  border-color: rgba(255, 255, 255, 0.7);
}

/* Spotlight Bar Underneath */
.buddy-spotlight-bar {
  position: relative;
  z-index: 10;
  width: min(100%, 720px);
  margin-top: 10px;
  padding: 22px 28px;
  border-radius: 24px;
  background: rgba(18, 20, 29, 0.75);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.09);
  box-shadow: 0 24px 50px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  gap: 14px;
  animation: fadeIn 0.4s ease;
}

.spotlight-badge-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
}

.red-bar-indicator {
  width: 4px;
  height: 16px;
  border-radius: 2px;
  background: #ff5252;
}

.spotlight-kicker {
  color: #ff6b6b;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.spotlight-tag {
  color: rgba(255, 255, 255, 0.55);
  padding-left: 6px;
  border-left: 1px solid rgba(255, 255, 255, 0.12);
}

.spotlight-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.spotlight-text {
  flex: 1;
}

.spotlight-title {
  margin: 0 0 6px;
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.spotlight-cn {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: normal;
}

.spotlight-desc {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.78);
}

.spotlight-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.btn-voice-preview {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #ffffff;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-voice-preview:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.voice-icon {
  font-size: 14px;
}

.btn-select-confirm {
  display: inline-flex;
  align-items: center;
  padding: 10px 20px;
  border-radius: 14px;
  background: #ffffff;
  color: #0b0c10;
  font-size: 13px;
  font-weight: 650;
  border: none;
  transition: all 0.2s ease;
}

.btn-select-confirm:hover {
  background: #f0f4f8;
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(255, 255, 255, 0.25);
}

.btn-select-confirm.btn-selected {
  background: #2563eb;
  color: #ffffff;
}

.btn-select-confirm.btn-selected:hover {
  background: #1d4ed8;
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.35);
}

.interaction-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.42);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 10px;
}

.tip-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 8px #38bdf8;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Handling */
@media (max-width: 820px) {
  .fan-deck-container {
    height: 330px;
  }
  .buddy-card {
    width: 155px;
    height: 230px;
    border-radius: 24px;
    padding: 16px 14px;
  }
  .buddy-name {
    font-size: 19px;
  }
  .buddy-cat {
    font-size: 10px;
  }
  .mascot-anchor {
    width: 140px;
    height: 140px;
    bottom: -18px;
  }
  .spotlight-content {
    flex-direction: column;
    align-items: flex-start;
  }
  .spotlight-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 540px) {
  .fan-deck-container {
    height: 290px;
  }
  .buddy-card {
    width: 130px;
    height: 200px;
    border-radius: 20px;
    padding: 14px 12px;
  }
  .buddy-name {
    font-size: 16px;
  }
  .buddy-cat {
    font-size: 9px;
  }
  .mascot-anchor {
    width: 115px;
    height: 115px;
    bottom: -14px;
  }
  .buddy-spotlight-bar {
    padding: 18px 20px;
  }
  .spotlight-actions {
    flex-direction: column;
    width: 100%;
  }
  .btn-voice-preview,
  .btn-select-confirm {
    width: 100%;
    justify-content: center;
  }
}
</style>
