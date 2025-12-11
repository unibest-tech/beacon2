<template>
  <div class="data-table-container">
    <div class="p-4">
      <a-row :gutter="16" class="mb-4">
        <a-col :span="8">
          <a-select
            v-model:value="filterOs"
            placeholder="选择系统平台"
            style="width: 100%"
            @change="handleFilter"
          >
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="win32">Windows</a-select-option>
            <a-select-option value="darwin">macOS</a-select-option>
            <a-select-option value="linux">Linux</a-select-option>
          </a-select>
        </a-col>
      </a-row>

      <a-table
        :columns="columns"
        :data-source="tableData"
        :pagination="pagination"
        :loading="loading"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'time'">
            {{ formatDateTime(record.time) }}
          </template>
          <template v-else-if="column.key === 'duration'">
            {{
              record.duration !== undefined && !isNaN(Number(record.duration))
                ? `${Number(record.duration).toFixed(2)}S`
                : '--'
            }}
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import { fetchBeaconData } from '@/api/beacon'
import type { BeaconData } from '@/api/beacon'
import { formatDateTime } from '@/utils/dateUtil'

const emit = defineEmits<{
  'update:data': [data: BeaconData[]]
}>()

const columns = [
  {
    title: '模板类型',
    dataIndex: 'template',
    key: 'template',
  },
  {
    title: 'unibest版本',
    dataIndex: 'unibestVersion',
    key: 'unibestVersion',
    customRender: ({ text, record }: { text: string; record: BeaconData }) => {
      return record.version || '--'
    },
  },
  {
    title: 'create-unibest版本',
    dataIndex: 'createUnibestVersion',
    key: 'createUnibestVersion',
  },
  {
    title: '操作系统',
    dataIndex: 'os',
    key: 'os',
    customRender: ({ text, record }: { text: string; record: BeaconData }) => {
      return record.osPlatform || '--'
    },
  },
  {
    title: 'CPU型号',
    dataIndex: 'cpuModel',
    key: 'cpuModel',
  },
  {
    title: '内存',
    dataIndex: 'totalMem',
    key: 'totalMem',
    customRender: ({ text }: { text: string }) => {
      return text ? `${text}G` : '--'
    },
  },
  {
    title: 'Node版本',
    dataIndex: 'nodeVersion',
    key: 'nodeVersion',
  },
  {
    title: '耗时',
    dataIndex: 'duration',
    key: 'duration',
  },
  {
    title: '时间',
    dataIndex: 'time',
    key: 'time',
  },
]

const tableData = ref<BeaconData[]>([])
const loading = ref(false)
const filterOs = ref('')
const pagination = ref<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 100,
  showSizeChanger: true,
  showTotal: total => `共 ${total} 条`,
})

const formatOsPlatform = (os?: string) => {
  if (!os) return '未知'
  const map: Record<string, string> = {
    win32: 'Windows',
    darwin: 'macOS',
    linux: 'Linux',
  }
  return map[os] || os
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.current || 1,
      pageSize: pagination.value.pageSize || 100,
      os: filterOs.value || undefined,
    }
    const res = await fetchBeaconData(params)
    tableData.value = res.data
    pagination.value.total = res.total
    // 发射数据更新事件
    emit('update:data', res.data)
  } catch (error) {
    console.error('获取数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 修正：将onMounted移到顶层
onMounted(() => {
  // 初始化加载第一页数据
  handleTableChange({ current: 1, pageSize: 100 })
})

const handleTableChange = (pag: TablePaginationConfig) => {
  pagination.value = pag
  fetchData()
}

const handleFilter = () => {
  pagination.value.current = 1
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>
