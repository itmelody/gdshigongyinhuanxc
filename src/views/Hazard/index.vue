<template>
  <div class="hazard-page">
    <!-- 搜索栏 -->
    <a-card :bordered="false" class="search-card">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="隐患区域">
          <a-select v-model:value="searchForm.area" placeholder="请选择" style="width: 150px" allow-clear>
            <a-select-option value="A区">A区</a-select-option>
            <a-select-option value="B区">B区</a-select-option>
            <a-select-option value="C区">C区</a-select-option>
            <a-select-option value="D区">D区</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="隐患类型">
          <a-select v-model:value="searchForm.type" placeholder="请选择" style="width: 150px" allow-clear>
            <a-select-option value="高处作业">高处作业</a-select-option>
            <a-select-option value="临时用电">临时用电</a-select-option>
            <a-select-option value="脚手架">脚手架</a-select-option>
            <a-select-option value="机械设备">机械设备</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="风险等级">
          <a-select v-model:value="searchForm.level" placeholder="请选择" style="width: 120px" allow-clear>
            <a-select-option value="高">高</a-select-option>
            <a-select-option value="中">中</a-select-option>
            <a-select-option value="低">低</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="处理状态">
          <a-select v-model:value="searchForm.status" placeholder="请选择" style="width: 120px" allow-clear>
            <a-select-option value="待整改">待整改</a-select-option>
            <a-select-option value="整改中">整改中</a-select-option>
            <a-select-option value="已整改">已整改</a-select-option>
            <a-select-option value="已验收">已验收</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">
            <template #icon><SearchOutlined /></template>
            搜索
          </a-button>
          <a-button @click="handleReset" style="margin-left: 8px">重置</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 操作按钮 -->
    <a-card :bordered="false" class="toolbar-card">
      <a-space>
        <a-button type="primary" danger @click="showAddModal">
          <template #icon><ExclamationCircleOutlined /></template>
          新增隐患
        </a-button>
        <a-button>
          <template #icon><ExportOutlined /></template>
          导出
        </a-button>
        <a-button>
          <template #icon><ReloadOutlined /></template>
          批量处理
        </a-button>
      </a-space>
    </a-card>

    <!-- 数据表格 -->
    <a-card :bordered="false">
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :pagination="pagination"
        :loading="loading"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'level'">
            <a-tag :color="getLevelColor(record.level)">
              {{ record.level }}风险
            </a-tag>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ record.status }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="viewDetail(record)">查看</a-button>
              <a-button 
                v-if="record.status === '待整改'" 
                type="link" 
                size="small" 
                @click="startRectify(record)"
              >
                整改
              </a-button>
              <a-button 
                v-if="record.status === '已整改'" 
                type="link" 
                size="small" 
                @click="acceptRecord(record)"
              >
                验收
              </a-button>
              <a-button type="link" danger size="small" @click="deleteRecord(record)">删除</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增隐患弹窗 -->
    <a-modal
      v-model:open="addModalVisible"
      title="新增隐患记录"
      width="700px"
      @ok="handleAddSubmit"
      @cancel="handleAddCancel"
    >
      <a-form :model="addForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="隐患名称" required>
          <a-input v-model:value="addForm.name" placeholder="请输入隐患名称" />
        </a-form-item>
        <a-form-item label="隐患区域" required>
          <a-select v-model:value="addForm.area" placeholder="请选择">
            <a-select-option value="A区">A区</a-select-option>
            <a-select-option value="B区">B区</a-select-option>
            <a-select-option value="C区">C区</a-select-option>
            <a-select-option value="D区">D区</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="隐患类型" required>
          <a-select v-model:value="addForm.type" placeholder="请选择">
            <a-select-option value="高处作业">高处作业</a-select-option>
            <a-select-option value="临时用电">临时用电</a-select-option>
            <a-select-option value="脚手架">脚手架</a-select-option>
            <a-select-option value="机械设备">机械设备</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="风险等级" required>
          <a-radio-group v-model:value="addForm.level">
            <a-radio value="高">高风险</a-radio>
            <a-radio value="中">中风险</a-radio>
            <a-radio value="低">低风险</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="发现时间" required>
          <a-date-picker v-model:value="addForm.discoverTime" show-time style="width: 100%" />
        </a-form-item>
        <a-form-item label="责任人" required>
          <a-select v-model:value="addForm.responsiblePerson" placeholder="请选择">
            <a-select-option value="张三">张三</a-select-option>
            <a-select-option value="李四">李四</a-select-option>
            <a-select-option value="王五">王五</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="隐患描述" required>
          <a-textarea v-model:value="addForm.description" :rows="4" placeholder="请详细描述隐患情况" />
        </a-form-item>
        <a-form-item label="现场照片">
          <a-upload list-type="picture-card" :max-count="3">
            <div>
              <PlusOutlined />
              <div style="margin-top: 8px">上传</div>
            </div>
          </a-upload>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 查看详情弹窗 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="隐患详情"
      width="700px"
      :footer="null"
    >
      <a-descriptions bordered :column="2">
        <a-descriptions-item label="隐患名称">{{ currentRecord?.name }}</a-descriptions-item>
        <a-descriptions-item label="隐患区域">{{ currentRecord?.area }}</a-descriptions-item>
        <a-descriptions-item label="隐患类型">{{ currentRecord?.type }}</a-descriptions-item>
        <a-descriptions-item label="风险等级">
          <a-tag :color="getLevelColor(currentRecord?.level || '')">
            {{ currentRecord?.level }}风险
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="发现时间">{{ currentRecord?.discoverTime }}</a-descriptions-item>
        <a-descriptions-item label="处理状态">
          <a-tag :color="getStatusColor(currentRecord?.status || '')">
            {{ currentRecord?.status }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="责任人">{{ currentRecord?.responsiblePerson }}</a-descriptions-item>
        <a-descriptions-item label="发现人">{{ currentRecord?.discoverer }}</a-descriptions-item>
        <a-descriptions-item label="隐患描述" :span="2">
          {{ currentRecord?.description }}
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { SearchOutlined, ExclamationCircleOutlined, ExportOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons-vue'

// 搜索表单
const searchForm = reactive({
  area: undefined,
  type: undefined,
  level: undefined,
  status: undefined
})

// 表格数据
const loading = ref(false)
const dataSource = ref([
  {
    id: 1,
    name: 'B区临时用电线路裸露',
    area: 'B区',
    type: '临时用电',
    level: '高',
    discoverTime: '2026-06-23 10:30',
    responsiblePerson: '张三',
    discoverer: '李四',
    description: '施工现场临时用电电缆线外皮破损，铜芯裸露，存在触电风险。',
    status: '待整改'
  },
  {
    id: 2,
    name: 'C区脚手架连墙件缺失',
    area: 'C区',
    type: '脚手架',
    level: '中',
    discoverTime: '2026-06-22 15:20',
    responsiblePerson: '王五',
    discoverer: '张三',
    description: '三层脚手架连墙件数量不足，部分位置未按规范设置。',
    status: '整改中'
  },
  {
    id: 3,
    name: 'A区高空作业人员未系安全带',
    area: 'A区',
    type: '高处作业',
    level: '高',
    discoverTime: '2026-06-22 09:15',
    responsiblePerson: '赵六',
    discoverer: '李四',
    description: '两名工人在5米以上高空作业时未按规定佩戴安全带。',
    status: '已整改'
  }
])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 3
})

// 表格列定义
const columns = [
  { title: '隐患名称', dataIndex: 'name', key: 'name', width: 200 },
  { title: '隐患区域', dataIndex: 'area', key: 'area', width: 100 },
  { title: '隐患类型', dataIndex: 'type', key: 'type', width: 120 },
  { title: '风险等级', dataIndex: 'level', key: 'level', width: 100 },
  { title: '发现时间', dataIndex: 'discoverTime', key: 'discoverTime', width: 180 },
  { title: '责任人', dataIndex: 'responsiblePerson', key: 'responsiblePerson', width: 100 },
  { title: '处理状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '操作', key: 'action', fixed: 'right', width: 220 }
]

// 新增弹窗
const addModalVisible = ref(false)
const addForm = reactive({
  name: '',
  area: undefined,
  type: undefined,
  level: '中',
  discoverTime: undefined,
  responsiblePerson: undefined,
  description: ''
})

// 详情弹窗
const detailModalVisible = ref(false)
const currentRecord = ref<any>(null)

const getLevelColor = (level: string) => {
  const map: Record<string, string> = {
    '高': 'red',
    '中': 'orange',
    '低': 'blue'
  }
  return map[level] || 'default'
}

const getStatusColor = (status: string) => {
  const map: Record<string, string> = {
    '待整改': 'error',
    '整改中': 'processing',
    '已整改': 'success',
    '已验收': 'cyan'
  }
  return map[status] || 'default'
}

const handleSearch = () => {
  message.info('搜索功能')
}

const handleReset = () => {
  searchForm.area = undefined
  searchForm.type = undefined
  searchForm.level = undefined
  searchForm.status = undefined
}

const showAddModal = () => {
  addModalVisible.value = true
}

const handleAddSubmit = () => {
  if (!addForm.name || !addForm.area || !addForm.type || !addForm.discoverTime || !addForm.responsiblePerson || !addForm.description) {
    message.warning('请填写必填项')
    return
  }
  
  const newRecord = {
    id: Date.now(),
    name: addForm.name,
    area: addForm.area,
    type: addForm.type,
    level: addForm.level,
    discoverTime: dayjs(addForm.discoverTime).format('YYYY-MM-DD HH:mm'),
    responsiblePerson: addForm.responsiblePerson,
    discoverer: '管理员',
    description: addForm.description,
    status: '待整改'
  }
  
  dataSource.value.unshift(newRecord)
  pagination.total++
  addModalVisible.value = false
  
  // 重置表单
  Object.assign(addForm, {
    name: '',
    area: undefined,
    type: undefined,
    level: '中',
    discoverTime: undefined,
    responsiblePerson: undefined,
    description: ''
  })
  
  message.success('新增成功')
}

const handleAddCancel = () => {
  addModalVisible.value = false
  Object.assign(addForm, {
    name: '',
    area: undefined,
    type: undefined,
    level: '中',
    discoverTime: undefined,
    responsiblePerson: undefined,
    description: ''
  })
}

const viewDetail = (record: any) => {
  currentRecord.value = record
  detailModalVisible.value = true
}

const startRectify = (record: any) => {
  record.status = '整改中'
  message.success('已开始整改')
}

const acceptRecord = (record: any) => {
  record.status = '已验收'
  message.success('验收通过')
}

const deleteRecord = (record: any) => {
  const index = dataSource.value.findIndex(item => item.id === record.id)
  if (index > -1) {
    dataSource.value.splice(index, 1)
    pagination.total--
    message.success('删除成功')
  }
}

const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
}
</script>

<style scoped lang="scss">
.hazard-page {
  .search-card {
    margin-bottom: 16px;
  }

  .toolbar-card {
    margin-bottom: 16px;
  }
}
</style>
