<template>
  <div class="hazard-detail">
    <a-card :bordered="false" class="detail-card">
      <template #title>
        <a-space>
          <a-button type="text" @click="$emit('back')">← 返回列表</a-button>
          <a-tag color="red">{{ currentRecord.code }}</a-tag>
          <span>{{ currentRecord.type }}</span>
        </a-space>
      </template>
      <template #extra>
        <a-space>
          <a-button @click="editRecord">编辑</a-button>
          <a-button @click="printRecord">打印</a-button>
          <a-button type="primary" @click="exportReport">导出报告</a-button>
        </a-space>
      </template>

      <!-- 基本信息 -->
      <a-descriptions title="基本信息" bordered :column="3" size="small">
        <a-descriptions-item label="隐患编号">{{ currentRecord.code }}</a-descriptions-item>
        <a-descriptions-item label="发现时间">{{ currentRecord.discoverTime }}</a-descriptions-item>
        <a-descriptions-item label="隐患类型">{{ currentRecord.type }}</a-descriptions-item>
        <a-descriptions-item label="所属阶段">{{ currentRecord.stage }}阶段</a-descriptions-item>
        <a-descriptions-item label="隐患等级">
          <a-tag :color="levelColorMap[currentRecord.level]">{{ currentRecord.level }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="置信度">{{ currentRecord.confidence }}%</a-descriptions-item>
        <a-descriptions-item label="具体位置">{{ currentRecord.location }}</a-descriptions-item>
        <a-descriptions-item label="来源">{{ currentRecord.source }}</a-descriptions-item>
        <a-descriptions-item label="责任人">{{ currentRecord.responsible }}</a-descriptions-item>
      </a-descriptions>

      <!-- AI识别证据 -->
      <h3 style="margin: 24px 0 12px">AI识别证据</h3>
      <a-row :gutter="12">
        <a-col :span="6" v-for="(frame, idx) in aiFrames" :key="idx">
          <div class="frame-card">
            <img :src="frame.image" :alt="`帧${idx + 1}`" />
            <div class="frame-meta">
              <span>{{ frame.time }}</span>
              <span>置信度 {{ frame.confidence }}%</span>
            </div>
          </div>
        </a-col>
      </a-row>
      <div class="confidence-trend">
        <span>时序置信度趋势：78% → 85% → 92% → 90%</span>
      </div>

      <!-- 处置流程 -->
      <h3 style="margin: 24px 0 12px">处置流程</h3>
      <a-timeline>
        <a-timeline-item v-for="(step, idx) in processSteps" :key="idx" :color="step.done ? 'green' : 'gray'">
          <strong>{{ step.time }}</strong> &nbsp; {{ step.operator }} &nbsp; {{ step.action }}
        </a-timeline-item>
      </a-timeline>

      <!-- 整改前后对比 -->
      <h3 style="margin: 24px 0 12px">整改前后对比</h3>
      <a-row :gutter="24">
        <a-col :span="12">
          <div class="compare-box">
            <div class="compare-label">整改前</div>
            <img :src="beforeImage" alt="整改前" />
          </div>
        </a-col>
        <a-col :span="12">
          <div class="compare-box">
            <div class="compare-label">整改后</div>
            <img :src="afterImage" alt="整改后" />
          </div>
        </a-col>
      </a-row>
      <div class="rectify-measure" style="margin-top: 12px">
        <strong>整改措施：</strong>已搭设外架防护栏杆，恢复作业面同步，经现场确认整改完成。
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { message } from 'ant-design-vue'
import aiImg1 from '@/assets/ai1.jpeg'
import aiImg2 from '@/assets/ai2.jpeg'
import aiImg3 from '@/assets/ai3.jpeg'
import aiImg4 from '@/assets/ai4.jpeg'

const props = defineProps<{ record: any }>()
defineEmits<{ back: [] }>()

const levelColorMap: Record<string, string> = { '重大': 'red', '较大': 'orange', '一般': 'gold' }

const currentRecord = computed(() => props.record || {
  code: 'YH-001', type: '外架与作业面不同步', level: '重大', stage: '主体',
  location: '2#塔吊作业区', discoverTime: '2026-06-23 14:28:00', confidence: 92.0,
  source: 'AI自动识别', responsible: '张安全'
})

const aiFrames = ref([
  { image: aiImg1, time: '14:28:00', confidence: 78 },
  { image: aiImg2, time: '14:28:05', confidence: 85 },
  { image: aiImg3, time: '14:28:10', confidence: 92 },
  { image: aiImg4, time: '14:28:15', confidence: 90 }
])

const processSteps = ref([
  { time: '2026-06-23 14:28', operator: 'AI系统', action: '自动识别隐患，生成工单 YH-001', done: true },
  { time: '2026-06-23 14:29', operator: '系统', action: '自动派单至 张安全（安全员）', done: true },
  { time: '2026-06-23 14:45', operator: '张安全', action: '确认隐患，正在组织整改', done: true },
  { time: '2026-06-23 15:30', operator: '待整改完成复核', action: '等待安全员现场复核', done: false },
  { time: '待消警', operator: '待AI二次认证', action: '等待AI自动验证整改效果', done: false }
])

const beforeImage = ref(aiImg1)
const afterImage = ref(aiImg3)

const goBack = () => { /* handled by $emit('back') */ }
const editRecord = () => { message.info('编辑模式') }
const printRecord = () => { message.info('打印中...') }
const exportReport = () => { message.success('报告已导出') }
</script>

<style scoped lang="scss">
.hazard-detail {
  .detail-card { border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); }
  .frame-card {
    background: #f5f5f5; border-radius: 6px; overflow: hidden;
    img { width: 100%; aspect-ratio: 9/6; object-fit: cover; display: block; }
    .frame-meta { padding: 6px 8px; font-size: 12px; display: flex; justify-content: space-between; color: #666; }
  }
  .confidence-trend { margin-top: 12px; padding: 8px 12px; background: #f0f5ff; border-radius: 4px; font-size: 13px; color: #1890ff; }
  .compare-box {
    .compare-label { font-weight: 600; margin-bottom: 8px; }
    img { width: 100%; aspect-ratio: 9/6; object-fit: cover; border-radius: 6px; }
  }
  .rectify-measure { padding: 12px; background: #f6ffed; border-radius: 6px; }
}
</style>
