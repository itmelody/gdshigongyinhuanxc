<template>
  <div class="efficiency-page">
    <!-- 筛选 -->
    <a-card :bordered="false" class="filter-card">
      <a-row justify="space-between" align="middle">
        <a-col>
          <a-space size="large">
            <a-select v-model:value="timeRange" style="width: 120px">
              <a-select-option value="today">今天</a-select-option>
              <a-select-option value="7">近7天</a-select-option>
              <a-select-option value="30">近30天</a-select-option>
              <a-select-option value="90">近90天</a-select-option>
            </a-select>
            <a-select v-model:value="projectFilter" placeholder="全部项目" style="width: 120px" allow-clear>
              <a-select-option value="滨江">滨江项目</a-select-option>
              <a-select-option value="钱塘">钱塘项目</a-select-option>
              <a-select-option value="余杭">余杭项目</a-select-option>
            </a-select>
            <a-select v-model:value="levelFilter" placeholder="全部等级" style="width: 120px" allow-clear>
              <a-select-option value="重大">重大</a-select-option>
              <a-select-option value="较大">较大</a-select-option>
              <a-select-option value="一般">一般</a-select-option>
            </a-select>
          </a-space>
        </a-col>
        <a-col>
          <a-button type="primary">导出报表</a-button>
        </a-col>
      </a-row>
    </a-card>

    <!-- 效能指标卡 -->
    <div class="kpi-row">
      <div class="kpi-card" v-for="kpi in kpiData" :key="kpi.label">
        <div class="kpi-icon" :style="{ background: kpi.iconBg }">
          <component :is="kpi.icon" :style="{ color: kpi.iconColor, fontSize: '22px' }" />
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

    <!-- 各环节耗时分解 -->
    <a-card :bordered="false" title="处置各环节耗时分解（按等级）" style="margin-top: 16px">
      <div class="stacked-bars">
        <div class="stacked-item" v-for="item in stackedData" :key="item.level">
          <div class="stacked-label">
            <span class="level-tag" :style="{ color: item.color }">{{ item.level }}</span>
          </div>
          <div class="stacked-bar-wrap">
            <div class="stacked-bar">
              <div class="bar-segment" v-for="(seg, idx) in item.segments" :key="idx" :style="{ width: seg.width + '%', background: seg.color }" @mouseenter="showTooltip($event, item.level + ' - ' + seg.label, seg.value)" @mouseleave="hideTooltip"></div>
            </div>
          </div>
          <div class="stacked-info">
            <span v-for="(seg, idx) in item.segments" :key="idx" class="seg-info">
              <span class="seg-dot" :style="{ background: seg.color }"></span>
              {{ seg.label }} {{ seg.value }}
            </span>
            <span class="total">总计 {{ item.total }}</span>
          </div>
        </div>
      </div>
    </a-card>

    <!-- 时长趋势 + 超时分析 -->
    <a-row :gutter="16" style="margin-top: 16px" class="equal-row">
      <a-col :span="12" class="equal-col">
        <a-card :bordered="false" title="处置时长趋势（近30天）" class="stretch-card">
          <div class="trend-chart">
            <div class="y-axis">
              <span class="y-label">4h</span><span class="y-label">3h</span><span class="y-label">2h</span><span class="y-label">1h</span><span class="y-label">0</span>
            </div>
            <div class="chart-body">
              <div class="chart-grid">
                <div class="grid-line" v-for="i in 5" :key="i"></div>
              </div>
              <div class="chart-line">
                <svg viewBox="0 0 100 50" preserveAspectRatio="none" class="line-svg" @mousemove="handleLineHover" @mouseleave="hideTooltip">
                  <polyline :points="efficiencyTrendPoints" fill="none" stroke="#1890ff" stroke-width="0.5" vector-effect="non-scaling-stroke" />
                  <rect x="0" y="0" width="100" height="50" fill="transparent" />
                </svg>
              </div>
              <div class="x-axis">
                <span class="x-label" v-for="(label, idx) in xAxisLabels" :key="idx" :style="{ left: label.pos + '%' }">{{ label.text }}</span>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="12" class="equal-col">
        <a-card :bordered="false" title="超时分析" class="stretch-card">
          <div class="timeout-analysis">
            <div class="timeout-stats">
              <div class="timeout-item">
                <div class="timeout-label">超时隐患</div>
                <div class="timeout-value">23 <span class="unit">起</span></div>
              </div>
              <div class="timeout-item">
                <div class="timeout-label">超时率</div>
                <div class="timeout-value">6.8<span class="unit">%</span></div>
                <div class="timeout-change down">↓ 较上期-1.2%</div>
              </div>
            </div>
            <div class="timeout-reasons">
              <div class="reason-title">超时原因 TOP3</div>
              <div class="reason-list">
                <div class="reason-item" v-for="(reason, idx) in timeoutReasons" :key="idx" @mouseenter="showTooltip($event, reason.name, reason.percent + '%')" @mouseleave="hideTooltip">
                  <span class="reason-rank">#{{ idx + 1 }}</span>
                  <span class="reason-name">{{ reason.name }}</span>
                  <div class="reason-bar-wrap">
                    <div class="reason-bar" :style="{ width: reason.percent + '%' }"></div>
                  </div>
                  <span class="reason-percent">{{ reason.percent }}%</span>
                </div>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 项目处置效率排名 -->
    <a-card :bordered="false" title="各项目处置效率排名" style="margin-top: 16px">
      <div class="project-ranking">
        <div class="ranking-item" v-for="(item, idx) in projectRank" :key="item.name" @mouseenter="showTooltip($event, item.name, item.hours + 'h')" @mouseleave="hideTooltip">
          <span class="ranking-badge" :style="{ background: getBadgeColor(idx) }">{{ idx + 1 }}</span>
          <span class="ranking-name">{{ item.name }}</span>
          <div class="ranking-bar-wrap">
            <div class="ranking-bar" :style="{ width: item.percent + '%', background: getBarColor(idx) }"></div>
          </div>
          <span class="ranking-value">{{ item.hours }}h</span>
        </div>
      </div>
    </a-card>
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
  ClockCircleOutlined, CheckCircleOutlined, ArrowUpOutlined, ArrowDownOutlined,
  FieldTimeOutlined, WarningOutlined
} from '@ant-design/icons-vue'

const timeRange = ref('30')
const projectFilter = ref<string>()
const levelFilter = ref<string>()

const kpiData = ref([
  { label: '平均闭环时长', value: 2.3, suffix: '小时', change: '较上期-0.5h', up: false, icon: ClockCircleOutlined, iconBg: '#fff7e6', iconColor: '#fa8c16', valueColor: '#fa8c16' },
  { label: '最短闭环', value: 0.5, suffix: '小时', change: '-', up: true, icon: CheckCircleOutlined, iconBg: '#f6ffed', iconColor: '#52c41a', valueColor: '#52c41a' },
  { label: '最长闭环', value: 8.2, suffix: '小时', change: '-', up: false, icon: FieldTimeOutlined, iconBg: '#fff2f0', iconColor: '#ff4d4f', valueColor: '#ff4d4f' },
  { label: '目标达标率', value: 87.5, suffix: '%', change: '较上期+5.2%', up: true, icon: CheckCircleOutlined, iconBg: '#f6ffed', iconColor: '#52c41a', valueColor: '#52c41a' }
])

const stackedData = ref([
  {
    level: '重大', color: '#ff4d4f', total: '1.9h',
    segments: [
      { label: '派单', value: '0.3h', width: 16, color: '#91d5ff' },
      { label: '整改', value: '1.2h', width: 63, color: '#69c0ff' },
      { label: '复核', value: '0.4h', width: 21, color: '#40a9ff' }
    ]
  },
  {
    level: '较大', color: '#faad14', total: '2.5h',
    segments: [
      { label: '派单', value: '0.2h', width: 8, color: '#91d5ff' },
      { label: '整改', value: '1.8h', width: 72, color: '#69c0ff' },
      { label: '复核', value: '0.5h', width: 20, color: '#40a9ff' }
    ]
  },
  {
    level: '一般', color: '#52c41a', total: '2.9h',
    segments: [
      { label: '派单', value: '0.1h', width: 3, color: '#91d5ff' },
      { label: '整改', value: '2.2h', width: 76, color: '#69c0ff' },
      { label: '复核', value: '0.6h', width: 21, color: '#40a9ff' }
    ]
  }
])

const efficiencyTrend = ref([
  2.5, 2.8, 2.6, 2.3, 2.7, 2.4, 2.2, 2.5, 2.3, 2.1, 2.4, 2.2, 2.0, 2.3, 2.1, 1.9, 2.2, 2.0, 1.8, 2.1,
  1.9, 1.7, 2.0, 1.8, 1.6, 1.9, 1.7, 1.5, 1.8, 1.6
])

const efficiencyTrendPoints = computed(() => {
  const max = 4
  return efficiencyTrend.value.map((v, i) => {
    const x = (i / (efficiencyTrend.value.length - 1)) * 100
    const y = 50 - (v / max) * 50
    return `${x},${y}`
  }).join(' ')
})

const xAxisLabels = computed(() => [
  { text: '6/01', pos: 0 }, { text: '6/05', pos: 13 },
  { text: '6/10', pos: 27 }, { text: '6/15', pos: 40 },
  { text: '6/20', pos: 53 }, { text: '6/24', pos: 67 }
])

const timeoutReasons = ref([
  { name: '整改资源不足', percent: 35 },
  { name: '审批流程延迟', percent: 28 },
  { name: '技术难度高', percent: 22 }
])

const projectRank = ref([
  { name: '滨江项目', hours: 1.8, percent: 30 },
  { name: '钱塘项目', hours: 2.1, percent: 45 },
  { name: '余杭项目', hours: 2.5, percent: 60 },
  { name: '萧山项目', hours: 3.2, percent: 80 }
])

const getBadgeColor = (idx: number) => {
  const colors = ['#ff4d4f', '#faad14', '#faad14', '#1890ff', '#1890ff']
  return colors[idx] || '#1890ff'
}

const getBarColor = (idx: number) => {
  const colors = ['#52c41a', '#52c41a', '#faad14', '#faad14', '#faad14']
  return colors[idx] || '#faad14'
}

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

// 折线图悬停
const handleLineHover = (e: MouseEvent) => {
  const svg = (e.currentTarget as SVGElement)
  const rect = svg.getBoundingClientRect()
  const ratio = (e.clientX - rect.left) / rect.width
  const idx = Math.round(ratio * (efficiencyTrend.value.length - 1))
  if (idx >= 0 && idx < efficiencyTrend.value.length) {
    const dayOffset = efficiencyTrend.value.length - 1 - idx
    const d = new Date()
    d.setDate(d.getDate() - dayOffset)
    tooltip.x = e.clientX
    tooltip.y = rect.top
    tooltip.title = `${d.getMonth() + 1}/${d.getDate()}`
    tooltip.value = efficiencyTrend.value[idx] + 'h'
    tooltip.visible = true
  }
}
</script>

<style scoped lang="scss">
.efficiency-page {
  .filter-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .kpi-row {
    display: flex;
    gap: 12px;
    margin-top: 16px;
    flex-wrap: wrap;

    .kpi-card {
      flex: 1 1 calc(25% - 12px);
      min-width: 200px;
      display: flex;
      align-items: center;
      gap: 12px;
      background: #fff;
      border-radius: 8px;
      padding: 14px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      transition: all 0.3s ease;

      &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }

      .kpi-icon { width: 44px; height: 44px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
      .kpi-info {
        flex: 1;
        .kpi-label { font-size: 12px; color: #666; margin-bottom: 2px; }
        .kpi-value { font-size: 22px; font-weight: 600; line-height: 1; margin-bottom: 2px; .kpi-suffix { font-size: 11px; font-weight: 400; color: #999; margin-left: 4px; } }
        .kpi-trend { font-size: 11px; display: flex; align-items: center; gap: 2px; &.up { color: #52c41a; } &.down { color: #1890ff; } }
      }
    }
  }

  .stacked-bars {
    .stacked-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;

      .stacked-label { width: 50px; .level-tag { font-weight: 600; } }
      .stacked-bar-wrap { flex: 1; }
      .stacked-bar { display: flex; height: 24px; border-radius: 4px; overflow: hidden; background: #f0f0f0; }
      .bar-segment { transition: all 0.3s; cursor: pointer; &:hover { opacity: 0.8; } }
      .stacked-info {
        display: flex;
        gap: 12px;
        font-size: 12px;
        width: 280px;
        .seg-info { display: flex; align-items: center; gap: 4px; .seg-dot { width: 8px; height: 8px; border-radius: 50%; } }
        .total { margin-left: auto; font-weight: 500; }
      }
    }
  }

  .equal-row { display: flex; align-items: stretch; }
  .equal-col { display: flex; flex-direction: column; }
  .stretch-card { flex: 1; display: flex; flex-direction: column; :deep(.ant-card-body) { flex: 1; display: flex; flex-direction: column; } }

  .trend-chart {
    display: flex;
    gap: 8px;
    flex: 1;
    min-height: 200px;

    .y-axis { display: flex; flex-direction: column; justify-content: space-between; padding-bottom: 28px; .y-label { font-size: 11px; color: #999; line-height: 1; } }
    .chart-body {
      flex: 1;
      position: relative;
      .chart-grid { position: absolute; top: 0; left: 0; right: 0; bottom: 28px; display: flex; flex-direction: column; justify-content: space-between; pointer-events: none; .grid-line { border-top: 1px dashed #f0f0f0; } }
      .chart-line { flex: 1; position: relative; z-index: 1; height: calc(100% - 28px); .line-svg { width: 100%; height: 100%; } }
      .x-axis { position: relative; height: 28px; border-top: 1px solid #f0f0f0; .x-label { position: absolute; bottom: 4px; transform: translateX(-50%); font-size: 11px; color: #999; } }
    }
  }

  .timeout-analysis {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;

    .timeout-stats {
      display: flex;
      gap: 24px;
      .timeout-item {
        .timeout-label { font-size: 13px; color: #666; margin-bottom: 4px; }
        .timeout-value { font-size: 28px; font-weight: 600; color: #ff4d4f; .unit { font-size: 14px; color: #999; } }
        .timeout-change { font-size: 12px; margin-top: 4px; &.down { color: #52c41a; } }
      }
    }

    .timeout-reasons {
      .reason-title { font-weight: 500; margin-bottom: 12px; }
      .reason-list {
        .reason-item {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
          .reason-rank { width: 20px; font-weight: 600; color: #666; }
          .reason-name { width: 100px; font-size: 13px; }
          .reason-bar-wrap { flex: 1; height: 8px; background: #f0f0f0; border-radius: 4px; }
          .reason-bar { height: 100%; background: #ff7875; border-radius: 4px; }
          .reason-percent { width: 40px; text-align: right; font-size: 13px; }
        }
      }
    }
  }

  .project-ranking {
    .ranking-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;

      .ranking-badge {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
      }
      .ranking-name { width: 80px; font-size: 13px; }
      .ranking-bar-wrap { flex: 1; height: 12px; background: #f0f0f0; border-radius: 6px; }
      .ranking-bar { height: 100%; border-radius: 6px; }
      .ranking-value { width: 40px; text-align: right; font-weight: 500; }
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
