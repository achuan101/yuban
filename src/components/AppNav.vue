<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useLearnerStore } from '@/stores/learner'

const route = useRoute()
const learner = useLearnerStore()

const links = [
  { to: '/home', label: '语伴' },
  { to: '/review', label: '复盘' },
  { to: '/me', label: '我的' },
]

const active = computed(() => route.path)
</script>

<template>
  <header class="nav">
    <RouterLink to="/home" class="brand">
      <span class="logo" aria-hidden="true" />
      <span class="brand-text">语伴</span>
    </RouterLink>

    <nav class="links">
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="link"
        :class="{ active: active.startsWith(link.to) }"
      >
        {{ link.label }}
      </RouterLink>
    </nav>

    <div class="meta">
      <span class="chip">{{ learner.cefr }} · L{{ learner.level }}</span>
    </div>
  </header>
</template>

<style scoped>
.nav {
  position: fixed;
  top: 0.75rem;
  left: 50%;
  transform: translateX(-50%);
  width: min(100% - 1.5rem, var(--max));
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1rem;
  padding: 0.65rem 0.85rem;
  background: rgba(255, 252, 247, 0.86);
  border: 1px solid var(--line);
  border-radius: 999px;
  backdrop-filter: blur(14px);
  box-shadow: 0 10px 30px rgba(15, 74, 61, 0.08);
  z-index: 20;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.15rem;
  color: var(--brand-deep);
}

.logo {
  width: 1.7rem;
  height: 1.7rem;
  border-radius: 0.55rem;
  background:
    radial-gradient(circle at 70% 30%, var(--accent), transparent 45%),
    linear-gradient(145deg, var(--brand), var(--brand-deep));
}

.links {
  display: flex;
  justify-content: center;
  gap: 0.35rem;
}

.link {
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  color: var(--ink-muted);
  font-weight: 600;
  font-size: 0.92rem;
}

.link.active,
.link:hover {
  background: var(--brand-soft);
  color: var(--brand-deep);
}

@media (max-width: 640px) {
  .nav {
    grid-template-columns: auto 1fr;
  }
  .meta {
    display: none;
  }
  .brand-text {
    display: none;
  }
}
</style>
