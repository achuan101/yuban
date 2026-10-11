<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useLearnerStore } from '@/stores/learner'

const router = useRouter()
const learner = useLearnerStore()

const form = reactive({
  name: learner.profile.name || '',
  ageGroup: learner.profile.ageGroup || 'teen',
  goal: learner.profile.goal || 'speaking',
  motherTongue: learner.profile.motherTongue || 'zh',
  dailyMinutes: learner.profile.dailyMinutes || 15,
  preferMode: learner.profile.preferMode || 'voice',
})

function submit() {
  if (!form.name.trim()) {
    form.name = '同学'
  }
  learner.saveOnboarding({ ...form, name: form.name.trim() })
  router.push('/placement')
}
</script>

<template>
  <section class="wrap">
    <div class="panel form-panel">
      <p class="eyebrow">第一步</p>
      <h1 class="display">先简单认识你</h1>
      <p class="muted intro">这些信息用来调整语伴的语气与话题，不会单独决定英语等级。</p>

      <form class="grid" @submit.prevent="submit">
        <div class="field">
          <label for="name">怎么称呼你</label>
          <input id="name" v-model="form.name" maxlength="20" placeholder="例如：小周" />
        </div>

        <div class="field">
          <label for="age">学段 / 年龄段</label>
          <select id="age" v-model="form.ageGroup">
            <option value="child">儿童（小学）</option>
            <option value="teen">青少年（中学）</option>
            <option value="adult">成人</option>
          </select>
        </div>

        <div class="field">
          <label for="goal">学习目标</label>
          <select id="goal" v-model="form.goal">
            <option value="speaking">日常开口</option>
            <option value="exam">考试辅助</option>
            <option value="travel">旅行交流</option>
            <option value="interest">兴趣陪伴</option>
          </select>
        </div>

        <div class="field">
          <label for="minutes">每日可练习时长</label>
          <select id="minutes" v-model.number="form.dailyMinutes">
            <option :value="10">约 10 分钟</option>
            <option :value="15">约 15 分钟</option>
            <option :value="30">约 30 分钟</option>
          </select>
        </div>

        <div class="field">
          <label for="mode">偏好交互</label>
          <select id="mode" v-model="form.preferMode">
            <option value="voice">语音为主</option>
            <option value="video">视频为主（演示）</option>
          </select>
        </div>

        <div class="actions">
          <button class="btn btn-primary" type="submit">下一步：入学测试</button>
        </div>
      </form>
    </div>
  </section>
</template>

<style scoped>
.wrap {
  max-width: 560px;
  margin: 2rem auto 0;
}

.form-panel {
  padding: 1.75rem;
}

h1 {
  margin: 0.4rem 0 0.6rem;
  font-size: 2rem;
}

.intro {
  margin: 0 0 1.5rem;
  line-height: 1.6;
}

.grid {
  display: grid;
  gap: 1rem;
}

.actions {
  margin-top: 0.5rem;
}
</style>
