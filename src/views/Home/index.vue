<template>
  <div class="home-page">
    <!-- 顶部欢迎区域 -->
    <a-card class="welcome-card" :bordered="false">
      <div class="welcome-content">
        <div class="weather-info">
          <CloudOutlined class="weather-icon" />
        </div>
        <div class="greeting">
          <h2>Hi 早上好，欢迎登录本系统！</h2>
          <p>{{ currentDate }} {{ currentWeekday }}</p>
        </div>
      </div>
    </a-card>

    <!-- 原料产量（巡检任务）统计 -->
    <a-row :gutter="[16, 16]" class="stats-section">
      <a-col :xs="24" :sm="8">
        <a-card class="stat-card" :bordered="false">
          <div class="stat-header">
            <SafetyCertificateOutlined class="stat-icon" style="color: #1890ff; background: rgba(24, 144, 255, 0.1);" />
            <span class="stat-title">今日巡检任务</span>
          </div>
          <div class="stat-value">
            <span class="number">22</span>
            <span class="unit">个</span>
          </div>
          <div class="stat-trend down">
            <span class="label">同比增长</span>
            <span class="value">12% ↓</span>
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="8">
        <a-card class="stat-card" :bordered="false">
          <div class="stat-header">
            <ExclamationCircleOutlined class="stat-icon" style="color: #52c41a; background: rgba(82, 196, 26, 0.1);" />
            <span class="stat-title">月累巡检量</span>
          </div>
          <div class="stat-value">
            <span class="number">686</span>
            <span class="unit">个</span>
          </div>
          <div class="stat-trend up">
            <span class="label">同比增长</span>
            <span class="value">12% ↑</span>
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="8">
        <a-card class="stat-card" :bordered="false">
          <div class="stat-header">
            <WarningOutlined class="stat-icon" style="color: #faad14; background: rgba(250, 173, 20, 0.1);" />
            <span class="stat-title">年累巡检量</span>
          </div>
          <div class="stat-value">
            <span class="number">1,869</span>
            <span class="unit">个</span>
          </div>
          <div class="stat-trend down">
            <span class="label">同比增长</span>
            <span class="value">12% ↓</span>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 成品产量（隐患管理）统计 -->
    <a-row :gutter="[16, 16]" class="stats-section">
      <a-col :xs="24" :sm="8">
        <a-card class="stat-card" :bordered="false">
          <div class="stat-header">
            <BugOutlined class="stat-icon" style="color: #ff4d4f; background: rgba(255, 77, 79, 0.1);" />
            <span class="stat-title">发现隐患数</span>
          </div>
          <div class="stat-value">
            <span class="number">5</span>
            <span class="unit">处</span>
          </div>
          <div class="stat-trend down">
            <span class="label">同比减少</span>
            <span class="value">8% ↓</span>
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="8">
        <a-card class="stat-card" :bordered="false">
          <div class="stat-header">
            <CheckCircleOutlined class="stat-icon" style="color: #52c41a; background: rgba(82, 196, 26, 0.1);" />
            <span class="stat-title">已整改隐患</span>
          </div>
          <div class="stat-value">
            <span class="number">3</span>
            <span class="unit">处</span>
          </div>
          <div class="stat-trend up">
            <span class="label">同比增长</span>
            <span class="value">15% ↑</span>
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="8">
        <a-card class="stat-card" :bordered="false">
          <div class="stat-header">
            <ClockCircleOutlined class="stat-icon" style="color: #faad14; background: rgba(250, 173, 20, 0.1);" />
            <span class="stat-title">待处理隐患</span>
          </div>
          <div class="stat-value">
            <span class="number">2</span>
            <span class="unit">处</span>
          </div>
          <div class="stat-trend down">
            <span class="label">同比减少</span>
            <span class="value">5% ↓</span>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 图表区域 -->
    <a-row :gutter="[16, 16]" class="charts-section">
      <a-col :xs="24" :lg="12">
        <a-card class="chart-card" :bordered="false">
          <template #title>
            <div class="card-title">
              <SafetyCertificateOutlined class="title-icon" />
              <span>巡检趋势分析</span>
            </div>
          </template>
          <template #extra>
            <a-radio-group v-model:value="trendPeriod" size="small">
              <a-radio-button value="day">日</a-radio-button>
              <a-radio-button value="month">月</a-radio-button>
              <a-radio-button value="year">年</a-radio-button>
            </a-radio-group>
          </template>
          <div ref="trendChartRef" style="height: 280px"></div>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="12">
        <a-card class="chart-card" :bordered="false">
          <template #title>
            <div class="card-title">
              <PieChartOutlined class="title-icon" />
              <span>隐患类型分布</span>
            </div>
          </template>
          <template #extra>
            <a-radio-group v-model:value="typePeriod" size="small">
              <a-radio-button value="day">日</a-radio-button>
              <a-radio-button value="month">月</a-radio-button>
              <a-radio-button value="year">年</a-radio-button>
            </a-radio-group>
          </template>
          <div ref="typeChartRef" style="height: 280px"></div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 底部数据区域 -->
    <a-row :gutter="[16, 16]" class="bottom-section">
      <a-col :xs="24" :lg="16">
        <a-card class="list-card" :bordered="false">
          <template #title>
            <div class="card-title">
              <BellOutlined class="title-icon" />
              <span>待办事项</span>
            </div>
          </template>
          <a-list :data-source="activities" item-layout="horizontal" class="activity-list">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta :description="item.time">
                  <template #title>
                    <div class="activity-title">
                      <span class="dot" :class="getUrgencyClass(item.urgency)"></span>
                      <span>{{ item.content }}</span>
                    </div>
                  </template>
                </a-list-item-meta>
                <div class="activity-status">
                  <a-tag :color="getTypeColor(item.type)">{{ getTypeText(item.type) }}</a-tag>
                  <span class="status-text">{{ item.status }}</span>
                </div>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="8">
        <a-card class="progress-card" :bordered="false">
          <template #title>
            <div class="card-title">
              <BarChartOutlined class="title-icon" />
              <span>计划完成情况</span>
            </div>
          </template>
          <div class="progress-list">
            <div v-for="(item, index) in progressData" :key="index" class="progress-item">
              <div class="progress-label">
                <span>{{ item.name }}</span>
                <span class="progress-value">{{ item.current }}/{{ item.total }} {{ item.unit }}</span>
              </div>
              <a-progress 
                :percent="Math.round((item.current / item.total) * 100)" 
                :stroke-color="getProgressColor(item.current / item.total)"
                :show-info="false"
              />
              <div class="progress-percent">{{ Math.round((item.current / item.total) * 100) }}%</div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import {
  CloudOutlined,
  SafetyCertificateOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  BugOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PieChartOutlined,
  BellOutlined,
  BarChartOutlined
} from '@ant-design/icons-vue'

const trendChartRef = ref<HTMLDivElement>()
const typeChartRef = ref<HTMLDivElement>()

// 当前日期和星期
const currentDate = ref(dayjs().format('YYYY-MM-DD'))
const currentWeekday = ref(dayjs().format('dddd'))

// 图表周期选择
const trendPeriod = ref('day')
const typePeriod = ref('day')

// 模拟数据 - 待办事项
const activities = ref([
  { 
    type: 'inspection', 
    content: 'A区脚手架安全检查待审批', 
    time: '2026-06-23 14:30',
    urgency: 'urgent',
    status: '任务审批 | 张国良'
  },
  { 
    type: 'hazard', 
    content: 'B区临时用电安全隐患待整改', 
    time: '2026-06-23 13:20',
    urgency: 'urgent',
    status: '任务审批 | 李明'
  },
  { 
    type: 'rectify', 
    content: 'C区高空作业防护已整改完成待验收', 
    time: '2026-06-23 11:15',
    urgency: 'normal',
    status: '验收审批 | 王强'
  },
  { 
    type: 'inspection', 
    content: 'D区塔吊设备巡检计划待执行', 
    time: '2026-06-23 10:00',
    urgency: 'normal',
    status: '任务审批 | 赵敏'
  }
])

// 进度数据
const progressData = ref([
  { name: '月度巡检完成率', current: 68.86, total: 81.48, unit: '' },
  { name: '隐患整改率', current: 57.86, total: 78.48, unit: '' },
  { name: '安全培训覆盖率', current: 68.86, total: 81.48, unit: '' },
  { name: '设备完好率', current: 72.86, total: 75.48, unit: '' },
  { name: '人员持证上岗率', current: 52.86, total: 82.48, unit: '' }
])

const getTypeText = (type: string) => {
  const map: Record<string, string> = {
    inspection: '巡检',
    hazard: '隐患',
    rectify: '整改'
  }
  return map[type] || type
}

const getTypeColor = (type: string) => {
  const map: Record<string, string> = {
    inspection: 'blue',
    hazard: 'red',
    rectify: 'green'
  }
  return map[type] || 'default'
}

const getUrgencyClass = (urgency: string) => {
  return urgency === 'urgent' ? 'urgent' : 'normal'
}

const getProgressColor = (ratio: number) => {
  if (ratio >= 0.9) return '#52c41a'
  if (ratio >= 0.7) return '#1890ff'
  if (ratio >= 0.5) return '#faad14'
  return '#ff4d4f'
}

// 初始化图表
onMounted(() => {
  // 趋势图
  if (trendChartRef.value) {
    const trendChart = echarts.init(trendChartRef.value)
    trendChart.setOption({
      tooltip: { 
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e8e8e8',
        borderWidth: 1
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['01月', '02月', '03月', '04月', '05月', '06月', '07月', '08月', '09月', '10月', '11月', '12月'],
        axisLine: { lineStyle: { color: '#e8e8e8' } },
        axisLabel: { color: '#8c8c8c' }
      },
      yAxis: { 
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#f0f0f0' } },
        axisLabel: { color: '#8c8c8c' }
      },
      series: [
        {
          name: '巡检次数',
          type: 'bar',
          barWidth: '40%',
          data: [20, 70, 50, 20, 10, 20, 10, 86, 20, 40, 20, 40],
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#1890ff' },
              { offset: 1, color: '#69c0ff' }
            ]),
            borderRadius: [4, 4, 0, 0]
          }
        }
      ]
    })
  }

  // 类型分布图
  if (typeChartRef.value) {
    const typeChart = echarts.init(typeChartRef.value)
    typeChart.setOption({
      tooltip: { 
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e8e8e8',
        borderWidth: 1
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['01月', '02月', '03月', '04月', '05月', '06月', '07月', '08月', '09月', '10月', '11月', '12月'],
        axisLine: { lineStyle: { color: '#e8e8e8' } },
        axisLabel: { color: '#8c8c8c' }
      },
      yAxis: { 
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#f0f0f0' } },
        axisLabel: { color: '#8c8c8c' }
      },
      series: [
        {
          name: '隐患数量',
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: [20, 50, 40, 60, 30, 20, 15, 25, 45, 80, 50, 30],
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
            ])
          },
          lineStyle: {
            width: 3,
            color: '#1890ff'
          },
          itemStyle: { color: '#1890ff' }
        }
      ]
    })
  }
})
</script>

<style scoped lang="scss">
.home-page {
  background: linear-gradient(135deg, #f0f5ff 0%, #e6f7ff 100%);
  min-height: calc(100vh - 120px);
  padding: 16px;

  // 欢迎卡片
  .welcome-card {
    margin-bottom: 16px;
    background: linear-gradient(90deg, #1890ff 0%, #40a9ff 100%);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);

    :deep(.ant-card-body) {
      padding: 24px 32px;
    }

    .welcome-content {
      display: flex;
      align-items: center;
      gap: 24px;

      .weather-icon {
        font-size: 48px;
        color: #fff;
        opacity: 0.9;
      }

      .greeting {
        h2 {
          color: #fff;
          font-size: 24px;
          font-weight: 500;
          margin: 0 0 8px 0;
        }

        p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 16px;
          margin: 0;
        }
      }
    }
  }

  // 统计卡片区域
  .stats-section {
    margin-bottom: 16px;

    .stat-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        transform: translateY(-2px);
      }

      :deep(.ant-card-body) {
        padding: 20px;
      }

      .stat-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;

        .stat-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          border-radius: 8px;
        }

        .stat-title {
          font-size: 14px;
          color: #8c8c8c;
        }
      }

      .stat-value {
        margin-bottom: 12px;

        .number {
          font-size: 32px;
          font-weight: 600;
          color: #262626;
          margin-right: 4px;
        }

        .unit {
          font-size: 14px;
          color: #8c8c8c;
        }
      }

      .stat-trend {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;

        .label {
          color: #8c8c8c;
        }

        .value {
          font-weight: 500;
        }

        &.up .value {
          color: #52c41a;
        }

        &.down .value {
          color: #ff4d4f;
        }
      }
    }
  }

  // 图表区域
  .charts-section {
    margin-bottom: 16px;

    .chart-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

      :deep(.ant-card-head) {
        border-bottom: 1px solid #f0f0f0;
        padding: 16px 20px;
      }

      :deep(.ant-card-body) {
        padding: 20px;
      }

      .card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 500;
        color: #262626;

        .title-icon {
          font-size: 18px;
          color: #1890ff;
        }
      }
    }
  }

  // 底部区域
  .bottom-section {
    .list-card,
    .progress-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

      :deep(.ant-card-head) {
        border-bottom: 1px solid #f0f0f0;
        padding: 16px 20px;
      }

      :deep(.ant-card-body) {
        padding: 20px;
      }

      .card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 500;
        color: #262626;

        .title-icon {
          font-size: 18px;
          color: #1890ff;
        }
      }
    }

    // 待办事项列表
    .activity-list {
      :deep(.ant-list-item) {
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }
      }

      .activity-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: #262626;

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;

          &.urgent {
            background: #ff4d4f;
          }

          &.normal {
            background: #1890ff;
          }
        }
      }

      .activity-status {
        display: flex;
        align-items: center;
        gap: 8px;

        .status-text {
          font-size: 13px;
          color: #8c8c8c;
        }
      }
    }

    // 进度列表
    .progress-list {
      .progress-item {
        margin-bottom: 20px;

        &:last-child {
          margin-bottom: 0;
        }

        .progress-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 14px;

          span:first-child {
            color: #262626;
          }

          .progress-value {
            color: #8c8c8c;
            font-size: 13px;
          }
        }

        :deep(.ant-progress) {
          margin-bottom: 4px;

          .ant-progress-inner {
            background-color: #f0f0f0;
            border-radius: 10px;
          }

          .ant-progress-bg {
            border-radius: 10px;
          }
        }

        .progress-percent {
          text-align: right;
          font-size: 13px;
          font-weight: 500;
          color: #1890ff;
        }
      }
    }
  }
}
</style>
