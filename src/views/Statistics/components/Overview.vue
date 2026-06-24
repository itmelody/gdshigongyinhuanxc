<template>
  <div class="overview-page">
    <!-- 实时数据动态 -->
    <a-card :bordered="false" class="realtime-card">
      <div class="realtime-header">
        <span class="realtime-title">实时数据动态</span>
      </div>
      <div class="realtime-bar">
        <div class="realtime-item">
          <div class="realtime-icon" style="background: #e6f7ff">
            <VideoCameraOutlined style="color: #1890ff" />
          </div>
          <div class="realtime-info">
            <div class="realtime-label">今日巡检</div>
            <div class="realtime-value" style="color: #1890ff">{{ realtimeData.inspection }}<span class="realtime-unit">次</span></div>
          </div>
        </div>
        <div class="realtime-item">
          <div class="realtime-icon" style="background: #f6ffed">
            <RobotOutlined style="color: #52c41a" />
          </div>
          <div class="realtime-info">
            <div class="realtime-label">AI识别</div>
            <div class="realtime-value" style="color: #52c41a">{{ realtimeData.aiCount }}<span class="realtime-unit">次</span></div>
          </div>
        </div>
        <div class="realtime-item">
          <div class="realtime-icon" style="background: #fff7e6">
            <UserOutlined style="color: #fa8c16" />
          </div>
          <div class="realtime-info">
            <div class="realtime-label">人工巡检</div>
            <div class="realtime-value" style="color: #fa8c16">{{ realtimeData.manualCount }}<span class="realtime-unit">次</span></div>
          </div>
        </div>
        <a-divider type="vertical" style="height: 40px" />
        <div class="realtime-item">
          <div class="realtime-icon" style="background: #fff2f0">
            <ExclamationCircleOutlined style="color: #ff4d4f" />
          </div>
          <div class="realtime-info">
            <div class="realtime-label">发现隐患</div>
            <div class="realtime-value" style="color: #ff4d4f">{{ realtimeData.found }}<span class="realtime-unit">起</span></div>
          </div>
        </div>
        <div class="realtime-item">
          <div class="realtime-icon" style="background: #fffbe6">
            <ClockCircleOutlined style="color: #faad14" />
          </div>
          <div class="realtime-info">
            <div class="realtime-label">待处置</div>
            <div class="realtime-value" style="color: #faad14">{{ realtimeData.pending }}<span class="realtime-unit">起</span></div>
          </div>
        </div>
        <div class="realtime-item">
          <div class="realtime-icon" style="background: #f6ffed">
            <CheckCircleOutlined style="color: #52c41a" />
          </div>
          <div class="realtime-info">
            <div class="realtime-label">已闭环</div>
            <div class="realtime-value" style="color: #52c41a">{{ realtimeData.closed }}<span class="realtime-unit">起</span></div>
          </div>
        </div>
      </div>
    </a-card>

    <!-- 全局筛选 -->
    <a-card :bordered="false" class="filter-card">
      <a-row justify="space-between" align="middle">
        <a-col>
          <a-space size="large">
            <a-select v-model:value="timeRange" style="width: 120px">
              <a-select-option value="today">今天</a-select-option>
              <a-select-option value="yesterday">昨天</a-select-option>
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
          <a-space>
            <a-button type="primary" @click="exportReport">导出报表</a-button>
            <a-button @click="refreshData">刷新</a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- 巡检统计 -->
    <a-card :bordered="false" style="margin-top: 16px">
      <div class="inspection-stats">
        <div class="ins-section">
          <div class="ins-kpi" v-for="kpi in inspectionKpi" :key="kpi.label">
            <div class="ins-icon" :style="{ background: kpi.iconBg }">
              <component :is="kpi.icon" :style="{ color: kpi.iconColor, fontSize: '20px' }" />
            </div>
            <div class="ins-info">
              <div class="ins-label">{{ kpi.label }}</div>
              <div class="ins-value" :style="{ color: kpi.valueColor }">
                {{ kpi.value }}<span class="ins-suffix">{{ kpi.suffix }}</span>
              </div>
              <div class="ins-trend" :class="kpi.up ? 'up' : 'down'">
                <component :is="kpi.up ? ArrowUpOutlined : ArrowDownOutlined" />
                {{ kpi.change }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-card>

    <!-- 隐患核心指标卡（8张） -->
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

    <!-- 趋势图 + TOP10 -->
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
                <div class="chart-bar" v-for="(val, idx) in trendData" :key="idx" :style="{ height: val + '%' }" @mouseenter="showTooltip($event, (30 - idx) + '日', Math.round(val * 0.8) + ' 起')" @mouseleave="hideTooltip">
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

    <!-- 巡检图表 -->
    <a-row :gutter="16" style="margin-top: 16px" class="equal-row">
      <a-col :span="12" class="equal-col">
        <a-card :bordered="false" title="巡检趋势（近30天）" class="stretch-card">
          <div class="inspection-trend-chart">
            <div class="chart-area">
              <div class="y-axis">
                <span class="y-label" v-for="val in inspYAxis" :key="val">{{ val }}</span>
              </div>
              <div class="chart-body">
                <div class="chart-grid">
                  <div class="grid-line" v-for="val in inspYAxis" :key="val"></div>
                </div>
                <div class="chart-bars">
                  <div class="bar-group" v-for="(item, idx) in inspTrendData" :key="idx">
                    <div class="bar-ai" :style="{ height: item.ai + '%' }" @mouseenter="showTooltip($event, (30 - idx) + '日 AI识别', Math.round(item.ai * 1.5) + ' 次')" @mouseleave="hideTooltip"></div>
                    <div class="bar-manual" :style="{ height: item.manual + '%' }" @mouseenter="showTooltip($event, (30 - idx) + '日 人工巡检', Math.round(item.manual * 1.5) + ' 次')" @mouseleave="hideTooltip"></div>
                  </div>
                </div>
                <div class="x-axis">
                  <span class="x-label" v-for="(label, idx) in inspXLabels" :key="idx" :style="{ left: label.pos + '%' }">{{ label.text }}</span>
                </div>
              </div>
            </div>
            <div class="chart-legend">
              <span class="legend-item"><span class="legend-dot" style="background: #1890ff"></span>AI识别</span>
              <span class="legend-item"><span class="legend-dot" style="background: #faad14"></span>人工巡检</span>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="12" class="equal-col">
        <a-card :bordered="false" title="巡检类型分布" class="stretch-card">
          <div class="inspection-pie">
            <svg viewBox="0 0 200 200" class="pie-svg">
              <circle v-for="(item, idx) in inspTypeData" :key="idx"
                :cx="100" :cy="100" r="70"
                fill="none" :stroke="item.color" stroke-width="30"
                :stroke-dasharray="getPieArc(item.percent)"
                :stroke-dashoffset="getPieOffset(idx, inspTypeData)"
                transform="rotate(-90 100 100)"
                style="cursor:pointer" @mouseenter="showTooltip($event, item.name, item.percent + '%')" @mouseleave="hideTooltip" />
            </svg>
            <div class="pie-legend">
              <div v-for="item in inspTypeData" :key="item.name" class="legend-item">
                <span class="legend-dot" :style="{ background: item.color }"></span>
                <span>{{ item.name }} {{ item.percent }}%</span>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 阶段分布 + 处置效率 -->
    <a-row :gutter="16" style="margin-top: 16px" class="equal-row">
      <a-col :span="12" class="equal-col">
        <a-card :bordered="false" title="阶段隐患分布" class="stretch-card">
          <div class="radar-chart-container">
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
                  x1="180" y1="180"
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
                r="5" fill="#1890ff" style="cursor:pointer"
                @mouseenter="showTooltip($event, item.name, item.percent + '%')" @mouseleave="hideTooltip" />
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
        <a-card :bordered="false" title="处置效率概览" class="stretch-card">
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
    <!-- Tooltip -->
    <div class="chart-tooltip" v-if="tooltip.visible" :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
      <div class="tooltip-title">{{ tooltip.title }}</div>
      <div class="tooltip-value">{{ tooltip.value }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { message } from 'ant-design-vue'
import {
  DatabaseOutlined, CheckCircleOutlined, PieChartOutlined,
  ArrowUpOutlined, ArrowDownOutlined, ClockCircleOutlined,
  ExclamationCircleOutlined, WarningOutlined, RadarChartOutlined,
  VideoCameraOutlined, RobotOutlined, UserOutlined, AimOutlined
} from '@ant-design/icons-vue'

const timeRange = ref('30')
const projectFilter = ref<string>()
const stageFilter = ref<string>()

const inspectionKpi = ref([
  { label: '巡检总次数', value: 3842, suffix: '次', change: '较上期+18%', up: true, icon: VideoCameraOutlined, iconBg: '#f0f5ff', iconColor: '#1677ff', valueColor: '#1677ff' },
  { label: 'AI智能识别', value: 2956, suffix: '次', change: '占比76.9%', up: true, icon: RobotOutlined, iconBg: '#e6f7ff', iconColor: '#13c2c2', valueColor: '#13c2c2' },
  { label: '人工巡检', value: 886, suffix: '次', change: '占比23.1%', up: false, icon: UserOutlined, iconBg: '#fff7e6', iconColor: '#fa8c16', valueColor: '#fa8c16' },
  { label: '巡检覆盖率', value: 96.3, suffix: '%', change: '覆盖26/27区域', up: true, icon: AimOutlined, iconBg: '#f6ffed', iconColor: '#52c41a', valueColor: '#52c41a' }
])

// 巡检趋势数据
const inspTrendData = ref([
  { ai: 75, manual: 25 }, { ai: 80, manual: 20 }, { ai: 70, manual: 30 }, { ai: 85, manual: 15 },
  { ai: 78, manual: 22 }, { ai: 82, manual: 18 }, { ai: 76, manual: 24 }, { ai: 88, manual: 12 },
  { ai: 80, manual: 20 }, { ai: 74, manual: 26 }, { ai: 86, manual: 14 }, { ai: 79, manual: 21 },
  { ai: 83, manual: 17 }, { ai: 77, manual: 23 }, { ai: 81, manual: 19 }, { ai: 85, manual: 15 },
  { ai: 78, manual: 22 }, { ai: 84, manual: 16 }, { ai: 80, manual: 20 }, { ai: 76, manual: 24 },
  { ai: 82, manual: 18 }, { ai: 87, manual: 13 }, { ai: 79, manual: 21 }, { ai: 83, manual: 17 },
  { ai: 75, manual: 25 }, { ai: 81, manual: 19 }, { ai: 86, manual: 14 }, { ai: 80, manual: 20 },
  { ai: 78, manual: 22 }, { ai: 84, manual: 16 }
])
const inspYAxis = [150, 120, 90, 60, 30, 0]
const inspXLabels = computed(() => {
  const labels = []
  const total = inspTrendData.value.length
  const step = Math.floor(total / 6)
  for (let i = 0; i < total; i += step) {
    const day = 30 - i
    labels.push({ text: `${day}日`, pos: (i / total) * 100 })
  }
  return labels
})

// 巡检类型分布
const inspTypeData = ref([
  { name: 'AI智能识别', percent: 76.9, color: '#1890ff' },
  { name: '人工巡检', percent: 23.1, color: '#faad14' }
])

const kpiData = ref([
  { label: '隐患总数', value: 1247, suffix: '起', change: '较上期+12%', up: true, icon: DatabaseOutlined, iconBg: '#f0f5ff', iconColor: '#1677ff', valueColor: '#1677ff' },
  { label: '已闭环', value: 1021, suffix: '起', change: '较上期+15%', up: true, icon: CheckCircleOutlined, iconBg: '#f6ffed', iconColor: '#52c41a', valueColor: '#52c41a' },
  { label: '闭环率', value: 81.9, suffix: '%', change: '较上期+2.1%', up: true, icon: PieChartOutlined, iconBg: '#e6f7ff', iconColor: '#13c2c2', valueColor: '#13c2c2' },
  { label: '环比变化', value: 12.3, suffix: '%', change: '较上期', up: true, icon: ArrowUpOutlined, iconBg: '#f0f5ff', iconColor: '#722ed1', valueColor: '#722ed1' },
  { label: '平均处置', value: 2.3, suffix: '小时', change: '较上期-0.5h', up: false, icon: ClockCircleOutlined, iconBg: '#fff7e6', iconColor: '#fa8c16', valueColor: '#fa8c16' },
  { label: '超时隐患', value: 23, suffix: '起', change: '较上期-8%', up: false, icon: ExclamationCircleOutlined, iconBg: '#fff2f0', iconColor: '#ff4d4f', valueColor: '#ff4d4f' },
  { label: '重大隐患', value: 12, suffix: '起', change: '较上期-2起', up: false, icon: WarningOutlined, iconBg: '#fff2f0', iconColor: '#eb2f96', valueColor: '#eb2f96' },
  { label: '隐患覆盖率', value: 96.3, suffix: '%', change: '覆盖 26/27种', up: true, icon: RadarChartOutlined, iconBg: '#f6ffed', iconColor: '#52c41a', valueColor: '#52c41a' }
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

const efficiencyData = ref([
  { label: '平均派单', value: '0.5分钟', percent: 5, color: '#52c41a' },
  { label: '平均整改', value: '1.8小时', percent: 60, color: '#1890ff' },
  { label: '平均复核', value: '0.5小时', percent: 20, color: '#faad14' },
  { label: '平均闭环', value: '2.3小时', percent: 77, color: '#722ed1' }
])

const realtimeData = ref({
  inspection: 128,
  aiCount: 98,
  manualCount: 30,
  found: 127,
  pending: 23,
  closed: 104
})

const CIRCUMFERENCE = 2 * Math.PI * 70
const getPieArc = (percent: number) => `${(percent / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`
const getPieOffset = (idx: number, data: any[]) => {
  let offset = 0
  for (let i = 0; i < idx; i++) offset += (data[i].percent / 100) * CIRCUMFERENCE
  return -offset
}

// 雷达图辅助函数
const RADAR_CENTER = { x: 180, y: 180 }
const RADAR_RADIUS = 100
const RADAR_MAX_VALUE = 40

const getRadarPoints = (level: number) => {
  const n = stageData.value.length
  const points = []
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    const x = RADAR_CENTER.x + RADAR_RADIUS * level * Math.cos(angle)
    const y = RADAR_CENTER.y + RADAR_RADIUS * level * Math.sin(angle)
    points.push(`${x},${y}`)
  }
  return points.join(' ')
}

const getAxisEnd = (idx: number) => {
  const n = stageData.value.length
  const angle = (Math.PI * 2 * idx) / n - Math.PI / 2
  return {
    x: RADAR_CENTER.x + RADAR_RADIUS * Math.cos(angle),
    y: RADAR_CENTER.y + RADAR_RADIUS * Math.sin(angle)
  }
}

const getDataPoint = (idx: number) => {
  const n = stageData.value.length
  const angle = (Math.PI * 2 * idx) / n - Math.PI / 2
  const value = stageData.value[idx].percent
  const r = (value / RADAR_MAX_VALUE) * RADAR_RADIUS
  return {
    x: RADAR_CENTER.x + r * Math.cos(angle),
    y: RADAR_CENTER.y + r * Math.sin(angle)
  }
}

const getDataPoints = () => {
  return stageData.value.map((_, idx) => {
    const point = getDataPoint(idx)
    return `${point.x},${point.y}`
  }).join(' ')
}

const getLabelPos = (idx: number) => {
  const n = stageData.value.length
  const angle = (Math.PI * 2 * idx) / n - Math.PI / 2
  const labelRadius = RADAR_RADIUS + 30
  return {
    x: RADAR_CENTER.x + labelRadius * Math.cos(angle),
    y: RADAR_CENTER.y + labelRadius * Math.sin(angle)
  }
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

const exportReport = () => { message.success('报表导出成功') }
const refreshData = () => { message.info('数据已刷新') }
</script>

<style scoped lang="scss">
.overview-page {
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
      min-width: 180px;
      display: flex;
      align-items: center;
      gap: 12px;
      background: #fff;
      border-radius: 8px;
      padding: 14px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .kpi-icon {
        width: 44px;
        height: 44px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .kpi-info {
        flex: 1;
        min-width: 0;

        .kpi-label { font-size: 12px; color: #666; margin-bottom: 2px; }
        .kpi-value {
          font-size: 22px;
          font-weight: 600;
          line-height: 1;
          margin-bottom: 2px;
          .kpi-suffix { font-size: 11px; font-weight: 400; color: #999; margin-left: 4px; }
        }
        .kpi-trend {
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 2px;
          &.up { color: #52c41a; }
          &.down { color: #1890ff; }
        }
      }
    }
  }

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
        :deep(.ant-card-body) { flex: 1; display: flex; flex-direction: column; }
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
      .y-label { font-size: 11px; color: #999; line-height: 1; }
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
        .grid-line { border-top: 1px dashed #f0f0f0; width: 100%; }
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
          .bar-value { position: absolute; top: -16px; left: 50%; transform: translateX(-50%); font-size: 10px; color: #666; white-space: nowrap; }
        }
      }

      .x-axis {
        position: relative;
        height: 24px;
        border-top: 1px solid #f0f0f0;
        .x-label { position: absolute; bottom: 4px; transform: translateX(-50%); font-size: 11px; color: #999; }
      }
    }
  }

  .top-list {
    .top-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
      .rank { width: 24px; font-weight: 600; color: #1890ff; }
      .type-name { width: 120px; font-size: 13px; }
      .bar-wrap { flex: 1; height: 8px; background: #f0f0f0; border-radius: 4px; }
      .bar-fill { height: 100%; background: #1890ff; border-radius: 4px; }
      .count { width: 30px; text-align: right; font-size: 13px; }
    }
  }

  .pie-chart-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    flex: 1;
    .pie-svg { width: 160px; height: 160px; }
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
        .legend-dot { width: 12px; height: 12px; border-radius: 50%; }
      }
    }
  }

  .efficiency-list {
    .eff-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      .eff-label { width: 80px; font-size: 13px; }
      .eff-bar-wrap { flex: 1; height: 12px; background: #f0f0f0; border-radius: 6px; }
      .eff-bar { height: 100%; border-radius: 6px; }
      .eff-value { width: 60px; text-align: right; font-size: 13px; font-weight: 500; }
    }
  }

  .realtime-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    margin-bottom: 16px;

    .realtime-header {
      padding: 12px 24px 0;
      .realtime-title {
        font-size: 15px;
        font-weight: 600;
        color: #1a1a1a;
      }
    }
  }

  .realtime-bar {
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 16px 24px;
    flex-wrap: wrap;

    .realtime-item {
      display: flex;
      align-items: center;
      gap: 10px;

      .realtime-icon {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
      }

      .realtime-info {
        .realtime-label {
          font-size: 12px;
          color: #666;
          margin-bottom: 2px;
        }
        .realtime-value {
          font-size: 18px;
          font-weight: 600;
          line-height: 1;
          .realtime-unit {
            font-size: 11px;
            font-weight: 400;
            color: #999;
            margin-left: 2px;
          }
        }
      }
    }
  }

  .inspection-stats {
    .ins-section {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .ins-kpi {
      flex: 1 1 calc(25% - 16px);
      min-width: 180px;
      display: flex;
      align-items: center;
      gap: 12px;
      background: #fafafa;
      border-radius: 8px;
      padding: 16px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .ins-icon {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .ins-info {
        flex: 1;
        min-width: 0;

        .ins-label { font-size: 12px; color: #666; margin-bottom: 2px; }
        .ins-value {
          font-size: 20px;
          font-weight: 600;
          line-height: 1;
          margin-bottom: 2px;
          .ins-suffix { font-size: 11px; font-weight: 400; color: #999; margin-left: 4px; }
        }
        .ins-trend {
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 2px;
          &.up { color: #52c41a; }
          &.down { color: #1890ff; }
        }
      }
    }
  }

  .inspection-trend-chart {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
    min-height: 180px;

    .chart-area {
      display: flex;
      gap: 8px;
      flex: 1;
    }

    .y-axis {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding-bottom: 24px;
      .y-label { font-size: 11px; color: #999; line-height: 1; }
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
        .grid-line { border-top: 1px dashed #f0f0f0; width: 100%; }
      }

      .chart-bars {
        display: flex;
        align-items: flex-end;
        gap: 4px;
        flex: 1;
        position: relative;
        z-index: 1;

        .bar-group {
          flex: 1;
          display: flex;
          gap: 2px;
          align-items: flex-end;
          height: 100%;

          .bar-ai {
            flex: 1;
            background: #1890ff;
            border-radius: 2px 2px 0 0;
            min-height: 4px;
            transition: all 0.3s;
            &:hover { opacity: 0.8; }
          }
          .bar-manual {
            flex: 1;
            background: #faad14;
            border-radius: 2px 2px 0 0;
            min-height: 4px;
            transition: all 0.3s;
            &:hover { opacity: 0.8; }
          }
        }
      }

      .x-axis {
        position: relative;
        height: 24px;
        border-top: 1px solid #f0f0f0;
        .x-label { position: absolute; bottom: 4px; transform: translateX(-50%); font-size: 11px; color: #999; }
      }
    }

    .chart-legend {
      display: flex;
      justify-content: center;
      gap: 24px;
      margin-top: 8px;
      .legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        .legend-dot { width: 10px; height: 10px; border-radius: 50%; }
      }
    }
  }

  .inspection-pie {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    flex: 1;
    .pie-svg { width: 160px; height: 160px; }
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
        .legend-dot { width: 12px; height: 12px; border-radius: 50%; }
      }
    }
  }

  .radar-chart-container {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;

    .radar-svg {
      width: 100%;
      max-width: 280px;
      height: auto;
    }

    .radar-label {
      font-size: 12px;
      fill: #666;
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

  .tooltip-title {
    color: rgba(255, 255, 255, 0.65);
    font-size: 11px;
    margin-bottom: 2px;
  }
  .tooltip-value {
    font-weight: 600;
    font-size: 13px;
  }
}
</style>
