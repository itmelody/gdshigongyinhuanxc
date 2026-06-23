<template>
  <div class="dispatch-strategy">
    <!-- YOLO小模型调度 -->
    <a-card title="YOLO小模型调度" :bordered="false" class="config-card">
      <a-form layout="vertical" :model="yoloConfig">
        <a-form-item label="视频流抽帧频率">
          <a-space align="center">
            <a-input-number v-model:value="yoloConfig.frameValue" :min="1" :max="10" />
            <a-select v-model:value="yoloConfig.frameUnit" style="width: 120px">
              <a-select-option value="每秒">每秒</a-select-option>
              <a-select-option value="每2秒">每2秒</a-select-option>
              <a-select-option value="每5秒">每5秒</a-select-option>
              <a-select-option value="每10秒">每10秒</a-select-option>
            </a-select>
          </a-space>
          <div class="form-hint">建议默认每秒1帧，频率越高实时性越好，但资源消耗也越大</div>
        </a-form-item>
        <a-form-item label="检测区域屏蔽">
          <a-textarea v-model:value="yoloConfig.maskRegion" :rows="3" placeholder='多边形坐标JSON，如：[{"x":100,"y":200},{"x":300,"y":200},{"x":300,"y":400}]' />
          <div class="form-hint">屏蔽非作业区域以减少误报，支持按摄像头独立配置</div>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="saveYolo">保存</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 视觉大模型调度 -->
    <a-card title="视觉大模型调度" :bordered="false" class="config-card" style="margin-top: 16px">
      <a-form layout="vertical" :model="llmConfig">
        <a-form-item label="调用触发条件">
          <a-radio-group v-model:value="llmConfig.trigger">
            <a-radio value="auto">小模型检出疑似隐患后自动触发（推荐）</a-radio>
            <a-radio value="timer">按固定频率定时触发</a-radio>
            <a-radio value="manual">人工手动触发</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="最大并发数">
              <a-input-number v-model:value="llmConfig.maxConcurrent" :min="1" :max="20" style="width:100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="单次分析帧数">
              <a-input-number v-model:value="llmConfig.frameCount" :min="1" :max="32" style="width:100%" />
              <div class="form-hint">数值越大时序分析越准确但耗时增加</div>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="调用间隔">
              <a-input-number v-model:value="llmConfig.interval" :min="10" :max="600" style="width:100%" />
              <div class="form-hint">同一摄像头两次分析的最小间隔（秒）</div>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item>
          <a-button type="primary" @click="saveLlm">保存</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 边缘/云端协同 -->
    <a-card title="边缘/云端协同" :bordered="false" class="config-card" style="margin-top: 16px">
      <a-table :columns="edgeColumns" :data-source="edgeData" :pagination="false" row-key="id" size="small">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'location'">
            <a-select v-model:value="record.location" size="small" style="width: 100px">
              <a-select-option value="边缘端">边缘端</a-select-option>
              <a-select-option value="云端">云端</a-select-option>
            </a-select>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.online ? 'success' : 'default'">{{ record.online ? '在线' : '离线' }}</a-tag>
          </template>
        </template>
      </a-table>

      <div class="strategy-hint">
        <h4>策略建议</h4>
        <ul>
          <li><strong>边缘端</strong>：实时性高、带宽占用低，适合常规巡检场景</li>
          <li><strong>云端</strong>：算力更强、识别精度更高，适合复杂场景分析</li>
          <li>建议对高风险区域摄像头配置云端处理</li>
        </ul>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'

const yoloConfig = reactive({
  frameValue: 1,
  frameUnit: '每秒',
  maskRegion: '[{"x":0,"y":0},{"x":100,"y":0},{"x":100,"y":50},{"x":0,"y":50}]'
})
const saveYolo = () => { message.success('YOLO调度配置已保存') }

const llmConfig = reactive({
  trigger: 'auto',
  maxConcurrent: 5,
  frameCount: 8,
  interval: 60
})
const saveLlm = () => { message.success('大模型调度配置已保存') }

const edgeColumns = [
  { title: '摄像头名称', dataIndex: 'name', key: 'name' },
  { title: '所在工地', dataIndex: 'site', key: 'site', width: 120 },
  { title: '处理位置', key: 'location', width: 120 },
  { title: '状态', key: 'status', width: 80 }
]
const edgeData = ref([
  { id: 1, name: '#1 大门入口', site: '滨江项目', location: '边缘端', online: true },
  { id: 2, name: '#2 南侧通道', site: '滨江项目', location: '边缘端', online: true },
  { id: 3, name: '#3 加工区', site: '滨江项目', location: '云端', online: true },
  { id: 4, name: '#5 东侧围墙', site: '城东项目', location: '云端', online: true },
  { id: 5, name: '#7 北侧仓库', site: '城东项目', location: '边缘端', online: false }
])
</script>

<style scoped lang="scss">
.dispatch-strategy {
  .config-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
  .form-hint {
    margin-top: 4px;
    font-size: 12px;
    color: #8c8c8c;
  }
  .strategy-hint {
    margin-top: 16px;
    padding: 12px 16px;
    background: #f6ffed;
    border: 1px solid #b7eb8f;
    border-radius: 6px;

    h4 { margin: 0 0 8px; font-size: 13px; color: #389e0d; }
    ul { margin: 0; padding-left: 16px; font-size: 12px; color: #595959; li { margin-bottom: 4px; } }
  }
}
</style>
