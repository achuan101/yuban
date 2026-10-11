import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  envPrefix: ['VITE_', 'DEEPSEEK_'],
  server: {
    host: '127.0.0.1',
    proxy: { '/api': 'http://127.0.0.1:8788' },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
