<template>
  <div class="ai-record">
    <!-- 统计概览 -->
    <a-card :bordered="false" class="stats-card">
      <a-row :gutter="16">
        <a-col :span="6" v-for="stat in statsData" :key="stat.label">
          <a-statistic :title="stat.label" :value="stat.value" :suffix="stat.suffix" />
        </a-col>
      </a-row>
    </a-card>

    <!-- 筛选栏 -->
    <a-card :bordered="false" class="filter-card" style="margin-top: 16px">
      <a-row :gutter="12" align="middle">
        <a-col :flex="1">
          <a-space wrap>
            <a-select v-model:value="timeRange" style="width: 120px">
              <a-select-option value="today">今天</a-select-option>
              <a-select-option value="week">近7天</a-select-option>
              <a-select-option value="month">近30天</a-select-option>
            </a-select>
            <a-select v-model:value="stageFilter" placeholder="阶段" style="width: 100px" allow-clear>
              <a-select-option value="通用">通用</a-select-option>
              <a-select-option value="基础">基础</a-select-option>
              <a-select-option value="主体">主体</a-select-option>
              <a-select-option value="装修">装修</a-select-option>
            </a-select>
            <a-select v-model:value="typeFilter" placeholder="隐患类型" style="width: 140px" allow-clear>
              <a-select-option v-for="t in hazardTypes" :key="t" :value="t">{{ t }}</a-select-option>
            </a-select>
            <a-select v-model:value="statusFilter" placeholder="状态" style="width: 100px" allow-clear>
              <a-select-option value="已闭环">已闭环</a-select-option>
              <a-select-option value="待处置">待处置</a-select-option>
              <a-select-option value="待派单">待派单</a-select-option>
              <a-select-option value="处置中">处置中</a-select-option>
              <a-select-option value="待复核">待复核</a-select-option>
            </a-select>
            <a-select v-model:value="confidenceFilter" style="width: 120px">
              <a-select-option value="0">全部置信度</a-select-option>
              <a-select-option value="90">≥90%</a-select-option>
              <a-select-option value="80">≥80%</a-select-option>
            </a-select>
            <a-input-search v-model:value="searchKeyword" placeholder="搜索隐患名称/位置" style="width: 180px" />
          </a-space>
        </a-col>
        <a-col>
          <a-space>
            <a-button @click="exportExcel">导出Excel</a-button>
            <a-button type="primary" @click="exportReport">导出报告</a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- 数据表格 -->
    <a-card :bordered="false" class="table-card" style="margin-top: 16px">
      <a-table :columns="columns" :data-source="filteredData" :pagination="{ pageSize: 10, showTotal: (total: number) => `共 ${total} 条记录` }" row-key="id" size="small">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'snapshot'">
            <div class="snapshot-thumb" @click="viewLarge(record)">📷</div>
          </template>
          <template v-else-if="column.key === 'confidence'">
            <span :class="confidenceClass(record.confidence)">{{ record.confidence }}%</span>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="statusColorMap[record.status]">{{ record.status }}</a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button type="link" size="small" @click="viewDetail(record)">详情</a-button>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 详情侧滑面板 -->
    <a-drawer v-model:open="drawerVisible" title="识别记录详情" width="500">
      <template v-if="detailRecord">
        <a-descriptions :column="1" bordered size="small">
          <a-descriptions-item label="识别时间">{{ detailRecord.time }}</a-descriptions-item>
          <a-descriptions-item label="隐患类型">{{ detailRecord.type }}</a-descriptions-item>
          <a-descriptions-item label="所属阶段">{{ detailRecord.stage }}</a-descriptions-item>
          <a-descriptions-item label="置信度">{{ detailRecord.confidence }}%</a-descriptions-item>
          <a-descriptions-item label="位置">{{ detailRecord.location }}</a-descriptions-item>
          <a-descriptions-item label="处置状态">
            <a-tag :color="statusColorMap[detailRecord.status]">{{ detailRecord.status }}</a-tag>
          </a-descriptions-item>
        </a-descriptions>
        <h4 style="margin: 16px 0 8px">识别画面</h4>
        <div class="detail-image">
          <img :src="detailRecord.image" alt="识别快照" />
        </div>
        <h4 style="margin: 16px 0 8px">处置记录</h4>
        <a-timeline>
          <a-timeline-item color="green">AI自动识别 {{ detailRecord.time }}</a-timeline-item>
          <a-timeline-item color="blue">系统自动派单 2026-06-23 14:30</a-timeline-item>
          <a-timeline-item color="orange">安全员现场核实 2026-06-23 15:20</a-timeline-item>
          <a-timeline-item color="green">整改完成验收 2026-06-23 16:45</a-timeline-item>
        </a-timeline>
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import aiImg1 from '@/assets/ai1.jpeg'
import aiImg2 from '@/assets/ai2.jpeg'
import aiImg3 from '@/assets/ai3.jpeg'
import aiImg4 from '@/assets/ai4.jpeg'

const timeRange = ref('today')
const stageFilter = ref<string>()
const typeFilter = ref<string>()
const statusFilter = ref<string>()
const confidenceFilter = ref('90')
const searchKeyword = ref('')

const hazardTypes = ['未佩戴安全帽', '临边防护缺失', '脚手架松动', '电焊不规范', '吊篮超员', '围挡缺失', '吸烟']
const statusColorMap: Record<string, string> = { '已闭环': 'success', '待处置': 'warning', '待派单': 'default', '处置中': 'processing', '待复核': 'cyan' }

const columns = [
  { title: '识别时间', dataIndex: 'time', key: 'time', width: 160 },
  { title: '快照', key: 'snapshot', width: 60 },
  { title: '隐患类型', dataIndex: 'type', key: 'type', width: 140 },
  { title: '阶段', dataIndex: 'stage', key: 'stage', width: 70 },
  { title: '置信度', key: 'confidence', width: 90 },
  { title: '位置', dataIndex: 'location', key: 'location', width: 120 },
  { title: '状态', key: 'status', width: 90 },
  { title: '操作', key: 'action', width: 70 }
]

const recordData = ref([
  { id: 1, time: '2026-06-23 14:28', type: '未佩戴安全帽', stage: '通用', confidence: 94.7, location: '南侧通道#2', status: '已闭环', image: aiImg1 },
  { id: 2, time: '2026-06-23 14:25', type: '外架与作业面不同步', stage: '主体', confidence: 92.0, location: '2#塔吊作业区', status: '待处置', image: aiImg2 },
  { id: 3, time: '2026-06-23 14:20', type: '临边防护缺失', stage: '基础', confidence: 91.0, location: '东侧基坑', status: '待派单', image: aiImg3 },
  { id: 4, time: '2026-06-23 14:15', type: '电焊未设防护屏', stage: '通用', confidence: 88.6, location: '加工区#3', status: '待复核', image: aiImg4 },
  { id: 5, time: '2026-06-23 14:10', type: '吊篮超员>2人', stage: '装修', confidence: 93.0, location: '装修作业面', status: '处置中', image: aiImg1 },
  { id: 6, time: '2026-06-23 14:05', type: '未佩戴安全帽', stage: '通用', confidence: 95.2, location: '南侧通道#2', status: '已闭环', image: aiImg2 },
  { id: 7, time: '2026-06-23 13:50', type: '围挡缺失', stage: '装修', confidence: 91.3, location: '东侧围墙#5', status: '待处置', image: aiImg3 },
  { id: 8, time: '2026-06-23 13:40', type: '脚手架连接松动', stage: '主体', confidence: 89.5, location: '北侧脚手架#4', status: '已闭环', image: aiImg4 }
])

const filteredData = computed(() => {
  let data = recordData.value
  if (stageFilter.value) data = data.filter(d => d.stage === stageFilter.value)
  if (typeFilter.value) data = data.filter(d => d.type === typeFilter.value)
  if (statusFilter.value) data = data.filter(d => d.status === statusFilter.value)
  if (Number(confidenceFilter.value) > 0) data = data.filter(d => d.confidence >= Number(confidenceFilter.value))
  if (searchKeyword.value) data = data.filter(d => d.type.includes(searchKeyword.value) || d.location.includes(searchKeyword.value))
  return data
})

const confidenceClass = (val: number) => {
  if (val >= 90) return 'confidence-high'
  if (val >= 80) return 'confidence-mid'
  return 'confidence-low'
}

const statsData = ref([
  { label: '今日识别', value: 127, suffix: '起' },
  { label: '本周识别', value: 586, suffix: '起' },
  { label: '本月识别', value: 1247, suffix: '起' },
  { label: '平均置信度', value: 91.2, suffix: '%' }
])

const drawerVisible = ref(false)
const detailRecord = ref<any>(null)
const viewDetail = (record: any) => { detailRecord.value = record; drawerVisible.value = true }
const viewLarge = (record: any) => { viewDetail(record) }
const exportExcel = () => { message.success('Excel导出成功') }
const exportReport = () => { message.success('巡检报告已导出') }
</script>

<style scoped lang="scss">
.ai-record {
  .filter-card, .table-card, .stats-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
  .snapshot-thumb {
    width: 36px;
    height: 36px;
    background: #f0f5ff;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 16px;
  }
  .confidence-high { color: #52c41a; font-weight: 600; }
  .confidence-mid { color: #faad14; font-weight: 600; }
  .confidence-low { color: #ff4d4f; font-weight: 600; }
  .detail-image {
    img { width: 100%; border-radius: 6px; max-height: 300px; object-fit: cover; }
  }
}
</style>
