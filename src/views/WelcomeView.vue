<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useLearnerStore } from '@/stores/learner'
import SceneVisual from '@/components/SceneVisual.vue'
import BuddyFanDeck from '@/components/BuddyFanDeck.vue'
import BuddyAvatarVisual from '@/components/BuddyAvatarVisual.vue'
import { getBuddyById } from '@/data/buddies'
import { speakText, stopSpeaking } from '@/services/audio'

const router = useRouter()
const learner = useLearnerStore()

const selectedBuddyId = ref(learner.companionId || 'orbit')
const currentBuddy = computed(() => getBuddyById(selectedBuddyId.value))

const translated = ref(false)
const sampleWord = ref('')
const message = ref('')

const BUDDY_QUOTES = {
  orbit: '先听懂就好。试着把 my family 换成你脑海里的画面，造一个属于你的星空句子！',
  sunny: '太棒啦！今天早晨家里有什么好玩的事？随时跟我聊聊，元气开启新一天！',
  cloudy: '深呼吸，慢慢来。听懂一个词，就已经向前迈出了很勇敢的一步。',
  dummies: '哔哔！注意到 “live with” 这个地道短语了吗？日常高频度满分，记住它！',
  sweetie: '哇！你愿意开口就已经超级棒了！无论多短的句子，我都在认真听哦！'
}

const currentBuddyQuote = computed(() => {
  return BUDDY_QUOTES[selectedBuddyId.value] || BUDDY_QUOTES.orbit
})

function onBuddySelected(buddy) {
  selectedBuddyId.value = buddy.id
  learner.setCompanion(buddy.id)
}

function startChatWithBuddy() {
  learner.setCompanion(selectedBuddyId.value)
  router.push('/chat')
}

const listen = () => {
  stopSpeaking()
  speakText('This is my home. I live here with my family. We have a good time together.', {
    rate: currentBuddy.value.voiceRate || 0.9,
    pitch: currentBuddy.value.voicePitch || 1.0,
    onError: e => (message.value = e)
  })
}

onBeforeUnmount(() => {
  stopSpeaking()
})
</script>

<template>
  <div class="welcome-container">
    <!-- Ambient Background Lighting -->
    <div class="ambient-glow glow-top" aria-hidden="true" />
    <div class="ambient-glow glow-right" aria-hidden="true" />
    <div class="ambient-glow glow-bottom" aria-hidden="true" />

    <!-- Top Navigation Bar -->
    <header class="welcome-nav">
      <RouterLink to="/" class="brand-logo">
        <span class="brand-badge">语</span>
        <div class="brand-text">
          <span class="brand-title">语伴</span>
          <small class="brand-sub">Pick Your Buddy</small>
        </div>
      </RouterLink>

      <nav class="welcome-links" aria-label="页面快捷导航">
        <RouterLink to="/review" class="nav-item">850词谱</RouterLink>
        <RouterLink to="/learn" class="nav-item">场景学习</RouterLink>
        <RouterLink to="/chat" class="nav-item">智能陪练</RouterLink>
      </nav>

      <div class="nav-actions">
        <RouterLink
          :to="learner.placementDone ? '/home' : '/onboarding'"
          class="btn-nav-action"
        >
          {{ learner.placementDone ? '进入今日学习 →' : '开始体验 · 测起点' }}
        </RouterLink>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero-section">
      <!-- Section Tag / Kicker -->
      <div class="hero-kicker-badge">
        <span class="kicker-spark">✦</span>
        <span>2026 AI 语言练习新范式 · 黏土拟物 × 扇形卡组微交互</span>
      </div>

      <!-- Grand Magazine Serif Headline -->
      <h1 class="hero-title">
        Pick Your Buddy.<br />
        <span class="serif-gradient">听得懂，慢慢说成自己的话。</span>
      </h1>

      <p class="hero-subtitle">
        告别死记硬背与开口焦虑。选一位契合你性格的专属 AI 语伴——温柔陪伴、幽默拆解、抑或自由漫游，陪你看懂日常小场景，听懂地道原声，再自信开口表达。
      </p>

      <!-- Centerpiece: Interactive Fan-out 3D Buddy Deck -->
      <div class="deck-showcase-area">
        <BuddyFanDeck
          v-model="selectedBuddyId"
          @select="onBuddySelected"
        />
      </div>

      <!-- Quick Action CTA Bar -->
      <div class="hero-cta-group">
        <button
          type="button"
          class="btn-hero-primary"
          @click="startChatWithBuddy"
        >
          <span class="btn-icon">💬</span>
          <span>与 {{ currentBuddy.name }} 开启智能对练</span>
        </button>

        <RouterLink
          :to="learner.placementDone ? '/placement' : '/onboarding'"
          class="btn-hero-secondary"
        >
          <span>{{ learner.placementDone ? '重新测评起点' : '入学测评 · 找舒服起点' }}</span>
        </RouterLink>
      </div>

      <!-- Product Micro-badges -->
      <div class="hero-feature-tags">
        <div class="feat-pill">
          <span class="feat-dot green" />
          <span>850 核心高频生活词谱</span>
        </div>
        <div class="feat-pill">
          <span class="feat-dot blue" />
          <span>零压力慢速自然朗读</span>
        </div>
        <div class="feat-pill">
          <span class="feat-dot purple" />
          <span>5 重鲜活性格语伴矩阵</span>
        </div>
        <div class="feat-pill">
          <span class="feat-dot red" />
          <span>场景切片自适应进阶</span>
        </div>
      </div>
    </section>

    <!-- Living Scene Interactive Preview -->
    <section class="scene-section">
      <div class="section-header-center">
        <span class="section-kicker">今天的小场景 · 互动探究</span>
        <h2 class="section-title-serif">在熟悉的生活里，自然理解英语。</h2>
        <p class="section-lead">以 850 词为基底，真实切片插画、高频短语与点词释义，让每一个新句子都清晰可辨。</p>
      </div>

      <div class="scene-preview-card">
        <div class="card-glass-glow" />

        <div class="preview-meta-bar">
          <div class="meta-tag-group">
            <span class="scene-icon">🏡</span>
            <span class="scene-topic">家人与生活</span>
            <span class="scene-subtopic">A morning at home</span>
          </div>
          <span class="buddy-present-badge">
            <span class="pulse-indicator" />
            <span>{{ currentBuddy.name }} 陪你阅读中</span>
          </span>
        </div>

        <div class="scene-media-wrapper">
          <SceneVisual scene="family" caption="A morning at home" />
        </div>

        <div class="scene-reading-body">
          <div class="reading-title-row">
            <h3 class="reading-heading">A little moment at home</h3>
            <button
              type="button"
              class="btn-audio-listen"
              title="听原声示范"
              aria-label="听原声示范"
              @click="listen"
            >
              <span class="play-triangle">▶</span>
              <span>听示范</span>
            </button>
          </div>

          <p class="reading-passage">
            This is my
            <button
              type="button"
              class="interactive-word"
              :class="{ 'word-active': sampleWord === 'home' }"
              @click="sampleWord = sampleWord === 'home' ? '' : 'home'"
            >home</button>.
            <br />
            I live here with my
            <button
              type="button"
              class="interactive-word"
              :class="{ 'word-active': sampleWord === 'family' }"
              @click="sampleWord = sampleWord === 'family' ? '' : 'family'"
            >family</button>.
            <br />
            We have a good time together.
          </p>

          <!-- Word Definition Tooltip Drawer -->
          <Transition name="fade-slide">
            <div v-if="sampleWord" class="word-explain-drawer">
              <div class="drawer-content">
                <strong>{{ sampleWord === 'home' ? 'home /həʊm/' : 'family /ˈfæməli/' }}</strong>
                <span>{{ sampleWord === 'home' ? '名词：家；住所' : '名词：家人；家庭' }}</span>
              </div>
              <button
                type="button"
                class="btn-pronounce"
                @click="speakText(sampleWord, { rate: currentBuddy.voiceRate, pitch: currentBuddy.voicePitch })"
              >
                🔊 发音
              </button>
            </div>
          </Transition>

          <!-- Optional Chinese Translation -->
          <Transition name="fade-slide">
            <p v-if="translated" class="reading-translation">
              这是我的家。我和家人住在这里。我们一起度过美好的时光。
            </p>
          </Transition>

          <div class="preview-actions-bar">
            <span class="helper-hint">💡 轻点高亮单词查看释义，随时听地道发音</span>
            <button
              type="button"
              class="btn-toggle-trans"
              @click="translated = !translated"
            >
              {{ translated ? '隐藏译文' : '对照译文' }}
            </button>
          </div>

          <p v-if="message" role="status" class="audio-status-msg">{{ message }}</p>
        </div>

        <!-- Dynamic Buddy Mentoring Quote Box -->
        <div class="buddy-mentoring-box" :style="{ background: currentBuddy.bgGradient }">
          <div class="buddy-mascot-chip">
            <BuddyAvatarVisual :buddy-id="selectedBuddyId" :size="52" />
          </div>
          <div class="buddy-quote-content">
            <div class="quote-header">
              <strong>{{ currentBuddy.name }}</strong>
              <small>（{{ currentBuddy.chineseName }}）</small>
              <span class="quote-role-pill">{{ currentBuddy.category }}</span>
            </div>
            <p class="quote-text">“{{ currentBuddyQuote }}”</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 3-Step Journey Path -->
    <section class="path-section">
      <div class="section-header-center">
        <span class="section-kicker">轻松循序渐进</span>
        <h2 class="section-title-serif">按你的节奏，每次只向前一点点。</h2>
        <p class="section-lead">没有强制打卡，没有等级标签。只关注每一次舒服的表达。</p>
      </div>

      <div class="path-cards-grid">
        <div class="path-card">
          <div class="step-num">01</div>
          <h3 class="step-title">找到舒适起点</h3>
          <p class="step-desc">
            850 词日常生活核心图谱。基础自适应测评允许直接选“我不会”，不扣分不贴标签，只为找到真正听懂的起跑线。
          </p>
          <div class="step-tag">自适应抽样 · 拒绝压力</div>
        </div>

        <div class="path-card">
          <div class="step-num">02</div>
          <h3 class="step-title">在生活里自然理解</h3>
          <p class="step-desc">
            以 90%+ 熟悉词构建真实生活场景。通过温馨插画、地道语调示范与一键点词助手，像读绘本一样轻松沉浸。
          </p>
          <div class="step-tag">可理解输入 · 场景沉浸</div>
        </div>

        <div class="path-card">
          <div class="step-num">03</div>
          <h3 class="step-title">与专属语伴自信表达</h3>
          <p class="step-desc">
            选定契合你性格的 AI 语伴。不管是打字探讨语法、还是直接开口语音对话，语伴永远耐心倾听，温柔引导你完整表达。
          </p>
          <div class="step-tag">多性格陪伴 · 语音实时互动</div>
        </div>
      </div>
    </section>

    <!-- Elegant Dark Magazine Footer -->
    <footer class="welcome-footer">
      <div class="footer-top">
        <div class="footer-brand">
          <span class="brand-badge mini">语</span>
          <strong>语伴 · Yuban</strong>
          <span>Pick Your Buddy, Light Up Your Day.</span>
        </div>
        <div class="footer-cta">
          <button
            type="button"
            class="btn-footer-chat"
            @click="startChatWithBuddy"
          >
            与 {{ currentBuddy.name }} 对话 →
          </button>
        </div>
      </div>

      <div class="footer-bottom">
        <span>© 2026 语伴 · 把英语变成自己的话。基于 850 词生活图谱与多重性格 AI 陪伴设计。</span>
        <div class="footer-links">
          <RouterLink to="/placement">起点测评</RouterLink>
          <RouterLink to="/learn">场景文章</RouterLink>
          <RouterLink to="/chat">智能陪练</RouterLink>
          <RouterLink to="/me">学习档案</RouterLink>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.welcome-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  background-color: #090a10;
  color: #f1f5f9;
  overflow-x: hidden;
  font-family: var(--font-sans, 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif);
}

/* Ambient Backdrops */
.ambient-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  transform: translate3d(0, 0, 0);
  pointer-events: none;
  z-index: 0;
  opacity: 0.45;
}

.glow-top {
  top: -150px;
  left: 50%;
  transform: translateX(-50%);
  width: 900px;
  height: 520px;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.35) 0%, rgba(139, 92, 246, 0.15) 50%, transparent 80%);
}

.glow-right {
  top: 420px;
  right: -100px;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, rgba(244, 63, 94, 0.08) 60%, transparent 80%);
}

.glow-bottom {
  bottom: 200px;
  left: -120px;
  width: 700px;
  height: 700px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, rgba(6, 182, 212, 0.08) 60%, transparent 80%);
}

/* Navigation Bar */
.welcome-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 84px;
  padding: 0 max(24px, calc((100vw - 1200px) / 2));
  background: rgba(9, 10, 16, 0.82);
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.brand-badge {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 20px;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.4);
}

.brand-badge.mini {
  width: 28px;
  height: 28px;
  font-size: 14px;
  border-radius: 8px;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-family: var(--font-serif, 'Playfair Display', Georgia, serif);
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: #ffffff;
}

.brand-sub {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.welcome-links {
  display: flex;
  gap: 28px;
}

.nav-item {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-item:hover {
  color: #ffffff;
}

.btn-nav-action {
  padding: 10px 20px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #ffffff;
  font-size: 13.5px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-nav-action:hover {
  background: #ffffff;
  color: #090a10;
  box-shadow: 0 6px 20px rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

/* Hero Section */
.hero-section {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 60px 24px 80px;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-kicker-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 16px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.85);
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.03em;
  margin-bottom: 24px;
}

.kicker-spark {
  color: #fbbf24;
}

.hero-title {
  margin: 0 0 20px;
  font-family: var(--font-serif, 'Playfair Display', Georgia, serif);
  font-size: clamp(40px, 6vw, 76px);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.serif-gradient {
  background: linear-gradient(135deg, #ffffff 30%, #cbd5e1 70%, #94a3b8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  max-width: 680px;
  margin: 0 0 36px;
  font-size: clamp(15px, 2vw, 17px);
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.68);
}

.deck-showcase-area {
  width: 100%;
  margin: 10px 0 30px;
}

/* CTA Group */
.hero-cta-group {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 15px;
  flex-wrap: wrap;
  justify-content: center;
}

.btn-hero-primary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 15px 32px;
  border-radius: 16px;
  background: #ffffff;
  color: #090a10;
  font-size: 15.5px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 10px 30px rgba(255, 255, 255, 0.18);
}

.btn-hero-primary:hover {
  background: #f1f5f9;
  transform: translateY(-2px);
  box-shadow: 0 14px 40px rgba(255, 255, 255, 0.28);
}

.btn-hero-secondary {
  display: inline-flex;
  align-items: center;
  padding: 15px 28px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.25s ease;
}

.btn-hero-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.hero-feature-tags {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 40px;
  flex-wrap: wrap;
  justify-content: center;
}

.feat-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.04);
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.07);
}

.feat-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.feat-dot.green { background: #34d399; }
.feat-dot.blue { background: #38bdf8; }
.feat-dot.purple { background: #a78bfa; }
.feat-dot.red { background: #f87171; }

/* Living Scene Section */
.scene-section {
  position: relative;
  z-index: 10;
  padding: 80px 24px;
  max-width: 1000px;
  margin: 0 auto;
}

.section-header-center {
  text-align: center;
  margin-bottom: 46px;
}

.section-kicker {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: #38bdf8;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.section-title-serif {
  margin: 0 0 14px;
  font-family: var(--font-serif, 'Playfair Display', Georgia, serif);
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 700;
  color: #ffffff;
}

.section-lead {
  max-width: 580px;
  margin: 0 auto;
  font-size: 14.5px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.62);
}

.scene-preview-card {
  position: relative;
  background: rgba(18, 21, 32, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 32px;
  box-shadow: 0 28px 60px rgba(0, 0, 0, 0.55);
  overflow: hidden;
  backdrop-filter: blur(20px);
}

.card-glass-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 140px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%);
  pointer-events: none;
}

.preview-meta-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 28px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.meta-tag-group {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

.scene-topic {
  font-weight: 600;
  color: #ffffff;
}

.scene-subtopic {
  color: rgba(255, 255, 255, 0.5);
  padding-left: 8px;
  border-left: 1px solid rgba(255, 255, 255, 0.15);
}

.buddy-present-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
  padding: 5px 12px;
  border-radius: 20px;
  border: 1px solid rgba(56, 189, 248, 0.2);
}

.pulse-indicator {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 8px #38bdf8;
}

.scene-media-wrapper {
  width: 100%;
}

.scene-media-wrapper :deep(.scene-visual) {
  border-radius: 0;
  border-left: none;
  border-right: none;
}

.scene-reading-body {
  padding: 28px 32px 24px;
}

.reading-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.reading-heading {
  margin: 0;
  font-family: var(--font-serif, 'Playfair Display', Georgia, serif);
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
}

.btn-audio-listen {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-audio-listen:hover {
  background: rgba(255, 255, 255, 0.16);
  transform: translateY(-1px);
}

.play-triangle {
  font-size: 11px;
  color: #38bdf8;
}

.reading-passage {
  font-family: var(--font-serif, Georgia, serif);
  font-size: clamp(21px, 2.5vw, 25px);
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 20px;
}

.interactive-word {
  font: inherit;
  font-weight: 600;
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.35);
  border-radius: 6px;
  padding: 0 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.interactive-word:hover,
.interactive-word.word-active {
  background: #38bdf8;
  color: #090a10;
  border-color: #38bdf8;
}

.word-explain-drawer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 14px;
  padding: 12px 18px;
  margin-bottom: 18px;
}

.drawer-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 13px;
}

.drawer-content strong {
  color: #ffffff;
}

.drawer-content span {
  color: rgba(255, 255, 255, 0.7);
}

.btn-pronounce {
  padding: 6px 14px;
  border-radius: 10px;
  background: #38bdf8;
  color: #090a10;
  border: none;
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
}

.reading-translation {
  font-size: 14px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.75);
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 20px;
}

.preview-actions-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 12px;
}

.helper-hint {
  color: rgba(255, 255, 255, 0.45);
}

.btn-toggle-trans {
  background: none;
  border: none;
  color: #38bdf8;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
}

.btn-toggle-trans:hover {
  text-decoration: underline;
}

.audio-status-msg {
  margin-top: 10px;
  color: #f87171;
  font-size: 12px;
}

/* Buddy Mentoring Box */
.buddy-mentoring-box {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 18px 24px;
  margin: 16px 28px 24px;
  border-radius: 20px;
  color: #ffffff;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.25);
  transition: all 0.35s ease;
}

.buddy-mascot-chip {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.buddy-quote-content {
  flex: 1;
}

.quote-header {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 4px;
}

.quote-header strong {
  font-size: 15px;
  font-weight: 700;
}

.quote-header small {
  font-size: 12px;
  opacity: 0.8;
}

.quote-role-pill {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
  margin-left: 6px;
}

.quote-text {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.6;
  opacity: 0.95;
}

/* Path Section */
.path-section {
  position: relative;
  z-index: 10;
  padding: 70px 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.path-cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 40px;
}

.path-card {
  background: rgba(18, 21, 32, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 24px;
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(16px);
  transition: all 0.3s ease;
}

.path-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.22);
  background: rgba(22, 26, 40, 0.85);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
}

.step-num {
  font-family: var(--font-serif, 'Playfair Display', Georgia, serif);
  font-size: 36px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.15);
  margin-bottom: 16px;
  line-height: 1;
}

.step-title {
  margin: 0 0 12px;
  font-size: 19px;
  font-weight: 700;
  color: #ffffff;
}

.step-desc {
  margin: 0 0 20px;
  font-size: 13.5px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.65);
  flex: 1;
}

.step-tag {
  font-size: 11px;
  font-weight: 600;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
  padding: 6px 12px;
  border-radius: 10px;
  align-self: flex-start;
  border: 1px solid rgba(56, 189, 248, 0.18);
}

/* Welcome Footer */
.welcome-footer {
  position: relative;
  z-index: 10;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 60px max(24px, calc((100vw - 1200px) / 2)) 40px;
  background: rgba(8, 9, 14, 0.95);
}

.footer-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 40px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-wrap: wrap;
  gap: 20px;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.footer-brand strong {
  font-size: 18px;
  color: #ffffff;
}

.footer-brand span {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  padding-left: 10px;
  border-left: 1px solid rgba(255, 255, 255, 0.12);
}

.btn-footer-chat {
  padding: 12px 24px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #ffffff;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-footer-chat:hover {
  background: #ffffff;
  color: #090a10;
}

.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 24px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  flex-wrap: wrap;
  gap: 14px;
}

.footer-links {
  display: flex;
  gap: 20px;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: #ffffff;
}

/* Responsive */
@media (max-width: 900px) {
  .path-cards-grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }
  .welcome-links {
    display: none;
  }
}

@media (max-width: 680px) {
  .ambient-glow {
    filter: blur(60px);
  }
  .glow-top {
    width: 360px;
    height: 300px;
  }
  .glow-right, .glow-bottom {
    width: 300px;
    height: 300px;
  }
  .welcome-nav {
    height: 70px;
  }
  .hero-section {
    padding: 40px 16px 60px;
  }
  .hero-cta-group {
    flex-direction: column;
    width: 100%;
  }
  .btn-hero-primary,
  .btn-hero-secondary {
    width: 100%;
    justify-content: center;
  }
  .scene-reading-body {
    padding: 20px 18px;
  }
  .buddy-mentoring-box {
    margin: 12px 16px 18px;
    padding: 14px 16px;
  }
  .footer-top,
  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
