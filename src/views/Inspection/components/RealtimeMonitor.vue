<template>
  <div class="realtime-monitor">
    <!-- 顶部工具栏 -->
    <a-card :bordered="false" class="toolbar-card">
      <a-row justify="space-between" align="middle">
        <a-col>
          <a-space>
            <a-select v-model:value="cameraFilter" placeholder="全部摄像头" style="width: 140px" allow-clear>
              <a-select-option value="all">全部摄像头</a-select-option>
              <a-select-option value="online">在线</a-select-option>
              <a-select-option value="offline">离线</a-select-option>
            </a-select>
            <a-select v-model:value="stageFilter" placeholder="按阶段筛选" style="width: 120px" allow-clear>
              <a-select-option value="通用">通用</a-select-option>
              <a-select-option value="基础">基础</a-select-option>
              <a-select-option value="主体">主体</a-select-option>
              <a-select-option value="装修">装修</a-select-option>
            </a-select>
            <a-select v-model:value="areaFilter" placeholder="按区域筛选" style="width: 120px" allow-clear>
              <a-select-option value="南侧">南侧</a-select-option>
              <a-select-option value="东侧">东侧</a-select-option>
              <a-select-option value="北侧">北侧</a-select-option>
              <a-select-option value="加工区">加工区</a-select-option>
            </a-select>
            <a-input-search v-model:value="searchKeyword" placeholder="搜索摄像头" style="width: 180px" />
          </a-space>
        </a-col>
        <a-col>
          <a-radio-group v-model:value="splitMode" button-style="solid" size="small">
            <a-radio-button :value="1">1</a-radio-button>
            <a-radio-button :value="4">4</a-radio-button>
            <a-radio-button :value="9">9</a-radio-button>
            <a-radio-button :value="16">16</a-radio-button>
          </a-radio-group>
        </a-col>
      </a-row>
    </a-card>

    <!-- 主体：左侧摄像头列表 + 右侧画面区 -->
    <div class="monitor-layout">
      <div class="camera-sidebar">
        <div class="sidebar-title">摄像头列表</div>
        <div
          v-for="cam in filteredCameras"
          :key="cam.id"
          class="camera-item"
          :class="{ active: selectedCamera?.id === cam.id }"
          @click="selectedCamera = cam"
        >
          <span class="cam-icon">📷</span>
          <span class="cam-name">{{ cam.name }}</span>
          <span class="cam-status" :class="cam.online ? 'online' : 'offline'">
            {{ cam.online ? '●' : '○' }}
          </span>
        </div>
      </div>

      <div class="camera-grid">
        <a-row :gutter="[12, 12]">
          <a-col
            v-for="cam in displayCameras"
            :key="cam.id"
            :span="colSpan"
          >
            <div class="monitor-card" :class="{ selected: selectedCamera?.id === cam.id }">
              <div class="monitor-image">
                <img :src="cam.image" :alt="cam.name" />
                <div class="ai-overlay" v-if="cam.hazard">
                  <span class="hazard-tag">⚠️ {{ cam.hazard }} {{ cam.confidence }}%</span>
                </div>
              </div>
              <div class="monitor-info">
                <div class="info-row">
                  <span class="cam-label">{{ cam.name }}</span>
                  <span class="detect-time">{{ cam.detectTime }}</span>
                </div>
                <div class="info-actions">
                  <a-button size="small" @click="viewSnapshot(cam)">查看快照</a-button>
                  <a-button type="primary" size="small" @click="viewRealtime(cam)">查看实时</a-button>
                </div>
              </div>
            </div>
          </a-col>
        </a-row>
      </div>
    </div>

    <!-- 选中摄像头详情面板 -->
    <a-card v-if="selectedCamera" title="摄像头详情" :bordered="false" class="detail-panel" style="margin-top: 16px">
      <a-row :gutter="24">
        <a-col :span="16">
          <div class="detail-image">
            <img :src="selectedCamera.image" :alt="selectedCamera.name" />
          </div>
        </a-col>
        <a-col :span="8">
          <a-descriptions :column="1" size="small" bordered>
            <a-descriptions-item label="摄像头名称">{{ selectedCamera.name }}</a-descriptions-item>
            <a-descriptions-item label="所在区域">{{ selectedCamera.area }}</a-descriptions-item>
            <a-descriptions-item label="在线状态">
              <a-tag :color="selectedCamera.online ? 'success' : 'default'">
                {{ selectedCamera.online ? '在线' : '离线' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="AI识别叠加">
              <a-tag color="green">已开启</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="最新识别" v-if="selectedCamera.hazard">
              {{ selectedCamera.hazard }} {{ selectedCamera.confidence }}%
            </a-descriptions-item>
            <a-descriptions-item label="识别时间">{{ selectedCamera.detectTime }}</a-descriptions-item>
          </a-descriptions>
          <div class="detail-actions" style="margin-top: 16px">
            <a-space direction="vertical" :size="8" style="width:100%">
              <a-button block @click="captureSnapshot">抓拍当前画面</a-button>
              <a-button block @click="startRecord">录制视频片段</a-button>
              <a-button block @click="ptzControl">云台控制</a-button>
              <a-button block @click="viewPlayback">查看回放</a-button>
            </a-space>
          </div>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import aiImg1 from '@/assets/ai1.jpeg'
import aiImg2 from '@/assets/ai2.jpeg'
import aiImg3 from '@/assets/ai3.jpeg'
import aiImg4 from '@/assets/ai4.jpeg'

const cameraFilter = ref<string>()
const stageFilter = ref<string>()
const areaFilter = ref<string>()
const searchKeyword = ref('')
const splitMode = ref(4)

const colSpan = computed(() => {
  const map: Record<number, number> = { 1: 24, 4: 12, 9: 8, 16: 6 }
  return map[splitMode.value] || 12
})

const cameras = ref([
  { id: 1, name: '南侧通道#2', area: '南侧通道', online: true, image: aiImg1, hazard: '未佩戴安全帽', confidence: 94.7, detectTime: '2026-06-23 14:28:00' },
  { id: 2, name: '2#塔吊作业区', area: '塔吊区', online: true, image: aiImg2, hazard: '外架与作业面不同步', confidence: 92.0, detectTime: '2026-06-23 14:25:00' },
  { id: 3, name: '东侧基坑', area: '东侧', online: true, image: aiImg3, hazard: '临边防护缺失', confidence: 91.0, detectTime: '2026-06-23 14:20:00' },
  { id: 4, name: '加工区#3', area: '加工区', online: true, image: aiImg4, hazard: '电焊未设防护屏', confidence: 88.6, detectTime: '2026-06-23 14:15:00' },
  { id: 5, name: '北侧仓库#7', area: '北侧', online: false, image: aiImg1, hazard: null, confidence: 0, detectTime: '-' },
  { id: 6, name: '装修作业面', area: '装修区', online: true, image: aiImg2, hazard: '吊篮超员>2人', confidence: 93.0, detectTime: '2026-06-23 14:10:00' }
])

const selectedCamera = ref(cameras.value[0])

const filteredCameras = computed(() => {
  let list = cameras.value
  if (cameraFilter.value === 'online') list = list.filter(c => c.online)
  if (cameraFilter.value === 'offline') list = list.filter(c => !c.online)
  if (areaFilter.value) list = list.filter(c => c.area.includes(areaFilter.value!))
  if (searchKeyword.value) list = list.filter(c => c.name.includes(searchKeyword.value))
  return list
})

const displayCameras = computed(() => filteredCameras.value.slice(0, splitMode.value))

const viewSnapshot = (cam: any) => { message.info(`查看快照：${cam.name}`) }
const viewRealtime = (cam: any) => { selectedCamera.value = cam; message.info(`实时画面：${cam.name}`) }
const captureSnapshot = () => { message.success('抓拍成功，已保存至隐患快照库') }
const startRecord = () => { message.info('录制已开始') }
const ptzControl = () => { message.info('云台控制面板已打开') }
const viewPlayback = () => { message.info('回放模式已启动') }
</script>

<style scoped lang="scss">
.realtime-monitor {
  .toolbar-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    margin-bottom: 16px;
  }
  .monitor-layout {
    display: flex;
    gap: 16px;
    align-items: stretch;
  }
  .camera-sidebar {
    width: 200px;
    flex: 0 0 200px;
    background: #fff;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    min-height: 500px;

    .sidebar-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #f0f0f0;
    }
    .camera-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      border-radius: 6px;
      cursor: pointer;
      margin-bottom: 4px;
      transition: all 0.2s;

      &:hover { background: #f5f5f5; }
      &.active { background: #e6f7ff; border: 1px solid #91d5ff; }

      .cam-icon { font-size: 14px; }
      .cam-name { flex: 1; font-size: 13px; }
      .cam-status {
        font-size: 10px;
        &.online { color: #52c41a; }
        &.offline { color: #d9d9d9; }
      }
    }
  }
  .camera-grid {
    flex: 1;
    min-width: 0;
  }
  .monitor-card {
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: all 0.2s;
    &.selected { box-shadow: 0 0 0 2px #1890ff; }

    .monitor-image {
      position: relative;
      width: 50%;
      margin: 0 auto;
      img {
        width: 100%;
        aspect-ratio: 9 / 6;
        object-fit: cover;
        display: block;
      }
      .ai-overlay {
        position: absolute;
        top: 8px;
        left: 8px;
        .hazard-tag {
          background: rgba(255, 77, 79, 0.9);
          color: #fff;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
      }
    }
    .monitor-info {
      padding: 10px;
      .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        .cam-label { font-weight: 500; font-size: 13px; }
        .detect-time { font-size: 11px; color: #8c8c8c; }
      }
      .info-actions {
        display: flex;
        gap: 8px;
      }
    }
  }
  .detail-panel {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    .detail-image {
      img {
        width: 100%;
        aspect-ratio: 9 / 6;
        object-fit: cover;
        border-radius: 6px;
      }
    }
  }
}
</style>
