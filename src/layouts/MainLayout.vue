<template>
  <a-layout class="layout">
    <!-- 顶部导航 -->
    <a-layout-header class="header">
      <div class="header-left">
        <menu-unfold-outlined
          v-if="appStore.collapsed"
          class="trigger"
          @click="appStore.toggleCollapsed"
        />
        <menu-fold-outlined
          v-else
          class="trigger"
          @click="appStore.toggleCollapsed"
        />
        <div class="logo">
          <img src="/logo.svg" alt="Logo" />
          <span>建筑工地施工隐患巡查智能体</span>
        </div>
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

    <a-layout>
      <!-- 侧边栏菜单 -->
      <a-layout-sider
        v-model:collapsed="appStore.collapsed"
        :width="200"
        breakpoint="lg"
        collapsible
      >
        <a-menu
          v-model:selectedKeys="selectedKeys"
          mode="inline"
          theme="dark"
          :items="menuItems"
          @click="handleMenuClick"
        />
      </a-layout-sider>

      <!-- 主内容区 -->
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
    </a-layout>
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
    label: '系统管理'
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
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  background: linear-gradient(90deg, #1890ff 0%, #096dd9 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .trigger {
      font-size: 18px;
      color: #fff;
      cursor: pointer;
      transition: color 0.3s;

      &:hover {
        color: #40a9ff;
      }
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #fff;
      font-size: 18px;
      font-weight: 600;

      img {
        height: 32px;
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
        color: #40a9ff;
      }
    }
  }
}

.content {
  margin: 16px;
  padding: 24px;
  background: #fff;
  border-radius: 4px;
  min-height: calc(100vh - 64px - 32px);
}

:deep(.ant-layout-sider) {
  background: #001529;
}
</style>
