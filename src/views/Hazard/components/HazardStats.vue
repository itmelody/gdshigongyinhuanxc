<template>
  <div class="hazard-stats">
    <!-- 筛选栏 -->
    <a-card :bordered="false" class="filter-card">
      <a-row justify="space-between" align="middle">
        <a-col>
          <a-space>
            <a-select v-model:value="timeRange" style="width: 120px">
              <a-select-option value="7">近7天</a-select-option>
              <a-select-option value="30">近30天</a-select-option>
              <a-select-option value="90">近90天</a-select-option>
            </a-select>
            <a-select v-model:value="projectFilter" placeholder="全部项目" style="width: 120px" allow-clear>
              <a-select-option value="滨江">滨江项目</a-select-option>
              <a-select-option value="钱塘">钱塘项目</a-select-option>
              <a-select-option value="余杭">余杭项目</a-select-option>
            </a-select>
            <a-select v-model:value="stageFilter" placeholder="全部阶段" style="width: 120px" allow-clear>
              <a-select-option value="通用">通用</a-select-option>
              <a-select-option value="基础">基础</a-select-option>
              <a-select-option value="主体">主体</a-select-option>
              <a-select-option value="装修">装修</a-select-option>
            </a-select>
          </a-space>
        </a-col>
        <a-col>
          <a-button type="primary" @click="exportReport">导出报表</a-button>
        </a-col>
      </a-row>
    </a-card>

    <!-- 核心指标卡 -->
    <div class="kpi-row">
      <div class="kpi-card" v-for="kpi in kpiData" :key="kpi.label">
        <div class="kpi-icon" :style="{ background: kpi.iconBg }">
          <component :is="kpi.icon" :style="{ color: kpi.iconColor, fontSize: '24px' }" />
        </div>
        <div class="kpi-info">
          <div class="kpi-label">{{ kpi.label }}</div>
          <div class="kpi-value" :style="{ color: kpi.valueColor }">
            {{ kpi.value }}<span class="kpi-suffix">{{ kpi.suffix }}</span>
          </div>
          <div class="kpi-trend" :class="kpi.up ? 'up' : 'down'">
            <component :is="kpi.up ? ArrowUpOutlined : ArrowDownOutlined" />
            {{ kpi.change }}
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <a-row :gutter="16" style="margin-top: 16px" class="equal-row">
      <a-col :span="12" class="equal-col">
        <a-card :bordered="false" title="隐患发现趋势（近30天）" class="stretch-card">
          <div class="chart-placeholder trend-chart">
            <div class="y-axis">
              <span class="y-label" v-for="val in yAxisLabels" :key="val">{{ val }}</span>
            </div>
            <div class="chart-body">
              <div class="chart-grid">
                <div class="grid-line" v-for="val in yAxisLabels" :key="val"></div>
              </div>
              <div class="chart-bars">
                <div class="chart-bar" v-for="(val, idx) in trendData" :key="idx" :style="{ height: val + '%' }" @mouseenter="showTooltip($event, `${30 - idx}日`, Math.round(val * 0.8) + ' 起')" @mouseleave="hideTooltip">
                  <span class="bar-value">{{ Math.round(val * 0.8) }}</span>
                </div>
              </div>
              <div class="x-axis">
                <span class="x-label" v-for="(label, idx) in xAxisLabels" :key="idx" :style="{ left: label.pos + '%' }">{{ label.text }}</span>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="12" class="equal-col">
        <a-card :bordered="false" title="隐患类型 TOP10" class="stretch-card">
          <div class="top-list">
            <div class="top-item" v-for="(item, idx) in topTypes" :key="idx" @mouseenter="showTooltip($event, item.name, item.count + ' 起')" @mouseleave="hideTooltip">
              <span class="rank">#{{ idx + 1 }}</span>
              <span class="type-name">{{ item.name }}</span>
              <div class="bar-wrap">
                <div class="bar-fill" :style="{ width: item.percent + '%' }"></div>
              </div>
              <span class="count">{{ item.count }}</span>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" style="margin-top: 16px" class="equal-row">
      <a-col :span="12" class="equal-col">
        <a-card :bordered="false" title="阶段隐患分布" class="stretch-card">
          <div class="radar-chart">
            <svg viewBox="0 0 360 360" class="radar-svg">
              <!-- 网格 -->
              <g class="radar-grid">
                <polygon v-for="level in [0.25, 0.5, 0.75, 1]" :key="level"
                  :points="getRadarPoints(level)"
                  fill="none" stroke="#f0f0f0" stroke-width="1" />
              </g>
              <!-- 轴线 -->
              <g class="radar-axes">
                <line v-for="(item, idx) in stageData" :key="idx"
                  x1="150" y1="150"
                  :x2="getAxisEnd(idx).x" :y2="getAxisEnd(idx).y"
                  stroke="#f0f0f0" stroke-width="1" />
              </g>
              <!-- 数据区域 -->
              <polygon
                :points="getDataPoints()"
                fill="rgba(24, 144, 255, 0.2)"
                stroke="#1890ff" stroke-width="2" />
              <!-- 数据点 -->
              <circle v-for="(item, idx) in stageData" :key="idx"
                :cx="getDataPoint(idx).x" :cy="getDataPoint(idx).y"
                r="6" fill="#1890ff" class="radar-point"
                @mouseenter="showTooltip($event, item.name, item.percent + '%')"
                @mouseleave="hideTooltip" />
              <!-- 标签 -->
              <text v-for="(item, idx) in stageData" :key="idx"
                :x="getLabelPos(idx).x" :y="getLabelPos(idx).y"
                class="radar-label" text-anchor="middle" dominant-baseline="middle">
                {{ item.name }} {{ item.percent }}%
              </text>
            </svg>
          </div>
        </a-card>
      </a-col>
      <a-col :span="12" class="equal-col">
        <a-card :bordered="false" title="处置效率分析" class="stretch-card">
          <div class="efficiency-list">
            <div class="eff-item" v-for="item in efficiencyData" :key="item.label" @mouseenter="showTooltip($event, item.label, item.value)" @mouseleave="hideTooltip">
              <span class="eff-label">{{ item.label }}</span>
              <div class="eff-bar-wrap">
                <div class="eff-bar" :style="{ width: item.percent + '%', background: item.color }"></div>
              </div>
              <span class="eff-value">{{ item.value }}</span>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 底部：排名 + 等级 + 来源 -->
    <a-row :gutter="16" style="margin-top: 16px" class="equal-row">
      <a-col :span="8" class="equal-col">
        <a-card :bordered="false" title="项目隐患排名" class="stretch-card">
          <div class="rank-list">
            <div v-for="(p, idx) in projectRank" :key="idx" class="rank-item" :class="{ 'rank-top': idx < 3 }">
              <span class="rank-badge" :class="'rank-' + (idx + 1)">{{ idx + 1 }}</span>
              <span class="rank-name">{{ p.name }}</span>
              <span class="rank-count">{{ p.count }} 起</span>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="8" class="equal-col">
        <a-card :bordered="false" title="等级分布" class="stretch-card">
          <div class="pie-chart-container">
            <svg viewBox="0 0 200 200" class="pie-svg">
              <circle v-for="(item, idx) in levelDist" :key="idx"
                :cx="100" :cy="100" r="70"
                fill="none"
                :stroke="item.color"
                stroke-width="30"
                :stroke-dasharray="getPieArc(item.percent)"
                :stroke-dashoffset="getPieOffset(idx, levelDist)"
                transform="rotate(-90 100 100)"
                class="donut-segment"
                @mouseenter="showTooltip($event, item.label, item.percent + '%')"
                @mouseleave="hideTooltip"
                style="transition: all 0.3s" />
            </svg>
            <div class="pie-legend">
              <div v-for="item in levelDist" :key="item.label" class="legend-item">
                <span class="legend-dot" :style="{ background: item.color }"></span>
                <span>{{ item.label }} {{ item.percent }}%</span>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="8" class="equal-col">
        <a-card :bordered="false" title="来源分布" class="stretch-card">
          <div class="pie-chart-container">
            <svg viewBox="0 0 200 200" class="pie-svg">
              <circle v-for="(item, idx) in sourceDist" :key="idx"
                :cx="100" :cy="100" r="70"
                fill="none"
                :stroke="item.color"
                stroke-width="30"
                :stroke-dasharray="getPieArc(item.percent)"
                :stroke-dashoffset="getPieOffset(idx, sourceDist)"
                transform="rotate(-90 100 100)"
                class="donut-segment"
                @mouseenter="showTooltip($event, item.label, item.percent + '%')"
                @mouseleave="hideTooltip"
                style="transition: all 0.3s" />
            </svg>
            <div class="pie-legend">
              <div v-for="item in sourceDist" :key="item.label" class="legend-item">
                <span class="legend-dot" :style="{ background: item.color }"></span>
                <span>{{ item.label }} {{ item.percent }}%</span>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 全局 Tooltip -->
    <div v-if="tooltip.visible" class="chart-tooltip" :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
      <div class="tooltip-title">{{ tooltip.title }}</div>
      <div class="tooltip-value">{{ tooltip.value }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import {
  DatabaseOutlined,
  CheckCircleOutlined,
  PieChartOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons-vue'

const timeRange = ref('30')
const projectFilter = ref<string>()
const stageFilter = ref<string>()

const kpiData = ref([
  { label: '隐患总数', value: 1247, suffix: '起', change: '较上期+12%', up: true, icon: DatabaseOutlined, iconBg: '#f0f5ff', iconColor: '#1677ff', valueColor: '#1677ff' },
  { label: '已闭环', value: 1021, suffix: '起', change: '较上期+15%', up: true, icon: CheckCircleOutlined, iconBg: '#f6ffed', iconColor: '#52c41a', valueColor: '#52c41a' },
  { label: '闭环率', value: 81.9, suffix: '%', change: '2.1%', up: true, icon: PieChartOutlined, iconBg: '#e6f7ff', iconColor: '#13c2c2', valueColor: '#13c2c2' },
  { label: '平均处置', value: 2.3, suffix: '小时', change: '0.5h', up: false, icon: ClockCircleOutlined, iconBg: '#fff7e6', iconColor: '#fa8c16', valueColor: '#fa8c16' },
  { label: '超时率', value: 6.8, suffix: '%', change: '1.2%', up: false, icon: ExclamationCircleOutlined, iconBg: '#fff2f0', iconColor: '#ff4d4f', valueColor: '#ff4d4f' }
])

const trendData = ref([30, 45, 55, 40, 65, 75, 50, 60, 80, 70, 55, 45, 60, 75, 85, 70, 60, 50, 65, 70, 55, 40, 60, 75, 80, 65, 50, 55, 60, 45])

const yAxisLabels = [100, 80, 60, 40, 20, 0]

const xAxisLabels = computed(() => {
  const labels = []
  const total = trendData.value.length
  const step = Math.floor(total / 6)
  for (let i = 0; i < total; i += step) {
    const day = 30 - i
    labels.push({ text: `${day}日`, pos: (i / total) * 100 })
  }
  return labels
})

const topTypes = ref([
  { name: '未佩戴安全帽', count: 32, percent: 100 },
  { name: '临边防护缺失', count: 18, percent: 56 },
  { name: '电焊不规范', count: 15, percent: 47 },
  { name: '外架堆物', count: 12, percent: 38 },
  { name: '吊篮超员', count: 8, percent: 25 },
  { name: '圆盘锯防护缺失', count: 6, percent: 19 },
  { name: '管线拖地', count: 5, percent: 16 },
  { name: '安全通道堆物', count: 4, percent: 13 }
])

const stageData = ref([
  { name: '通用', percent: 28, color: '#1890ff' },
  { name: '基础', percent: 18, color: '#52c41a' },
  { name: '主体', percent: 34, color: '#faad14' },
  { name: '装修', percent: 20, color: '#722ed1' }
])

// 雷达图辅助函数
const RADAR_CENTER = { x: 180, y: 180 }
const RADAR_RADIUS = 100
const RADAR_MAX_VALUE = 40 // 最大刻度值

const getAngle = (idx: number) => {
  const total = stageData.value.length
  return (idx * 2 * Math.PI) / total - Math.PI / 2
}

const getRadarPoints = (level: number) => {
  const points = []
  for (let i = 0; i < stageData.value.length; i++) {
    const angle = getAngle(i)
    const x = RADAR_CENTER.x + RADAR_RADIUS * level * Math.cos(angle)
    const y = RADAR_CENTER.y + RADAR_RADIUS * level * Math.sin(angle)
    points.push(`${x},${y}`)
  }
  return points.join(' ')
}

const getAxisEnd = (idx: number) => {
  const angle = getAngle(idx)
  return {
    x: RADAR_CENTER.x + RADAR_RADIUS * Math.cos(angle),
    y: RADAR_CENTER.y + RADAR_RADIUS * Math.sin(angle)
  }
}

const getDataPoint = (idx: number) => {
  const angle = getAngle(idx)
  const value = stageData.value[idx].percent
  const radius = (value / RADAR_MAX_VALUE) * RADAR_RADIUS
  return {
    x: RADAR_CENTER.x + radius * Math.cos(angle),
    y: RADAR_CENTER.y + radius * Math.sin(angle)
  }
}

const getDataPoints = () => {
  return stageData.value.map((_, idx) => {
    const point = getDataPoint(idx)
    return `${point.x},${point.y}`
  }).join(' ')
}

const getLabelPos = (idx: number) => {
  const angle = getAngle(idx)
  const labelRadius = RADAR_RADIUS + 30
  return {
    x: RADAR_CENTER.x + labelRadius * Math.cos(angle),
    y: RADAR_CENTER.y + labelRadius * Math.sin(angle)
  }
}

const efficiencyData = ref([
  { label: '平均派单', value: '0.5分钟', percent: 5, color: '#52c41a' },
  { label: '平均整改', value: '1.8小时', percent: 60, color: '#1890ff' },
  { label: '平均复核', value: '0.5小时', percent: 20, color: '#faad14' },
  { label: '平均闭环', value: '2.3小时', percent: 77, color: '#722ed1' }
])

const projectRank = ref([
  { name: '滨江项目', count: 247 },
  { name: '钱塘项目', count: 198 },
  { name: '余杭项目', count: 156 },
  { name: '萧山项目', count: 132 },
  { name: '临平项目', count: 98 }
])

const levelDist = ref([
  { label: '重大', percent: 12, color: '#ff4d4f' },
  { label: '较大', percent: 28, color: '#fa8c16' },
  { label: '一般', percent: 60, color: '#fadb14' }
])

const sourceDist = ref([
  { label: 'AI识别', percent: 89, color: '#1890ff' },
  { label: '随手拍', percent: 8, color: '#52c41a' },
  { label: '人工上报', percent: 3, color: '#722ed1' }
])

const exportReport = () => { message.success('报表导出成功') }

// Tooltip 状态
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  title: '',
  value: ''
})

const showTooltip = (event: MouseEvent, title: string, value: string) => {
  const rect = (event.target as HTMLElement).getBoundingClientRect()
  tooltip.value = {
    visible: true,
    x: rect.left + rect.width / 2,
    y: rect.top - 10,
    title,
    value
  }
}

const hideTooltip = () => {
  tooltip.value.visible = false
}

// 饼图辅助函数
const CIRCUMFERENCE = 2 * Math.PI * 70 // r=70

const getPieArc = (percent: number) => {
  return `${(percent / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`
}

const getPieOffset = (idx: number, data: any[]) => {
  let offset = 0
  for (let i = 0; i < idx; i++) {
    offset += (data[i].percent / 100) * CIRCUMFERENCE
  }
  return -offset
}
</script>

<style scoped lang="scss">
.hazard-stats {
  .filter-card { border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); }

  .equal-row {
    display: flex;
    align-items: stretch;

    .equal-col {
      display: flex;
      flex-direction: column;

      .stretch-card {
        flex: 1;
        display: flex;
        flex-direction: column;

        :deep(.ant-card-body) {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
      }
    }
  }

  .kpi-row {
    display: flex;
    gap: 16px;
    margin-top: 16px;

    .kpi-card {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 12px;
      background: #fff;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .kpi-icon {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .kpi-info {
        flex: 1;
        min-width: 0;

        .kpi-label {
          font-size: 13px;
          color: #666;
          margin-bottom: 4px;
        }

        .kpi-value {
          font-size: 24px;
          font-weight: 600;
          line-height: 1;
          margin-bottom: 4px;

          .kpi-suffix {
            font-size: 12px;
            font-weight: 400;
            color: #999;
            margin-left: 4px;
          }
        }

        .kpi-trend {
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;

          &.up { color: #52c41a; }
          &.down { color: #1890ff; }
        }
      }
    }
  }
  .trend-chart {
    display: flex;
    gap: 8px;
    flex: 1;
    min-height: 120px;

    .y-axis {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding-bottom: 24px;

      .y-label {
        font-size: 11px;
        color: #999;
        line-height: 1;
      }
    }

    .chart-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      position: relative;

      .chart-grid {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 24px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        pointer-events: none;

        .grid-line {
          border-top: 1px dashed #f0f0f0;
          width: 100%;
        }
      }

      .chart-bars {
        display: flex;
        align-items: flex-end;
        gap: 4px;
        flex: 1;
        position: relative;
        z-index: 1;

        .chart-bar {
          flex: 1;
          background: #1890ff;
          border-radius: 2px 2px 0 0;
          min-height: 4px;
          position: relative;

          .bar-value {
            position: absolute;
            top: -16px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 10px;
            color: #666;
            white-space: nowrap;
          }
        }
      }

      .x-axis {
        position: relative;
        height: 24px;
        border-top: 1px solid #f0f0f0;

        .x-label {
          position: absolute;
          bottom: 4px;
          transform: translateX(-50%);
          font-size: 11px;
          color: #999;
        }
      }
    }
  }
  .top-list {
    .top-item {
      display: flex; align-items: center; gap: 8px; margin-bottom: 10px;
      .rank { width: 24px; font-weight: 600; color: #1890ff; }
      .type-name { width: 120px; font-size: 13px; }
      .bar-wrap { flex: 1; height: 8px; background: #f0f0f0; border-radius: 4px; }
      .bar-fill { height: 100%; background: #1890ff; border-radius: 4px; }
      .count { width: 30px; text-align: right; font-size: 13px; }
    }
  }
  .radar-chart {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    min-height: 200px;

    .radar-svg {
      width: 100%;
      max-width: 300px;
      height: auto;

      .radar-label {
        font-size: 12px;
        fill: #666;
      }
    }
  }
  .efficiency-list {
    .eff-item {
      display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
      .eff-label { width: 80px; font-size: 13px; }
      .eff-bar-wrap { flex: 1; height: 12px; background: #f0f0f0; border-radius: 6px; }
      .eff-bar { height: 100%; border-radius: 6px; }
      .eff-value { width: 60px; text-align: right; font-size: 13px; font-weight: 500; }
    }
  }
  .rank-list {
    .rank-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 8px;
      border-bottom: 1px solid #f0f0f0;
      transition: background 0.2s;

      &.rank-top {
        background: #fafafa;
        border-radius: 6px;
        margin-bottom: 4px;
      }

      .rank-badge {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
        color: #fff;
        background: #d9d9d9;

        &.rank-1 { background: #ff4d4f; }
        &.rank-2 { background: #fa8c16; }
        &.rank-3 { background: #faad14; }
      }

      .rank-name {
        flex: 1;
        font-size: 14px;
      }

      .rank-count {
        font-size: 14px;
        font-weight: 600;
        color: #1890ff;
      }
    }
  }

  .pie-chart-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    flex: 1;

    .pie-svg {
      width: 160px;
      height: 160px;
    }

    .pie-legend {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;

      .legend-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;

        .legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
      }
    }
  }

  // 全局 Tooltip
  .chart-tooltip {
    position: fixed;
    transform: translate(-50%, -100%);
    background: rgba(0, 0, 0, 0.85);
    color: #fff;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 13px;
    pointer-events: none;
    z-index: 1000;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

    .tooltip-title {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.75);
      margin-bottom: 4px;
    }

    .tooltip-value {
      font-size: 14px;
      font-weight: 600;
    }
  }

  // 柱状图悬停效果
  .chart-bar {
    cursor: pointer;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.8;
    }
  }

  // TOP10 悬停效果
  .top-item {
    cursor: pointer;
    transition: background 0.2s;
    border-radius: 4px;
    padding: 4px 8px;
    margin: 0 -8px;

    &:hover {
      background: #f5f5f5;
    }
  }

  // 雷达图数据点悬停效果
  .radar-point {
    cursor: pointer;
    transition: r 0.2s;

    &:hover {
      r: 8;
    }
  }

  // 处置效率条悬停效果
  .eff-item {
    cursor: pointer;
    transition: background 0.2s;
    border-radius: 4px;
    padding: 4px 8px;
    margin: 0 -8px;

    &:hover {
      background: #f5f5f5;
    }
  }

  // 环状图扇区悬停效果
  .donut-segment {
    cursor: pointer;
    transition: stroke-width 0.2s;

    &:hover {
      stroke-width: 36;
    }
  }
}
</style>
