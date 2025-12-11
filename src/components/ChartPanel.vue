<template>
  <div class="chart-panel">
    <div class="chart-item">
      <h3 class="text-lg font-medium mb-4">系统分布</h3>
      <div ref="osChartRef" class="chart-container" />
    </div>
    <div class="chart-item">
      <h3 class="text-lg font-medium mb-4">时段使用量</h3>
      <div ref="hourlyChartRef" class="chart-container" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts/core'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import { PieChart, BarChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import type { BeaconData } from '@/api/beacon'
import { groupByHour } from '@/utils/dateUtil'

echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  PieChart,
  BarChart,
  CanvasRenderer,
])

const props = defineProps<{
  data: BeaconData[]
}>()

const osChartRef = ref<HTMLElement>()
const hourlyChartRef = ref<HTMLElement>()
let osChart: echarts.ECharts | null = null
let hourlyChart: echarts.ECharts | null = null

const initCharts = () => {
  if (osChartRef.value && !osChart) {
    osChart = echarts.init(osChartRef.value)
  }
  if (hourlyChartRef.value && !hourlyChart) {
    hourlyChart = echarts.init(hourlyChartRef.value)
  }
  updateCharts()
}

const updateOsChart = () => {
  if (!osChart || !props.data.length) return

  const osCount: Record<string, number> = {}
  props.data.forEach(item => {
    const os = item.osPlatform || '未知'
    osCount[os] = (osCount[os] || 0) + 1
  })

  const data = Object.entries(osCount).map(([name, value]) => ({
    name:
      name === 'win32'
        ? 'Windows'
        : name === 'darwin'
        ? 'macOS'
        : name === 'linux'
        ? 'Linux'
        : name,
    value,
  }))

  osChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data,
      },
    ],
  })
}

const updateHourlyChart = () => {
  if (!hourlyChart || !props.data.length) return

  const hourlyData = groupByHour(props.data)

  hourlyChart.setOption({
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
    xAxis: [
      {
        type: 'category',
        data: hourlyData.map(item => item.hour),
        axisTick: {
          alignWithLabel: true,
        },
      },
    ],
    yAxis: [
      {
        type: 'value',
      },
    ],
    series: [
      {
        name: '使用量',
        type: 'bar',
        barWidth: '60%',
        data: hourlyData.map(item => item.count),
      },
    ],
  })
}

const updateCharts = () => {
  console.log('Updating charts with data length:', props.data.length)
  updateOsChart()
  updateHourlyChart()
}

watch(
  () => props.data,
  newData => {
    console.log('ChartPanel data updated:', newData.length)
    if (newData.length > 0) {
      updateCharts()
    }
  },
  { immediate: true },
)

const handleResize = () => {
  osChart?.resize()
  hourlyChart?.resize()
}

onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  osChart?.dispose()
  hourlyChart?.dispose()
})
</script>
