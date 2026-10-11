<script setup>
import { computed } from 'vue'
import { useLearnerStore } from '@/stores/learner'
import SceneVisual from '@/components/SceneVisual.vue'
import BuddyAvatarVisual from '@/components/BuddyAvatarVisual.vue'
import { getBuddyById } from '@/data/buddies'

const learner = useLearnerStore()
const activeCompanion = computed(() => learner.activeCompanion || getBuddyById('orbit'))

const stats = computed(() => [
  ['有识读／听读证据', learner.counts.recognized],
  ['需要支持', learner.counts.learning],
  ['稳定运用', learner.counts.stable],
  ['还未确认', learner.counts.untested]
])
</script>

<template>
  <section class="home-page">
    <header class="page-head">
      <div>
        <span class="section-label">从懂到会用</span>
        <h1>{{ learner.displayName }}，今天聊聊生活。</h1>
        <p>不是赶进度。让看见、听懂和说出来连在一起。</p>
      </div>
      <RouterLink class="btn btn-secondary" to="/me">我的学习档案</RouterLink>
    </header>

    <div class="home-grid">
      <RouterLink to="/learn" class="panel featured">
        <SceneVisual scene="family" caption="从一个熟悉的家开始" />
        <div class="card-copy">
          <span class="section-label">适合你的场景学习</span>
          <h2>听懂一篇，说出自己的故事。</h2>
          <p class="muted">约 {{ learner.summary.median }} / 850 的初步起点，文章会参考你的求助与练习记录。</p>
          <span class="btn btn-primary">继续今天的学习 →</span>
        </div>
      </RouterLink>

      <div class="side">
        <!-- Dynamic Buddy Coach Card -->
        <RouterLink class="panel coach-card" to="/chat">
          <div class="coach-visual-wrap">
            <BuddyAvatarVisual :buddy-id="activeCompanion.id" :size="76" />
          </div>
          <div class="coach-text-wrap">
            <span class="coach-kicker">专属语伴 · {{ activeCompanion.category }}</span>
            <h2>{{ activeCompanion.name }} 智能陪练</h2>
            <p>{{ activeCompanion.tagline }}</p>
            <span class="coach-action-btn">与 {{ activeCompanion.name }} 开启对话 →</span>
          </div>
        </RouterLink>

        <div class="panel scope">
          <h3>这次只测这850词。</h3>
          <p class="muted">认识比例是抽样估计，未测词不会标成“掌握”。在真实文章中慢慢确认。</p>
          <RouterLink to="/review">查看主词汇图谱 →</RouterLink>
        </div>
      </div>
    </div>

    <div class="stats">
      <div v-for="[label, n] in stats" :key="label">
        <b>{{ n }}</b>
        <span>{{ label }}</span>
      </div>
    </div>

    <section class="panel recent">
      <h3>最近的练习</h3>
      <p v-if="!learner.sessions.length" class="muted">完成第一篇文章后，这里会留下你的学习足迹。</p>
      <div v-for="s in learner.sessions.slice(0, 4)" :key="s.id" class="recent-row">
        <span>{{ s.title || '场景练习' }}</span>
        <span class="muted">{{ new Date(s.at).toLocaleDateString('zh-CN') }}</span>
      </div>
    </section>
  </section>
</template>

<style scoped>
.home-page {
  animation: fadeIn 0.3s ease;
}

.home-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(250px, 1fr);
  gap: 25px;
}

.featured {
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
}

.featured:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.08);
}

.card-copy {
  padding: 30px;
}

.card-copy h2 {
  font-size: 27px;
  font-weight: 500;
  margin: 10px 0;
}

.card-copy p {
  font-size: 14px;
  line-height: 1.7;
}

.side {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.coach-card {
  padding: 24px;
  background: linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%);
  border: 1px solid #dbeafe;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.coach-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 32px rgba(37, 99, 235, 0.12);
}

.coach-visual-wrap {
  width: 76px;
  height: 76px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.coach-text-wrap {
  flex: 1;
}

.coach-kicker {
  font-size: 11px;
  font-weight: 600;
  color: #2563eb;
  letter-spacing: 0.04em;
  display: block;
  margin-bottom: 3px;
}

.coach-card h2 {
  font-size: 21px;
  margin: 0 0 4px;
  color: var(--ink, #1e293b);
}

.coach-card p {
  font-size: 12.5px;
  color: var(--ink-muted, #64748b);
  margin: 0 0 10px;
  line-height: 1.5;
}

.coach-action-btn {
  font-size: 13px;
  font-weight: 600;
  color: #2563eb;
}

.scope {
  padding: 28px;
}

.scope h3 {
  font-size: 18px;
  margin: 0 0 8px;
}

.scope p {
  font-size: 13px;
  color: var(--ink-muted);
  line-height: 1.6;
  margin: 0 0 14px;
}

.scope a {
  font-size: 13px;
  color: var(--brand);
  font-weight: 600;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin: 36px 0;
}

.stats > div {
  border-left: 1px solid var(--line);
  padding-left: 25px;
}

.stats b {
  font-size: 35px;
  font-weight: 400;
  display: block;
}

.stats span {
  font-size: 12px;
  color: var(--ink-muted);
}

.recent {
  padding: 25px;
}

.recent-row {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid var(--line);
  padding: 14px 0;
  font-size: 13px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 750px) {
  .home-grid {
    grid-template-columns: 1fr;
  }
  .stats {
    grid-template-columns: 1fr 1fr;
    gap: 25px;
  }
  .card-copy {
    padding: 22px;
  }
}
</style>
