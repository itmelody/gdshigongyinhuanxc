<template>
  <div class="rule-engine">
    <a-card :bordered="false" class="config-card">
      <a-tabs v-model:activeKey="activeTab">
        <!-- Tab 1: 隐患识别规则 -->
        <a-tab-pane key="identify" tab="隐患识别规则">
          <div class="toolbar">
            <a-space>
              <a-select v-model:value="identifyFilter" placeholder="按阶段筛选" allow-clear style="width: 140px">
                <a-select-option value="通用">通用</a-select-option>
                <a-select-option value="基础">基础</a-select-option>
                <a-select-option value="主体">主体</a-select-option>
                <a-select-option value="装修">装修</a-select-option>
              </a-select>
              <a-input-search v-model:value="identifySearch" placeholder="搜索隐患名称" style="width: 200px" />
              <a-button @click="batchEnable">批量启用</a-button>
              <a-button @click="batchDisable">批量停用</a-button>
            </a-space>
          </div>
          <a-table
            :columns="identifyColumns"
            :data-source="filteredIdentifyData"
            :row-selection="{ selectedRowKeys: selectedRows, onChange: onSelectChange }"
            :pagination="false"
            row-key="id"
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'enabled'">
                <a-switch v-model:checked="record.enabled" size="small" />
              </template>
              <template v-else-if="column.key === 'action'">
                <a-button type="link" size="small" @click="editIdentify(record)">编辑</a-button>
              </template>
            </template>
          </a-table>
        </a-tab-pane>

        <!-- Tab 2: 预警与分发规则 -->
        <a-tab-pane key="warning" tab="预警与分发规则">
          <h4 style="margin-bottom: 12px">预警等级映射</h4>
          <a-table :columns="warningColumns" :data-source="warningLevelData" :pagination="false" row-key="id" size="small">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'level'">
                <a-select v-model:value="record.level" size="small" style="width: 90px">
                  <a-select-option value="重大"><span style="color:#ff4d4f">重大</span></a-select-option>
                  <a-select-option value="较大"><span style="color:#faad14">较大</span></a-select-option>
                  <a-select-option value="一般"><span style="color:#1890ff">一般</span></a-select-option>
                </a-select>
              </template>
            </template>
          </a-table>

          <h4 style="margin: 24px 0 12px">分发对象配置</h4>
          <a-table :columns="dispatchColumns" :data-source="dispatchData" :pagination="false" row-key="level" size="small">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'action'">
                <a-button type="link" size="small" @click="editDispatch(record)">编辑</a-button>
              </template>
            </template>
          </a-table>

          <h4 style="margin: 24px 0 12px">超时升级策略</h4>
          <a-form layout="inline" :model="timeoutPolicy">
            <a-form-item label="超时升级通知">
              <a-input v-model:value="timeoutPolicy.target" style="width: 120px" />
            </a-form-item>
            <a-form-item label="超时时长">
              <a-input-number v-model:value="timeoutPolicy.minutes" :min="10" :max="480" />
              <span style="margin-left:4px">分钟</span>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" size="small" @click="saveTimeout">保存</a-button>
            </a-form-item>
          </a-form>
        </a-tab-pane>

        <!-- Tab 3: 巡检调度规则 -->
        <a-tab-pane key="schedule" tab="巡检调度规则">
          <div class="toolbar">
            <a-space>
              <a-button type="primary" @click="addPlan">新增计划</a-button>
            </a-space>
          </div>
          <a-table :columns="planColumns" :data-source="planData" :pagination="false" row-key="id" size="small">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-switch v-model:checked="record.enabled" size="small" />
              </template>
              <template v-else-if="column.key === 'action'">
                <a-space>
                  <a-button type="link" size="small" @click="editPlan(record)">编辑</a-button>
                  <a-button type="link" danger size="small" @click="deletePlan(record)">删除</a-button>
                </a-space>
              </template>
            </template>
          </a-table>

          <h4 style="margin: 24px 0 12px">重点区域配置</h4>
          <div class="area-tags">
            <a-tag v-for="area in keyAreas" :key="area" closable @close="removeArea(area)" color="blue">{{ area }}</a-tag>
            <a-input v-if="areaInputVisible" v-model:value="newArea" size="small" style="width: 120px" @blur="addArea" @keyup.enter="addArea" />
            <a-tag v-else style="cursor:pointer" @click="showAreaInput">+ 新增区域</a-tag>
          </div>

          <h4 style="margin: 24px 0 12px">规则优先级排序</h4>
          <div class="priority-list">
            <div v-for="(rule, i) in priorityRules" :key="rule.id" class="priority-item">
              <span class="priority-index">{{ i + 1 }}</span>
              <span class="priority-name">{{ rule.name }}</span>
              <a-space>
                <a-button size="small" :disabled="i === 0" @click="moveRule(i, -1)">上移</a-button>
                <a-button size="small" :disabled="i === priorityRules.length - 1" @click="moveRule(i, 1)">下移</a-button>
              </a-space>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- 编辑侧滑面板 -->
    <a-drawer v-model:open="drawerVisible" :title="drawerTitle" width="400" @close="drawerVisible = false">
      <a-form :model="editForm" layout="vertical">
        <a-form-item label="置信度阈值">
          <a-slider v-model:value="editForm.threshold" :min="70" :max="99" :tip-formatter="(v: number) => v + '%'" />
          <span>{{ editForm.threshold }}%</span>
        </a-form-item>
        <a-form-item label="识别灵敏度">
          <a-select v-model:value="editForm.sensitivity">
            <a-select-option value="高">高（检出多但误报可能较高）</a-select-option>
            <a-select-option value="中">中（平衡精度和召回）</a-select-option>
            <a-select-option value="低">低（输出更精准）</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="备注说明">
          <a-textarea v-model:value="editForm.remark" :rows="3" placeholder="记录配置原因" />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-space>
          <a-button @click="drawerVisible = false">取消</a-button>
          <a-button type="primary" @click="saveEdit">保存</a-button>
        </a-space>
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'

const activeTab = ref('identify')

// === Tab 1: 隐患识别规则 ===
const identifyFilter = ref<string>()
const identifySearch = ref('')
const selectedRows = ref<number[]>([])

const identifyData = ref([
  { id: 1, enabled: true, name: '未正确佩戴安全帽', stage: '通用', threshold: 92, sensitivity: '中' },
  { id: 2, enabled: true, name: '临边防护缺失', stage: '基础/主体', threshold: 90, sensitivity: '中' },
  { id: 3, enabled: false, name: '吸烟', stage: '通用', threshold: 85, sensitivity: '低' },
  { id: 4, enabled: true, name: '吊篮超员>2人', stage: '装修', threshold: 93, sensitivity: '高' },
  { id: 5, enabled: true, name: '未穿反光背心', stage: '通用', threshold: 88, sensitivity: '中' },
  { id: 6, enabled: true, name: '脚手架连接松动', stage: '主体', threshold: 91, sensitivity: '高' },
  { id: 7, enabled: true, name: '基坑支护异常', stage: '基础', threshold: 90, sensitivity: '高' },
  { id: 8, enabled: false, name: '饮酒作业', stage: '通用', threshold: 80, sensitivity: '低' },
  { id: 9, enabled: true, name: '电焊作业不规范', stage: '装修', threshold: 89, sensitivity: '中' },
  { id: 10, enabled: true, name: '围挡缺失', stage: '装修', threshold: 91, sensitivity: '中' }
])

const filteredIdentifyData = computed(() => {
  let data = identifyData.value
  if (identifyFilter.value) data = data.filter(d => d.stage.includes(identifyFilter.value!))
  if (identifySearch.value) data = data.filter(d => d.name.includes(identifySearch.value))
  return data
})

const identifyColumns = [
  { title: '启用', key: 'enabled', width: 60 },
  { title: '隐患名称', dataIndex: 'name', key: 'name' },
  { title: '所属阶段', dataIndex: 'stage', key: 'stage', width: 100 },
  { title: '置信度阈值', dataIndex: 'threshold', key: 'threshold', width: 110, customRender: ({ text }: any) => text + '%' },
  { title: '灵敏度', dataIndex: 'sensitivity', key: 'sensitivity', width: 80 },
  { title: '操作', key: 'action', width: 80 }
]

const onSelectChange = (keys: number[]) => { selectedRows.value = keys }
const batchEnable = () => {
  selectedRows.value.forEach(id => {
    const item = identifyData.value.find(d => d.id === id)
    if (item) item.enabled = true
  })
  message.success('已批量启用')
}
const batchDisable = () => {
  selectedRows.value.forEach(id => {
    const item = identifyData.value.find(d => d.id === id)
    if (item) item.enabled = false
  })
  message.success('已批量停用')
}

// 编辑侧滑
const drawerVisible = ref(false)
const drawerTitle = ref('编辑识别规则')
const editForm = reactive({ id: 0, threshold: 90, sensitivity: '中', remark: '' })
const editIdentify = (record: any) => {
  editForm.id = record.id
  editForm.threshold = record.threshold
  editForm.sensitivity = record.sensitivity
  editForm.remark = ''
  drawerTitle.value = `编辑：${record.name}`
  drawerVisible.value = true
}
const saveEdit = () => {
  const item = identifyData.value.find(d => d.id === editForm.id)
  if (item) {
    item.threshold = editForm.threshold
    item.sensitivity = editForm.sensitivity
  }
  drawerVisible.value = false
  message.success('保存成功')
}

// === Tab 2: 预警与分发规则 ===
const warningColumns = [
  { title: '隐患名称', dataIndex: 'name', key: 'name' },
  { title: '当前等级', key: 'level', width: 120 }
]
const warningLevelData = ref([
  { id: 1, name: '未正确佩戴安全帽', level: '较大' },
  { id: 2, name: '临边防护缺失', level: '重大' },
  { id: 3, name: '吸烟', level: '一般' },
  { id: 4, name: '吊篮超员>2人', level: '重大' },
  { id: 5, name: '脚手架连接松动', level: '重大' }
])

const dispatchColumns = [
  { title: '预警等级', dataIndex: 'level', key: 'level', width: 80 },
  { title: '一级分发对象', dataIndex: 'primary', key: 'primary' },
  { title: '二级分发对象（抄送）', dataIndex: 'secondary', key: 'secondary' },
  { title: '响应时限', dataIndex: 'timeout', key: 'timeout', width: 100 },
  { title: '操作', key: 'action', width: 80 }
]
const dispatchData = ref([
  { level: '重大', primary: '项目经理 + 安全总监', secondary: '项目总监 + 监管部门', timeout: '1小时' },
  { level: '较大', primary: '安全员 + 项目经理', secondary: '项目总监', timeout: '2小时' },
  { level: '一般', primary: '安全员', secondary: '项目经理', timeout: '2小时' }
])
const editDispatch = (record: any) => { message.info(`编辑 ${record.level} 级分发规则`) }

const timeoutPolicy = reactive({ target: '项目总监', minutes: 60 })
const saveTimeout = () => { message.success('超时升级策略已保存') }

// === Tab 3: 巡检调度规则 ===
const planColumns = [
  { title: '计划名称', dataIndex: 'name', key: 'name' },
  { title: '执行频率', dataIndex: 'frequency', key: 'frequency', width: 90 },
  { title: '时间段', dataIndex: 'timeRange', key: 'timeRange', width: 140 },
  { title: '巡检频次', dataIndex: 'interval', key: 'interval', width: 120 },
  { title: '状态', key: 'status', width: 80 },
  { title: '操作', key: 'action', width: 120 }
]
const planData = ref([
  { id: 1, name: '日常巡检', frequency: '每日', timeRange: '09:00-18:00', interval: '每30分钟', enabled: true },
  { id: 2, name: '夜间巡查', frequency: '每日', timeRange: '20:00-06:00', interval: '每60分钟', enabled: true },
  { id: 3, name: '周末专项检查', frequency: '每周', timeRange: '08:00-17:00', interval: '每15分钟', enabled: false }
])
const addPlan = () => { message.info('打开新增计划表单') }
const editPlan = (record: any) => { message.info(`编辑计划：${record.name}`) }
const deletePlan = (record: any) => {
  const idx = planData.value.findIndex(p => p.id === record.id)
  if (idx > -1) { planData.value.splice(idx, 1); message.success('删除成功') }
}

// 重点区域
const keyAreas = ref(['基坑区域', '2#塔吊作业区', '东侧临边', '南侧通道'])
const areaInputVisible = ref(false)
const newArea = ref('')
const showAreaInput = () => { areaInputVisible.value = true }
const addArea = () => {
  if (newArea.value.trim()) { keyAreas.value.push(newArea.value.trim()); newArea.value = '' }
  areaInputVisible.value = false
}
const removeArea = (area: string) => {
  keyAreas.value = keyAreas.value.filter(a => a !== area)
}

// 优先级排序
const priorityRules = ref([
  { id: 1, name: '重大隐患即时报警规则' },
  { id: 2, name: '安全帽检测规则' },
  { id: 3, name: '临边防护检测规则' },
  { id: 4, name: '常规巡检调度规则' }
])
const moveRule = (index: number, dir: number) => {
  const list = priorityRules.value
  const target = index + dir
  if (target < 0 || target >= list.length) return
  const temp = list[index]
  list[index] = list[target]
  list[target] = temp
  priorityRules.value = [...list]
}
</script>

<style scoped lang="scss">
.rule-engine {
  .config-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
  .toolbar {
    margin-bottom: 12px;
  }
  .area-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }
  .priority-list {
    .priority-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      border: 1px solid #f0f0f0;
      border-radius: 6px;
      margin-bottom: 8px;
      background: #fafafa;

      .priority-index {
        width: 24px;
        height: 24px;
        background: #1890ff;
        color: #fff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
      }
      .priority-name {
        flex: 1;
      }
    }
  }
}
</style>
