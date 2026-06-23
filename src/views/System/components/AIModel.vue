<template>
  <div class="ai-model">
    <div class="model-layout">
      <!-- 左侧：模型列表 -->
      <div class="model-list">
        <div class="list-header">
          <h4>模型列表</h4>
          <a-button type="primary" size="small">+ 新增模型</a-button>
        </div>
        <div
          v-for="model in models"
          :key="model.id"
          class="model-card"
          :class="{ active: selectedModel?.id === model.id }"
          @click="selectedModel = model"
        >
          <div class="model-card-header">
            <span class="model-name">{{ model.name }}</span>
            <span class="status-dot" :class="model.status"></span>
          </div>
          <div class="model-meta">
            <a-tag :color="model.type === 'YOLO' ? 'blue' : 'purple'" size="small">{{ model.type }}</a-tag>
            <span class="version">v{{ model.version }}</span>
          </div>
          <div class="model-time">{{ model.updateTime }}</div>
        </div>
      </div>

      <!-- 右侧：模型详情 -->
      <div class="model-detail" v-if="selectedModel">
        <a-card :bordered="false" class="detail-card">
          <template #title>
            <div class="detail-header">
              <span>{{ selectedModel.name }}</span>
              <a-tag :color="selectedModel.status === 'running' ? 'success' : selectedModel.status === 'stopped' ? 'default' : 'error'">
                {{ selectedModel.status === 'running' ? '运行中' : selectedModel.status === 'stopped' ? '已停用' : '异常' }}
              </a-tag>
            </div>
          </template>
          <template #extra>
            <a-space>
              <a-button size="small" :disabled="selectedModel.status === 'running'" @click="toggleModel(true)">启用</a-button>
              <a-button size="small" :disabled="selectedModel.status !== 'running'" @click="toggleModel(false)">停用</a-button>
              <a-button size="small" danger>删除</a-button>
              <a-button size="small" type="primary">上传新版本</a-button>
            </a-space>
          </template>

          <a-descriptions :column="3" bordered size="small">
            <a-descriptions-item label="模型名称">{{ selectedModel.name }}</a-descriptions-item>
            <a-descriptions-item label="版本号">v{{ selectedModel.version }}</a-descriptions-item>
            <a-descriptions-item label="模型类型">{{ selectedModel.type }}</a-descriptions-item>
            <a-descriptions-item label="部署时间">{{ selectedModel.deployTime }}</a-descriptions-item>
            <a-descriptions-item label="模型大小">{{ selectedModel.size }}</a-descriptions-item>
            <a-descriptions-item label="识别精度(mAP)">{{ selectedModel.mAP }}</a-descriptions-item>
          </a-descriptions>

          <!-- 版本列表 -->
          <h4 style="margin: 20px 0 12px">版本列表</h4>
          <a-table :columns="versionColumns" :data-source="selectedModel.versions" :pagination="false" row-key="version" size="small">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag :color="record.current ? 'success' : 'default'">{{ record.current ? '当前' : '历史' }}</a-tag>
              </template>
              <template v-else-if="column.key === 'action'">
                <a-button type="link" size="small" :disabled="record.current" @click="switchVersion(record)">切换至此版本</a-button>
              </template>
            </template>
          </a-table>

          <!-- 灰度发布 -->
          <h4 style="margin: 20px 0 12px">灰度发布配置</h4>
          <div class="gray-release">
            <div v-for="item in grayConfig" :key="item.version" class="gray-item">
              <span class="gray-label">v{{ item.version }}</span>
              <a-slider v-model:value="item.ratio" :min="0" :max="100" style="flex:1" />
              <span class="gray-value">{{ item.ratio }}%</span>
            </div>
            <div class="gray-total">
              流量总计：<span :class="{ error: grayTotal !== 100 }">{{ grayTotal }}%</span>
              <span v-if="grayTotal !== 100" style="color:#ff4d4f">（需等于100%）</span>
            </div>
          </div>

          <!-- 推理参数 -->
          <h4 style="margin: 20px 0 12px">推理参数配置</h4>
          <a-form layout="vertical" :model="inferenceParams" class="params-form">
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="置信度阈值">
                  <a-slider v-model:value="inferenceParams.confidence" :min="0.5" :max="0.99" :step="0.01" />
                  <span>{{ inferenceParams.confidence }}</span>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="IoU阈值">
                  <a-slider v-model:value="inferenceParams.iou" :min="0.3" :max="0.9" :step="0.01" />
                  <span>{{ inferenceParams.iou }}</span>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="最大检测数量">
                  <a-input-number v-model:value="inferenceParams.maxDetections" :min="1" :max="200" style="width:100%" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>

          <!-- 推理资源 -->
          <h4 style="margin: 20px 0 12px">推理资源</h4>
          <a-form layout="vertical" :model="resourceParams" class="params-form">
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="CPU核数">
                  <a-select v-model:value="resourceParams.cpu">
                    <a-select-option :value="2">2核</a-select-option>
                    <a-select-option :value="4">4核</a-select-option>
                    <a-select-option :value="8">8核</a-select-option>
                    <a-select-option :value="16">16核</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="内存大小">
                  <a-select v-model:value="resourceParams.memory">
                    <a-select-option value="4G">4G</a-select-option>
                    <a-select-option value="8G">8G</a-select-option>
                    <a-select-option value="16G">16G</a-select-option>
                    <a-select-option value="32G">32G</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="AI芯片">
                  <a-select v-model:value="resourceParams.gpu">
                    <a-select-option value="none">无</a-select-option>
                    <a-select-option value="T4">NVIDIA T4</a-select-option>
                    <a-select-option value="A10">NVIDIA A10</a-select-option>
                    <a-select-option value="A100">NVIDIA A100</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>

          <!-- 批量推理 -->
          <h4 style="margin: 20px 0 12px">批量推理设置</h4>
          <a-form layout="inline" :model="batchParams">
            <a-form-item label="任务并发数">
              <a-input-number v-model:value="batchParams.concurrency" :min="1" :max="50" />
            </a-form-item>
            <a-form-item label="批次大小">
              <a-input-number v-model:value="batchParams.batchSize" :min="1" :max="64" />
            </a-form-item>
            <a-form-item label="超时时间">
              <a-input-number v-model:value="batchParams.timeout" :min="5" :max="300" />
              <span style="margin-left:4px">秒</span>
            </a-form-item>
          </a-form>

          <!-- 模型测试 -->
          <h4 style="margin: 20px 0 12px">模型测试与验证</h4>
          <a-space style="margin-bottom: 12px">
            <a-radio-group v-model:value="testMode" button-style="solid">
              <a-radio-button value="upload">上传图片</a-radio-button>
              <a-radio-button value="camera">接入摄像头</a-radio-button>
            </a-radio-group>
            <a-switch v-model:checked="compareMode" checked-children="对比模式" un-checked-children="单模型" />
          </a-space>
          <div class="test-area">
            <a-upload-dragger :before-upload="() => false" accept="image/*">
              <p class="ant-upload-text">点击或拖拽图片到此区域进行测试</p>
              <p class="ant-upload-hint">支持 JPG/PNG 格式，将展示识别结果</p>
            </a-upload-dragger>
            <div v-if="compareMode" class="compare-hint">
              对比模式已开启，将左右分屏展示两个版本的识别结果
            </div>
          </div>
        </a-card>
      </div>
      <a-empty v-else description="请选择一个模型查看详情" class="model-detail" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'

const models = ref([
  { id: 1, name: 'YOLOv8-安全帽检测', version: '3.2', type: 'YOLO', status: 'running', updateTime: '2026-06-20', deployTime: '2026-05-01', size: '28.5MB', mAP: '94.7%',
    versions: [
      { version: '3.2', releaseTime: '2026-06-20', size: '28.5MB', mAP: '94.7%', current: true },
      { version: '3.1', releaseTime: '2026-05-15', size: '27.8MB', mAP: '92.3%', current: false },
      { version: '3.0', releaseTime: '2026-04-01', size: '26.2MB', mAP: '89.1%', current: false }
    ]
  },
  { id: 2, name: '视觉大模型-综合分析', version: '2.0', type: '大模型', status: 'running', updateTime: '2026-06-18', deployTime: '2026-03-10', size: '2.1GB', mAP: '96.3%',
    versions: [
      { version: '2.0', releaseTime: '2026-06-18', size: '2.1GB', mAP: '96.3%', current: true },
      { version: '1.5', releaseTime: '2026-04-10', size: '1.9GB', mAP: '93.8%', current: false }
    ]
  },
  { id: 3, name: 'YOLOv8-临边检测', version: '1.8', type: 'YOLO', status: 'stopped', updateTime: '2026-06-10', deployTime: '2026-02-20', size: '31.2MB', mAP: '91.5%',
    versions: [
      { version: '1.8', releaseTime: '2026-06-10', size: '31.2MB', mAP: '91.5%', current: true },
      { version: '1.7', releaseTime: '2026-04-05', size: '30.5MB', mAP: '89.8%', current: false }
    ]
  },
  { id: 4, name: 'YOLOv8-围挡检测', version: '1.2', type: 'YOLO', status: 'running', updateTime: '2026-06-15', deployTime: '2026-05-20', size: '25.8MB', mAP: '92.1%',
    versions: [
      { version: '1.2', releaseTime: '2026-06-15', size: '25.8MB', mAP: '92.1%', current: true }
    ]
  }
])

const selectedModel = ref(models.value[0])

const versionColumns = [
  { title: '版本号', dataIndex: 'version', key: 'version', width: 80, customRender: ({ text }: any) => 'v' + text },
  { title: '发布时间', dataIndex: 'releaseTime', key: 'releaseTime', width: 160 },
  { title: '模型大小', dataIndex: 'size', key: 'size', width: 100 },
  { title: '识别精度', dataIndex: 'mAP', key: 'mAP', width: 100 },
  { title: '状态', key: 'status', width: 80 },
  { title: '操作', key: 'action', width: 120 }
]

const grayConfig = ref([
  { version: '3.2', ratio: 90 },
  { version: '3.1', ratio: 10 }
])
const grayTotal = computed(() => grayConfig.value.reduce((sum, g) => sum + g.ratio, 0))

const inferenceParams = reactive({ confidence: 0.85, iou: 0.5, maxDetections: 50 })
const resourceParams = reactive({ cpu: 8, memory: '16G', gpu: 'A10' })
const batchParams = reactive({ concurrency: 5, batchSize: 8, timeout: 30 })

const testMode = ref('upload')
const compareMode = ref(false)

const toggleModel = (enable: boolean) => {
  if (selectedModel.value) {
    selectedModel.value.status = enable ? 'running' : 'stopped'
    message.success(`${selectedModel.value.name} 已${enable ? '启用' : '停用'}`)
  }
}
const switchVersion = (record: any) => {
  message.success(`已切换至 v${record.version}`)
}
</script>

<style scoped lang="scss">
.ai-model {
  .model-layout {
    display: flex;
    gap: 16px;
    min-height: 600px;
  }
  .model-list {
    width: 240px;
    flex-shrink: 0;
    background: #fff;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      h4 { margin: 0; font-size: 14px; }
    }
    .model-card {
      padding: 10px;
      border-radius: 6px;
      border: 1px solid #f0f0f0;
      margin-bottom: 8px;
      cursor: pointer;
      transition: all 0.2s;

      &.active { border-color: #1890ff; background: #e6f7ff; }
      &:hover { border-color: #1890ff; }

      .model-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
      }
      .model-name { font-weight: 500; font-size: 13px; }
      .status-dot {
        width: 8px; height: 8px; border-radius: 50%;
        &.running { background: #52c41a; }
        &.stopped { background: #d9d9d9; }
        &.error { background: #ff4d4f; }
      }
      .model-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
      .version { font-size: 12px; color: #8c8c8c; }
      .model-time { font-size: 11px; color: #bfbfbf; }
    }
  }
  .model-detail {
    flex: 1;
    min-width: 0;
  }
  .detail-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
  .detail-header {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .gray-release {
    .gray-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
      .gray-label { width: 50px; font-size: 13px; }
      .gray-value { width: 40px; text-align: right; font-size: 13px; }
    }
    .gray-total {
      margin-top: 8px;
      font-size: 13px;
      .error { color: #ff4d4f; font-weight: 600; }
    }
  }
  .params-form {
    :deep(.ant-form-item) { margin-bottom: 8px; }
  }
  .test-area {
    .compare-hint {
      margin-top: 8px;
      padding: 8px 12px;
      background: #fff7e6;
      border-radius: 4px;
      font-size: 12px;
      color: #d48806;
    }
  }
}
</style>
