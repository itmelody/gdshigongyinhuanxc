<template>
  <div class="inspection-page">
    <!-- 搜索栏 -->
    <a-card :bordered="false" class="search-card">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="巡检区域">
          <a-select v-model:value="searchForm.area" placeholder="请选择" style="width: 150px" allow-clear>
            <a-select-option value="A区">A区</a-select-option>
            <a-select-option value="B区">B区</a-select-option>
            <a-select-option value="C区">C区</a-select-option>
            <a-select-option value="D区">D区</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="巡检类型">
          <a-select v-model:value="searchForm.type" placeholder="请选择" style="width: 150px" allow-clear>
            <a-select-option value="日常巡检">日常巡检</a-select-option>
            <a-select-option value="专项检查">专项检查</a-select-option>
            <a-select-option value="节前检查">节前检查</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="searchForm.status" placeholder="请选择" style="width: 120px" allow-clear>
            <a-select-option value="待执行">待执行</a-select-option>
            <a-select-option value="进行中">进行中</a-select-option>
            <a-select-option value="已完成">已完成</a-select-option>
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
        <a-button type="primary" @click="showAddModal">
          <template #icon><PlusOutlined /></template>
          新增巡检
        </a-button>
        <a-button>
          <template #icon><ExportOutlined /></template>
          导出
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
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ record.status }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="viewDetail(record)">查看</a-button>
              <a-button 
                v-if="record.status === '待执行'" 
                type="link" 
                size="small" 
                @click="startInspection(record)"
              >
                开始
              </a-button>
              <a-button 
                v-if="record.status === '进行中'" 
                type="link" 
                size="small" 
                @click="completeInspection(record)"
              >
                完成
              </a-button>
              <a-button type="link" danger size="small" @click="deleteRecord(record)">删除</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增巡检弹窗 -->
    <a-modal
      v-model:open="addModalVisible"
      title="新增巡检任务"
      width="600px"
      @ok="handleAddSubmit"
      @cancel="handleAddCancel"
    >
      <a-form :model="addForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="巡检名称" required>
          <a-input v-model:value="addForm.name" placeholder="请输入巡检名称" />
        </a-form-item>
        <a-form-item label="巡检区域" required>
          <a-select v-model:value="addForm.area" placeholder="请选择">
            <a-select-option value="A区">A区</a-select-option>
            <a-select-option value="B区">B区</a-select-option>
            <a-select-option value="C区">C区</a-select-option>
            <a-select-option value="D区">D区</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="巡检类型" required>
          <a-select v-model:value="addForm.type" placeholder="请选择">
            <a-select-option value="日常巡检">日常巡检</a-select-option>
            <a-select-option value="专项检查">专项检查</a-select-option>
            <a-select-option value="节前检查">节前检查</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="计划时间" required>
          <a-date-picker v-model:value="addForm.planTime" show-time style="width: 100%" />
        </a-form-item>
        <a-form-item label="巡检人员" required>
          <a-select v-model:value="addForm.inspector" placeholder="请选择">
            <a-select-option value="张三">张三</a-select-option>
            <a-select-option value="李四">李四</a-select-option>
            <a-select-option value="王五">王五</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="备注说明">
          <a-textarea v-model:value="addForm.remark" :rows="3" placeholder="请输入备注说明" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { SearchOutlined, PlusOutlined, ExportOutlined } from '@ant-design/icons-vue'

// 搜索表单
const searchForm = reactive({
  area: undefined,
  type: undefined,
  status: undefined
})

// 表格数据
const loading = ref(false)
const dataSource = ref([
  {
    id: 1,
    name: 'A区脚手架安全检查',
    area: 'A区',
    type: '日常巡检',
    planTime: '2026-06-23 09:00',
    inspector: '张三',
    status: '已完成'
  },
  {
    id: 2,
    name: 'B区临时用电专项检查',
    area: 'B区',
    type: '专项检查',
    planTime: '2026-06-23 14:00',
    inspector: '李四',
    status: '进行中'
  },
  {
    id: 3,
    name: 'C区高空作业防护检查',
    area: 'C区',
    type: '日常巡检',
    planTime: '2026-06-24 09:00',
    inspector: '王五',
    status: '待执行'
  }
])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 3
})

// 表格列定义
const columns = [
  { title: '巡检名称', dataIndex: 'name', key: 'name', width: 200 },
  { title: '巡检区域', dataIndex: 'area', key: 'area', width: 100 },
  { title: '巡检类型', dataIndex: 'type', key: 'type', width: 120 },
  { title: '计划时间', dataIndex: 'planTime', key: 'planTime', width: 180 },
  { title: '巡检人员', dataIndex: 'inspector', key: 'inspector', width: 100 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '操作', key: 'action', fixed: 'right', width: 200 }
]

// 新增弹窗
const addModalVisible = ref(false)
const addForm = reactive({
  name: '',
  area: undefined,
  type: undefined,
  planTime: undefined,
  inspector: undefined,
  remark: ''
})

const getStatusColor = (status: string) => {
  const map: Record<string, string> = {
    '待执行': 'default',
    '进行中': 'processing',
    '已完成': 'success'
  }
  return map[status] || 'default'
}

const handleSearch = () => {
  message.info('搜索功能')
}

const handleReset = () => {
  searchForm.area = undefined
  searchForm.type = undefined
  searchForm.status = undefined
}

const showAddModal = () => {
  addModalVisible.value = true
}

const handleAddSubmit = () => {
  if (!addForm.name || !addForm.area || !addForm.type || !addForm.planTime || !addForm.inspector) {
    message.warning('请填写必填项')
    return
  }
  
  const newRecord = {
    id: Date.now(),
    name: addForm.name,
    area: addForm.area,
    type: addForm.type,
    planTime: dayjs(addForm.planTime).format('YYYY-MM-DD HH:mm'),
    inspector: addForm.inspector,
    status: '待执行'
  }
  
  dataSource.value.unshift(newRecord)
  pagination.total++
  addModalVisible.value = false
  
  // 重置表单
  Object.assign(addForm, {
    name: '',
    area: undefined,
    type: undefined,
    planTime: undefined,
    inspector: undefined,
    remark: ''
  })
  
  message.success('新增成功')
}

const handleAddCancel = () => {
  addModalVisible.value = false
  Object.assign(addForm, {
    name: '',
    area: undefined,
    type: undefined,
    planTime: undefined,
    inspector: undefined,
    remark: ''
  })
}

const viewDetail = (record: any) => {
  message.info(`查看巡检详情：${record.name}`)
}

const startInspection = (record: any) => {
  record.status = '进行中'
  message.success('已开始巡检')
}

const completeInspection = (record: any) => {
  record.status = '已完成'
  message.success('巡检已完成')
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
.inspection-page {
  .search-card {
    margin-bottom: 16px;
  }

  .toolbar-card {
    margin-bottom: 16px;
  }
}
</style>
