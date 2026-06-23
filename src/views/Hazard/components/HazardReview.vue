<template>
  <div class="hazard-review-page">
    <a-card :bordered="false" class="review-card">
      <template #title>
        <a-space>
          <a-button type="text" @click="$emit('back')">← 返回列表</a-button>
          <span>复核操作</span>
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

      <!-- 处置记录 -->
      <a-card :bordered="false" class="disposal-record">
        <template #title>处置记录</template>
        <a-timeline>
          <a-timeline-item color="green">
            <p><strong>已派单</strong></p>
            <p>派单给：张安全（安全主管）</p>
            <p>整改时限：2小时</p>
            <p class="time">2026-06-23 14:35:00</p>
          </a-timeline-item>
          <a-timeline-item color="blue">
            <p><strong>整改中</strong></p>
            <p>已搭设外架防护栏杆，恢复作业面同步</p>
            <p class="time">2026-06-23 15:42:00</p>
          </a-timeline-item>
          <a-timeline-item color="orange">
            <p><strong>待复核</strong></p>
            <p>整改完成，申请复核</p>
            <p class="time">2026-06-23 15:50:00</p>
          </a-timeline-item>
        </a-timeline>
      </a-card>

      <a-divider />

      <!-- 整改前后对比 -->
      <a-card :bordered="false" class="comparison-card">
        <template #title>整改前后对比</template>
        <a-row :gutter="16">
          <a-col :span="12">
            <div class="comparison-image">
              <div class="image-label">整改前</div>
              <img :src="beforeImage" alt="整改前" />
            </div>
          </a-col>
          <a-col :span="12">
            <div class="comparison-image">
              <div class="image-label">整改后</div>
              <img :src="afterImage" alt="整改后" />
            </div>
          </a-col>
        </a-row>
      </a-card>

      <a-divider />

      <!-- 复核表单 -->
      <a-form :model="reviewState" layout="vertical" class="review-form">
        <a-form-item label="复核结果" required>
          <a-radio-group v-model:value="reviewState.result">
            <a-radio value="pass">通过 - 整改合格</a-radio>
            <a-radio value="reject">退回 - 整改不合格</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="复核意见">
          <a-textarea v-model:value="reviewState.comment" placeholder="请输入复核意见" :rows="3" />
        </a-form-item>

        <a-divider />

        <a-space>
          <a-button type="primary" :disabled="!reviewState.result" @click="submitReview">
            {{ reviewState.result === 'pass' ? '确认通过' : '确认退回' }}
          </a-button>
          <a-button @click="$emit('back')">取消</a-button>
        </a-space>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import aiImg1 from '@/assets/ai1.jpeg'
import aiImg3 from '@/assets/ai3.jpeg'

const props = defineProps<{ record: any }>()
defineEmits<{ back: [] }>()

const levelColorMap: Record<string, string> = { '重大': 'red', '较大': 'orange', '一般': 'gold' }

const currentRecord = computed(() => props.record || {
  code: 'YH-001', type: '外架与作业面不同步', level: '重大', stage: '主体',
  location: '2#塔吊作业区', discoverTime: '2026-06-23 14:28:00'
})

const beforeImage = ref(aiImg1)
const afterImage = ref(aiImg3)

const reviewState = ref({
  result: undefined as string | undefined,
  comment: ''
})

const submitReview = () => {
  if (reviewState.value.result === 'pass') {
    message.success('复核通过，隐患已闭环')
    if (props.record) props.record.status = '已闭环'
  } else {
    message.warning('已退回，请重新整改')
    if (props.record) props.record.status = '处置中'
  }
}
</script>

<style scoped lang="scss">
.hazard-review-page {
  .review-card {
    .disposal-record,
    .comparison-card {
      margin-bottom: 16px;
      background: #fafafa;
    }

    .comparison-image {
      position: relative;

      .image-label {
        position: absolute;
        top: 8px;
        left: 8px;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 1;
      }

      img {
        width: 100%;
        aspect-ratio: 9 / 6;
        object-fit: cover;
        border-radius: 4px;
        display: block;
      }
    }

    .review-form {
      max-width: 600px;
    }

    .time {
      color: #999;
      font-size: 12px;
    }
  }
}
</style>
