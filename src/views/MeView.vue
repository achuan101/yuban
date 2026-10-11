<script setup>
import { useRouter } from 'vue-router'
import { useLearnerStore } from '@/stores/learner'

const router = useRouter()
const learner = useLearnerStore()

const ageLabel = {
  child: '儿童',
  teen: '青少年',
  adult: '成人',
}

const goalLabel = {
  speaking: '日常开口',
  exam: '考试辅助',
  travel: '旅行交流',
  interest: '兴趣陪伴',
}

function retake() {
  learner.placementDone = false
  learner.placementSkipped = false
  learner.persist()
  router.push('/placement')
}

function reset() {
  if (!confirm('确定清除本地学习数据并重新开始？')) return
  learner.resetAll()
  router.push('/')
}
</script>

<template>
  <section class="me">
    <header class="panel head">
      <div>
        <p class="eyebrow">学习画像</p>
        <h1 class="display">{{ learner.displayName }}</h1>
        <p class="muted">AI 输出约束会跟随画像动态调整。</p>
      </div>
      <div class="level-badge">
        <strong>{{ learner.cefr }}</strong>
        <span>L{{ learner.level }} · {{ learner.levelLabel }}</span>
      </div>
    </header>

    <section class="panel block">
      <h2>基础信息</h2>
      <dl class="kv">
        <div><dt>学段</dt><dd>{{ ageLabel[learner.profile.ageGroup] }}</dd></div>
        <div><dt>目标</dt><dd>{{ goalLabel[learner.profile.goal] }}</dd></div>
        <div><dt>每日时长</dt><dd>{{ learner.profile.dailyMinutes }} 分钟</dd></div>
        <div><dt>偏好</dt><dd>{{ learner.profile.preferMode === 'video' ? '视频' : '语音' }}</dd></div>
      </dl>
    </section>

    <section class="panel block">
      <h2>AI 控词策略</h2>
      <dl class="kv">
        <div><dt>用词上限</dt><dd>L{{ learner.aiConstraints.maxLevel }}</dd></div>
        <div><dt>语速</dt><dd>{{ learner.aiConstraints.speechRate }}</dd></div>
        <div><dt>句长</dt><dd>{{ learner.aiConstraints.sentenceLength }}</dd></div>
        <div><dt>纠错</dt><dd>{{ learner.aiConstraints.correction }}</dd></div>
      </dl>
    </section>

    <section class="panel block">
      <h2>弱项标签</h2>
      <div class="tags">
        <span v-for="tag in learner.weakTags" :key="tag" class="chip">{{ tag }}</span>
        <span v-if="!learner.weakTags.length" class="muted">暂无</span>
      </div>
    </section>

    <div class="actions">
      <button class="btn btn-secondary" type="button" @click="retake">重做入学测</button>
      <button class="btn btn-ghost" type="button" @click="reset">清除数据重来</button>
    </div>
  </section>
</template>

<style scoped>
.me {
  display: grid;
  gap: 1rem;
}

.head {
  padding: 1.4rem 1.5rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
}

h1 {
  margin: 0.25rem 0 0.4rem;
  font-size: 2rem;
}

.level-badge {
  min-width: 120px;
  text-align: center;
  padding: 0.9rem;
  border-radius: 16px;
  background: linear-gradient(160deg, #1a6b5a, #245c6b);
  color: #fff;
}

.level-badge strong {
  display: block;
  font-family: var(--font-display);
  font-size: 1.6rem;
}

.level-badge span {
  font-size: 0.8rem;
  opacity: 0.9;
}

.block {
  padding: 1.2rem 1.25rem;
}

.block h2 {
  margin: 0 0 0.8rem;
  font-size: 1.1rem;
}

.kv {
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem 1rem;
}

.kv div {
  display: grid;
  gap: 0.2rem;
}

.kv dt {
  color: var(--ink-muted);
  font-size: 0.85rem;
}

.kv dd {
  margin: 0;
  font-weight: 700;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

@media (max-width: 640px) {
  .head {
    flex-direction: column;
    align-items: flex-start;
  }
  .kv {
    grid-template-columns: 1fr;
  }
}
</style>
