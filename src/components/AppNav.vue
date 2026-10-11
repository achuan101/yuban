<script setup>
import { computed } from 'vue'
import { useLearnerStore } from '@/stores/learner'
import { getBuddyById } from '@/data/buddies'
import BuddyAvatarVisual from './BuddyAvatarVisual.vue'

const learner = useLearnerStore()
const activeCompanion = computed(() => learner.activeCompanion || getBuddyById('orbit'))
</script>

<template>
  <header class="app-nav">
    <RouterLink to="/" class="brand">
      <span class="brand-symbol">语</span>
      <span class="brand-name">语伴</span>
      <small>with {{ activeCompanion.name }}</small>
    </RouterLink>

    <nav aria-label="主要导航">
      <RouterLink to="/home">今日</RouterLink>
      <RouterLink to="/learn">学习</RouterLink>
      <RouterLink to="/chat" class="nav-chat-item">
        <span class="nav-buddy-dot" :style="{ background: activeCompanion.bgGradient }">
          <BuddyAvatarVisual :buddy-id="activeCompanion.id" :size="16" />
        </span>
        <span>{{ activeCompanion.name }}</span>
      </RouterLink>
      <RouterLink to="/review">词库</RouterLink>
      <RouterLink to="/me">我的</RouterLink>
    </nav>

    <span class="nav-level">
      {{ learner.placementDone ? `约 ${learner.summary.median} / 850` : '找到舒服的起点' }}
    </span>
  </header>
</template>

<style scoped>
.nav-chat-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.nav-buddy-dot {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}
</style>
