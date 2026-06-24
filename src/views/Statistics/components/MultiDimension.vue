<template>
  <div class="dimension-page">
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
          </a-space>
        </a-col>
        <a-col>
          <a-space>
            <a-button>交叉分析</a-button>
            <a-button type="primary">导出</a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- 类型分布 + 等级分布 -->
    <a-row :gutter="16" style="margin-top: 16px" class="equal-row">
      <a-col :span="12" class="equal-col">
        <a-card :bordered="false" title="隐患类型分布" class="stretch-card">
          <div class="type-dist-list">
            <div class="type-dist-item" v-for="item in typeData" :key="item.name" @mouseenter="showTooltip($event, item.name, item.count + ' 起 (' + item.percent + '%)')" @mouseleave="hideTooltip">
              <span class="type-name">{{ item.name }}</span>
              <div class="type-bar-wrap">
                <div class="type-bar" :style="{ width: item.percent + '%', background: item.color }"></div>
              </div>
              <span class="type-percent">{{ item.percent }}%</span>
              <span class="type-count">{{ item.count }}</span>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="12" class="equal-col">
        <a-card :bordered="false" title="隐患等级分布" class="stretch-card">
          <div class="pie-chart-container">
            <svg viewBox="0 0 200 200" class="pie-svg">
              <circle v-for="(item, idx) in levelData" :key="idx"
                :cx="100" :cy="100" r="70"
                fill="none" :stroke="item.color" stroke-width="30"
                :stroke-dasharray="getPieArc(item.percent)"
                :stroke-dashoffset="getPieOffset(idx, levelData)"
                transform="rotate(-90 100 100)"
                style="cursor:pointer" @mouseenter="showTooltip($event, item.name, item.percent + '%')" @mouseleave="hideTooltip" />
            </svg>
            <div class="pie-legend">
              <div v-for="item in levelData" :key="item.name" class="legend-item">
                <span class="legend-dot" :style="{ background: item.color }"></span>
                <span>{{ item.name }} {{ item.percent }}%</span>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 交叉分析 + 来源分布 -->
    <a-row :gutter="16" style="margin-top: 16px" class="equal-row">
      <a-col :span="12" class="equal-col">
        <a-card :bordered="false" title="阶段×类型交叉分析" class="stretch-card">
          <div class="heatmap-table">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th v-for="stage in stages" :key="stage">{{ stage }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in crossData" :key="row.type">
                  <td class="type-label">{{ row.type }}</td>
                  <td v-for="stage in stages" :key="stage" class="heatmap-cell" :style="{ background: getHeatColor(row[stage]) }" @mouseenter="showTooltip($event, row.type + ' × ' + stage, row[stage] + ' 起')" @mouseleave="hideTooltip">
                    {{ row[stage] }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </a-card>
      </a-col>
      <a-col :span="12" class="equal-col">
        <a-card :bordered="false" title="隐患来源分布" class="stretch-card">
          <div class="pie-chart-container">
            <svg viewBox="0 0 200 200" class="pie-svg">
              <circle v-for="(item, idx) in sourceData" :key="idx"
                :cx="100" :cy="100" r="70"
                fill="none" :stroke="item.color" stroke-width="30"
                :stroke-dasharray="getPieArc(item.percent)"
                :stroke-dashoffset="getPieOffset(idx, sourceData)"
                transform="rotate(-90 100 100)"
                style="cursor:pointer" @mouseenter="showTooltip($event, item.name, item.percent + '%')" @mouseleave="hideTooltip" />
            </svg>
            <div class="pie-legend">
              <div v-for="item in sourceData" :key="item.name" class="legend-item">
                <span class="legend-dot" :style="{ background: item.color }"></span>
                <span>{{ item.name }} {{ item.percent }}%</span>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 位置热力图 -->
    <a-card :bordered="false" title="隐患位置分布（热力图）" style="margin-top: 16px">
      <div class="location-heatmap">
        <div class="location-grid">
          <div class="location-cell" v-for="loc in locationData" :key="loc.name" :style="{ background: loc.heatColor }" @mouseenter="showTooltip($event, loc.name, loc.count + ' 起')" @mouseleave="hideTooltip">
            <div class="loc-name">{{ loc.name }}</div>
            <div class="loc-count">{{ loc.count }} 起</div>
          </div>
        </div>
        <div class="heat-legend">
          <span class="heat-label">低风险</span>
          <div class="heat-bar"></div>
          <span class="heat-label">高风险</span>
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
import { ref, reactive } from 'vue'

const timeRange = ref('30')
const projectFilter = ref<string>()

const typeData = ref([
  { name: '未佩戴安全帽', count: 320, percent: 25.7, color: '#ff4d4f' },
  { name: '临边防护缺失', count: 181, percent: 14.5, color: '#faad14' },
  { name: '电焊不规范', count: 151, percent: 12.1, color: '#1890ff' },
  { name: '外架堆物', count: 120, percent: 9.6, color: '#52c41a' },
  { name: '吊篮超员', count: 80, percent: 6.4, color: '#722ed1' },
  { name: '圆盘锯防护缺失', count: 60, percent: 4.8, color: '#13c2c2' },
  { name: '管线拖地', count: 45, percent: 3.6, color: '#eb2f96' }
])

const levelData = ref([
  { name: '重大', percent: 9.6, color: '#ff4d4f' },
  { name: '较大', percent: 28.1, color: '#faad14' },
  { name: '一般', percent: 62.3, color: '#52c41a' }
])

const sourceData = ref([
  { name: 'AI识别', percent: 89, color: '#1890ff' },
  { name: '随手拍', percent: 8, color: '#52c41a' },
  { name: '人工上报', percent: 3, color: '#faad14' }
])

const stages = ['通用', '基础', '主体', '装修']
const crossData = ref([
  { type: '未戴安全帽', 通用: 32, 基础: 0, 主体: 0, 装修: 0 },
  { type: '临边防护', 通用: 0, 基础: 8, 主体: 10, 装修: 0 },
  { type: '电焊不规范', 通用: 15, 基础: 0, 主体: 0, 装修: 0 },
  { type: '外架堆物', 通用: 12, 基础: 0, 主体: 0, 装修: 0 },
  { type: '吊篮超员', 通用: 0, 基础: 5, 主体: 3, 装修: 0 }
])

const getHeatColor = (value: number) => {
  if (value === 0) return '#f5f5f5'
  if (value <= 5) return '#e6f7ff'
  if (value <= 10) return '#91d5ff'
  if (value <= 20) return '#69c0ff'
  return '#ff7875'
}

const locationData = ref([
  { name: '2#塔吊作业区', count: 45, heatColor: '#ff7875' },
  { name: '东侧基坑', count: 38, heatColor: '#ff9c6e' },
  { name: '加工区', count: 32, heatColor: '#ffc069' },
  { name: '材料堆放区', count: 28, heatColor: '#95de64' },
  { name: '安全通道', count: 22, heatColor: '#b7eb8f' },
  { name: '生活区', count: 15, heatColor: '#e6f7ff' },
  { name: '办公区', count: 8, heatColor: '#e6f7ff' },
  { name: '其他区域', count: 12, heatColor: '#f0f0f0' }
])

const CIRCUMFERENCE = 2 * Math.PI * 70
const getPieArc = (percent: number) => `${(percent / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`
const getPieOffset = (idx: number, data: any[]) => {
  let offset = 0
  for (let i = 0; i < idx; i++) offset += (data[i].percent / 100) * CIRCUMFERENCE
  return -offset
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
</script>

<style scoped lang="scss">
.dimension-page {
  .filter-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .equal-row { display: flex; align-items: stretch; }
  .equal-col { display: flex; flex-direction: column; }
  .stretch-card { flex: 1; display: flex; flex-direction: column; :deep(.ant-card-body) { flex: 1; display: flex; flex-direction: column; } }

  .type-dist-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;

    .type-dist-item {
      display: flex;
      align-items: center;
      gap: 8px;
      .type-name { width: 100px; font-size: 13px; flex-shrink: 0; }
      .type-bar-wrap { flex: 1; height: 10px; background: #f0f0f0; border-radius: 5px; }
      .type-bar { height: 100%; border-radius: 5px; transition: all 0.3s; }
      .type-percent { width: 40px; font-size: 12px; color: #666; text-align: right; }
      .type-count { width: 30px; font-size: 12px; color: #999; text-align: right; }
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
      .legend-item { display: flex; align-items: center; gap: 8px; font-size: 13px; .legend-dot { width: 12px; height: 12px; border-radius: 50%; } }
    }
  }

  .heatmap-table {
    flex: 1;
    overflow-x: auto;
    table {
      width: 100%;
      border-collapse: collapse;
      th, td { padding: 8px 12px; text-align: center; font-size: 13px; border: 1px solid #f0f0f0; }
      th { background: #fafafa; font-weight: 500; }
      .type-label { text-align: left; font-weight: 500; background: #fafafa; }
      .heatmap-cell { transition: all 0.3s; font-weight: 500; }
    }
  }

  .location-heatmap {
    .location-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 16px;

      .location-cell {
        padding: 16px;
        border-radius: 8px;
        text-align: center;
        transition: all 0.3s;
        cursor: pointer;
        &:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        .loc-name { font-size: 13px; font-weight: 500; margin-bottom: 4px; }
        .loc-count { font-size: 15px; font-weight: 600; }
      }
    }

    .heat-legend {
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: center;
      .heat-bar {
        width: 200px;
        height: 8px;
        background: linear-gradient(to right, #e6f7ff, #95de64, #ffc069, #ff7875);
        border-radius: 4px;
      }
      .heat-label { font-size: 12px; color: #666; }
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
