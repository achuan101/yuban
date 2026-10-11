import { createRouter, createWebHistory } from 'vue-router'
import { useLearnerStore } from '@/stores/learner'
const router = createRouter({ history: createWebHistory(), scrollBehavior: () => ({ top: 0 }), routes: [
  { path: '/', name: 'welcome', component: () => import('@/views/WelcomeView.vue'), meta: { nav: false } },
  { path: '/onboarding', name: 'onboarding', component: () => import('@/views/OnboardingView.vue') },
  { path: '/placement', name: 'placement', component: () => import('@/views/PlacementView.vue') },
  { path: '/home', name: 'home', component: () => import('@/views/HomeView.vue') },
  { path: '/learn', name: 'learn', component: () => import('@/views/LearnView.vue') },
  { path: '/chat', name: 'chat', component: () => import('@/views/ChatView.vue') },
  { path: '/review', name: 'review', component: () => import('@/views/ReviewView.vue') },
  { path: '/me', name: 'me', component: () => import('@/views/MeView.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' },
] })
router.beforeEach(to => { const learner = useLearnerStore(); if (['home','learn','review'].includes(to.name) && !learner.placementDone) return learner.onboardingDone ? '/placement' : '/onboarding' })
export default router
