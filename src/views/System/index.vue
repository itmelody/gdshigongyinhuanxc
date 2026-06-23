<template>
  <div class="system-page">
    <a-tabs v-model:activeKey="activeTab" type="card">
      <!-- 用户管理 -->
      <a-tab-pane key="user" tab="用户管理">
        <a-card :bordered="false">
          <template #extra>
            <a-button type="primary" @click="showAddUserModal">
              <template #icon><PlusOutlined /></template>
              新增用户
            </a-button>
          </template>
          
          <a-table
            :columns="userColumns"
            :data-source="userData"
            :pagination="userPagination"
            row-key="id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag :color="record.status ? 'success' : 'error'">
                  {{ record.status ? '启用' : '禁用' }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'role'">
                <a-tag :color="getRoleColor(record.role)">
                  {{ getRoleText(record.role) }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'action'">
                <a-space>
                  <a-button type="link" size="small" @click="editUser(record)">编辑</a-button>
                  <a-button 
                    type="link" 
                    size="small" 
                    @click="toggleUserStatus(record)"
                  >
                    {{ record.status ? '禁用' : '启用' }}
                  </a-button>
                  <a-button type="link" danger size="small" @click="deleteUser(record)">删除</a-button>
                </a-space>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-tab-pane>

      <!-- 角色权限 -->
      <a-tab-pane key="role" tab="角色权限">
        <a-card :bordered="false">
          <template #extra>
            <a-button type="primary">
              <template #icon><PlusOutlined /></template>
              新增角色
            </a-button>
          </template>
          
          <a-table
            :columns="roleColumns"
            :data-source="roleData"
            :pagination="false"
            row-key="id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'permissions'">
                <a-space wrap>
                  <a-tag v-for="perm in record.permissions" :key="perm">
                    {{ perm }}
                  </a-tag>
                </a-space>
              </template>
              <template v-else-if="column.key === 'action'">
                <a-space>
                  <a-button type="link" size="small" @click="editRole(record)">编辑</a-button>
                  <a-button type="link" size="small" @click="configPermissions(record)">配置权限</a-button>
                  <a-button type="link" danger size="small" @click="deleteRole(record)">删除</a-button>
                </a-space>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-tab-pane>

      <!-- 系统设置 -->
      <a-tab-pane key="settings" tab="系统设置">
        <a-card title="基本设置" :bordered="false" style="margin-bottom: 16px">
          <a-form layout="vertical" :model="systemSettings" style="max-width: 600px">
            <a-form-item label="系统名称">
              <a-input v-model:value="systemSettings.systemName" />
            </a-form-item>
            <a-form-item label="巡检提醒时间">
              <a-time-picker v-model:value="systemSettings.reminderTime" format="HH:mm" />
            </a-form-item>
            <a-form-item label="隐患整改期限（天）">
              <a-input-number v-model:value="systemSettings.rectifyDays" :min="1" :max="30" />
            </a-form-item>
            <a-form-item label="自动归档天数">
              <a-input-number v-model:value="systemSettings.autoArchiveDays" :min="7" :max="90" />
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="saveSystemSettings">保存设置</a-button>
            </a-form-item>
          </a-form>
        </a-card>

        <a-card title="通知设置" :bordered="false">
          <a-list item-layout="horizontal" :data-source="notificationSettings">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta :description="item.description">
                  <template #title>{{ item.name }}</template>
                </a-list-item-meta>
                <template #actions>
                  <a-switch v-model:checked="item.enabled" />
                </template>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-tab-pane>

      <!-- 操作日志 -->
      <a-tab-pane key="logs" tab="操作日志">
        <a-card :bordered="false">
          <a-table
            :columns="logColumns"
            :data-source="logData"
            :pagination="logPagination"
            row-key="id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'type'">
                <a-tag :color="getLogTypeColor(record.type)">
                  {{ getLogTypeText(record.type) }}
                </a-tag>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-tab-pane>
    </a-tabs>

    <!-- 新增/编辑用户弹窗 -->
    <a-modal
      v-model:open="userModalVisible"
      :title="isEdit ? '编辑用户' : '新增用户'"
      width="600px"
      @ok="handleUserSubmit"
      @cancel="handleUserCancel"
    >
      <a-form :model="userForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="用户名" required>
          <a-input v-model:value="userForm.username" placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item label="姓名" required>
          <a-input v-model:value="userForm.realName" placeholder="请输入姓名" />
        </a-form-item>
        <a-form-item label="手机号" required>
          <a-input v-model:value="userForm.phone" placeholder="请输入手机号" />
        </a-form-item>
        <a-form-item label="邮箱">
          <a-input v-model:value="userForm.email" placeholder="请输入邮箱" />
        </a-form-item>
        <a-form-item label="角色" required>
          <a-select v-model:value="userForm.role" placeholder="请选择角色">
            <a-select-option value="admin">管理员</a-select-option>
            <a-select-option value="manager">项目经理</a-select-option>
            <a-select-option value="inspector">巡检员</a-select-option>
            <a-select-option value="worker">施工人员</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="所属区域">
          <a-select v-model:value="userForm.area" placeholder="请选择" allow-clear>
            <a-select-option value="A区">A区</a-select-option>
            <a-select-option value="B区">B区</a-select-option>
            <a-select-option value="C区">C区</a-select-option>
            <a-select-option value="D区">D区</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { PlusOutlined } from '@ant-design/icons-vue'

const activeTab = ref('user')

// 用户管理
const userColumns = [
  { title: '用户名', dataIndex: 'username', key: 'username', width: 120 },
  { title: '姓名', dataIndex: 'realName', key: 'realName', width: 100 },
  { title: '手机号', dataIndex: 'phone', key: 'phone', width: 130 },
  { title: '邮箱', dataIndex: 'email', key: 'email', width: 180 },
  { title: '角色', dataIndex: 'role', key: 'role', width: 100 },
  { title: '所属区域', dataIndex: 'area', key: 'area', width: 100 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '操作', key: 'action', fixed: 'right', width: 200 }
]

const userData = ref([
  { id: 1, username: 'admin', realName: '系统管理员', phone: '13800138001', email: 'admin@example.com', role: 'admin', area: '-', status: true, createTime: '2026-01-15 10:30:00' },
  { id: 2, username: 'zhangsan', realName: '张三', phone: '13800138002', email: 'zhangsan@example.com', role: 'manager', area: 'A区', status: true, createTime: '2026-02-20 14:20:00' },
  { id: 3, username: 'lisi', realName: '李四', phone: '13800138003', email: 'lisi@example.com', role: 'inspector', area: 'B区', status: true, createTime: '2026-03-10 09:15:00' },
  { id: 4, username: 'wangwu', realName: '王五', phone: '13800138004', email: 'wangwu@example.com', role: 'inspector', area: 'C区', status: false, createTime: '2026-04-05 16:45:00' }
])

const userPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 4
})

const userModalVisible = ref(false)
const isEdit = ref(false)
const userForm = reactive({
  id: 0,
  username: '',
  realName: '',
  phone: '',
  email: '',
  role: '',
  area: ''
})

const getRoleColor = (role: string) => {
  const map: Record<string, string> = {
    admin: 'red',
    manager: 'blue',
    inspector: 'green',
    worker: 'default'
  }
  return map[role] || 'default'
}

const getRoleText = (role: string) => {
  const map: Record<string, string> = {
    admin: '管理员',
    manager: '项目经理',
    inspector: '巡检员',
    worker: '施工人员'
  }
  return map[role] || role
}

const showAddUserModal = () => {
  isEdit.value = false
  Object.assign(userForm, {
    id: 0,
    username: '',
    realName: '',
    phone: '',
    email: '',
    role: '',
    area: ''
  })
  userModalVisible.value = true
}

const editUser = (record: any) => {
  isEdit.value = true
  Object.assign(userForm, { ...record })
  userModalVisible.value = true
}

const handleUserSubmit = () => {
  if (!userForm.username || !userForm.realName || !userForm.phone || !userForm.role) {
    message.warning('请填写必填项')
    return
  }
  
  if (isEdit.value) {
    const index = userData.value.findIndex(item => item.id === userForm.id)
    if (index > -1) {
      Object.assign(userData.value[index], userForm)
      message.success('修改成功')
    }
  } else {
    const newUser = {
      ...userForm,
      id: Date.now(),
      status: true,
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
    userData.value.unshift(newUser)
    userPagination.total++
    message.success('新增成功')
  }
  
  userModalVisible.value = false
}

const handleUserCancel = () => {
  userModalVisible.value = false
}

const toggleUserStatus = (record: any) => {
  record.status = !record.status
  message.success(`已${record.status ? '启用' : '禁用'}用户`)
}

const deleteUser = (record: any) => {
  const index = userData.value.findIndex(item => item.id === record.id)
  if (index > -1) {
    userData.value.splice(index, 1)
    userPagination.total--
    message.success('删除成功')
  }
}

// 角色权限
const roleColumns = [
  { title: '角色名称', dataIndex: 'name', key: 'name', width: 120 },
  { title: '角色标识', dataIndex: 'code', key: 'code', width: 120 },
  { title: '描述', dataIndex: 'description', key: 'description', width: 200 },
  { title: '权限列表', dataIndex: 'permissions', key: 'permissions', width: 300 },
  { title: '用户数', dataIndex: 'userCount', key: 'userCount', width: 100 },
  { title: '操作', key: 'action', fixed: 'right', width: 200 }
]

const roleData = ref([
  { id: 1, name: '管理员', code: 'admin', description: '系统最高权限，可管理所有功能', permissions: ['全部权限'], userCount: 1 },
  { id: 2, name: '项目经理', code: 'manager', description: '负责项目整体管理', permissions: ['巡检管理', '隐患管理', '统计分析', '人员管理'], userCount: 5 },
  { id: 3, name: '巡检员', code: 'inspector', description: '执行现场巡检任务', permissions: ['巡检执行', '隐患上报', '我的任务'], userCount: 12 },
  { id: 4, name: '施工人员', code: 'worker', description: '查看个人任务和整改要求', permissions: ['我的任务', '整改反馈'], userCount: 50 }
])

const editRole = (record: any) => {
  message.info(`编辑角色：${record.name}`)
}

const configPermissions = (record: any) => {
  message.info(`配置权限：${record.name}`)
}

const deleteRole = (record: any) => {
  if (record.code === 'admin') {
    message.error('不能删除管理员角色')
    return
  }
  message.success('删除成功')
}

// 系统设置
const systemSettings = reactive({
  systemName: '建筑工地施工隐患巡查智能体',
  reminderTime: dayjs('09:00', 'HH:mm'),
  rectifyDays: 7,
  autoArchiveDays: 30
})

const notificationSettings = ref([
  { name: '新隐患通知', description: '发现新隐患时发送通知', enabled: true },
  { name: '整改到期提醒', description: '隐患整改即将到期时提醒', enabled: true },
  { name: '巡检任务提醒', description: '每日巡检任务提醒', enabled: true },
  { name: '验收通过通知', description: '隐患整改验收通过时通知', enabled: false }
])

const saveSystemSettings = () => {
  message.success('保存成功')
}

// 操作日志
const logColumns = [
  { title: '操作时间', dataIndex: 'time', key: 'time', width: 180 },
  { title: '操作人', dataIndex: 'operator', key: 'operator', width: 100 },
  { title: '操作类型', dataIndex: 'type', key: 'type', width: 100 },
  { title: '操作内容', dataIndex: 'content', key: 'content', width: 300 },
  { title: 'IP地址', dataIndex: 'ip', key: 'ip', width: 150 }
]

const logData = ref([
  { id: 1, time: '2026-06-23 14:30:25', operator: '张三', type: 'add', content: '新增巡检任务：A区脚手架安全检查', ip: '192.168.1.100' },
  { id: 2, time: '2026-06-23 13:20:15', operator: '李四', type: 'hazard', content: '上报隐患：B区临时用电线路裸露', ip: '192.168.1.101' },
  { id: 3, time: '2026-06-23 11:15:30', operator: '王五', type: 'rectify', content: '完成整改：C区高空作业防护', ip: '192.168.1.102' },
  { id: 4, time: '2026-06-23 10:00:00', operator: 'admin', type: 'login', content: '登录系统', ip: '192.168.1.1' }
])

const logPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 4
})

const getLogTypeColor = (type: string) => {
  const map: Record<string, string> = {
    add: 'blue',
    hazard: 'red',
    rectify: 'green',
    login: 'cyan',
    logout: 'orange'
  }
  return map[type] || 'default'
}

const getLogTypeText = (type: string) => {
  const map: Record<string, string> = {
    add: '新增',
    hazard: '隐患',
    rectify: '整改',
    login: '登录',
    logout: '登出'
  }
  return map[type] || type
}
</script>

<style scoped lang="scss">
.system-page {
  :deep(.ant-tabs-nav) {
    margin-bottom: 16px;
  }
}
</style>
