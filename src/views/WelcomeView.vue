<script setup>
import { useRouter } from 'vue-router'
import { useLearnerStore } from '@/stores/learner'

const router = useRouter()
const learner = useLearnerStore()

function start() {
  if (learner.onboardingDone && (learner.placementDone || learner.placementSkipped)) {
    router.push('/home')
    return
  }
  if (learner.onboardingDone) {
    router.push('/placement')
    return
  }
  router.push('/onboarding')
}
</script>

<template>
  <section class="hero">
    <div class="hero-copy">
      <p class="brand-mark display">语伴</p>
      <h1 class="display headline">和刚好懂你的 AI，一起开口说英语</h1>
      <p class="lead muted">
        入学测先定水平，语音陪伴持续校准。遇到抽象词，还能用画面帮你看懂。
      </p>
      <div class="actions">
        <button class="btn btn-primary" type="button" @click="start">开始认识语伴</button>
        <button
          v-if="learner.onboardingDone"
          class="btn btn-secondary"
          type="button"
          @click="router.push('/home')"
        >
          继续上次
        </button>
      </div>
      <ul class="promises">
        <li>水平匹配，略高于你一点</li>
        <li>语音对话为主，轻松开口</li>
        <li>难词生图，理解更直观</li>
      </ul>
    </div>

    <div class="hero-visual panel" aria-hidden="true">
      <div class="orbit">
        <div class="orb" />
        <div class="bubble b1">Hi, I’m Yuban</div>
        <div class="bubble b2">Let’s talk slowly</div>
        <div class="bubble b3">See · Hear · Speak</div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  min-height: calc(100vh - 2rem);
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 2rem;
  align-items: center;
  padding: 1.5rem 0;
}

.brand-mark {
  font-size: clamp(2.8rem, 6vw, 4.2rem);
  color: var(--brand-deep);
  margin: 0 0 0.75rem;
  animation: rise 0.7s ease both;
}

.headline {
  font-size: clamp(1.55rem, 3.2vw, 2.15rem);
  margin: 0 0 1rem;
  max-width: 16ch;
  animation: rise 0.7s ease 0.08s both;
}

.lead {
  font-size: 1.05rem;
  line-height: 1.65;
  max-width: 34ch;
  margin: 0 0 1.5rem;
  animation: rise 0.7s ease 0.14s both;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.75rem;
  animation: rise 0.7s ease 0.2s both;
}

.promises {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.55rem;
  color: var(--ink-muted);
  animation: rise 0.7s ease 0.26s both;
}

.promises li {
  position: relative;
  padding-left: 1.2rem;
}

.promises li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.55rem;
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background: var(--accent);
}

.hero-visual {
  min-height: 420px;
  position: relative;
  overflow: hidden;
  padding: 1.5rem;
  animation: rise 0.8s ease 0.12s both;
}

.orbit {
  position: relative;
  height: 100%;
  min-height: 380px;
  background:
    radial-gradient(circle at 30% 30%, rgba(232, 163, 23, 0.25), transparent 40%),
    linear-gradient(160deg, #1a6b5a, #0f4a3d 60%, #245c6b);
  border-radius: 14px;
}

.orb {
  position: absolute;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  left: 50%;
  top: 42%;
  transform: translate(-50%, -50%);
  background:
    radial-gradient(circle at 35% 30%, #fff1d1, transparent 40%),
    radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.2), transparent 45%),
    #2f8f6b;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
  animation: float 4.5s ease-in-out infinite;
}

.bubble {
  position: absolute;
  background: rgba(255, 252, 247, 0.94);
  color: var(--brand-deep);
  padding: 0.65rem 0.9rem;
  border-radius: 14px;
  font-weight: 600;
  font-size: 0.92rem;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
}

.b1 {
  top: 14%;
  left: 10%;
  animation: float 5s ease-in-out 0.2s infinite;
}
.b2 {
  top: 28%;
  right: 8%;
  animation: float 4.2s ease-in-out 0.6s infinite;
}
.b3 {
  bottom: 14%;
  left: 22%;
  animation: float 4.8s ease-in-out 0.9s infinite;
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translate(-50%, -50%) translateY(0);
  }
  50% {
    transform: translate(-50%, -50%) translateY(-10px);
  }
}

.b1,
.b2,
.b3 {
  transform: none;
}

.b1 {
  animation-name: bob;
}
.b2 {
  animation-name: bob;
}
.b3 {
  animation-name: bob;
}

@keyframes bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@media (max-width: 860px) {
  .hero {
    grid-template-columns: 1fr;
  }
  .hero-visual {
    min-height: 300px;
  }
  .orbit {
    min-height: 280px;
  }
}
</style>
