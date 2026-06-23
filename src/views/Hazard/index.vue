<template>
  <div class="hazard-page">
    <div class="hazard-layout">
      <div class="hazard-sidebar">
        <a-menu v-model:selectedKeys="selectedKeys" mode="inline" :items="menuItems" @click="onMenuClick" />
      </div>
      <div class="hazard-content">
        <HazardList v-if="activePage === 'list'" @action="onListAction" />
        <HazardDetail v-else-if="activePage === 'detail'" :record="currentRecord" @back="activePage = 'list'; selectedKeys = ['list']" />
        <HazardDisposal v-else-if="activePage === 'disposal'" :record="currentRecord" @back="activePage = 'list'; selectedKeys = ['list']" />
        <HazardDispatch v-else-if="activePage === 'dispatch'" :record="currentRecord" @back="activePage = 'list'; selectedKeys = ['list']" />
        <HazardReview v-else-if="activePage === 'review'" :record="currentRecord" @back="activePage = 'list'; selectedKeys = ['list']" />
        <HazardStats v-else-if="activePage === 'stats'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import {
  UnorderedListOutlined,
  BarChartOutlined
} from '@ant-design/icons-vue'
import HazardList from './components/HazardList.vue'
import HazardDetail from './components/HazardDetail.vue'
import HazardDisposal from './components/HazardDisposal.vue'
import HazardDispatch from './components/HazardDispatch.vue'
import HazardReview from './components/HazardReview.vue'
import HazardStats from './components/HazardStats.vue'

const activePage = ref('list')
const selectedKeys = ref(['list'])
const currentRecord = ref<any>(null)

const menuItems = [
  { key: 'list', icon: () => h(UnorderedListOutlined), label: '隐患列表' },
  { key: 'stats', icon: () => h(BarChartOutlined), label: '隐患统计' }
]

const onMenuClick = ({ key }: { key: string }) => {
  activePage.value = key
  selectedKeys.value = [key]
}

const onListAction = ({ record, action }: { record: any; action: string }) => {
  currentRecord.value = record
  if (action === 'view') {
    activePage.value = 'detail'
  } else if (action === 'disposal') {
    activePage.value = 'disposal'
  } else if (action === 'dispatch') {
    activePage.value = 'dispatch'
  } else if (action === 'review') {
    activePage.value = 'review'
  }
}
</script>

<style scoped lang="scss">
.hazard-page {
  .hazard-layout {
    display: flex;
    gap: 16px;
    min-height: calc(100vh - 180px);
  }

  .hazard-sidebar {
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

  .hazard-content {
    flex: 1;
    min-width: 0;
  }
}
</style>
