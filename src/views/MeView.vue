<script setup>
import { ref, computed } from 'vue'
import { useLearnerStore } from '@/stores/learner'
import { useRouter } from 'vue-router'
import { BUDDIES, getBuddyById } from '@/data/buddies'
import BuddyAvatarVisual from '@/components/BuddyAvatarVisual.vue'

const learner = useLearnerStore()
const router = useRouter()
const message = ref('')
const confirmReset = ref(false)

const activeCompanion = computed(() => learner.activeCompanion || getBuddyById('orbit'))

function changeBuddy(id) {
  learner.setCompanion(id)
  message.value = `已切换当前语伴为 ${activeCompanion.value.name}（${activeCompanion.value.chineseName}）。`
}

function download() {
  const blob = new Blob(
    [JSON.stringify({ version: 2, exportedAt: new Date().toISOString(), state: learner.$state }, null, 2)],
    { type: 'application/json' }
  )
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'yuban-alex-learning.json'
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  message.value = '学习档案已导出，请妥善保存。'
}

async function upload(e) {
  try {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2000000) throw new Error('档案过大，请检查文件')
    learner.importArchive(await file.text())
    message.value = '已恢复学习档案。'
  } catch (err) {
    message.value = err.message
  } finally {
    e.target.value = ''
  }
}

function reset() {
  learner.resetAll()
  router.push('/onboarding')
}
</script>

<template>
  <section class="profile-page">
    <header class="page-head">
      <div>
        <h1>我的学习档案</h1>
        <p>只为推荐更合适的内容，不用年级给你贴标签。</p>
      </div>
    </header>

    <!-- Learner Profile Card -->
    <div class="panel profile-card">
      <div class="user-avatar-circle">
        <span>{{ (learner.displayName || '朋友')[0] }}</span>
      </div>
      <div class="profile-meta">
        <h2>{{ learner.displayName }}</h2>
        <p class="muted">
          {{ learner.placementDone ? `这850词中的初步认识量约 ${learner.summary.median}，区间 ${learner.summary.low} — ${learner.summary.high}` : '还没有做基础测试' }}
        </p>
        <RouterLink to="/onboarding" class="btn btn-secondary btn-sm">修改学习需求</RouterLink>
      </div>
    </div>

    <!-- Active Buddy Persona Card & Switcher -->
    <div class="panel companion-card">
      <div class="companion-head">
        <div class="companion-visual" :style="{ background: activeCompanion.bgGradient }">
          <BuddyAvatarVisual :buddy-id="activeCompanion.id" :size="72" />
        </div>
        <div class="companion-info">
          <span class="companion-kicker">当前专属陪练语伴</span>
          <h3>{{ activeCompanion.name }} <small>（{{ activeCompanion.chineseName }}）</small></h3>
          <p class="companion-tagline">{{ activeCompanion.tagline }}</p>
          <p class="companion-desc">{{ activeCompanion.desc }}</p>
        </div>
      </div>

      <div class="companion-selector-row">
        <span class="selector-title">切换语伴角色：</span>
        <div class="buddy-pills-list">
          <button
            v-for="b in BUDDIES"
            :key="b.id"
            type="button"
            class="buddy-pill-btn"
            :class="{ 'pill-active': b.id === activeCompanion.id }"
            @click="changeBuddy(b.id)"
          >
            <span class="pill-dot" :style="{ background: b.bgColor }" />
            <span>{{ b.name }}</span>
            <small>({{ b.chineseName }})</small>
          </button>
        </div>
      </div>
    </div>

    <!-- Archive Storage Card -->
    <div class="panel archive">
      <h2>记录握在自己手里。</h2>
      <p class="muted">当前记录保存在这个浏览器中，换设备前先导出。档案不含任何服务密钥。</p>
      <div class="actions">
        <button class="btn btn-primary" @click="download">导出学习档案</button>
        <label class="btn btn-secondary">
          恢复学习档案
          <input type="file" accept="application/json,.json" class="file-input" @change="upload" />
        </label>
        <RouterLink class="btn btn-ghost" to="/placement">重新测评</RouterLink>
      </div>
      <p class="notice">重新测评会重新建立识读起点。建议先导出旧档案；不会把未测词自动标成已掌握。</p>
      <p v-if="message || learner.storageError" role="status" class="status-msg">
        {{ message || learner.storageError }}
      </p>
    </div>

    <section class="scope">
      <h3>声音与AI服务</h3>
      <p>个性化文章与对话通过服务器连接 DeepSeek 模型，并注入当前所选专属语伴的性格设定与语速音调参数。朗读使用设备英语高质量音色，录音提供回听和识别文本匹配，不冒充口音评分。</p>
    </section>

    <button class="btn btn-ghost btn-danger-link" @click="confirmReset = true">
      清除本浏览器学习记录
    </button>

    <div v-if="confirmReset" class="notice reset-notice">
      <p>确认清除？清除后只有导出的档案可以恢复。</p>
      <div class="reset-actions">
        <button class="btn btn-secondary" @click="confirmReset = false">保留记录</button>
        <button class="btn btn-primary btn-danger-action" @click="reset">确认清除</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.profile-page {
  max-width: 860px;
  margin: auto;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 30px;
  margin-bottom: 24px;
}

.user-avatar-circle {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--brand, #158765);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  font-weight: 700;
  box-shadow: 0 8px 20px rgba(21, 135, 101, 0.2);
  flex-shrink: 0;
}

.profile-meta h2 {
  font-size: 25px;
  margin: 0 0 6px;
}

.profile-meta p {
  font-size: 13.5px;
  margin: 0 0 12px;
}

.btn-sm {
  min-height: 36px;
  padding: 6px 14px;
  font-size: 13px;
}

/* Companion Card */
.companion-card {
  padding: 30px;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}

.companion-head {
  display: flex;
  align-items: center;
  gap: 22px;
  margin-bottom: 24px;
}

.companion-visual {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.companion-info {
  flex: 1;
}

.companion-kicker {
  font-size: 11px;
  font-weight: 600;
  color: #2563eb;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.companion-info h3 {
  font-size: 22px;
  margin: 2px 0 4px;
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.companion-info small {
  font-size: 13px;
  font-weight: normal;
  color: var(--ink-muted);
}

.companion-tagline {
  font-size: 13px;
  color: #2563eb;
  font-weight: 500;
  margin: 0 0 4px;
}

.companion-desc {
  font-size: 13px;
  color: var(--ink-muted);
  line-height: 1.6;
  margin: 0;
}

.companion-selector-row {
  border-top: 1px solid var(--line);
  padding-top: 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.selector-title {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--ink-muted);
}

.buddy-pills-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.buddy-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid var(--line);
  background: #ffffff;
  color: var(--ink);
  font-size: 12.5px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.buddy-pill-btn:hover {
  border-color: #94a3b8;
  background: #f1f5f9;
}

.buddy-pill-btn.pill-active {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #1d4ed8;
  font-weight: 600;
}

.pill-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.buddy-pill-btn small {
  font-size: 11px;
  color: var(--ink-muted);
}

/* Archive */
.archive {
  padding: 30px;
  margin: 24px 0;
}

.archive h2 {
  font-size: 23px;
  font-weight: 500;
  margin: 0 0 6px;
}

.archive p, .scope p {
  font-size: 13px;
}

.file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.scope {
  padding: 15px 5px;
  color: var(--ink-muted);
}

.scope h3 {
  color: var(--ink);
  font-weight: 500;
  margin-bottom: 8px;
}

.status-msg {
  margin-top: 14px;
  font-size: 13px;
  color: #16a34a;
}

.btn-danger-link {
  color: #dc2626;
  font-size: 13px;
}

.reset-notice {
  margin-top: 14px;
}

.reset-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.btn-danger-action {
  background: #dc2626;
}

@media (max-width: 680px) {
  .companion-head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
