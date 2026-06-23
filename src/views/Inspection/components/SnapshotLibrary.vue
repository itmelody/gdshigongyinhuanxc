<template>
  <div class="snapshot-library">
    <!-- 统计概览 -->
    <a-card :bordered="false" class="stats-card">
      <a-row :gutter="16">
        <a-col :span="6" v-for="stat in statsData" :key="stat.label">
          <a-statistic :title="stat.label" :value="stat.value" :suffix="stat.suffix" />
        </a-col>
      </a-row>
    </a-card>

    <!-- 筛选栏 -->
    <a-card :bordered="false" class="filter-card" style="margin-top: 16px">
      <a-row justify="space-between" align="middle">
        <a-col>
          <a-space wrap>
            <a-select v-model:value="typeFilter" placeholder="按类型" style="width: 140px" allow-clear>
              <a-select-option v-for="t in hazardTypes" :key="t" :value="t">{{ t }}</a-select-option>
            </a-select>
            <a-select v-model:value="stageFilter" placeholder="按阶段" style="width: 110px" allow-clear>
              <a-select-option value="通用">通用</a-select-option>
              <a-select-option value="基础">基础</a-select-option>
              <a-select-option value="主体">主体</a-select-option>
              <a-select-option value="装修">装修</a-select-option>
            </a-select>
            <a-select v-model:value="timeFilter" style="width: 110px">
              <a-select-option value="7">近7天</a-select-option>
              <a-select-option value="30">近30天</a-select-option>
              <a-select-option value="90">近90天</a-select-option>
            </a-select>
            <a-input-search v-model:value="searchKeyword" placeholder="搜索快照" style="width: 160px" />
          </a-space>
        </a-col>
        <a-col>
          <a-button type="primary" @click="batchExport">批量导出</a-button>
        </a-col>
      </a-row>
    </a-card>

    <!-- 快照网格 -->
    <div class="snapshot-grid" style="margin-top: 16px">
      <a-row :gutter="[16, 16]">
        <a-col :span="6" v-for="snap in filteredSnapshots" :key="snap.id">
          <div class="snap-card">
            <div class="snap-image" @click="viewLarge(snap)">
              <img :src="snap.image" :alt="snap.type" />
              <div class="snap-badge">{{ snap.type }}</div>
            </div>
            <div class="snap-info">
              <div class="info-meta">
                <span class="snap-stage">{{ snap.stage }}阶段</span>
                <span class="snap-date">{{ snap.date }}</span>
              </div>
              <div class="info-confidence">置信度 {{ snap.confidence }}%</div>
              <a-button type="link" size="small" @click="viewLarge(snap)">查看大图</a-button>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 分页 -->
    <div class="snap-pagination">
      <span class="total-info">共 {{ totalCount }} 张快照 展示 1-{{ filteredSnapshots.length }} / {{ totalCount }}</span>
      <a-pagination v-model:current="currentPage" :total="totalCount" :page-size="8" size="small" />
    </div>

    <!-- 大图弹窗 -->
    <a-modal v-model:open="largeModalVisible" title="隐患快照详情" :footer="null" width="680px">
      <template v-if="selectedSnap">
        <div class="large-image">
          <img :src="selectedSnap.image" :alt="selectedSnap.type" />
        </div>
        <a-descriptions :column="2" size="small" bordered style="margin-top: 16px">
          <a-descriptions-item label="隐患类型">{{ selectedSnap.type }}</a-descriptions-item>
          <a-descriptions-item label="所属阶段">{{ selectedSnap.stage }}阶段</a-descriptions-item>
          <a-descriptions-item label="识别时间">{{ selectedSnap.date }}</a-descriptions-item>
          <a-descriptions-item label="置信度">{{ selectedSnap.confidence }}%</a-descriptions-item>
          <a-descriptions-item label="位置">{{ selectedSnap.location }}</a-descriptions-item>
          <a-descriptions-item label="关联记录">
            <a @click="goToRecord(selectedSnap)">查看识别记录详情</a>
          </a-descriptions-item>
        </a-descriptions>
      </template>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import aiImg1 from '@/assets/ai1.jpeg'
import aiImg2 from '@/assets/ai2.jpeg'
import aiImg3 from '@/assets/ai3.jpeg'
import aiImg4 from '@/assets/ai4.jpeg'

const typeFilter = ref<string>()
const stageFilter = ref<string>()
const timeFilter = ref('7')
const searchKeyword = ref('')
const currentPage = ref(1)
const totalCount = 856

const hazardTypes = ['未佩戴安全帽', '临边防护缺失', '脚手架松动', '电焊不规范', '吊篮超员', '围挡缺失', '安全通道堆物', '圆盘锯防护缺失', '管线拖地']

const snapshots = ref([
  { id: 1, type: '未佩戴安全帽', stage: '通用', date: '2026-06-23', confidence: 94.7, location: '南侧通道#2', image: aiImg1 },
  { id: 2, type: '临边防护缺失', stage: '基础', date: '2026-06-23', confidence: 91.0, location: '东侧基坑', image: aiImg2 },
  { id: 3, type: '脚手架松动', stage: '主体', date: '2026-06-22', confidence: 89.0, location: '北侧脚手架#4', image: aiImg3 },
  { id: 4, type: '吊篮超员', stage: '装修', date: '2026-06-22', confidence: 93.0, location: '装修作业面', image: aiImg4 },
  { id: 5, type: '电焊不规范', stage: '通用', date: '2026-06-22', confidence: 88.6, location: '加工区#3', image: aiImg1 },
  { id: 6, type: '安全通道堆物', stage: '通用', date: '2026-06-21', confidence: 87.0, location: '南侧通道#1', image: aiImg2 },
  { id: 7, type: '圆盘锯防护缺失', stage: '通用', date: '2026-06-21', confidence: 92.5, location: '加工区#2', image: aiImg3 },
  { id: 8, type: '管线拖地', stage: '装修', date: '2026-06-21', confidence: 85.0, location: '装修作业面', image: aiImg4 }
])

const filteredSnapshots = computed(() => {
  let data = snapshots.value
  if (typeFilter.value) data = data.filter(s => s.type === typeFilter.value)
  if (stageFilter.value) data = data.filter(s => s.stage === stageFilter.value)
  if (searchKeyword.value) data = data.filter(s => s.type.includes(searchKeyword.value) || s.location.includes(searchKeyword.value))
  return data
})

const statsData = ref([
  { label: '总快照数', value: 856, suffix: '张' },
  { label: '本月新增', value: 247, suffix: '张' },
  { label: '本周新增', value: 58, suffix: '张' },
  { label: '覆盖类型', value: '24/27', suffix: '种' }
])

const largeModalVisible = ref(false)
const selectedSnap = ref<any>(null)
const viewLarge = (snap: any) => { selectedSnap.value = snap; largeModalVisible.value = true }
const goToRecord = (snap: any) => { message.info(`跳转至识别记录详情：${snap.type} - ${snap.location}`) }
const batchExport = () => { message.success('批量导出成功') }
</script>

<style scoped lang="scss">
.snapshot-library {
  .filter-card, .stats-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
  .snap-card {
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: all 0.2s;
    &:hover { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12); transform: translateY(-2px); }

    .snap-image {
      position: relative;
      cursor: pointer;
      img {
        width: 100%;
        aspect-ratio: 9 / 6;
        object-fit: cover;
        display: block;
      }
      .snap-badge {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        padding: 4px 8px;
        font-size: 12px;
      }
    }
    .snap-info {
      padding: 10px;
      .info-meta {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: #8c8c8c;
        margin-bottom: 4px;
        .snap-stage { background: #f0f5ff; padding: 1px 6px; border-radius: 3px; color: #1890ff; }
      }
      .info-confidence {
        font-size: 13px;
        font-weight: 500;
        color: #52c41a;
        margin-bottom: 6px;
      }
    }
  }
  .snap-pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    .total-info { font-size: 13px; color: #8c8c8c; }
  }
  .large-image {
    img { width: 100%; max-height: 420px; object-fit: cover; border-radius: 6px; }
  }
}
</style>
