<script setup>
import { useLearnerStore } from '@/stores/learner'
const learner = useLearnerStore()
</script>
<template>
  <header class="app-nav"><RouterLink to="/" class="brand"><span class="brand-symbol">语</span>语伴 <small>with Alex</small></RouterLink>
    <nav aria-label="主要导航"><RouterLink to="/home">今日</RouterLink><RouterLink to="/learn">学习</RouterLink><RouterLink to="/chat">Alex</RouterLink><RouterLink to="/review">词库</RouterLink><RouterLink to="/me">我的</RouterLink></nav>
    <span class="nav-level">{{ learner.placementDone ? `约 ${learner.summary.median} / 850` : '找到舒服的起点' }}</span>
  </header>
</template>
