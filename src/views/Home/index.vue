<template>
  <div class="home-page">
    <!-- 统计卡片 -->
    <a-row :gutter="[16, 16]" class="stats-cards">
      <a-col :xs="24" :sm="12" :md="6">
        <a-card hoverable>
          <a-statistic title="今日巡检任务" :value="12" :value-style="{ color: '#3f8600' }">
            <template #suffix>个</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <a-card hoverable>
          <a-statistic title="发现隐患数" :value="5" :value-style="{ color: '#cf1322' }">
            <template #suffix>处</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <a-card hoverable>
          <a-statistic title="已整改隐患" :value="3" :value-style="{ color: '#1890ff' }">
            <template #suffix>处</template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <a-card hoverable>
          <a-statistic title="待处理隐患" :value="2" :value-style="{ color: '#faad14' }">
            <template #suffix>处</template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 图表区域 -->
    <a-row :gutter="[16, 16]" class="charts-section">
      <a-col :xs="24" :lg="12">
        <a-card title="近7天巡检趋势">
          <div ref="trendChartRef" style="height: 300px"></div>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="12">
        <a-card title="隐患类型分布">
          <div ref="typeChartRef" style="height: 300px"></div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 最新动态 -->
    <a-card title="最新动态" class="latest-activity">
      <a-list :data-source="activities" item-layout="horizontal">
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta :description="item.time">
              <template #title>
                <a-tag :color="getTypeColor(item.type)">{{ getTypeText(item.type) }}</a-tag>
                {{ item.content }}
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'

const trendChartRef = ref<HTMLDivElement>()
const typeChartRef = ref<HTMLDivElement>()

// 模拟数据
const activities = ref([
  { type: 'inspection', content: '完成A区脚手架安全检查', time: '2026-06-23 14:30' },
  { type: 'hazard', content: '发现B区临时用电安全隐患', time: '2026-06-23 13:20' },
  { type: 'rectify', content: 'C区高空作业防护已整改完成', time: '2026-06-23 11:15' },
  { type: 'inspection', content: '开始D区塔吊设备巡检', time: '2026-06-23 10:00' }
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

// 初始化图表
onMounted(() => {
  // 趋势图
  if (trendChartRef.value) {
    const trendChart = echarts.init(trendChartRef.value)
    trendChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['6-17', '6-18', '6-19', '6-20', '6-21', '6-22', '6-23']
      },
      yAxis: { type: 'value' },
      series: [
        {
          name: '巡检次数',
          type: 'line',
          smooth: true,
          data: [8, 10, 12, 9, 11, 13, 12],
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
            ])
          },
          itemStyle: { color: '#1890ff' }
        }
      ]
    })
  }

  // 类型分布图
  if (typeChartRef.value) {
    const typeChart = echarts.init(typeChartRef.value)
    typeChart.setOption({
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left' },
      series: [
        {
          name: '隐患类型',
          type: 'pie',
          radius: '60%',
          data: [
            { value: 15, name: '高处作业' },
            { value: 12, name: '临时用电' },
            { value: 10, name: '脚手架' },
            { value: 8, name: '机械设备' },
            { value: 5, name: '其他' }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    })
  }
})
</script>

<style scoped lang="scss">
.home-page {
  .stats-cards {
    margin-bottom: 16px;
  }

  .charts-section {
    margin-bottom: 16px;
  }

  .latest-activity {
    :deep(.ant-list-item-meta-title) {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
}
</style>
