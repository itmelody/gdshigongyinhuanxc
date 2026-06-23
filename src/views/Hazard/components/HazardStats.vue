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
    <a-card :bordered="false" style="margin-top: 16px">
      <a-row :gutter="16">
        <a-col :span="5" v-for="kpi in kpiData" :key="kpi.label">
          <a-statistic :title="kpi.label" :value="kpi.value" :suffix="kpi.suffix" />
          <div class="kpi-trend" :class="kpi.up ? 'up' : 'down'">
            {{ kpi.up ? '↑' : '↓' }} {{ kpi.change }}
          </div>
        </a-col>
      </a-row>
    </a-card>

    <!-- 图表区域 -->
    <a-row :gutter="16" style="margin-top: 16px">
      <a-col :span="12">
        <a-card :bordered="false" title="隐患发现趋势（近30天）">
          <div class="chart-placeholder trend-chart">
            <div class="chart-bar" v-for="(val, idx) in trendData" :key="idx" :style="{ height: val + '%' }">
              <span class="bar-value">{{ Math.round(val * 0.8) }}</span>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card :bordered="false" title="隐患类型 TOP10">
          <div class="top-list">
            <div class="top-item" v-for="(item, idx) in topTypes" :key="idx">
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

    <a-row :gutter="16" style="margin-top: 16px">
      <a-col :span="12">
        <a-card :bordered="false" title="阶段隐患分布">
          <div class="pie-list">
            <div class="pie-item" v-for="item in stageData" :key="item.name">
              <span class="dot" :style="{ background: item.color }"></span>
              <span class="pie-name">{{ item.name }}</span>
              <span class="pie-percent">{{ item.percent }}%</span>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card :bordered="false" title="处置效率分析">
          <div class="efficiency-list">
            <div class="eff-item" v-for="item in efficiencyData" :key="item.label">
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
    <a-card :bordered="false" style="margin-top: 16px">
      <a-row :gutter="24">
        <a-col :span="8">
          <h4>项目隐患排名</h4>
          <div v-for="(p, idx) in projectRank" :key="idx" class="rank-item">
            <span>{{ idx + 1 }}. {{ p.name }}</span>
            <span>{{ p.count }} 起</span>
          </div>
        </a-col>
        <a-col :span="8">
          <h4>等级分布</h4>
          <div v-for="item in levelDist" :key="item.label" class="dist-item">
            <span class="dot" :style="{ background: item.color }"></span>
            {{ item.label }} {{ item.percent }}%
          </div>
        </a-col>
        <a-col :span="8">
          <h4>来源分布</h4>
          <div v-for="item in sourceDist" :key="item.label" class="dist-item">
            <span class="dot" :style="{ background: item.color }"></span>
            {{ item.label }} {{ item.percent }}%
          </div>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'

const timeRange = ref('30')
const projectFilter = ref<string>()
const stageFilter = ref<string>()

const kpiData = ref([
  { label: '隐患总数', value: 1247, suffix: '起', change: '较上期+12%', up: true },
  { label: '已闭环', value: 1021, suffix: '起', change: '较上期+15%', up: true },
  { label: '闭环率', value: 81.9, suffix: '%', change: '↑ 2.1%', up: true },
  { label: '平均处置', value: 2.3, suffix: '小时', change: '↓ 0.5h', up: false },
  { label: '超时率', value: 6.8, suffix: '%', change: '↓ 1.2%', up: false }
])

const trendData = ref([30, 45, 55, 40, 65, 75, 50, 60, 80, 70, 55, 45, 60, 75, 85, 70, 60, 50, 65, 70, 55, 40, 60, 75, 80, 65, 50, 55, 60, 45])

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

const projectRank = ref([
  { name: '滨江项目', count: 247 },
  { name: '钱塘项目', count: 198 },
  { name: '余杭项目', count: 156 }
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
</script>

<style scoped lang="scss">
.hazard-stats {
  .filter-card { border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); }
  .kpi-trend {
    font-size: 12px; margin-top: 4px;
    &.up { color: #52c41a; }
    &.down { color: #1890ff; }
  }
  .trend-chart {
    display: flex; align-items: flex-end; gap: 4px; height: 120px;
    .chart-bar {
      flex: 1; background: #1890ff; border-radius: 2px 2px 0 0; min-height: 4px; position: relative;
      .bar-value { position: absolute; top: -16px; left: 50%; transform: translateX(-50%); font-size: 10px; color: #666; white-space: nowrap; }
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
  .pie-list {
    .pie-item {
      display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
      .dot { width: 12px; height: 12px; border-radius: 50%; }
      .pie-name { flex: 1; }
      .pie-percent { font-weight: 600; }
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
  .rank-item {
    display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0;
  }
  .dist-item {
    display: flex; align-items: center; gap: 8px; margin-bottom: 10px;
    .dot { width: 10px; height: 10px; border-radius: 50%; }
  }
}
</style>
