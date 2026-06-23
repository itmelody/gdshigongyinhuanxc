<template>
  <a-config-provider :locale="zhCN">
    <MainLayout />
  </a-config-provider>
</template>

<script setup lang="ts">
import MainLayout from '@/layouts/MainLayout.vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
