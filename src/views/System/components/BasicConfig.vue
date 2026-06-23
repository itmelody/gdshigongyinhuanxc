<template>
  <div class="basic-config">
    <a-card title="智能体基础信息" :bordered="false" class="config-card">
      <a-form :model="form" :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="智能体名称">
          <a-input v-model:value="form.name" :maxlength="50" show-count />
        </a-form-item>
        <a-form-item label="智能体描述">
          <a-textarea v-model:value="form.description" :rows="3" />
        </a-form-item>
        <a-form-item label="施工阶段关联">
          <a-checkbox-group v-model:value="form.stages" :options="stageOptions" @change="onStageChange" />
          <div class="stage-hint" v-if="form.stages.length">
            已关联 {{ form.stages.length }} 个阶段，下方展示对应隐患类型清单
          </div>
        </a-form-item>
        <a-form-item label="启用状态">
          <a-switch v-model:checked="form.enabled" checked-children="已启用" un-checked-children="已停用" />
        </a-form-item>
        <a-form-item :wrapper-col="{ offset: 4 }">
          <a-space>
            <a-button type="primary" @click="handleSave">保存</a-button>
            <a-button @click="handleCancel">取消</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 关联阶段隐患类型 -->
    <a-card v-if="form.stages.length" title="关联阶段隐患类型" :bordered="false" class="config-card" style="margin-top: 16px">
      <a-tag v-for="h in filteredHazards" :key="h" color="blue" style="margin-bottom: 6px">{{ h }}</a-tag>
    </a-card>

    <!-- 版本管理 -->
    <a-card title="版本管理" :bordered="false" class="config-card" style="margin-top: 16px">
      <a-table :columns="versionColumns" :data-source="versionData" :pagination="false" row-key="version" size="small">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-popconfirm title="确定回滚至该版本？" @confirm="handleRollback(record)">
              <a-button type="link" size="small">回滚</a-button>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'

const stageOptions = ['通用', '基础', '主体', '装修']

const form = reactive({
  name: '建筑工地施工隐患巡查智能体 V3.2',
  description: '覆盖通用/基础/主体/装修四阶段共27种隐患类型，基于YOLO+视觉大模型双引擎协同识别',
  stages: ['通用', '基础', '主体', '装修'] as string[],
  enabled: true
})

const allHazards: Record<string, string[]> = {
  '通用': ['未正确佩戴安全帽', '未穿反光背心', '吸烟', '饮酒作业', '未系安全带'],
  '基础': ['临边防护缺失', '基坑支护异常', '临时用电不规范', '堆载超限'],
  '主体': ['脚手架连接松动', '塔吊超载运行', '高处作业无防护', '模板支撑不牢'],
  '装修': ['吊篮超员', '电焊作业不规范', '油漆存放不当', '围挡缺失']
}

const filteredHazards = computed(() => {
  return form.stages.flatMap(s => allHazards[s] || [])
})

const onStageChange = () => {}

const versionColumns = [
  { title: '版本号', dataIndex: 'version', key: 'version', width: 100 },
  { title: '变更内容摘要', dataIndex: 'summary', key: 'summary' },
  { title: '操作人', dataIndex: 'operator', key: 'operator', width: 100 },
  { title: '变更时间', dataIndex: 'time', key: 'time', width: 180 },
  { title: '操作', key: 'action', width: 80 }
]

const versionData = ref([
  { version: 'V3.2', summary: '新增装修阶段围挡缺失检测规则', operator: '张三', time: '2026-06-20 14:30:00' },
  { version: 'V3.1', summary: '调整置信度阈值从85%提升至90%', operator: '李四', time: '2026-06-15 10:20:00' },
  { version: 'V3.0', summary: '升级YOLO模型至V8版本，识别精度提升12%', operator: '王五', time: '2026-05-28 09:00:00' },
  { version: 'V2.5', summary: '新增塔吊超载和脚手架松动检测', operator: '张三', time: '2026-04-10 16:45:00' }
])

const handleSave = () => {
  message.success('保存成功，版本号自动更新为 V3.3')
}
const handleCancel = () => {
  message.info('已取消修改')
}
const handleRollback = (record: any) => {
  message.success(`已回滚至 ${record.version} 版本`)
}
</script>

<style scoped lang="scss">
.basic-config {
  .config-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
  .stage-hint {
    margin-top: 8px;
    font-size: 12px;
    color: #1890ff;
  }
}
</style>
