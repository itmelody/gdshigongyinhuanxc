<template>
  <div class="config-template">
    <!-- 模板管理 -->
    <a-card title="配置模板管理" :bordered="false" class="config-card">
      <template #extra>
        <a-button type="primary" @click="addTemplate">+ 新建模板</a-button>
      </template>
      <a-row :gutter="[16, 16]">
        <a-col :xs="24" :sm="12" :md="8" v-for="tpl in templates" :key="tpl.id">
          <a-card :bordered="true" hoverable class="tpl-card">
            <template #title>{{ tpl.name }}</template>
            <template #extra>
              <a-space>
                <a-button type="link" size="small" @click="applyTemplate(tpl)">应用</a-button>
                <a-button type="link" size="small" @click="editTemplate(tpl)">编辑</a-button>
                <a-button type="link" danger size="small" @click="deleteTemplate(tpl)">删除</a-button>
              </a-space>
            </template>
            <a-descriptions :column="1" size="small">
              <a-descriptions-item label="适用场景">{{ tpl.scene }}</a-descriptions-item>
              <a-descriptions-item label="创建时间">{{ tpl.createTime }}</a-descriptions-item>
              <a-descriptions-item label="最后修改">{{ tpl.updateTime }}</a-descriptions-item>
            </a-descriptions>
          </a-card>
        </a-col>
      </a-row>
    </a-card>

    <!-- 导入导出 -->
    <a-card title="导入导出" :bordered="false" class="config-card" style="margin-top: 16px">
      <a-row :gutter="24">
        <a-col :span="12">
          <h4>导出配置</h4>
          <p class="hint-text">将当前项目配置导出为 JSON 文件</p>
          <a-form layout="vertical">
            <a-form-item label="导出范围">
              <a-select v-model:value="exportScope" style="width: 100%">
                <a-select-option value="all">全量配置</a-select-option>
                <a-select-option value="basic">仅基础配置</a-select-option>
                <a-select-option value="rule">仅规则引擎</a-select-option>
                <a-select-option value="model">仅模型配置</a-select-option>
                <a-select-option value="dispatch">仅调度策略</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="handleExport">导出配置</a-button>
            </a-form-item>
          </a-form>
        </a-col>
        <a-col :span="12">
          <h4>导入配置</h4>
          <p class="hint-text">上传 JSON/YAML 格式配置文件</p>
          <a-upload-dragger :before-upload="handleImportFile" accept=".json,.yaml,.yml">
            <p class="ant-upload-text">点击或拖拽文件到此区域</p>
            <p class="ant-upload-hint">支持 .json 和 .yaml 格式</p>
          </a-upload-dragger>
          <div v-if="importResult" class="import-result" style="margin-top: 12px">
            <a-alert
              :type="importResult.success ? 'success' : 'warning'"
              :message="importResult.message"
              show-icon
            />
          </div>
          <a-space style="margin-top: 12px">
            <a-radio-group v-model:value="importMode">
              <a-radio value="overwrite">覆盖当前配置</a-radio>
              <a-radio value="saveAs">另存为新模板</a-radio>
            </a-radio-group>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- 新建模板弹窗 -->
    <a-modal v-model:open="modalVisible" :title="isEdit ? '编辑模板' : '新建模板'" width="500px" @ok="saveTemplate" @cancel="modalVisible = false">
      <a-form :model="templateForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="模板名称" required>
          <a-input v-model:value="templateForm.name" placeholder="如：住宅项目标准配置" />
        </a-form-item>
        <a-form-item label="适用场景">
          <a-textarea v-model:value="templateForm.scene" :rows="2" placeholder="描述该模板适用的项目类型" />
        </a-form-item>
        <a-form-item label="模板来源">
          <a-radio-group v-model:value="templateForm.source">
            <a-radio value="current">从当前配置复制</a-radio>
            <a-radio value="empty">空白模板</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'

// === 模板管理 ===
const templates = ref([
  { id: 1, name: '住宅项目标准配置', scene: '适用于一般住宅建设项目的标准巡查配置', createTime: '2026-05-01 10:00:00', updateTime: '2026-06-15 14:30:00' },
  { id: 2, name: '商业综合体配置', scene: '适用于大型商业综合体建设，覆盖多工种交叉场景', createTime: '2026-04-20 09:00:00', updateTime: '2026-06-10 11:00:00' },
  { id: 3, name: '基础设施工程配置', scene: '适用于桥梁、隧道等基础设施工程', createTime: '2026-03-15 16:00:00', updateTime: '2026-05-28 09:30:00' }
])

const modalVisible = ref(false)
const isEdit = ref(false)
const templateForm = reactive({ id: 0, name: '', scene: '', source: 'current' })

const addTemplate = () => {
  isEdit.value = false
  Object.assign(templateForm, { id: 0, name: '', scene: '', source: 'current' })
  modalVisible.value = true
}
const editTemplate = (record: any) => {
  isEdit.value = true
  Object.assign(templateForm, { id: record.id, name: record.name, scene: record.scene, source: 'current' })
  modalVisible.value = true
}
const applyTemplate = (record: any) => {
  message.success(`已应用模板：${record.name}`)
}
const deleteTemplate = (record: any) => {
  const idx = templates.value.findIndex(t => t.id === record.id)
  if (idx > -1) { templates.value.splice(idx, 1); message.success('删除成功') }
}
const saveTemplate = () => {
  if (!templateForm.name) { message.warning('请填写模板名称'); return }
  modalVisible.value = false
  message.success(isEdit.value ? '模板已更新' : '模板已创建')
}

// === 导入导出 ===
const exportScope = ref('all')
const importMode = ref('overwrite')
const importResult = ref<{ success: boolean; message: string } | null>(null)

const handleExport = () => {
  message.success(`${exportScope.value === 'all' ? '全量' : exportScope.value}配置已导出`)
}
const handleImportFile = (file: File) => {
  importResult.value = {
    success: true,
    message: `导入成功：${file.name}，共解析 ${Math.floor(Math.random() * 20 + 10)} 项配置`
  }
  message.success('文件解析完成')
  return false
}
</script>

<style scoped lang="scss">
.config-template {
  .config-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
  .tpl-card {
    height: 100%;
  }
  .hint-text {
    font-size: 12px;
    color: #8c8c8c;
    margin-bottom: 12px;
  }
}
</style>
