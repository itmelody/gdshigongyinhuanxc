<template>
  <div class="hazard-disposal">
    <!-- 状态进度条 -->
    <a-card :bordered="false" class="progress-card">
      <template #title>
        <a-space>
          <a-button type="text" @click="$emit('back')">← 返回列表</a-button>
          <a-tag color="red">{{ currentRecord.code }}</a-tag>
          <span>{{ currentRecord.type }}</span>
        </a-space>
      </template>
      <a-steps :current="currentStep" size="small">
        <a-step title="已派单" description="2026-06-23 14:29" />
        <a-step title="整改中" description="2026-06-23 14:45" />
        <a-step title="待复核" description="等待安全员复核" />
        <a-step title="已消警" description="等待AI验证" />
      </a-steps>
    </a-card>

    <!-- 当前操作区 -->
    <a-card :bordered="false" style="margin-top: 16px" class="action-card">
      <template #title>
        <span>当前操作（角色：安全员）</span>
      </template>
      <div class="task-info">
        <a-alert message="待处置任务" type="warning" show-icon>
          <template #description>
            <p>隐患：{{ currentRecord.type }}（<a-tag :color="levelColorMap[currentRecord.level]">{{ currentRecord.level }}</a-tag>）</p>
            <p>位置：{{ currentRecord.location }} &nbsp; 限时：2小时</p>
            <p>剩余时间：<span class="countdown">1小时32分</span> ⏰</p>
          </template>
        </a-alert>
      </div>

      <a-form :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }" style="margin-top: 24px">
        <a-form-item label="整改措施">
          <a-textarea v-model:value="rectifyMeasure" :rows="4" placeholder="请输入整改措施描述" />
        </a-form-item>
        <a-form-item label="整改照片">
          <a-upload
            v-model:file-list="fileList"
            list-type="picture-card"
            :max-count="5"
            accept=".jpg,.png"
            @preview="handlePreview"
          >
            <div v-if="fileList.length < 5">
              <PlusOutlined />
              <div style="margin-top: 8px">上传</div>
            </div>
          </a-upload>
          <div class="upload-tip">支持 jpg/png 格式，最多5张</div>
        </a-form-item>
        <a-form-item :wrapper-col="{ offset: 4, span: 18 }">
          <a-space>
            <a-button type="primary" @click="submitReview">提交复核</a-button>
            <a-button @click="saveDraft">暂存</a-button>
            <a-button danger @click="requestExtension">申请延期</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 处置记录 -->
    <a-card :bordered="false" style="margin-top: 16px" class="record-card">
      <template #title>处置记录</template>
      <a-timeline>
        <a-timeline-item v-for="(log, idx) in disposalLogs" :key="idx" color="blue">
          <strong>{{ log.time }}</strong> &nbsp; <span style="color: #1890ff">{{ log.operator }}</span> &nbsp; {{ log.action }}
        </a-timeline-item>
      </a-timeline>
    </a-card>

    <!-- 图片预览弹窗 -->
    <a-modal v-model:open="previewVisible" title="预览" :footer="null" width="600px">
      <img :src="previewImage" alt="预览" style="width: 100%" />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'

const props = defineProps<{ record: any }>()
defineEmits<{ back: [] }>()

const currentRecord = computed(() => props.record || {
  code: 'YH-001', type: '外架与作业面不同步', level: '重大'
})

const levelColorMap: Record<string, string> = { '重大': 'red', '较大': 'orange', '一般': 'gold' }

const currentStep = computed(() => {
  const map: Record<string, number> = { '待派单': 0, '处置中': 1, '待复核': 2, '已闭环': 3 }
  return map[props.record?.status] ?? 1
})
const rectifyMeasure = ref('已搭设外架防护栏杆，恢复作业面同步，经现场确认整改完成。')
const fileList = ref<any[]>([])
const previewVisible = ref(false)
const previewImage = ref('')

const disposalLogs = ref([
  { time: '2026-06-23 14:29', operator: '系统', action: '已派单至 张安全' },
  { time: '2026-06-23 14:45', operator: '张安全', action: '已确认隐患，开始组织整改' },
  { time: '2026-06-23 15:10', operator: '张安全', action: '上传整改照片（2张），提交复核' }
])

const handlePreview = (file: any) => {
  previewImage.value = file.thumbUrl || file.url
  previewVisible.value = true
}
const submitReview = () => { message.success('已提交复核') }
const saveDraft = () => { message.success('暂存成功') }
const requestExtension = () => { message.info('延期申请已提交') }
</script>

<style scoped lang="scss">
.hazard-disposal {
  .progress-card, .action-card, .record-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
  .countdown { color: #ff4d4f; font-weight: 600; font-size: 16px; }
  .upload-tip { font-size: 12px; color: #8c8c8c; margin-top: 4px; }
}
</style>
