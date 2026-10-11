import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  // 只注入 VITE_ 前缀变量到前端；DEEPSEEK_* 密钥仅服务端读取，绝不进入浏览器 bundle
  envPrefix: ['VITE_'],
  server: {
    host: '0.0.0.0',
    proxy: { '/api': 'http://127.0.0.1:8788' },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
