import { createRouter, createWebHistory } from 'vue-router'
import { useLearnerStore } from '@/stores/learner'

const routes = [
  {
    path: '/',
    name: 'welcome',
    component: () => import('@/views/WelcomeView.vue'),
    meta: { nav: false },
  },
  {
    path: '/onboarding',
    name: 'onboarding',
    component: () => import('@/views/OnboardingView.vue'),
    meta: { nav: false },
  },
  {
    path: '/placement',
    name: 'placement',
    component: () => import('@/views/PlacementView.vue'),
    meta: { nav: false },
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/chat',
    name: 'chat',
    component: () => import('@/views/ChatView.vue'),
    meta: { nav: false },
  },
  {
    path: '/review',
    name: 'review',
    component: () => import('@/views/ReviewView.vue'),
  },
  {
    path: '/me',
    name: 'me',
    component: () => import('@/views/MeView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to) => {
  const learner = useLearnerStore()
  const gated = ['home', 'chat', 'review', 'me']
  if (gated.includes(to.name) && !learner.onboardingDone) {
    return { name: 'welcome' }
  }
  if (to.name === 'home' && learner.onboardingDone && !learner.placementDone && !learner.placementSkipped) {
    return { name: 'placement' }
  }
  return true
})

export default router
