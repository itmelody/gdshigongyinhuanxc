<template>
  <div class="inspection-task">
    <a-card :bordered="false" class="config-card">
      <a-tabs v-model:activeKey="activeTab">
        <!-- 自动巡检计划 -->
        <a-tab-pane key="plan" tab="自动巡检计划">
          <div class="toolbar">
            <a-button type="primary" @click="addPlan">+ 新建计划</a-button>
          </div>
          <a-table :columns="planColumns" :data-source="planData" :pagination="false" row-key="id" size="small">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <span class="status-dot" :class="record.running ? 'running' : 'stopped'">
                  {{ record.running ? '●' : '○' }}
                </span>
                {{ record.running ? '运行中' : '已停用' }}
              </template>
              <template v-else-if="column.key === 'action'">
                <a-space>
                  <a-button type="link" size="small" @click="editPlan(record)">编辑</a-button>
                  <a-button type="link" size="small" @click="togglePlan(record)">
                    {{ record.running ? '暂停' : '启动' }}
                  </a-button>
                </a-space>
              </template>
            </template>
          </a-table>
        </a-tab-pane>

        <!-- 临时巡检任务 -->
        <a-tab-pane key="temp" tab="临时任务">
          <div class="toolbar">
            <a-button type="primary" @click="addTempTask">+ 创建临时任务</a-button>
          </div>
          <a-table :columns="tempColumns" :data-source="tempData" :pagination="false" row-key="id" size="small">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag :color="statusColorMap[record.status]">{{ record.status }}</a-tag>
              </template>
              <template v-else-if="column.key === 'action'">
                <a-space>
                  <a-button v-if="record.status === '待执行'" type="link" size="small" @click="executeTask(record)">执行</a-button>
                  <a-button v-if="record.status === '待执行'" type="link" size="small" @click="editTempTask(record)">编辑</a-button>
                  <a-button v-if="record.status === '已完成'" type="link" size="small" @click="viewReport(record)">查看报告</a-button>
                </a-space>
              </template>
            </template>
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- 新建/编辑计划弹窗 -->
    <a-modal v-model:open="planModalVisible" :title="isEditPlan ? '编辑巡检计划' : '新建巡检计划'" width="550px" @ok="savePlan" @cancel="planModalVisible = false">
      <a-form :model="planForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="计划名称" required>
          <a-input v-model:value="planForm.name" placeholder="如：每日全工地巡检" />
        </a-form-item>
        <a-form-item label="执行频率" required>
          <a-select v-model:value="planForm.frequency">
            <a-select-option value="每日">每日</a-select-option>
            <a-select-option value="每周">每周</a-select-option>
            <a-select-option value="每月">每月</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="巡检时段" required>
          <a-time-range-picker v-model:value="planForm.timeRange" format="HH:mm" style="width: 100%" />
        </a-form-item>
        <a-form-item label="覆盖区域">
          <a-select v-model:value="planForm.coverage" mode="multiple" placeholder="选择覆盖的摄像头/区域">
            <a-select-option value="全部摄像头">全部摄像头</a-select-option>
            <a-select-option value="高风险区域">高风险区域</a-select-option>
            <a-select-option value="南侧通道">南侧通道</a-select-option>
            <a-select-option value="东侧基坑">东侧基坑</a-select-option>
            <a-select-option value="加工区">加工区</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="巡检频次">
          <a-input-number v-model:value="planForm.interval" :min="5" :max="120" />
          <span style="margin-left: 4px">分钟/次</span>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 创建临时任务弹窗 -->
    <a-modal v-model:open="tempModalVisible" title="创建临时巡检任务" width="500px" @ok="saveTempTask" @cancel="tempModalVisible = false">
      <a-form :model="tempForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="任务名称" required>
          <a-input v-model:value="tempForm.name" placeholder="如：台风前专项排查" />
        </a-form-item>
        <a-form-item label="执行时间" required>
          <a-date-picker v-model:value="tempForm.executeTime" show-time style="width: 100%" />
        </a-form-item>
        <a-form-item label="覆盖范围">
          <a-select v-model:value="tempForm.coverage" mode="multiple" placeholder="选择范围">
            <a-select-option value="全部摄像头">全部摄像头</a-select-option>
            <a-select-option value="塔吊作业区">塔吊作业区</a-select-option>
            <a-select-option value="基坑区域">基坑区域</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'

const activeTab = ref('plan')
const statusColorMap: Record<string, string> = { '待执行': 'default', '执行中': 'processing', '已完成': 'success', '异常': 'error' }

// === 自动巡检计划 ===
const planColumns = [
  { title: '计划名称', dataIndex: 'name', key: 'name' },
  { title: '执行频率', dataIndex: 'frequency', key: 'frequency', width: 90 },
  { title: '巡检时段', dataIndex: 'timeRange', key: 'timeRange', width: 140 },
  { title: '覆盖区域', dataIndex: 'coverage', key: 'coverage', width: 120 },
  { title: '状态', key: 'status', width: 100 },
  { title: '操作', key: 'action', width: 120 }
]
const planData = ref([
  { id: 1, name: '每日全工地巡检', frequency: '每日', timeRange: '09:00-18:00', coverage: '全部摄像头', running: true },
  { id: 2, name: '重点区域加密巡检', frequency: '每日', timeRange: '09:00-18:00', coverage: '高风险区域', running: true },
  { id: 3, name: '夜间安全巡查', frequency: '每日', timeRange: '20:00-06:00', coverage: '全部摄像头', running: false },
  { id: 4, name: '每周专项巡检', frequency: '每周', timeRange: '周一 14:00', coverage: '主体阶段', running: true }
])

const planModalVisible = ref(false)
const isEditPlan = ref(false)
const planForm = reactive({ id: 0, name: '', frequency: '每日', timeRange: null, coverage: [], interval: 30 })

const addPlan = () => {
  isEditPlan.value = false
  Object.assign(planForm, { id: 0, name: '', frequency: '每日', timeRange: null, coverage: [], interval: 30 })
  planModalVisible.value = true
}
const editPlan = (record: any) => {
  isEditPlan.value = true
  Object.assign(planForm, { id: record.id, name: record.name, frequency: record.frequency, coverage: [record.coverage], interval: 30 })
  planModalVisible.value = true
}
const togglePlan = (record: any) => {
  record.running = !record.running
  message.success(`${record.name} 已${record.running ? '启动' : '暂停'}`)
}
const savePlan = () => {
  if (!planForm.name) { message.warning('请填写计划名称'); return }
  planModalVisible.value = false
  message.success(isEditPlan.value ? '计划已更新' : '计划已创建')
}

// === 临时巡检任务 ===
const tempColumns = [
  { title: '任务名称', dataIndex: 'name', key: 'name' },
  { title: '执行时间', dataIndex: 'executeTime', key: 'executeTime', width: 160 },
  { title: '覆盖范围', dataIndex: 'coverage', key: 'coverage', width: 120 },
  { title: '执行状态', key: 'status', width: 100 },
  { title: '操作', key: 'action', width: 140 }
]
const tempData = ref([
  { id: 1, name: '台风前专项排查', executeTime: '2026-06-23 16:00', coverage: '全部摄像头', status: '待执行' },
  { id: 2, name: '塔吊专项检查', executeTime: '2026-06-22 10:00', coverage: '塔吊作业区', status: '已完成' },
  { id: 3, name: '暴雨后基坑复查', executeTime: '2026-06-21 08:00', coverage: '基坑区域', status: '已完成' }
])

const tempModalVisible = ref(false)
const tempForm = reactive({ id: 0, name: '', executeTime: null, coverage: [] })

const addTempTask = () => {
  Object.assign(tempForm, { id: 0, name: '', executeTime: null, coverage: [] })
  tempModalVisible.value = true
}
const editTempTask = (record: any) => {
  Object.assign(tempForm, { ...record })
  tempModalVisible.value = true
}
const executeTask = (record: any) => {
  record.status = '执行中'
  message.success('任务已开始执行')
}
const viewReport = (record: any) => { message.info(`查看巡检报告：${record.name}`) }
const saveTempTask = () => {
  if (!tempForm.name) { message.warning('请填写任务名称'); return }
  tempModalVisible.value = false
  message.success('临时任务已创建')
}
</script>

<style scoped lang="scss">
.inspection-task {
  .config-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
  .toolbar {
    margin-bottom: 12px;
  }
  .status-dot {
    margin-right: 4px;
    &.running { color: #52c41a; }
    &.stopped { color: #d9d9d9; }
  }
}
</style>
