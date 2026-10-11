<script setup>
import { computed } from 'vue'
import { useLearnerStore } from '@/stores/learner'

const learner = useLearnerStore()

const latest = computed(() => learner.sessions[0] || null)
const words = computed(() => {
  const fromSessions = learner.sessions.flatMap((s) => s.newWords || [])
  const merged = [...new Set([...learner.visualAidWords, ...learner.wrongWords, ...fromSessions])]
  return merged.slice(0, 24)
})
</script>

<template>
  <section class="review">
    <header>
      <p class="eyebrow">学习闭环</p>
      <h1 class="display">复盘与词本</h1>
      <p class="muted">会话结束后沉淀新词与表达，配合入学测错词一起复习。</p>
    </header>

    <div class="stats">
      <article class="panel stat">
        <span>连续练习</span>
        <strong>{{ learner.streak }} 天</strong>
      </article>
      <article class="panel stat">
        <span>会话次数</span>
        <strong>{{ learner.sessions.length }}</strong>
      </article>
      <article class="panel stat">
        <span>待复习词</span>
        <strong>{{ words.length }}</strong>
      </article>
    </div>

    <section v-if="latest" class="panel block">
      <h2>最近一次会话</h2>
      <p>
        话题「{{ latest.topic }}」· {{ latest.turns }} 轮 · 水平 L{{ latest.level }}
      </p>
      <div v-if="latest.newWords?.length" class="tags">
        <span v-for="w in latest.newWords" :key="w" class="chip">{{ w }}</span>
      </div>
      <p v-else class="muted">这次没有触发视觉辅助新词，下次遇到抽象概念可点「看图理解」。</p>
    </section>

    <section class="panel block">
      <h2>词本</h2>
      <div v-if="words.length" class="word-list">
        <div v-for="w in words" :key="w" class="word">
          <strong>{{ w }}</strong>
          <span>{{ learner.wordMastery[w] === 'learning' ? '学习中' : '待巩固' }}</span>
        </div>
      </div>
      <p v-else class="muted">完成入学测或对话后，生词会出现在这里。</p>
    </section>

    <section class="panel block">
      <h2>历史会话</h2>
      <ul v-if="learner.sessions.length" class="history">
        <li v-for="s in learner.sessions" :key="s.id">
          <div>
            <strong>{{ s.topic }}</strong>
            <small>{{ new Date(s.at).toLocaleString() }}</small>
          </div>
          <span>{{ s.turns }} 轮</span>
        </li>
      </ul>
      <p v-else class="muted">还没有会话记录，去首页开始第一次对话吧。</p>
    </section>
  </section>
</template>

<style scoped>
.review {
  display: grid;
  gap: 1.1rem;
}

header h1 {
  margin: 0.3rem 0 0.5rem;
  font-size: 2rem;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.stat {
  padding: 1rem 1.1rem;
  display: grid;
  gap: 0.35rem;
}

.stat span {
  color: var(--ink-muted);
  font-size: 0.88rem;
}

.stat strong {
  font-family: var(--font-display);
  font-size: 1.6rem;
}

.block {
  padding: 1.2rem 1.25rem;
}

.block h2 {
  margin: 0 0 0.7rem;
  font-size: 1.15rem;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.6rem;
}

.word-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.55rem;
}

.word {
  padding: 0.75rem 0.85rem;
  border-radius: 12px;
  background: #fff;
  border: 1px solid var(--line);
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  align-items: baseline;
}

.word span {
  font-size: 0.75rem;
  color: var(--ink-muted);
}

.history {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.55rem;
}

.history li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.7rem 0;
  border-bottom: 1px solid var(--line);
}

.history strong {
  display: block;
}

.history small {
  color: var(--ink-muted);
}

@media (max-width: 640px) {
  .stats {
    grid-template-columns: 1fr;
  }
}
</style>
