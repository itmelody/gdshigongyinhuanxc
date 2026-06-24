<template>
  <div class="trend-page">
    <!-- 筛选 -->
    <a-card :bordered="false" class="filter-card">
      <a-row justify="space-between" align="middle">
        <a-space size="middle">
          <a-select v-model:value="timeRange" style="width: 110px">
            <a-select-option value="7">近7天</a-select-option>
            <a-select-option value="30">近30天</a-select-option>
            <a-select-option value="90">近90天</a-select-option>
          </a-select>
          <a-select v-model:value="granularity" style="width: 90px">
            <a-select-option value="day">按日</a-select-option>
            <a-select-option value="week">按周</a-select-option>
            <a-select-option value="month">按月</a-select-option>
          </a-select>
          <a-select v-model:value="stageFilter" placeholder="全部阶段" style="width: 110px" allow-clear>
            <a-select-option value="通用">通用</a-select-option>
            <a-select-option value="基础">基础</a-select-option>
            <a-select-option value="主体">主体</a-select-option>
            <a-select-option value="装修">装修</a-select-option>
          </a-select>
          <a-select v-model:value="typeFilter" placeholder="全部类型" style="width: 110px" allow-clear>
            <a-select-option value="安全帽">未佩戴安全帽</a-select-option>
            <a-select-option value="临边">临边防护缺失</a-select-option>
            <a-select-option value="电焊">电焊不规范</a-select-option>
          </a-select>
        </a-space>
      </a-row>
    </a-card>

    <!-- 周期分析 -->
    <a-card :bordered="false" style="margin-top: 16px">
      <template #title>
        <span style="font-weight: 600">周期分析</span>
      </template>
      <div class="period-cards">
        <div class="period-card" v-for="p in periodData" :key="p.label">
          <div class="period-icon" :style="{ background: p.iconBg }">
            <component :is="p.icon" :style="{ color: p.iconColor, fontSize: '20px' }" />
          </div>
          <div class="period-label">{{ p.label }}</div>
          <div class="period-value" :style="{ color: p.valueColor }">{{ p.value }}<span class="unit">{{ p.unit }}</span></div>
          <div v-if="p.change" class="period-change" :class="p.up ? 'up' : 'down'">
            {{ p.up ? '↑' : '↓' }} {{ p.change }}
          </div>
        </div>
      </div>
    </a-card>

    <!-- 主趋势图 -->
    <a-card :bordered="false" style="margin-top: 16px">
      <template #title>
        <span style="font-weight: 600">隐患发现趋势</span>
        <a-tag color="blue" style="margin-left: 12px">日均: {{ stats.avg }}起</a-tag>
        <a-tag color="red">峰值: {{ stats.max }}起({{ stats.maxDate }})</a-tag>
      </template>
      <div class="main-chart">
        <svg :viewBox="`0 0 ${svgWidth} ${svgHeight}`" preserveAspectRatio="none" style="width:100%;height:200px" @mousemove="handleMainChartHover" @mouseleave="hideTooltip">
          <!-- 网格线 -->
          <line v-for="(y, i) in gridY" :key="i" :x1="0" :y1="y" :x2="svgWidth" :y2="y" stroke="#f0f0f0" stroke-dasharray="4" />
          <!-- 折线 -->
          <polyline :points="mainLinePoints" fill="none" stroke="#1890ff" stroke-width="0.5" />
          <!-- 悬停热区 -->
          <rect x="0" y="0" :width="svgWidth" :height="svgHeight" fill="transparent" />
        </svg>
        <!-- X轴标签 -->
        <div class="x-labels">
          <span v-for="(label, i) in xAxisLabels" :key="i" :style="{ left: label.pos + '%' }">{{ label.text }}</span>
        </div>
      </div>
    </a-card>

    <!-- 阶段对比 + 类型对比 -->
    <a-row :gutter="16" style="margin-top: 16px">
      <a-col :span="12">
        <a-card :bordered="false" title="各阶段隐患趋势对比">
          <div class="sub-chart">
            <div class="legend-bar">
              <span v-for="s in stageCompare" :key="s.name" class="legend-item">
                <i :style="{ background: s.color }"></i>{{ s.name }}
              </span>
            </div>
            <svg :viewBox="`0 0 ${svgWidth} ${svgHeight}`" preserveAspectRatio="none" style="width:100%;height:160px" @mousemove="handleSubChartHover($event, s)" @mouseleave="hideTooltip">
              <line v-for="(y, i) in subGridY" :key="i" :x1="0" :y1="y" :x2="svgWidth" :y2="y" stroke="#f0f0f0" stroke-dasharray="4" />
              <polyline v-for="s2 in stageCompare" :key="s2.name" :points="getSubPoints(s2.data)" fill="none" :stroke="s2.color" stroke-width="0.5" />
              <rect x="0" y="0" :width="svgWidth" :height="svgHeight" fill="transparent" />
            </svg>
            <div class="x-labels">
              <span v-for="(label, i) in shortXLabels" :key="i" :style="{ left: label.pos + '%' }">{{ label.text }}</span>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card :bordered="false" title="隐患类型趋势对比">
          <div class="sub-chart">
            <div class="legend-bar">
              <span v-for="t in typeCompare" :key="t.name" class="legend-item">
                <i :style="{ background: t.color }"></i>{{ t.name }}
              </span>
            </div>
            <svg :viewBox="`0 0 ${svgWidth} ${svgHeight}`" preserveAspectRatio="none" style="width:100%;height:160px" @mousemove="handleSubChartHover($event, t)" @mouseleave="hideTooltip">
              <line v-for="(y, i) in subGridY" :key="i" :x1="0" :y1="y" :x2="svgWidth" :y2="y" stroke="#f0f0f0" stroke-dasharray="4" />
              <polyline v-for="t2 in typeCompare" :key="t2.name" :points="getSubPoints(t2.data)" fill="none" :stroke="t2.color" stroke-width="0.5" />
              <rect x="0" y="0" :width="svgWidth" :height="svgHeight" fill="transparent" />
            </svg>
            <div class="x-labels">
              <span v-for="(label, i) in shortXLabels" :key="i" :style="{ left: label.pos + '%' }">{{ label.text }}</span>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
    <!-- Tooltip -->
    <div class="chart-tooltip" v-if="tooltip.visible" :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
      <div class="tooltip-title">{{ tooltip.title }}</div>
      <div class="tooltip-value">{{ tooltip.value }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import {
  CalendarOutlined, ClockCircleOutlined, RiseOutlined,
  FireOutlined, ThunderboltOutlined
} from '@ant-design/icons-vue'

const timeRange = ref('90')
const granularity = ref('day')
const stageFilter = ref<string>()
const typeFilter = ref<string>()

const svgWidth = 100
const svgHeight = 100

const trendData = ref([
  25, 30, 35, 28, 40, 55, 48, 52, 45, 38, 42, 50, 65, 58, 70, 75, 62, 55, 48, 60,
  68, 72, 65, 58, 50, 55, 62, 70, 75, 80, 72, 65, 58, 52, 48, 55, 60, 68, 72, 78,
  85, 90, 82, 75, 68, 72, 80, 88, 95, 100, 92, 85, 78, 72, 68, 75, 80, 88, 92, 98,
  105, 110, 102, 95, 88, 82, 78, 85, 90, 98, 102, 108, 115, 120, 112, 105, 98, 92,
  88, 95, 100, 108, 115, 127, 118, 110, 102
])

// Y轴网格线位置（主图）
const gridY = [0, 16.7, 33.3, 50, 66.7, 83.3, 100]

// Y轴网格线位置（子图）
const subGridY = [0, 50, 100]

const xAxisLabels = [
  { text: '5/25', pos: 0 }, { text: '5/30', pos: 16.7 }, { text: '6/04', pos: 33.3 },
  { text: '6/09', pos: 50 }, { text: '6/14', pos: 66.7 }, { text: '6/19', pos: 83.3 }, { text: '6/24', pos: 100 }
]
const shortXLabels = [
  { text: '5/25', pos: 0 }, { text: '6/01', pos: 25 },
  { text: '6/08', pos: 50 }, { text: '6/15', pos: 75 }, { text: '6/22', pos: 100 }
]

const stats = ref({ avg: 41.6, max: 127, maxDate: '6/23' })

// Tooltip状态
const tooltip = reactive({ visible: false, x: 0, y: 0, title: '', value: '' })
const showTooltip = (e: MouseEvent, title: string, value: string) => {
  const rect = (e.target as HTMLElement).getBoundingClientRect()
  tooltip.x = rect.left + rect.width / 2
  tooltip.y = rect.top
  tooltip.title = title
  tooltip.value = value
  tooltip.visible = true
}
const hideTooltip = () => { tooltip.visible = false }

// 折线图悬停：通过鼠标位置找最近的数据点
const handleMainChartHover = (e: MouseEvent) => {
  const svg = (e.currentTarget as SVGElement)
  const rect = svg.getBoundingClientRect()
  const ratio = (e.clientX - rect.left) / rect.width
  const max = 120
  const idx = Math.round(ratio * (trendData.value.length - 1))
  if (idx >= 0 && idx < trendData.value.length) {
    const dayOffset = trendData.value.length - 1 - idx
    const dateStr = getDateStr(dayOffset)
    tooltip.x = e.clientX
    tooltip.y = rect.top
    tooltip.title = dateStr
    tooltip.value = trendData.value[idx] + ' 起'
    tooltip.visible = true
  }
}

const handleSubChartHover = (e: MouseEvent, series: { name: string, data: number[] }) => {
  const svg = (e.currentTarget as SVGElement)
  const rect = svg.getBoundingClientRect()
  const ratio = (e.clientX - rect.left) / rect.width
  const idx = Math.round(ratio * (series.data.length - 1))
  if (idx >= 0 && idx < series.data.length) {
    tooltip.x = e.clientX
    tooltip.y = rect.top
    tooltip.title = series.name
    tooltip.value = series.data[idx] + ' 起'
    tooltip.visible = true
  }
}

const getDateStr = (daysAgo: number) => {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

// 主图折线点
const mainLinePoints = computed(() => {
  const max = 120
  return trendData.value.map((v, i) => {
    const x = (i / (trendData.value.length - 1)) * svgWidth
    const y = svgHeight - (v / max) * svgHeight
    return `${x},${y}`
  }).join(' ')
})

// 主图填充区域点
const mainFillPoints = computed(() => {
  const max = 120
  const points = trendData.value.map((v, i) => {
    const x = (i / (trendData.value.length - 1)) * svgWidth
    const y = svgHeight - (v / max) * svgHeight
    return `${x},${y}`
  })
  points.push(`${svgWidth},${svgHeight}`)
  points.push(`0,${svgHeight}`)
  return points.join(' ')
})

// 主图数据点（用于圆圈显示，只取X轴标签对应的位置）
const mainDataPoints = computed(() => {
  const max = 120
  const indices = [0, 15, 30, 45, 60, 75, 89] // 对应X轴标签位置
  return indices.map(i => ({
    x: (i / (trendData.value.length - 1)) * svgWidth,
    y: svgHeight - (trendData.value[i] / max) * svgHeight
  }))
})

// 子图折线点
const getSubPoints = (data: number[]) => {
  const max = 40
  return data.map((v, i) => {
    const x = (i / (data.length - 1)) * svgWidth
    const y = svgHeight - (v / max) * svgHeight
    return `${x},${y}`
  }).join(' ')
}

// 子图数据点（用于圆圈显示）
const getSubDataPoints = (data: number[]) => {
  const max = 40
  return data.map((v, i) => ({
    x: (i / (data.length - 1)) * svgWidth,
    y: svgHeight - (v / max) * svgHeight
  }))
}

const stageCompare = ref([
  { name: '通用', color: '#1890ff', data: [10, 15, 12, 18, 14, 20, 16, 22, 18, 25, 20, 28, 22, 30, 25, 32, 28, 35, 30, 38] },
  { name: '基础', color: '#52c41a', data: [8, 10, 12, 14, 11, 16, 13, 18, 15, 20, 17, 22, 19, 24, 21, 26, 23, 28, 25, 30] },
  { name: '主体', color: '#faad14', data: [15, 18, 16, 20, 18, 22, 20, 24, 22, 26, 24, 28, 26, 30, 28, 32, 30, 34, 32, 36] },
  { name: '装修', color: '#722ed1', data: [6, 8, 7, 10, 8, 12, 10, 14, 12, 16, 14, 18, 16, 20, 18, 22, 20, 24, 22, 26] }
])

const typeCompare = ref([
  { name: '未戴安全帽', color: '#ff4d4f', data: [5, 8, 6, 10, 7, 12, 9, 14, 11, 16, 13, 18, 15, 20, 17, 22, 19, 24, 21, 26] },
  { name: '临边防护', color: '#faad14', data: [3, 5, 4, 6, 5, 8, 6, 10, 7, 12, 9, 14, 11, 16, 13, 18, 15, 20, 17, 22] },
  { name: '电焊不规范', color: '#1890ff', data: [2, 4, 3, 5, 4, 6, 5, 8, 6, 10, 7, 12, 9, 14, 11, 16, 13, 18, 15, 20] },
  { name: '外架堆物', color: '#52c41a', data: [1, 2, 2, 3, 2, 4, 3, 5, 4, 6, 5, 8, 6, 10, 7, 12, 9, 14, 11, 16] }
])

const periodData = ref([
  { label: '本周发现', value: 586, unit: '起', change: '14.5%', up: true, icon: CalendarOutlined, iconBg: '#e6f7ff', iconColor: '#1890ff', valueColor: '#1890ff' },
  { label: '上周发现', value: 512, unit: '起', change: '', up: true, icon: ClockCircleOutlined, iconBg: '#f6ffed', iconColor: '#52c41a', valueColor: '#52c41a' },
  { label: '环比变化', value: 14.5, unit: '%', change: '', up: true, icon: RiseOutlined, iconBg: '#fff7e6', iconColor: '#fa8c16', valueColor: '#fa8c16' },
  { label: '本月发现', value: 1247, unit: '起', change: '13.1%', up: true, icon: FireOutlined, iconBg: '#fff2f0', iconColor: '#ff4d4f', valueColor: '#ff4d4f' },
  { label: '上月发现', value: 1103, unit: '起', change: '', up: false, icon: ThunderboltOutlined, iconBg: '#f9f0ff', iconColor: '#722ed1', valueColor: '#722ed1' }
])
</script>

<style scoped lang="scss">
.trend-page {
  padding: 0;

  .filter-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .main-chart {
    position: relative;
    padding-bottom: 24px;

    .x-labels {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 24px;

      span {
        position: absolute;
        transform: translateX(-50%);
        font-size: 11px;
        color: #999;
      }
    }
  }

  .sub-chart {
    .legend-bar {
      display: flex;
      gap: 16px;
      margin-bottom: 12px;
      flex-wrap: wrap;

      .legend-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: #666;

        i {
          display: inline-block;
          width: 16px;
          height: 3px;
          border-radius: 1px;
        }
      }
    }

    .x-labels {
      position: relative;
      height: 24px;
      margin-top: 4px;

      span {
        position: absolute;
        transform: translateX(-50%);
        font-size: 11px;
        color: #999;
      }
    }
  }

  .period-cards {
    display: flex;
    gap: 16px;

    .period-card {
      flex: 1;
      background: #fafafa;
      border-radius: 8px;
      padding: 20px 16px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;

      .period-icon {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .period-label { font-size: 13px; color: #666; }
      .period-value { font-size: 24px; font-weight: 600; .unit { font-size: 12px; color: #999; margin-left: 2px; } }
      .period-change { font-size: 12px; &.up { color: #52c41a; } &.down { color: #ff4d4f; } }
    }
  }
}

.chart-tooltip {
  position: fixed;
  transform: translate(-50%, -100%);
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 12px;
  pointer-events: none;
  z-index: 9999;
  white-space: nowrap;
  margin-top: -8px;

  .tooltip-title { color: rgba(255, 255, 255, 0.65); font-size: 11px; margin-bottom: 2px; }
  .tooltip-value { font-weight: 600; font-size: 13px; }
}
</style>
