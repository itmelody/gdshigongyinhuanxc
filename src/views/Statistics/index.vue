<template>
  <div class="statistics-page">
    <div class="statistics-layout">
      <div class="statistics-sidebar">
        <a-menu v-model:selectedKeys="selectedKeys" mode="inline" :items="menuItems" @click="onMenuClick" />
      </div>
      <div class="statistics-content">
        <Overview v-if="activePage === 'overview'" />
        <TrendAnalysis v-else-if="activePage === 'trend'" />
        <MultiDimension v-else-if="activePage === 'dimension'" />
        <Efficiency v-else-if="activePage === 'efficiency'" />
        <ProjectCompare v-else-if="activePage === 'project'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  DashboardOutlined,
  FundOutlined
} from '@ant-design/icons-vue'
import Overview from './components/Overview.vue'
import TrendAnalysis from './components/TrendAnalysis.vue'
import MultiDimension from './components/MultiDimension.vue'
import Efficiency from './components/Efficiency.vue'
import ProjectCompare from './components/ProjectCompare.vue'

const activePage = ref('overview')
const selectedKeys = ref(['overview'])

const menuItems = [
  { key: 'overview', icon: () => h(BarChartOutlined), label: '统计总览' },
  { key: 'trend', icon: () => h(LineChartOutlined), label: '隐患趋势分析' },
  { key: 'dimension', icon: () => h(PieChartOutlined), label: '隐患多维分析' },
  { key: 'efficiency', icon: () => h(DashboardOutlined), label: '处置效能分析' },
  { key: 'project', icon: () => h(FundOutlined), label: '项目对比分析' }
]

const onMenuClick = ({ key }: { key: string }) => {
  activePage.value = key
}
</script>

<style scoped lang="scss">
.statistics-page {
  .statistics-layout {
    display: flex;
    gap: 16px;
    min-height: calc(100vh - 180px);
  }

  .statistics-sidebar {
    width: 200px;
    flex-shrink: 0;
    background: #fff;
    border-radius: 8px;
    padding: 8px 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    :deep(.ant-menu-inline) {
      border-right: none;
    }
  }

  .statistics-content {
    flex: 1;
    min-width: 0;
  }
}
</style>
