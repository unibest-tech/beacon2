<template>
  <div class="p-4 bg-white rounded-lg shadow-sm">
    <h3 class="text-lg font-medium mb-4">模板使用统计</h3>
    <div class="relative h-400px">
      <!-- 图表显示 -->
      <div ref="chartRef" class="h-[400px] w-full"></div>
      <div
        v-if="loading"
        class="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center"
      >
        <div class="flex flex-col items-center">
          <div
            class="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"
          ></div>
          <span class="mt-3 text-gray-500">加载中...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { fetchBeaconData } from '@/api/beacon'
import type { BeaconData } from '@/api/beacon'

const uiLibraryList = [
  'wot-ui',
  'uview-pro',
  'sard-uniapp',
  'uview-plus',
  'uv-ui',
  // 'skiyee-ui',
  'none',
]
// 定义支持的模板类型
const UI_LIBRARY_TYPES = [...uiLibraryList] as const

type UiLibraryType = (typeof UI_LIBRARY_TYPES)[number]

// 图表数据格式
interface ChartDataItem {
  uiLibrary: UiLibraryType
  count: number
  percentage: number
}

// 状态定义
const rawData = ref<BeaconData[]>([])
const chartData = ref<ChartDataItem[]>([])
const loading = ref(false)
const chartRef = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null
// 移除分页相关配置，直接获取所有数据用于统计

/**
 * 处理原始数据，统计各模板使用次数及百分比
 */
const processChartData = () => {
  // 初始化统计对象
  // 定义合并后的类别
  const mergedCategories = [...uiLibraryList] as const

  // 初始化统计对象
  const uiLibraryCount: Record<string, number> = mergedCategories.reduce(
    (acc, type) => {
      acc[type] = 0
      return acc
    },
    {} as Record<string, number>,
  )

  // 处理数据并合并main和base
  rawData.value.forEach(item => {
    const uiLibrary = item.uiLibrary as UiLibraryType
    if (uiLibraryCount.hasOwnProperty(uiLibrary)) {
      uiLibraryCount[uiLibrary]++
    }
  })

  // 计算总数
  const totalCount = Object.values(uiLibraryCount).reduce(
    (sum, count) => sum + (count ?? 0),
    0,
  )

  // 转换为图表所需格式，并计算百分比
  chartData.value = Object.entries(uiLibraryCount).map(
    ([uiLibrary, count]) => ({
      uiLibrary,
      count,
      percentage: totalCount > 0 ? (count / totalCount) * 100 : 0,
    }),
  )
  console.log('chartData:', chartData.value)
}

/**
 * 从API获取数据，主要是服务端没有对应接口，所以这里直接获取所有数据，前端自己计算
 * 所以接口会比较满
 */
const fetchData = async () => {
  loading.value = true
  try {
    // 直接获取所有数据，不使用分页
    const res = await fetchBeaconData({ page: 1, pageSize: 100000 })
    rawData.value = res.data
    processChartData()
  } catch (error) {
    console.error('获取模板统计数据失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 初始化图表
 */
const initChart = () => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value, {
    height: '400px',
  })
  updateChart()
}

/**
 * 更新图表配置
 */
const updateChart = () => {
  if (!chartInstance || !chartData.value.length) return

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: chartData.value.map(item => item.uiLibrary),
      axisLabel: {
        rotate: 45,
        interval: 0,
      },
      name: '模板类型',
    },
    yAxis: {
      type: 'value',
      name: '使用次数',
    },
    series: [
      {
        name: '使用次数',
        type: 'bar',
        data: chartData.value.map(item => ({
          value: item.count,
          percentage: item.percentage,
        })),
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => {
            console.log('params:', params)
            // 显示数量和百分比，添加防御性检查避免undefined错误
            const percentage = params.data.percentage ?? 0
            return `${params.data.value}（${percentage.toFixed(1)}%）`
          },
        },
        itemStyle: {
          color: '#5470C6',
        },
      },
    ],
  }

  chartInstance.setOption(option)
}

// 监听数据变化更新图表
watch(chartData, () => {
  updateChart()
})

// 处理窗口大小变化
const handleResize = () => {
  chartInstance?.resize()
}

// 组件挂载时获取数据并初始化图表
onMounted(() => {
  fetchData()
  // 等待数据加载后初始化图表
  setTimeout(initChart, 100)

  // 窗口大小变化时重绘图表
  window.addEventListener('resize', handleResize)
})

// 组件卸载时销毁图表实例
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  window.removeEventListener('resize', handleResize)
})
</script>
