import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/gdshigongyinhuanxc/', // GitHub Pages 仓库名称
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
})
