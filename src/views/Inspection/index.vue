<template>
  <div class="inspection-page">
    <div class="inspection-layout">
      <div class="inspection-sidebar">
        <a-menu v-model:selectedKeys="selectedKeys" mode="inline" :items="menuItems" @click="onMenuClick" />
      </div>
      <div class="inspection-content">
        <RealtimeMonitor v-if="activePage === 'monitor'" />
        <InspectionTask v-else-if="activePage === 'task'" />
        <AIRecord v-else-if="activePage === 'record'" />
        <SnapshotLibrary v-else-if="activePage === 'snapshot'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import {
  VideoCameraOutlined,
  ScheduleOutlined,
  DatabaseOutlined,
  PictureOutlined
} from '@ant-design/icons-vue'
import RealtimeMonitor from './components/RealtimeMonitor.vue'
import InspectionTask from './components/InspectionTask.vue'
import AIRecord from './components/AIRecord.vue'
import SnapshotLibrary from './components/SnapshotLibrary.vue'

const activePage = ref('monitor')
const selectedKeys = ref(['monitor'])

const menuItems = [
  { key: 'monitor', icon: () => h(VideoCameraOutlined), label: '实时监控' },
  { key: 'task', icon: () => h(ScheduleOutlined), label: '巡检任务' },
  { key: 'record', icon: () => h(DatabaseOutlined), label: 'AI识别记录' },
  { key: 'snapshot', icon: () => h(PictureOutlined), label: '隐患快照库' }
]

const onMenuClick = ({ key }: { key: string }) => {
  activePage.value = key
}
</script>

<style scoped lang="scss">
.inspection-page {
  .inspection-layout {
    display: flex;
    gap: 16px;
    min-height: calc(100vh - 180px);
  }

  .inspection-sidebar {
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

  .inspection-content {
    flex: 1;
    min-width: 0;
  }
}
</style>
