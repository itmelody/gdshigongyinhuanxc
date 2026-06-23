<template>
  <div class="statistics-page">
    <!-- 时间筛选 -->
    <a-card :bordered="false" class="filter-card">
      <a-space size="large">
        <span style="font-weight: 600;">统计周期：</span>
        <a-radio-group v-model:value="timeRange" button-style="solid" @change="handleTimeChange">
          <a-radio-button value="week">本周</a-radio-button>
          <a-radio-button value="month">本月</a-radio-button>
          <a-radio-button value="quarter">本季度</a-radio-button>
          <a-radio-button value="year">本年</a-radio-button>
        </a-radio-group>
        <a-range-picker v-model:value="customRange" @change="handleCustomRange" />
      </a-space>
    </a-card>

    <!-- 核心指标 -->
    <a-row :gutter="[16, 16]" class="metrics-cards">
      <a-col :xs="24" :sm="12" :md="6">
        <a-card hoverable>
          <a-statistic title="巡检总次数" :value="156" :value-style="{ color: '#1890ff' }">
            <template #suffix>次</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <a-card hoverable>
          <a-statistic title="发现隐患数" :value="48" :value-style="{ color: '#cf1322' }">
            <template #suffix>处</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <a-card hoverable>
          <a-statistic title="整改完成率" :value="87.5" :precision="1" :value-style="{ color: '#3f8600' }">
            <template #suffix>%</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <a-card hoverable>
          <a-statistic title="平均响应时间" :value="2.3" :precision="1" :value-style="{ color: '#faad14' }">
            <template #suffix>小时</template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 图表区域 -->
    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :lg="12">
        <a-card title="月度巡检趋势">
          <div ref="monthlyTrendRef" style="height: 350px"></div>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="12">
        <a-card title="隐患类型分布">
          <div ref="typeDistributionRef" style="height: 350px"></div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="[16, 16]" style="margin-top: 16px">
      <a-col :xs="24" :lg="12">
        <a-card title="各区域隐患统计">
          <div ref="areaStatsRef" style="height: 350px"></div>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="12">
        <a-card title="风险等级分布">
          <div ref="levelDistributionRef" style="height: 350px"></div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 数据报表 -->
    <a-card title="详细数据报表" style="margin-top: 16px">
      <template #extra>
        <a-button>
          <template #icon><DownloadOutlined /></template>
          导出Excel
        </a-button>
      </template>
      <a-table
        :columns="reportColumns"
        :data-source="reportData"
        :pagination="false"
        bordered
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'rectifyRate'">
            <a-progress 
              :percent="record.rectifyRate" 
              :stroke-color="getProgressColor(record.rectifyRate)"
              :show-info="false"
            />
            <span style="margin-left: 8px">{{ record.rectifyRate }}%</span>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { DownloadOutlined } from '@ant-design/icons-vue'

const timeRange = ref('month')
const customRange = ref<[dayjs.Dayjs, dayjs.Dayjs]>()

// 图表引用
const monthlyTrendRef = ref<HTMLDivElement>()
const typeDistributionRef = ref<HTMLDivElement>()
const areaStatsRef = ref<HTMLDivElement>()
const levelDistributionRef = ref<HTMLDivElement>()

let monthlyChart: any
let typeChart: any
let areaChart: any
let levelChart: any

// 报表数据
const reportColumns = [
  { title: '月份', dataIndex: 'month', key: 'month', width: 100 },
  { title: '巡检次数', dataIndex: 'inspectionCount', key: 'inspectionCount', width: 100 },
  { title: '发现隐患', dataIndex: 'hazardCount', key: 'hazardCount', width: 100 },
  { title: '已整改', dataIndex: 'rectifiedCount', key: 'rectifiedCount', width: 100 },
  { title: '整改率', dataIndex: 'rectifyRate', key: 'rectifyRate', width: 200 },
  { title: '高风险', dataIndex: 'highRiskCount', key: 'highRiskCount', width: 100 },
  { title: '中风险', dataIndex: 'mediumRiskCount', key: 'mediumRiskCount', width: 100 },
  { title: '低风险', dataIndex: 'lowRiskCount', key: 'lowRiskCount', width: 100 }
]

const reportData = ref([
  { month: '2026-01', inspectionCount: 45, hazardCount: 12, rectifiedCount: 11, rectifyRate: 91.7, highRiskCount: 3, mediumRiskCount: 5, lowRiskCount: 4 },
  { month: '2026-02', inspectionCount: 42, hazardCount: 10, rectifiedCount: 9, rectifyRate: 90.0, highRiskCount: 2, mediumRiskCount: 4, lowRiskCount: 4 },
  { month: '2026-03', inspectionCount: 48, hazardCount: 15, rectifiedCount: 13, rectifyRate: 86.7, highRiskCount: 4, mediumRiskCount: 6, lowRiskCount: 5 },
  { month: '2026-04', inspectionCount: 50, hazardCount: 13, rectifiedCount: 12, rectifyRate: 92.3, highRiskCount: 3, mediumRiskCount: 5, lowRiskCount: 5 },
  { month: '2026-05', inspectionCount: 52, hazardCount: 14, rectifiedCount: 12, rectifyRate: 85.7, highRiskCount: 4, mediumRiskCount: 6, lowRiskCount: 4 },
  { month: '2026-06', inspectionCount: 48, hazardCount: 11, rectifiedCount: 10, rectifyRate: 90.9, highRiskCount: 2, mediumRiskCount: 5, lowRiskCount: 4 }
])

const getProgressColor = (rate: number) => {
  if (rate >= 90) return '#52c41a'
  if (rate >= 80) return '#1890ff'
  return '#faad14'
}

const handleTimeChange = () => {
  customRange.value = undefined
  updateCharts()
}

const handleCustomRange = () => {
  if (customRange.value) {
    timeRange.value = ''
    updateCharts()
  }
}

const initMonthlyTrendChart = () => {
  if (!monthlyTrendRef.value) return
  
  monthlyChart = echarts.init(monthlyTrendRef.value)
  monthlyChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['巡检次数', '隐患数量', '整改数量'] },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '巡检次数',
        type: 'bar',
        data: [45, 42, 48, 50, 52, 48],
        itemStyle: { color: '#1890ff' }
      },
      {
        name: '隐患数量',
        type: 'bar',
        data: [12, 10, 15, 13, 14, 11],
        itemStyle: { color: '#ff4d4f' }
      },
      {
        name: '整改数量',
        type: 'line',
        smooth: true,
        data: [11, 9, 13, 12, 12, 10],
        itemStyle: { color: '#52c41a' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
            { offset: 1, color: 'rgba(82, 196, 26, 0.05)' }
          ])
        }
      }
    ]
  })
}

const initTypeDistributionChart = () => {
  if (!typeDistributionRef.value) return
  
  typeChart = echarts.init(typeDistributionRef.value)
  typeChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        name: '隐患类型',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false, position: 'center' },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: { show: false },
        data: [
          { value: 18, name: '高处作业', itemStyle: { color: '#ff4d4f' } },
          { value: 15, name: '临时用电', itemStyle: { color: '#faad14' } },
          { value: 12, name: '脚手架', itemStyle: { color: '#1890ff' } },
          { value: 10, name: '机械设备', itemStyle: { color: '#52c41a' } },
          { value: 8, name: '其他', itemStyle: { color: '#722ed1' } }
        ]
      }
    ]
  })
}

const initAreaStatsChart = () => {
  if (!areaStatsRef.value) return
  
  areaChart = echarts.init(areaStatsRef.value)
  areaChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['高风险', '中风险', '低风险'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value' },
    yAxis: {
      type: 'category',
      data: ['A区', 'B区', 'C区', 'D区']
    },
    series: [
      {
        name: '高风险',
        type: 'bar',
        stack: 'total',
        data: [3, 5, 2, 4],
        itemStyle: { color: '#ff4d4f' }
      },
      {
        name: '中风险',
        type: 'bar',
        stack: 'total',
        data: [6, 8, 5, 7],
        itemStyle: { color: '#faad14' }
      },
      {
        name: '低风险',
        type: 'bar',
        stack: 'total',
        data: [4, 5, 6, 3],
        itemStyle: { color: '#1890ff' }
      }
    ]
  })
}

const initLevelDistributionChart = () => {
  if (!levelDistributionRef.value) return
  
  levelChart = echarts.init(levelDistributionRef.value)
  levelChart.setOption({
    tooltip: { trigger: 'item' },
    series: [
      {
        name: '风险等级',
        type: 'gauge',
        progress: {
          show: true,
          width: 18
        },
        axisLine: {
          lineStyle: {
            width: 18
          }
        },
        axisTick: { show: false },
        splitLine: { length: 15, lineStyle: { width: 2, color: '#999' } },
        axisLabel: { distance: 25, color: '#999', fontSize: 14 },
        anchor: {
          show: true,
          showAbove: true,
          size: 25,
          itemStyle: { borderWidth: 10 }
        },
        title: { show: false },
        detail: {
          valueAnimation: true,
          fontSize: 30,
          offsetCenter: [0, '70%']
        },
        data: [{ value: 87.5, name: '整改完成率' }]
      }
    ]
  })
}

const updateCharts = () => {
  // 根据时间范围更新图表数据（这里使用模拟数据）
  console.log('更新图表数据，时间范围:', timeRange.value || customRange.value)
}

onMounted(() => {
  initMonthlyTrendChart()
  initTypeDistributionChart()
  initAreaStatsChart()
  initLevelDistributionChart()
  
  window.addEventListener('resize', () => {
    monthlyChart?.resize()
    typeChart?.resize()
    areaChart?.resize()
    levelChart?.resize()
  })
})
</script>

<style scoped lang="scss">
.statistics-page {
  .filter-card {
    margin-bottom: 16px;
  }

  .metrics-cards {
    margin-bottom: 16px;
  }
}
</style>
