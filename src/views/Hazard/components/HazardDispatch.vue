<template>
  <div class="hazard-dispatch-page">
    <!-- 返回按钮 + 标题 -->
    <a-card :bordered="false" class="dispatch-card">
      <template #title>
        <a-space>
          <a-button type="text" @click="$emit('back')">← 返回列表</a-button>
          <span>派单操作</span>
        </a-space>
      </template>

      <!-- 隐患信息概览 -->
      <a-descriptions title="隐患信息" :column="3" bordered size="small">
        <a-descriptions-item label="隐患编号">
          <a-tag color="red">{{ currentRecord.code }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="隐患类型">{{ currentRecord.type }}</a-descriptions-item>
        <a-descriptions-item label="隐患等级">
          <a-tag :color="levelColorMap[currentRecord.level]">{{ currentRecord.level }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="发现时间">{{ currentRecord.discoverTime }}</a-descriptions-item>
        <a-descriptions-item label="施工阶段">{{ currentRecord.stage }}</a-descriptions-item>
        <a-descriptions-item label="位置">{{ currentRecord.location }}</a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <!-- 派单表单 -->
      <a-form :model="formState" layout="vertical" class="dispatch-form">
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item label="责任人" required>
              <a-select v-model:value="formState.responsible" placeholder="请选择责任人">
                <a-select-option value="张安全">张安全 - 安全主管</a-select-option>
                <a-select-option value="李工地">李工地 - 项目经理</a-select-option>
                <a-select-option value="王施工">王施工 - 施工队长</a-select-option>
                <a-select-option value="赵质检">赵质检 - 质量主管</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="整改时限" required>
              <a-select v-model:value="formState.deadline" placeholder="请选择时限">
                <a-select-option value="2小时">2小时（紧急）</a-select-option>
                <a-select-option value="4小时">4小时</a-select-option>
                <a-select-option value="24小时">24小时</a-select-option>
                <a-select-option value="3天">3天</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="派单备注">
          <a-textarea v-model:value="formState.remark" placeholder="请输入派单说明或整改要求" :rows="4" />
        </a-form-item>

        <a-form-item label="附件">
          <a-upload list-type="picture-card" :file-list="fileList" :before-upload="beforeUpload" @remove="handleRemove">
            <div v-if="fileList.length < 3">
              <plus-outlined />
              <div style="margin-top: 8px">上传</div>
            </div>
          </a-upload>
        </a-form-item>

        <a-divider />

        <!-- 操作按钮 -->
        <a-space>
          <a-button type="primary" @click="submitDispatch">确认派单</a-button>
          <a-button @click="$emit('back')">取消</a-button>
        </a-space>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'

const props = defineProps<{ record: any }>()
defineEmits<{ back: [] }>()

const levelColorMap: Record<string, string> = { '重大': 'red', '较大': 'orange', '一般': 'gold' }

const currentRecord = computed(() => props.record || {
  code: 'YH-001', type: '外架与作业面不同步', level: '重大', stage: '主体',
  location: '2#塔吊作业区', discoverTime: '2026-06-23 14:28:00'
})

const formState = ref({
  responsible: undefined as string | undefined,
  deadline: undefined as string | undefined,
  remark: ''
})

const fileList = ref<any[]>([])
const beforeUpload = (file: any) => {
  fileList.value = [...fileList.value, file]
  return false
}
const handleRemove = (file: any) => {
  const index = fileList.value.indexOf(file)
  if (index > -1) fileList.value.splice(index, 1)
}

const submitDispatch = () => {
  if (!formState.value.responsible) {
    message.warning('请选择责任人')
    return
  }
  if (!formState.value.deadline) {
    message.warning('请选择整改时限')
    return
  }
  message.success(`派单成功！已指派给 ${formState.value.responsible}`)
  // 可以更新record状态
  if (props.record) {
    props.record.status = '处置中'
  }
}
</script>

<style scoped lang="scss">
.hazard-dispatch-page {
  .dispatch-card {
    .dispatch-form {
      max-width: 800px;
    }
  }
}
</style>
