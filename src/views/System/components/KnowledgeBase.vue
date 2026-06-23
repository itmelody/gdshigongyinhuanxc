<template>
  <div class="knowledge-base">
    <a-card :bordered="false" class="config-card">
      <a-tabs v-model:activeKey="activeTab">
        <!-- Tab 1: 隐患标准库 -->
        <a-tab-pane key="standard" tab="隐患标准库维护">
          <div class="toolbar">
            <a-space>
              <a-select v-model:value="standardFilter" placeholder="按阶段筛选" allow-clear style="width: 140px">
                <a-select-option value="通用">通用</a-select-option>
                <a-select-option value="基础">基础</a-select-option>
                <a-select-option value="主体">主体</a-select-option>
                <a-select-option value="装修">装修</a-select-option>
              </a-select>
              <a-input-search v-model:value="standardSearch" placeholder="搜索隐患名称" style="width: 200px" />
            </a-space>
          </div>
          <a-table :columns="standardColumns" :data-source="filteredStandards" :pagination="{ pageSize: 10 }" row-key="id" size="small">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'action'">
                <a-button type="link" size="small" @click="editStandard(record)">编辑</a-button>
              </template>
            </template>
          </a-table>
        </a-tab-pane>

        <!-- Tab 2: 提示词模板 -->
        <a-tab-pane key="prompt" tab="提示词模板管理">
          <div class="toolbar">
            <a-button type="primary" @click="addPrompt">+ 新增模板</a-button>
          </div>
          <a-table :columns="promptColumns" :data-source="promptData" :pagination="false" row-key="id" size="small">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'action'">
                <a-space>
                  <a-button type="link" size="small" @click="editPrompt(record)">编辑</a-button>
                  <a-button type="link" danger size="small" @click="deletePrompt(record)">删除</a-button>
                </a-space>
              </template>
            </template>
          </a-table>
        </a-tab-pane>

        <!-- Tab 3: 知识库更新 -->
        <a-tab-pane key="docs" tab="知识库更新">
          <a-upload-dragger :before-upload="() => false" accept=".pdf,.doc,.docx" class="upload-area">
            <p class="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p class="ant-upload-hint">支持 PDF/Word 格式的安全规范、施工标准等文档</p>
          </a-upload-dragger>
          <a-table :columns="docColumns" :data-source="docData" :pagination="false" row-key="id" size="small" style="margin-top: 16px">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag :color="record.status === '已生效' ? 'success' : 'processing'">{{ record.status }}</a-tag>
              </template>
              <template v-else-if="column.key === 'action'">
                <a-button type="link" danger size="small" @click="deleteDoc(record)">删除</a-button>
              </template>
            </template>
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- 编辑侧滑 -->
    <a-drawer v-model:open="drawerVisible" :title="drawerTitle" width="500" @close="drawerVisible = false">
      <a-form v-if="drawerType === 'standard'" :model="standardForm" layout="vertical">
        <a-form-item label="隐患名称">
          <a-input :value="standardForm.name" disabled />
        </a-form-item>
        <a-form-item label="标准描述">
          <a-textarea v-model:value="standardForm.description" :rows="3" />
        </a-form-item>
        <a-form-item label="整改要求">
          <a-textarea v-model:value="standardForm.rectifyReq" :rows="3" />
        </a-form-item>
        <a-form-item label="法规依据">
          <a-input v-model:value="standardForm.regulation" />
        </a-form-item>
        <a-form-item label="参考图片">
          <a-upload list-type="picture-card" :max-count="5" :before-upload="() => false">
            <div><plus-outlined /><div style="margin-top: 4px">上传</div></div>
          </a-upload>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model:value="standardForm.remark" :rows="2" />
        </a-form-item>
      </a-form>

      <a-form v-if="drawerType === 'prompt'" :model="promptForm" layout="vertical">
        <a-form-item label="模板名称">
          <a-input v-model:value="promptForm.name" />
        </a-form-item>
        <a-form-item label="适用场景">
          <a-input v-model:value="promptForm.scene" />
        </a-form-item>
        <a-form-item label="关联模型">
          <a-select v-model:value="promptForm.model">
            <a-select-option value="YOLOv8-安全帽检测">YOLOv8-安全帽检测</a-select-option>
            <a-select-option value="视觉大模型-综合分析">视觉大模型-综合分析</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="系统提示词内容">
          <a-textarea v-model:value="promptForm.content" :rows="6" placeholder="如：你是一名资深建筑安全专家..." />
        </a-form-item>
        <a-form-item label="输出格式规范">
          <a-textarea v-model:value="promptForm.outputFormat" :rows="3" placeholder="定义模型输出的JSON结构要求" />
        </a-form-item>
      </a-form>

      <template #footer>
        <a-space>
          <a-button @click="drawerVisible = false">取消</a-button>
          <a-button type="primary" @click="saveDrawer">保存</a-button>
        </a-space>
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'

const activeTab = ref('standard')

// === Tab 1: 隐患标准库 ===
const standardFilter = ref<string>()
const standardSearch = ref('')
const standardColumns = [
  { title: '隐患名称', dataIndex: 'name', key: 'name', width: 160 },
  { title: '所属阶段', dataIndex: 'stage', key: 'stage', width: 80 },
  { title: '标准描述', dataIndex: 'description', key: 'description', ellipsis: true },
  { title: '整改要求', dataIndex: 'rectifyReq', key: 'rectifyReq', ellipsis: true },
  { title: '法规依据', dataIndex: 'regulation', key: 'regulation', width: 150 },
  { title: '操作', key: 'action', width: 80 }
]
const standardData = ref([
  { id: 1, name: '未正确佩戴安全帽', stage: '通用', description: '施工人员在作业区域未按规定佩戴安全帽或佩戴不规范', rectifyReq: '立即停止作业，正确佩戴安全帽后方可继续', regulation: 'JGJ59-2011 第3.0.5条' },
  { id: 2, name: '临边防护缺失', stage: '基础', description: '基坑、楼面、阳台等临边区域未设置有效防护栏杆', rectifyReq: '设置1.2m高标准防护栏杆并挂安全网', regulation: 'JGJ80-2016 第4.1.1条' },
  { id: 3, name: '吸烟', stage: '通用', description: '施工人员在施工现场或禁烟区域吸烟', rectifyReq: '立即制止，进行安全教育并记录', regulation: '施工现场消防安全管理规定' },
  { id: 4, name: '脚手架连接松动', stage: '主体', description: '脚手架立杆、横杆连接扣件松动或缺失', rectifyReq: '立即加固处理，检查相邻连接点', regulation: 'JGJ130-2011 第6.3.2条' },
  { id: 5, name: '电焊作业不规范', stage: '装修', description: '电焊作业未设置防护屏或灭火器', rectifyReq: '停止作业，设置防护屏和灭火设备', regulation: 'GB50720-2011 第6.3.1条' },
  { id: 6, name: '吊篮超员', stage: '装修', description: '吊篮内人员超过2人限定', rectifyReq: '立即减员，按规范操作', regulation: 'JGJ202-2010 第5.3.6条' }
])
const filteredStandards = computed(() => {
  let data = standardData.value
  if (standardFilter.value) data = data.filter(d => d.stage === standardFilter.value)
  if (standardSearch.value) data = data.filter(d => d.name.includes(standardSearch.value))
  return data
})

// === Tab 2: 提示词模板 ===
const promptColumns = [
  { title: '模板名称', dataIndex: 'name', key: 'name', width: 160 },
  { title: '适用场景', dataIndex: 'scene', key: 'scene', width: 140 },
  { title: '关联模型', dataIndex: 'model', key: 'model', width: 180 },
  { title: '最近更新时间', dataIndex: 'updateTime', key: 'updateTime', width: 160 },
  { title: '操作', key: 'action', width: 120 }
]
const promptData = ref([
  { id: 1, name: '通用识别提示词', scene: '通用识别', model: '视觉大模型-综合分析', updateTime: '2026-06-20 10:30:00' },
  { id: 2, name: '装修阶段分析', scene: '装修阶段分析', model: '视觉大模型-综合分析', updateTime: '2026-06-15 14:20:00' },
  { id: 3, name: '安全帽检测专用', scene: '安全帽检测', model: 'YOLOv8-安全帽检测', updateTime: '2026-06-10 09:00:00' }
])
const addPrompt = () => {
  drawerType.value = 'prompt'
  Object.assign(promptForm, { id: 0, name: '', scene: '', model: '', content: '', outputFormat: '' })
  drawerTitle.value = '新增提示词模板'
  drawerVisible.value = true
}
const editPrompt = (record: any) => {
  drawerType.value = 'prompt'
  Object.assign(promptForm, { ...record })
  drawerTitle.value = `编辑：${record.name}`
  drawerVisible.value = true
}
const deletePrompt = (record: any) => {
  const idx = promptData.value.findIndex(p => p.id === record.id)
  if (idx > -1) { promptData.value.splice(idx, 1); message.success('删除成功') }
}

// === Tab 3: 知识库更新 ===
const docColumns = [
  { title: '文件名', dataIndex: 'name', key: 'name' },
  { title: '上传时间', dataIndex: 'uploadTime', key: 'uploadTime', width: 160 },
  { title: '文档类型', dataIndex: 'type', key: 'type', width: 100 },
  { title: '状态', key: 'status', width: 80 },
  { title: '操作', key: 'action', width: 80 }
]
const docData = ref([
  { id: 1, name: '建筑施工安全检查标准JGJ59-2011.pdf', uploadTime: '2026-06-01 10:00:00', type: 'PDF', status: '已生效' },
  { id: 2, name: '高处作业安全技术规范JGJ80-2016.pdf', uploadTime: '2026-05-20 14:30:00', type: 'PDF', status: '已生效' },
  { id: 3, name: '施工现场消防安全规范.docx', uploadTime: '2026-06-22 09:00:00', type: 'Word', status: '解析中' }
])
const deleteDoc = (record: any) => {
  const idx = docData.value.findIndex(d => d.id === record.id)
  if (idx > -1) { docData.value.splice(idx, 1); message.success('删除成功') }
}

// === 侧滑编辑 ===
const drawerVisible = ref(false)
const drawerTitle = ref('编辑')
const drawerType = ref<'standard' | 'prompt'>('standard')

const standardForm = reactive({ id: 0, name: '', description: '', rectifyReq: '', regulation: '', remark: '' })
const promptForm = reactive({ id: 0, name: '', scene: '', model: '', content: '', outputFormat: '' })

const editStandard = (record: any) => {
  drawerType.value = 'standard'
  Object.assign(standardForm, { ...record, remark: '' })
  drawerTitle.value = `编辑：${record.name}`
  drawerVisible.value = true
}
const saveDrawer = () => {
  drawerVisible.value = false
  message.success('保存成功')
}
</script>

<style scoped lang="scss">
.knowledge-base {
  .config-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
  .toolbar {
    margin-bottom: 12px;
  }
  .upload-area {
    max-width: 100%;
  }
}
</style>
