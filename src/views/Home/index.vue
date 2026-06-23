<template>
  <div class="home-page">
    <!-- 今日概览卡片 -->
    <a-row :gutter="[16, 16]" class="overview-section">
      <a-col :xs="24" :sm="12" :md="12" :lg="6">
        <a-card class="overview-card stat-card" :bordered="false">
          <div class="card-header">
            <span class="icon">📊</span>
            <span class="title">今日发现</span>
          </div>
          <div class="card-body">
            <div class="main-value">127 起</div>
            <div class="trend up">↑ 较昨日+5</div>
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="12" :lg="6">
        <a-card class="overview-card stat-card warning" :bordered="false">
          <div class="card-header">
            <span class="icon">⏳</span>
            <span class="title">待处置</span>
          </div>
          <div class="card-body">
            <div class="main-value">23 起</div>
            <div class="trend warning">⚠️ 超时3起</div>
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="12" :lg="6">
        <a-card class="overview-card stat-card success" :bordered="false">
          <div class="card-header">
            <span class="icon">✅</span>
            <span class="title">已闭环</span>
          </div>
          <div class="card-body">
            <div class="main-value">104 起</div>
            <div class="trend up">↑ 较昨日+8</div>
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="12" :lg="6">
        <a-card class="overview-card stat-card rate" :bordered="false">
          <div class="card-header">
            <span class="icon">🔄</span>
            <span class="title">闭环率</span>
          </div>
          <div class="card-body">
            <div class="main-value">81.9%</div>
            <div class="trend up">↑ 较昨日+2.1%</div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 实时预警 + 待办任务 -->
    <a-row :gutter="[16, 16]" class="middle-section">
      <a-col :xs="24" :lg="14">
        <a-card class="warning-section" :bordered="false">
          <template #title>
            <div class="section-title">
              <span>⚠️ 实时预警</span>
              <span class="subtitle">最新5条 · 滚动刷新</span>
            </div>
          </template>
          <template #extra>
            <div class="legend">
              <span class="legend-item"><span class="dot red"></span>重大</span>
              <span class="legend-item"><span class="dot orange"></span>较大</span>
              <span class="legend-item"><span class="dot yellow"></span>一般</span>
            </div>
          </template>
          <a-list :data-source="warnings" item-layout="horizontal" class="warning-list">
            <template #renderItem="{ item }">
              <a-list-item>
                <div class="warning-item">
                  <div class="warning-left">
                    <span class="level-dot" :class="item.level"></span>
                    <span class="project">{{ item.project }}</span>
                    <span class="content">{{ item.content }}</span>
                    <span class="status">→ {{ item.status }}</span>
                  </div>
                  <div class="warning-right">
                    <span class="time">{{ item.time }}</span>
                    <a-button v-if="item.actions.includes('查看')" type="link" size="small">查看</a-button>
                    <a-button v-if="item.actions.includes('处置')" type="primary" size="small">处置</a-button>
                    <a-button v-if="item.actions.includes('派单')" type="default" size="small">派单</a-button>
                    <a-button v-if="item.actions.includes('追踪')" type="default" size="small">追踪</a-button>
                    <a-button v-if="item.actions.includes('催办')" type="link" size="small" danger>催办</a-button>
                    <a-button v-if="item.actions.includes('复核')" type="default" size="small">复核</a-button>
                  </div>
                </div>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="10">
        <a-card class="todo-card" :bordered="false">
          <template #title>
            <div class="section-title">
              <span>📋 我的待办任务</span>
              <span class="subtitle">共{{ tasks.length }}项 · 今日</span>
            </div>
          </template>
          <template #extra>
            <div class="legend">
              <span class="legend-item"><span class="dot red"></span>重大</span>
              <span class="legend-item"><span class="dot orange"></span>较大</span>
              <span class="legend-item"><span class="dot blue"></span>一般</span>
            </div>
          </template>
          <a-list :data-source="tasks" item-layout="horizontal" class="todo-list">
            <template #renderItem="{ item }">
              <a-list-item>
                <div class="todo-item">
                  <div class="todo-left">
                    <a-tag :color="getLevelColor(item.level)" size="small">{{ item.level }}</a-tag>
                    <span class="project">{{ item.project }}</span>
                    <span class="title">{{ item.title }}</span>
                    <span class="remaining">剩{{ item.remaining }}</span>
                  </div>
                  <div class="todo-right">
                    <span class="time">{{ item.time }}</span>
                    <a-button v-if="item.action === '处置'" type="primary" size="small">处置</a-button>
                    <a-button v-else-if="item.action === '派单'" type="default" size="small">派单</a-button>
                    <a-button v-else type="default" size="small">{{ item.action }}</a-button>
                  </div>
                </div>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>

    <!-- 图表区域 -->
    <a-row :gutter="[16, 16]" class="charts-section">
      <a-col :xs="24" :md="8">
        <a-card class="chart-card" :bordered="false">
          <template #title>
            <div class="card-title">
              <span>隐患类型TOP5</span>
            </div>
          </template>
          <div ref="typeChartRef" style="height: 280px"></div>
        </a-card>
      </a-col>
      <a-col :xs="24" :md="8">
        <a-card class="chart-card" :bordered="false">
          <template #title>
            <div class="card-title">
              <span>阶段隐患分布</span>
            </div>
          </template>
          <div ref="stageChartRef" style="height: 280px"></div>
        </a-card>
      </a-col>
      <a-col :xs="24" :md="8">
        <a-card class="chart-card" :bordered="false">
          <template #title>
            <div class="card-title">
              <span>发现趋势（近7天）</span>
            </div>
          </template>
          <div ref="trendChartRef" style="height: 280px"></div>
        </a-card>
      </a-col>
    </a-row>

    <!-- AI巡查画面 -->
    <a-row :gutter="[16, 16]" class="bottom-section">
      <a-col :xs="24">
        <a-card class="ai-card" :bordered="false">
          <template #title>
            <div class="card-title">
              <span>🎥 AI实时巡查画面</span>
            </div>
          </template>
          <a-row :gutter="[16, 16]" class="ai-content">
            <a-col :xs="24" :sm="12" :md="6" v-for="scene in aiScenes" :key="scene.id">
              <div class="camera-view">
                <img class="camera-image" :src="scene.image" :alt="scene.label" />
                <div class="recognition-result">
                  <div class="result-item">
                    <span class="label">识别结果:</span>
                    <span class="value">{{ scene.result }} <span class="confidence">{{ scene.confidence }}</span></span>
                  </div>
                  <div class="result-item">
                    <span class="label">位置:</span>
                    <span class="value">{{ scene.location }}</span>
                  </div>
                </div>
                <div class="scene-actions">
                  <a-button size="small">上一帧</a-button>
                  <a-button size="small">下一帧</a-button>
                  <a-button type="primary" size="small">查看实时</a-button>
                </div>
              </div>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
    </a-row>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import aiImg1 from '@/assets/ai1.jpeg'
import aiImg2 from '@/assets/ai2.jpeg'
import aiImg3 from '@/assets/ai3.jpeg'
import aiImg4 from '@/assets/ai4.jpeg'

const typeChartRef = ref<HTMLDivElement>()
const stageChartRef = ref<HTMLDivElement>()
const trendChartRef = ref<HTMLDivElement>()

// 实时预警数据
const warnings = ref([
  {
    level: 'red',
    project: '滨江项目',
    time: '2026-06-23 14:28:00',
    content: '2#塔吊作业区 · 外架与作业面不同步（主体）',
    status: '已派单 张安全',
    actions: ['查看', '处置']
  },
  {
    level: 'red',
    project: '余杭项目',
    time: '2026-06-23 14:15:00',
    content: '东侧基坑 · 临边防护缺失（基础）',
    status: '待派单',
    actions: ['派单', '查看']
  },
  {
    level: 'orange',
    project: '萧山项目',
    time: '2026-06-23 13:52:00',
    content: '装修作业面 · 吊篮超员>2人（装修）',
    status: '处置中 李安全',
    actions: ['追踪', '催办']
  },
  {
    level: 'yellow',
    project: '钱塘项目',
    time: '2026-06-23 13:30:00',
    content: '南侧通道 · 未佩戴安全帽（通用）',
    status: '待复核',
    actions: ['复核', '查看']
  },
  {
    level: 'yellow',
    project: '滨江项目',
    time: '2026-06-23 13:05:00',
    content: '加工区 · 圆盘锯缺防护罩（通用）',
    status: '已闭环',
    actions: ['查看']
  }
])

// 待办任务
const tasks = ref([
  {
    id: 1,
    level: '重大',
    project: '滨江项目',
    title: '塔吊外架不同步',
    time: '2026-06-23 14:28:00',
    remaining: '1h32m',
    action: '处置'
  },
  {
    id: 2,
    level: '较大',
    project: '余杭项目',
    title: '基坑临边缺失',
    time: '2026-06-23 14:15:00',
    remaining: '3h43m',
    action: '派单'
  },
  {
    id: 3,
    level: '一般',
    project: '钱塘项目',
    title: '安全帽未戴',
    time: '2026-06-23 13:30:00',
    remaining: '超时32m',
    action: '复核'
  },
  {
    id: 4,
    level: '一般',
    project: '滨江项目',
    title: '圆盘锯缺罩',
    time: '2026-06-23 13:05:00',
    remaining: '2h15m',
    action: '处置'
  },
  {
    id: 5,
    level: '较大',
    project: '萧山项目',
    title: '电焊不规范',
    time: '2026-06-23 12:48:00',
    remaining: '4h20m',
    action: '处置'
  }
])

// 已选中的任务
const checkedTasks = ref<number[]>([])

// 获取等级颜色
const getLevelColor = (level: string) => {
  const map: Record<string, string> = {
    '重大': 'red',
    '较大': 'orange',
    '一般': 'blue'
  }
  return map[level] || 'default'
}

// AI巡查场景数据
const aiScenes = ref([
  {
    id: 1,
    label: '未戴安全帽',
    image: aiImg1,
    result: '未佩戴安全帽',
    confidence: '94.7%',
    location: '南侧通道 #2摄像头'
  },
  {
    id: 2,
    label: '围挡缺失',
    image: aiImg2,
    result: '施工围挡缺失',
    confidence: '91.3%',
    location: '东侧围墙 #5摄像头'
  },
  {
    id: 3,
    label: '电焊作业不规范',
    image: aiImg3,
    result: '电焊未设防护屏',
    confidence: '88.6%',
    location: '加工区 #3摄像头'
  },
  {
    id: 4,
    label: '堆载不符合要求',
    image: aiImg4,
    result: '材料堆载超高',
    confidence: '92.1%',
    location: '北侧仓库 #7摄像头'
  }
])

// 初始化图表
onMounted(() => {
  // 隐患类型TOP5条形图
  if (typeChartRef.value) {
    const typeChart = echarts.init(typeChartRef.value)
    typeChart.setOption({
      tooltip: { 
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#f0f0f0' } }
      },
      yAxis: {
        type: 'category',
        data: ['吊篮悬停', '外架堆物', '电焊不规范', '临边防护缺失', '未戴安全帽'],
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { fontSize: 12 }
      },
      series: [
        {
          name: '数量',
          type: 'bar',
          data: [8, 12, 15, 18, 32],
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#1890ff' },
              { offset: 1, color: '#40a9ff' }
            ]),
            borderRadius: [0, 4, 4, 0]
          },
          label: {
            show: true,
            position: 'right',
            fontSize: 12
          }
        }
      ]
    })
  }

  // 阶段分布环形图
  if (stageChartRef.value) {
    const stageChart = echarts.init(stageChartRef.value)
    stageChart.setOption({
      tooltip: { 
        trigger: 'item',
        formatter: '{b}: {c}%'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        itemWidth: 12,
        itemHeight: 12,
        textStyle: { fontSize: 12 }
      },
      series: [
        {
          name: '阶段分布',
          type: 'pie',
          radius: ['50%', '70%'],
          center: ['40%', '50%'],
          avoidLabelOverlap: false,
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold'
            }
          },
          data: [
            { value: 28, name: '通用', itemStyle: { color: '#1890ff' } },
            { value: 18, name: '基础', itemStyle: { color: '#52c41a' } },
            { value: 34, name: '主体', itemStyle: { color: '#faad14' } },
            { value: 20, name: '装修', itemStyle: { color: '#ff4d4f' } }
          ]
        }
      ]
    })
  }

  // 发现趋势折线图
  if (trendChartRef.value) {
    const trendChart = echarts.init(trendChartRef.value)
    trendChart.setOption({
      tooltip: { 
        trigger: 'axis'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['一', '二', '三', '四', '五', '六', '日'],
        axisLine: { lineStyle: { color: '#e8e8e8' } },
        axisLabel: { color: '#8c8c8c' }
      },
      yAxis: { 
        type: 'value',
        max: 80,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#f0f0f0' } },
        axisLabel: { color: '#8c8c8c' }
      },
      series: [
        {
          name: '发现数',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          data: [45, 52, 38, 65, 58, 70, 62],
          itemStyle: { color: '#1890ff' },
          lineStyle: { width: 2, color: '#1890ff' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
            ])
          }
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

  // 今日概览区域
  .overview-section {
    margin-bottom: 16px;

    .stat-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        transform: translateY(-2px);
      }

      &.warning {
        border-left: 4px solid #faad14;
      }

      &.success {
        border-left: 4px solid #52c41a;
      }

      &.rate {
        border-left: 4px solid #1890ff;
      }

      :deep(.ant-card-body) {
        padding: 20px;
      }

      .card-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;

        .icon {
          font-size: 20px;
        }

        .title {
          font-size: 14px;
          color: #8c8c8c;
        }
      }

      .card-body {
        .main-value {
          font-size: 32px;
          font-weight: 600;
          color: #262626;
          line-height: 1.2;
          margin-bottom: 8px;
        }

        .trend {
          font-size: 13px;

          &.up {
            color: #52c41a;
          }

          &.warning {
            color: #faad14;
          }
        }
      }
    }
  }

  // 中间区域（实时预警 + 待办任务）
  .middle-section {
    margin-bottom: 16px;

    .warning-section,
    .todo-card {
      height: 100%;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      display: flex;
      flex-direction: column;

      :deep(.ant-card-head) {
        border-bottom: 1px solid #f0f0f0;
        padding: 16px 20px;
        flex-shrink: 0;
      }

      :deep(.ant-card-body) {
        padding: 20px;
        flex: 1;
        overflow: hidden;
      }

      .section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 500;
        color: #262626;

        .subtitle {
          font-size: 13px;
          color: #8c8c8c;
          font-weight: normal;
        }
      }

      .legend {
        display: flex;
        gap: 16px;
        font-size: 13px;

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;

          .dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;

            &.red { background: #ff4d4f; }
            &.orange { background: #faad14; }
            &.yellow { background: #faad14; }
            &.blue { background: #1890ff; }
          }
        }
      }
    }

    // 实时预警区域
    .warning-section {
      :deep(.ant-card-head) {
        border-bottom: 1px solid #f0f0f0;
        padding: 16px 20px;
      }

      :deep(.ant-card-body) {
        padding: 20px;
      }

      .warning-list {
        :deep(.ant-list-item) {
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }
        }

        .warning-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;

          .warning-left {
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 1;

            .level-dot {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              flex-shrink: 0;

              &.red { background: #ff4d4f; }
              &.orange { background: #faad14; }
              &.yellow { background: #faad14; }
            }

            .project {
              font-size: 12px;
              color: #1890ff;
              background: #e6f7ff;
              padding: 1px 6px;
              border-radius: 3px;
              font-weight: 500;
              flex-shrink: 0;
            }

            .content {
              font-size: 14px;
              color: #262626;
            }

            .status {
              font-size: 13px;
              color: #8c8c8c;
            }
          }

          .warning-right {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;

            .time {
              font-size: 12px;
              color: #8c8c8c;
              font-family: 'Courier New', monospace;
              white-space: nowrap;
            }
          }
        }
      }
    }

    // 待办任务样式
    .todo-card {
      .todo-list {
        :deep(.ant-list-item) {
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }
        }

        .todo-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;

          .todo-left {
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 1;

            .project {
              font-size: 12px;
              color: #1890ff;
              background: #e6f7ff;
              padding: 1px 6px;
              border-radius: 3px;
              font-weight: 500;
              flex-shrink: 0;
            }

            .title {
              font-size: 14px;
              color: #262626;
            }

            .remaining {
              font-size: 12px;
              color: #8c8c8c;
              font-family: 'Courier New', monospace;
            }
          }

          .todo-right {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;

            .time {
              font-size: 12px;
              color: #8c8c8c;
              font-family: 'Courier New', monospace;
              white-space: nowrap;
            }
          }
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
        font-size: 16px;
        font-weight: 500;
        color: #262626;
      }
    }
  }

  // 底部区域（AI巡查画面）
  .bottom-section {
    margin-bottom: 16px;

    .ai-card {
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
        font-size: 16px;
        font-weight: 500;
        color: #262626;
      }

      .ai-content {
        margin-bottom: 16px;

        .camera-view {
          height: 100%;
          display: flex;
          flex-direction: column;

          .camera-image {
            width: 100%;
            height: 270px;
            object-fit: cover;
            border-radius: 8px;
            margin-bottom: 12px;
            display: block;
          }

          .recognition-result {
            background: #f0f5ff;
            border-radius: 6px;
            padding: 10px;
            flex: 1;

            .result-item {
              display: flex;
              justify-content: space-between;
              gap: 6px;
              margin-bottom: 6px;

              &:last-child {
                margin-bottom: 0;
              }

              .label {
                font-size: 12px;
                color: #595959;
                flex-shrink: 0;
              }

              .value {
                font-size: 12px;
                color: #262626;
                font-weight: 500;
                text-align: right;

                .confidence {
                  color: #ff4d4f;
                  font-weight: 600;
                }
              }
            }
          }

          .scene-actions {
            display: flex;
            gap: 6px;
            justify-content: center;
            margin-top: 10px;
          }
        }
      }
    }
  }
}
</style>
