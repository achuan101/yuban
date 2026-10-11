<script setup>
import { useRouter } from 'vue-router'
import { useLearnerStore } from '@/stores/learner'

const router = useRouter()
const learner = useLearnerStore()

function startChat(topic) {
  router.push({ name: 'chat', query: topic ? { topic } : {} })
}
</script>

<template>
  <section class="home">
    <header class="hero-strip panel">
      <div>
        <p class="eyebrow">你好，{{ learner.displayName }}</p>
        <h1 class="display">今天想和 {{ learner.companionName }} 聊点什么？</h1>
        <p class="muted">
          当前水平 {{ learner.cefr }} · L{{ learner.level }}（{{ learner.levelLabel }}）。语伴会用略高一点的英语陪你练习。
        </p>
        <div class="cta">
          <button class="btn btn-primary" type="button" @click="startChat()">开始语音对话</button>
          <RouterLink class="btn btn-secondary" to="/review">查看复盘</RouterLink>
        </div>
      </div>
      <div class="companion" aria-hidden="true">
        <div class="face" />
        <p>Listening…</p>
      </div>
    </header>

    <section class="topics">
      <h2 class="display">推荐话题</h2>
      <div class="topic-grid">
        <button
          v-for="topic in learner.topics"
          :key="topic"
          class="topic panel"
          type="button"
          @click="startChat(topic)"
        >
          <span>{{ topic }}</span>
          <small>匹配 L{{ learner.level }}</small>
        </button>
      </div>
    </section>

    <section v-if="learner.weakTags.length" class="hints panel">
      <h3>今日关注</h3>
      <div class="tags">
        <span v-for="tag in learner.weakTags" :key="tag" class="chip">{{ tag }}</span>
      </div>
    </section>
  </section>
</template>

<style scoped>
.home {
  display: grid;
  gap: 1.5rem;
}

.hero-strip {
  display: grid;
  grid-template-columns: 1.4fr 0.8fr;
  gap: 1.25rem;
  padding: 1.5rem;
  overflow: hidden;
}

h1 {
  margin: 0.35rem 0 0.7rem;
  font-size: clamp(1.6rem, 3.5vw, 2.1rem);
  max-width: 18ch;
}

.cta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-top: 1.2rem;
}

.companion {
  border-radius: 14px;
  background: linear-gradient(160deg, #1a6b5a, #245c6b);
  color: #fff;
  display: grid;
  place-content: center;
  gap: 0.75rem;
  text-align: center;
  min-height: 180px;
}

.face {
  width: 72px;
  height: 72px;
  margin: 0 auto;
  border-radius: 50%;
  background:
    radial-gradient(circle at 35% 30%, #fff1d1, transparent 40%),
    #2f8f6b;
  box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.12);
  animation: pulse 2.8s ease-in-out infinite;
}

.companion p {
  margin: 0;
  opacity: 0.9;
  font-weight: 600;
}

.topics h2 {
  margin: 0 0 0.85rem;
  font-size: 1.35rem;
}

.topic-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.topic {
  padding: 1.1rem 1rem;
  text-align: left;
  cursor: pointer;
  border: 1px solid var(--line);
  background: var(--surface);
  transition: transform 0.18s ease, border-color 0.18s ease;
}

.topic:hover {
  transform: translateY(-2px);
  border-color: var(--brand);
}

.topic span {
  display: block;
  font-weight: 700;
  margin-bottom: 0.35rem;
}

.topic small {
  color: var(--ink-muted);
}

.hints {
  padding: 1.1rem 1.25rem;
}

.hints h3 {
  margin: 0 0 0.7rem;
  font-size: 1rem;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@media (max-width: 800px) {
  .hero-strip,
  .topic-grid {
    grid-template-columns: 1fr;
  }
}
</style>
