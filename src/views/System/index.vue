<template>
  <div class="system-page">
    <div class="system-layout">
      <div class="system-sidebar">
        <a-menu v-model:selectedKeys="selectedKeys" mode="inline" :items="menuItems" @click="onMenuClick" />
      </div>
      <div class="system-content">
        <BasicConfig v-if="activePage === 'basic'" />
        <RuleEngine v-else-if="activePage === 'rule'" />
        <AIModel v-else-if="activePage === 'ai'" />
        <KnowledgeBase v-else-if="activePage === 'knowledge'" />
        <DispatchStrategy v-else-if="activePage === 'dispatch'" />
        <AuditLog v-else-if="activePage === 'audit'" />
        <ConfigTemplate v-else-if="activePage === 'template'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import {
  SettingOutlined,
  ThunderboltOutlined,
  RobotOutlined,
  BookOutlined,
  ScheduleOutlined,
  FileSearchOutlined,
  CloudUploadOutlined
} from '@ant-design/icons-vue'
import BasicConfig from './components/BasicConfig.vue'
import RuleEngine from './components/RuleEngine.vue'
import AIModel from './components/AIModel.vue'
import KnowledgeBase from './components/KnowledgeBase.vue'
import DispatchStrategy from './components/DispatchStrategy.vue'
import AuditLog from './components/AuditLog.vue'
import ConfigTemplate from './components/ConfigTemplate.vue'

const activePage = ref('basic')
const selectedKeys = ref(['basic'])

const menuItems = [
  { key: 'basic', icon: () => h(SettingOutlined), label: '基础配置' },
  { key: 'rule', icon: () => h(ThunderboltOutlined), label: '规则引擎' },
  { key: 'ai', icon: () => h(RobotOutlined), label: 'AI模型配置' },
  { key: 'knowledge', icon: () => h(BookOutlined), label: '知识库管理' },
  { key: 'dispatch', icon: () => h(ScheduleOutlined), label: '调度策略' },
  { key: 'audit', icon: () => h(FileSearchOutlined), label: '操作日志' },
  { key: 'template', icon: () => h(CloudUploadOutlined), label: '配置模板' }
]

const onMenuClick = ({ key }: { key: string }) => {
  activePage.value = key
}
</script>

<style scoped lang="scss">
.system-page {
  .system-layout {
    display: flex;
    gap: 16px;
    min-height: calc(100vh - 180px);
  }

  .system-sidebar {
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

  .system-content {
    flex: 1;
    min-width: 0;
  }
}
</style>
