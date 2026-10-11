<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppNav from './components/AppNav.vue'

const route = useRoute()
const showNav = computed(() => route.meta.nav !== false)
</script>

<template>
  <div class="app-shell">
    <div class="bg-atmosphere" aria-hidden="true" />
    <AppNav v-if="showNav" />
    <main class="app-main" :class="{ 'with-nav': showNav }">
      <RouterView v-slot="{ Component }">
        <Transition name="fade-slide" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>
