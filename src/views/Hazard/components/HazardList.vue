<template>
  <div class="hazard-list">
    <!-- 统计概览 -->
    <div class="stats-row">
      <div class="stat-card" v-for="stat in statsData" :key="stat.label" @click="filterByStat(stat.key)">
        <div class="stat-icon" :style="{ background: stat.iconBg }">
          <component :is="stat.icon" :style="{ color: stat.iconColor, fontSize: '24px' }" />
        </div>
        <div class="stat-info">
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-value" :style="{ color: stat.valueColor }">{{ stat.value }}<span class="stat-suffix">{{ stat.suffix }}</span></div>
        </div>
      </div>
    </div>

    <!-- 状态筛选标签 + 操作按钮 -->
    <a-card :bordered="false" class="toolbar-card">
      <a-row justify="space-between" align="middle">
        <a-col>
          <a-radio-group v-model:value="statusTab" button-style="solid" @change="onStatusTabChange">
            <a-radio-button value="all">全部</a-radio-button>
            <a-radio-button value="待派单">待派单</a-radio-button>
            <a-radio-button value="处置中">处置中</a-radio-button>
            <a-radio-button value="待复核">待复核</a-radio-button>
            <a-radio-button value="已闭环">已闭环</a-radio-button>
          </a-radio-group>
        </a-col>
        <a-col>
          <a-space>
            <a-button @click="batchDispatch">批量派单</a-button>
            <a-button @click="batchExport">批量导出</a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- 多维筛选 -->
    <a-card :bordered="false" class="filter-card" style="margin-top: 16px">
      <a-row justify="space-between" align="middle">
        <a-col>
          <a-space wrap>
            <a-select v-model:value="timeRange" style="width: 100px">
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
            <a-select v-model:value="typeFilter" placeholder="类型" style="width: 140px" allow-clear>
              <a-select-option v-for="t in hazardTypes" :key="t" :value="t">{{ t }}</a-select-option>
            </a-select>
            <a-select v-model:value="levelFilter" placeholder="等级" style="width: 100px" allow-clear>
              <a-select-option value="重大">重大</a-select-option>
              <a-select-option value="较大">较大</a-select-option>
              <a-select-option value="一般">一般</a-select-option>
            </a-select>
            <a-select v-model:value="sourceFilter" placeholder="来源" style="width: 110px" allow-clear>
              <a-select-option value="AI识别">AI识别</a-select-option>
              <a-select-option value="随手拍">随手拍</a-select-option>
              <a-select-option value="人工上报">人工上报</a-select-option>
            </a-select>
            <a-input-search v-model:value="searchKeyword" placeholder="搜索编号/名称/位置" style="width: 180px" />
          </a-space>
        </a-col>
        <a-col>
          <a-button @click="refreshData">刷新</a-button>
        </a-col>
      </a-row>
    </a-card>

    <!-- 数据表格 -->
    <a-card :bordered="false" style="margin-top: 16px">
      <a-table
        :columns="columns"
        :data-source="filteredData"
        :pagination="{ pageSize: 10, showTotal: (t: number) => `共 ${t} 条记录`, showSizeChanger: true }"
        row-key="id"
        size="small"
        :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'level'">
            <a-tag :color="levelColorMap[record.level]">{{ record.level }}</a-tag>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="statusColorMap[record.status]">{{ record.status }}</a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button v-if="record.status === '待派单'" type="link" size="small" @click="handleDispatch(record)">派单</a-button>
            <a-button v-else-if="record.status === '处置中'" type="link" size="small" @click="handleDisposal(record)">处置</a-button>
            <a-button v-else-if="record.status === '待复核'" type="link" size="small" @click="handleReview(record)">复核</a-button>
            <a-button v-else type="link" size="small" @click="handleView(record)">查看</a-button>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { message } from 'ant-design-vue'
import {
  ClockCircleOutlined,
  SyncOutlined,
  FileSearchOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue'

const emit = defineEmits<{ action: [payload: { record: any; action: string }] }>()

const statusTab = ref('all')
const timeRange = ref('today')
const stageFilter = ref<string>()
const typeFilter = ref<string>()
const levelFilter = ref<string>()
const sourceFilter = ref<string>()
const searchKeyword = ref('')
const selectedRowKeys = ref<number[]>([])

const hazardTypes = ['未佩戴安全帽', '临边防护缺失', '外架与作业面不同步', '电焊不规范', '吊篮超员', '圆盘锯防护缺失']
const levelColorMap: Record<string, string> = { '重大': 'red', '较大': 'orange', '一般': 'gold' }
const statusColorMap: Record<string, string> = { '待派单': 'default', '处置中': 'processing', '待复核': 'warning', '已闭环': 'success' }

const columns = [
  { title: '编号', dataIndex: 'code', key: 'code', width: 90 },
  { title: '隐患类型', dataIndex: 'type', key: 'type', width: 160 },
  { title: '等级', key: 'level', width: 80 },
  { title: '阶段', dataIndex: 'stage', key: 'stage', width: 70 },
  { title: '位置', dataIndex: 'location', key: 'location', width: 120 },
  { title: '状态', key: 'status', width: 90 },
  { title: '发现时间', dataIndex: 'discoverTime', key: 'discoverTime', width: 160 },
  { title: '操作', key: 'action', width: 80 }
]

const recordData = ref([
  { id: 1, code: 'YH-001', type: '外架与作业面不同步', level: '重大', stage: '主体', location: '2#塔吊作业区', status: '待派单', discoverTime: '2026-06-23 14:28' },
  { id: 2, code: 'YH-002', type: '临边防护缺失', level: '较大', stage: '基础', location: '东侧基坑', status: '待派单', discoverTime: '2026-06-23 14:15' },
  { id: 3, code: 'YH-003', type: '吊篮超员>2人', level: '较大', stage: '装修', location: '装修作业面', status: '处置中', discoverTime: '2026-06-23 13:52' },
  { id: 4, code: 'YH-004', type: '未佩戴安全帽', level: '一般', stage: '通用', location: '南侧通道', status: '待复核', discoverTime: '2026-06-23 13:30' },
  { id: 5, code: 'YH-005', type: '电焊未设防护屏', level: '一般', stage: '通用', location: '加工区#3', status: '已闭环', discoverTime: '2026-06-23 13:05' },
  { id: 6, code: 'YH-006', type: '圆盘锯缺少防护罩', level: '一般', stage: '通用', location: '加工区#3', status: '待派单', discoverTime: '2026-06-23 12:48' },
  { id: 7, code: 'YH-007', type: '未佩戴安全帽', level: '一般', stage: '通用', location: '南侧通道#2', status: '已闭环', discoverTime: '2026-06-23 12:30' },
  { id: 8, code: 'YH-008', type: '临边防护缺失', level: '较大', stage: '主体', location: '北侧脚手架#4', status: '处置中', discoverTime: '2026-06-23 11:50' }
])

const filteredData = computed(() => {
  let data = recordData.value
  if (statusTab.value !== 'all') data = data.filter(d => d.status === statusTab.value)
  if (stageFilter.value) data = data.filter(d => d.stage === stageFilter.value)
  if (typeFilter.value) data = data.filter(d => d.type === typeFilter.value)
  if (levelFilter.value) data = data.filter(d => d.level === levelFilter.value)
  if (sourceFilter.value) data = data.filter(() => true)
  if (searchKeyword.value) data = data.filter(d => d.code.includes(searchKeyword.value) || d.type.includes(searchKeyword.value) || d.location.includes(searchKeyword.value))
  return data
})

const statsData = ref([
  { key: '待派单', label: '待派单', value: 12, suffix: '起', icon: ClockCircleOutlined, iconBg: '#f0f5ff', iconColor: '#1677ff', valueColor: '#1677ff' },
  { key: '处置中', label: '处置中', value: 23, suffix: '起', icon: SyncOutlined, iconBg: '#e6f7ff', iconColor: '#13c2c2', valueColor: '#13c2c2' },
  { key: '待复核', label: '待复核', value: 8, suffix: '起', icon: FileSearchOutlined, iconBg: '#fff7e6', iconColor: '#fa8c16', valueColor: '#fa8c16' },
  { key: '已闭环', label: '已闭环', value: 84, suffix: '起', icon: CheckCircleOutlined, iconBg: '#f6ffed', iconColor: '#52c41a', valueColor: '#52c41a' },
  { key: 'timeout', label: '超时', value: 3, suffix: '起', icon: ExclamationCircleOutlined, iconBg: '#fff2f0', iconColor: '#ff4d4f', valueColor: '#ff4d4f' }
])

const onSelectChange = (keys: number[]) => { selectedRowKeys.value = keys }
const onStatusTabChange = () => { /* filtered by computed */ }
const filterByStat = (key: string) => { if (key !== 'timeout') statusTab.value = key }
const handleDispatch = (record: any) => { emit('action', { record, action: 'dispatch' }) }
const handleDisposal = (record: any) => { emit('action', { record, action: 'disposal' }) }
const handleReview = (record: any) => { emit('action', { record, action: 'review' }) }
const handleView = (record: any) => { emit('action', { record, action: 'view' }) }
const batchDispatch = () => { message.success('批量派单成功') }
const batchExport = () => { message.success('导出成功') }
const refreshData = () => { message.info('数据已刷新') }
</script>

<style scoped lang="scss">
.hazard-list {
  .stats-row {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;

    .stat-card {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 12px;
      background: #fff;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .stat-info {
        .stat-label {
          font-size: 13px;
          color: #666;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 600;
          line-height: 1;

          .stat-suffix {
            font-size: 12px;
            font-weight: 400;
            color: #999;
            margin-left: 4px;
          }
        }
      }
    }
  }

  .toolbar-card, .filter-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
}
</style>
