<template>
  <div class="audit-log">
    <a-card :bordered="false" class="config-card">
      <a-tabs v-model:activeKey="activeTab">
        <!-- Tab 1: 配置变更日志 -->
        <a-tab-pane key="changes" tab="配置变更日志">
          <div class="toolbar">
            <a-space>
              <a-select v-model:value="timeRange" style="width: 140px">
                <a-select-option value="today">今天</a-select-option>
                <a-select-option value="week">近7天</a-select-option>
                <a-select-option value="month">近30天</a-select-option>
              </a-select>
              <a-input-search v-model:value="operatorSearch" placeholder="搜索操作人" style="width: 160px" />
              <a-select v-model:value="moduleFilter" placeholder="变更模块" allow-clear style="width: 140px">
                <a-select-option value="基础配置">基础配置</a-select-option>
                <a-select-option value="规则引擎">规则引擎</a-select-option>
                <a-select-option value="模型配置">模型配置</a-select-option>
                <a-select-option value="知识库">知识库</a-select-option>
                <a-select-option value="调度策略">调度策略</a-select-option>
              </a-select>
            </a-space>
          </div>
          <a-table :columns="logColumns" :data-source="filteredLogs" :pagination="{ pageSize: 10 }" row-key="id" size="small">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'type'">
                <a-tag :color="typeColorMap[record.type]">{{ record.type }}</a-tag>
              </template>
              <template v-else-if="column.key === 'action'">
                <a-button type="link" size="small" @click="viewDetail(record)">查看详情</a-button>
              </template>
            </template>
          </a-table>
        </a-tab-pane>

        <!-- Tab 2: 规则命中统计 -->
        <a-tab-pane key="stats" tab="规则命中统计">
          <div class="toolbar">
            <a-radio-group v-model:value="statsPeriod" button-style="solid" size="small">
              <a-radio-button value="day">按日</a-radio-button>
              <a-radio-button value="week">按周</a-radio-button>
              <a-radio-button value="month">按月</a-radio-button>
            </a-radio-group>
            <a-button size="small" @click="exportStats">导出统计报表</a-button>
          </div>
          <div class="stats-chart">
            <div v-for="item in ruleStats" :key="item.rule" class="stat-bar-item">
              <span class="stat-label">{{ item.rule }}</span>
              <div class="stat-bar-wrap">
                <div class="stat-bar" :style="{ width: (item.count / maxStatCount * 100) + '%' }"></div>
              </div>
              <span class="stat-count">{{ item.count }}</span>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- 详情弹窗 -->
    <a-modal v-model:open="detailVisible" title="变更详情" width="600px" :footer="null">
      <div v-if="detailRecord" class="diff-view">
        <a-descriptions :column="1" bordered size="small">
          <a-descriptions-item label="操作时间">{{ detailRecord.time }}</a-descriptions-item>
          <a-descriptions-item label="操作人">{{ detailRecord.operator }}</a-descriptions-item>
          <a-descriptions-item label="变更模块">{{ detailRecord.module }}</a-descriptions-item>
          <a-descriptions-item label="操作类型">{{ detailRecord.type }}</a-descriptions-item>
          <a-descriptions-item label="变更内容">{{ detailRecord.summary }}</a-descriptions-item>
        </a-descriptions>
        <h4 style="margin: 12px 0 8px">变更前后对比</h4>
        <div class="diff-block">
          <div class="diff-line removed">- 置信度阈值: {{ detailRecord.before }}</div>
          <div class="diff-line added">+ 置信度阈值: {{ detailRecord.after }}</div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'

const activeTab = ref('changes')

// === Tab 1: 配置变更日志 ===
const timeRange = ref('week')
const operatorSearch = ref('')
const moduleFilter = ref<string>()

const logColumns = [
  { title: '操作时间', dataIndex: 'time', key: 'time', width: 170 },
  { title: '操作人', dataIndex: 'operator', key: 'operator', width: 80 },
  { title: '变更模块', dataIndex: 'module', key: 'module', width: 100 },
  { title: '变更内容摘要', dataIndex: 'summary', key: 'summary' },
  { title: '操作类型', key: 'type', width: 80 },
  { title: '操作', key: 'action', width: 100 }
]

const typeColorMap: Record<string, string> = {
  '修改': 'blue', '新增': 'green', '删除': 'red', '回滚': 'orange'
}

const logData = ref([
  { id: 1, time: '2026-06-23 14:30:00', operator: '张三', module: '规则引擎', summary: '修改安全帽检测置信度阈值 92%→90%', type: '修改', before: '92%', after: '90%' },
  { id: 2, time: '2026-06-23 10:20:00', operator: '李四', module: '基础配置', summary: '新增装修阶段围挡缺失检测规则', type: '新增', before: '-', after: '已启用' },
  { id: 3, time: '2026-06-22 16:45:00', operator: '王五', module: '模型配置', summary: 'YOLOv8-安全帽检测升级至v3.2', type: '修改', before: 'v3.1', after: 'v3.2' },
  { id: 4, time: '2026-06-21 09:00:00', operator: '张三', module: '调度策略', summary: '调整大模型调用间隔 30s→60s', type: '修改', before: '30秒', after: '60秒' },
  { id: 5, time: '2026-06-20 14:30:00', operator: 'admin', module: '基础配置', summary: '回滚至V3.1版本', type: '回滚', before: 'V3.2', after: 'V3.1' },
  { id: 6, time: '2026-06-19 11:00:00', operator: '李四', module: '知识库', summary: '删除过期安全规范文档', type: '删除', before: '3个文档', after: '0个文档' }
])

const filteredLogs = computed(() => {
  let data = logData.value
  if (operatorSearch.value) data = data.filter(d => d.operator.includes(operatorSearch.value))
  if (moduleFilter.value) data = data.filter(d => d.module === moduleFilter.value)
  return data
})

// 详情弹窗
const detailVisible = ref(false)
const detailRecord = ref<any>(null)
const viewDetail = (record: any) => {
  detailRecord.value = record
  detailVisible.value = true
}

// === Tab 2: 规则命中统计 ===
const statsPeriod = ref('day')

const ruleStats = ref([
  { rule: '未正确佩戴安全帽', count: 156 },
  { rule: '临边防护缺失', count: 89 },
  { rule: '脚手架连接松动', count: 67 },
  { rule: '吸烟', count: 45 },
  { rule: '吊篮超员', count: 32 },
  { rule: '电焊作业不规范', count: 28 },
  { rule: '围挡缺失', count: 21 }
])

const maxStatCount = computed(() => Math.max(...ruleStats.value.map(r => r.count)))

const exportStats = () => {
  message.success('统计报表已导出')
}
</script>

<style scoped lang="scss">
.audit-log {
  .config-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
  .toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }
  .stats-chart {
    .stat-bar-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
      .stat-label { width: 140px; font-size: 13px; text-align: right; }
      .stat-bar-wrap {
        flex: 1;
        height: 20px;
        background: #f5f5f5;
        border-radius: 4px;
        overflow: hidden;
        .stat-bar {
          height: 100%;
          background: linear-gradient(90deg, #1890ff, #36cfc9);
          border-radius: 4px;
          transition: width 0.3s;
        }
      }
      .stat-count { width: 40px; font-size: 13px; font-weight: 500; }
    }
  }
  .diff-view {
    .diff-block {
      background: #1e1e1e;
      border-radius: 6px;
      padding: 12px;
      .diff-line {
        font-family: 'Courier New', monospace;
        font-size: 13px;
        padding: 2px 8px;
        &.removed { color: #ff6b6b; background: rgba(255,107,107,0.1); }
        &.added { color: #51cf66; background: rgba(81,207,102,0.1); }
      }
    }
  }
}
</style>
