<template>
  <div class="project-compare-page">
    <!-- 筛选 -->
    <a-card :bordered="false" class="filter-card">
      <a-space size="large">
        <a-select v-model:value="timeRange" style="width: 120px">
          <a-select-option value="7">近7天</a-select-option>
          <a-select-option value="30">近30天</a-select-option>
          <a-select-option value="90">近90天</a-select-option>
        </a-select>
        <a-select v-model:value="metric" placeholder="对比指标" style="width: 120px">
          <a-select-option value="total">隐患总数</a-select-option>
          <a-select-option value="closedRate">闭环率</a-select-option>
          <a-select-option value="avgTime">平均处置时长</a-select-option>
        </a-select>
        <a-button type="primary">导出</a-button>
      </a-space>
    </a-card>

    <!-- 指标对比 -->
    <a-row :gutter="16" style="margin-top: 16px" class="equal-row">
      <a-col :span="12" class="equal-col">
        <a-card :bordered="false" title="隐患总数对比" class="stretch-card">
          <div class="compare-bars">
            <div class="compare-item" v-for="p in projectCompare" :key="p.name + '1'" @mouseenter="showTooltip($event, p.name + ' - 隐患总数', p.total + ' 起')" @mouseleave="hideTooltip">
              <span class="compare-name">{{ p.name }}</span>
              <div class="compare-bar-wrap">
                <div class="compare-bar" :style="{ width: p.totalPercent + '%', background: p.color }"></div>
              </div>
              <span class="compare-value">{{ p.total }}</span>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="12" class="equal-col">
        <a-card :bordered="false" title="闭环率对比" class="stretch-card">
          <div class="compare-bars">
            <div class="compare-item" v-for="p in projectCompare" :key="p.name + '2'" @mouseenter="showTooltip($event, p.name + ' - 闭环率', p.closedRate + '%')" @mouseleave="hideTooltip">
              <span class="compare-name">{{ p.name }}</span>
              <div class="compare-bar-wrap">
                <div class="compare-bar" :style="{ width: p.closedRate + '%', background: p.closedColor }"></div>
              </div>
              <span class="compare-value">{{ p.closedRate }}%</span>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 处置效率对比 + 等级分布对比 -->
    <a-row :gutter="16" style="margin-top: 16px" class="equal-row">
      <a-col :span="12" class="equal-col">
        <a-card :bordered="false" title="处置效率对比" class="stretch-card">
          <div class="efficiency-compare">
            <div class="eff-item" v-for="p in projectCompare" :key="p.name + '3'" @mouseenter="showTooltip($event, p.name + ' - 处置效率', p.avgTime + 'h')" @mouseleave="hideTooltip">
              <span class="eff-name">{{ p.name }}</span>
              <div class="eff-bar-wrap">
                <div class="eff-bar" :style="{ width: p.effPercent + '%', background: p.color }"></div>
              </div>
              <span class="eff-value">{{ p.avgTime }}h</span>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="12" class="equal-col">
        <a-card :bordered="false" title="等级分布对比" class="stretch-card">
          <div class="level-compare">
            <div class="level-item" v-for="p in projectCompare" :key="p.name">
              <span class="level-name">{{ p.name }}</span>
              <div class="level-bars">
                <div class="level-segment" v-for="seg in p.levels" :key="seg.label" :style="{ width: seg.width + '%', background: seg.color }" @mouseenter="showTooltip($event, p.name + ' - ' + seg.label, seg.value + '%')" @mouseleave="hideTooltip"></div>
              </div>
              <div class="level-legend">
                <span v-for="seg in p.levels" :key="seg.label" class="seg-tag">
                  <span class="seg-dot" :style="{ background: seg.color }"></span>
                  {{ seg.label }}
                </span>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 项目明细表 -->
    <a-card :bordered="false" title="项目明细对比" style="margin-top: 16px">
      <a-table :columns="tableColumns" :data-source="tableData" :pagination="false" bordered size="small">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'closedRate'">
            <a-progress :percent="record.closedRate" :stroke-color="record.closedRate >= 85 ? '#52c41a' : record.closedRate >= 70 ? '#faad14' : '#ff4d4f'" :show-info="false" />
            <span style="margin-left: 8px">{{ record.closedRate }}%</span>
          </template>
          <template v-if="column.key === 'timeoutRate'">
            <span :style="{ color: record.timeoutRate > 10 ? '#ff4d4f' : record.timeoutRate > 5 ? '#faad14' : '#52c41a' }">{{ record.timeoutRate }}%</span>
          </template>
        </template>
      </a-table>
    </a-card>
    <!-- Tooltip -->
    <div class="chart-tooltip" v-if="tooltip.visible" :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
      <div class="tooltip-title">{{ tooltip.title }}</div>
      <div class="tooltip-value">{{ tooltip.value }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const timeRange = ref('30')
const metric = ref('total')

const projectCompare = ref([
  {
    name: '滨江项目', total: 247, totalPercent: 100, closedRate: 85.4, closedColor: '#52c41a', avgTime: 1.8, effPercent: 30, color: '#1890ff',
    levels: [
      { label: '重大', value: 8, width: 8, color: '#ff4d4f' },
      { label: '较大', value: 25, width: 25, color: '#faad14' },
      { label: '一般', value: 67, width: 67, color: '#52c41a' }
    ]
  },
  {
    name: '钱塘项目', total: 198, totalPercent: 80, closedRate: 82.3, closedColor: '#52c41a', avgTime: 2.1, effPercent: 45, color: '#52c41a',
    levels: [
      { label: '重大', value: 10, width: 10, color: '#ff4d4f' },
      { label: '较大', value: 28, width: 28, color: '#faad14' },
      { label: '一般', value: 62, width: 62, color: '#52c41a' }
    ]
  },
  {
    name: '余杭项目', total: 156, totalPercent: 63, closedRate: 78.2, closedColor: '#faad14', avgTime: 2.5, effPercent: 60, color: '#faad14',
    levels: [
      { label: '重大', value: 12, width: 12, color: '#ff4d4f' },
      { label: '较大', value: 30, width: 30, color: '#faad14' },
      { label: '一般', value: 58, width: 58, color: '#52c41a' }
    ]
  },
  {
    name: '萧山项目', total: 132, totalPercent: 53, closedRate: 75.8, closedColor: '#faad14', avgTime: 3.2, effPercent: 80, color: '#ff4d4f',
    levels: [
      { label: '重大', value: 15, width: 15, color: '#ff4d4f' },
      { label: '较大', value: 32, width: 32, color: '#faad14' },
      { label: '一般', value: 53, width: 53, color: '#52c41a' }
    ]
  },
  {
    name: '临平项目', total: 98, totalPercent: 40, closedRate: 71.4, closedColor: '#ff4d4f', avgTime: 2.8, effPercent: 70, color: '#722ed1',
    levels: [
      { label: '重大', value: 9, width: 9, color: '#ff4d4f' },
      { label: '较大', value: 26, width: 26, color: '#faad14' },
      { label: '一般', value: 65, width: 65, color: '#52c41a' }
    ]
  }
])

const tableColumns = [
  { title: '项目', dataIndex: 'name', key: 'name', width: 100 },
  { title: '隐患总数', dataIndex: 'total', key: 'total', width: 80 },
  { title: '已闭环', dataIndex: 'closed', key: 'closed', width: 80 },
  { title: '闭环率', dataIndex: 'closedRate', key: 'closedRate', width: 180 },
  { title: '平均处置', dataIndex: 'avgTime', key: 'avgTime', width: 80 },
  { title: '超时率', dataIndex: 'timeoutRate', key: 'timeoutRate', width: 80 },
  { title: '重大隐患', dataIndex: 'major', key: 'major', width: 80 }
]

const tableData = ref([
  { name: '滨江项目', total: 247, closed: 211, closedRate: 85.4, avgTime: '1.8h', timeoutRate: 5.2, major: 20 },
  { name: '钱塘项目', total: 198, closed: 163, closedRate: 82.3, avgTime: '2.1h', timeoutRate: 6.8, major: 20 },
  { name: '余杭项目', total: 156, closed: 122, closedRate: 78.2, avgTime: '2.5h', timeoutRate: 8.5, major: 19 },
  { name: '萧山项目', total: 132, closed: 100, closedRate: 75.8, avgTime: '3.2h', timeoutRate: 12.1, major: 20 },
  { name: '临平项目', total: 98, closed: 70, closedRate: 71.4, avgTime: '2.8h', timeoutRate: 9.2, major: 9 }
])

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
</script>

<style scoped lang="scss">
.project-compare-page {
  .filter-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .equal-row { display: flex; align-items: stretch; }
  .equal-col { display: flex; flex-direction: column; }
  .stretch-card { flex: 1; display: flex; flex-direction: column; :deep(.ant-card-body) { flex: 1; display: flex; flex-direction: column; } }

  .compare-bars, .efficiency-compare {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .compare-item, .eff-item {
      display: flex;
      align-items: center;
      gap: 8px;
      .compare-name, .eff-name { width: 70px; font-size: 13px; flex-shrink: 0; }
      .compare-bar-wrap, .eff-bar-wrap { flex: 1; height: 12px; background: #f0f0f0; border-radius: 6px; }
      .compare-bar, .eff-bar { height: 100%; border-radius: 6px; transition: all 0.3s; }
      .compare-value, .eff-value { width: 50px; text-align: right; font-size: 13px; font-weight: 500; }
    }
  }

  .level-compare {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .level-item {
      .level-name { display: block; font-size: 13px; margin-bottom: 4px; }
      .level-bars { display: flex; height: 16px; border-radius: 4px; overflow: hidden; margin-bottom: 4px; }
      .level-segment { transition: all 0.3s; cursor: pointer; &:hover { opacity: 0.8; } }
      .level-legend {
        display: flex;
        gap: 8px;
        .seg-tag { display: flex; align-items: center; gap: 4px; font-size: 11px; color: #666; .seg-dot { width: 8px; height: 8px; border-radius: 50%; } }
      }
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
