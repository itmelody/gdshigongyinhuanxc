<template>
  <a-layout class="layout">
    <!-- 顶部导航 -->
    <a-layout-header class="header">
      <div class="header-left">
        <div class="logo">
          <img src="/logo.svg" alt="Logo" />
          <span>建筑工地施工隐患巡查智能体</span>
        </div>
        <a-menu
          v-model:selectedKeys="selectedKeys"
          mode="horizontal"
          theme="light"
          :items="menuItems"
          @click="handleMenuClick"
          class="top-menu"
        />
      </div>
      <div class="header-right">
        <a-space :size="16">
          <a-button type="text">
            <template #icon><BellOutlined /></template>
          </a-button>
          <a-dropdown>
            <a class="ant-dropdown-link" @click.prevent>
              <UserOutlined />
              <span style="margin-left: 8px;">管理员</span>
              <DownOutlined />
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item>个人中心</a-menu-item>
                <a-menu-item>修改密码</a-menu-item>
                <a-menu-divider />
                <a-menu-item>退出登录</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </a-space>
      </div>
    </a-layout-header>

    <!-- 主内容区 -->
    <a-layout-content class="content">
      <router-view />
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, watch, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  BellOutlined,
  UserOutlined,
  DownOutlined,
  HomeOutlined,
  ScanOutlined,
  ExclamationCircleOutlined,
  BarChartOutlined,
  SettingOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()

const selectedKeys = ref<string[]>(['home'])

const menuItems = [
  {
    key: 'home',
    icon: () => h(HomeOutlined),
    label: '首页'
  },
  {
    key: 'inspection',
    icon: () => h(ScanOutlined),
    label: '智能巡检'
  },
  {
    key: 'hazard',
    icon: () => h(ExclamationCircleOutlined),
    label: '隐患管理'
  },
  {
    key: 'statistics',
    icon: () => h(BarChartOutlined),
    label: '统计分析'
  },
  {
    key: 'system',
    icon: () => h(SettingOutlined),
    label: '智能体配置'
  }
]

const handleMenuClick = (info: any) => {
  const pathMap: Record<string, string> = {
    home: '/home',
    inspection: '/inspection',
    hazard: '/hazard',
    statistics: '/statistics',
    system: '/system'
  }
  router.push(pathMap[info.key])
}

// 监听路由变化，同步选中状态
watch(
  () => route.path,
  (newPath) => {
    const pathKeyMap: Record<string, string> = {
      '/home': 'home',
      '/inspection': 'inspection',
      '/hazard': 'hazard',
      '/statistics': 'statistics',
      '/system': 'system'
    }
    selectedKeys.value = [pathKeyMap[newPath] || 'home']
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f5ff 0%, #e6f7ff 100%);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  background: linear-gradient(90deg, #1890ff 0%, #40a9ff 100%);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
  height: 64px;

  .header-left {
    display: flex;
    align-items: center;
    gap: 32px;
    flex: 1;

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #fff;
      font-size: 18px;
      font-weight: 600;
      white-space: nowrap;

      img {
        height: 36px;
      }
    }

    .top-menu {
      flex: 1;
      background: transparent;
      border-bottom: none;

      :deep(.ant-menu-item) {
        color: rgba(255, 255, 255, 0.85);
        font-size: 15px;
        font-weight: 500;

        &:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.1);
        }

        &.ant-menu-item-selected {
          color: #fff;
          background: rgba(255, 255, 255, 0.15);

          &::after {
            border-bottom-color: #fff;
          }
        }
      }
    }
  }

  .header-right {
    .ant-dropdown-link {
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;

      &:hover {
        color: rgba(255, 255, 255, 0.85);
      }
    }

    :deep(.ant-btn-text) {
      color: #fff;

      &:hover {
        color: rgba(255, 255, 255, 0.85);
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }
}

.content {
  margin: 16px;
  min-height: calc(100vh - 64px - 32px);
}
</style>
