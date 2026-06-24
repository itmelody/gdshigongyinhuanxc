/*
 * @Author: 郑惠敏
 * @LastEditors: 郑惠敏
 * @Description: nothing
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './', // GitHub Pages 仓库名称
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  build: {
    outDir: 'gdshigongyinhuanxc',
  },
})
