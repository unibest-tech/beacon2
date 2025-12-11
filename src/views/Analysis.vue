<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">数据分析</h2>
    <a-card class="mb-6">
      <a-statistic-countdown
        title="数据更新倒计时"
        :value="deadline"
        format="HH:mm:ss"
        @finish="onFinish"
      />
    </a-card>
    <a-row :gutter="16">
      <a-col :span="8">
        <a-card>
          <a-statistic
            title="今日创建数"
            :value="todayCount"
            :value-style="{ color: '#3f8600' }"
          >
            <template #prefix>
              <arrow-up-outlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card>
          <a-statistic
            title="平均耗时"
            :value="avgDuration"
            :precision="2"
            suffix="秒"
          />
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card>
          <a-statistic
            title="总创建数"
            :value="totalCount"
            :value-style="{ color: '#cf1322' }"
          />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ArrowUpOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import { fetchBeaconData } from '@/api/beacon'

const deadline = ref(Date.now() + 1000 * 60 * 60) // 1小时后
const todayCount = ref(0)
const avgDuration = ref(0)
const totalCount = ref(0)

const fetchAnalysisData = async () => {
  try {
    const res = await fetchBeaconData({ page: 1, pageSize: 1000 })
    const today = dayjs().format('YYYY-MM-DD')

    // 计算今日数据
    todayCount.value = res.data.filter(
      item => dayjs(item.createAt).format('YYYY-MM-DD') === today,
    ).length

    // 设置总数
    totalCount.value = res.total
  } catch (error) {
    console.error('获取分析数据失败:', error)
  }
}

const onFinish = () => {
  fetchAnalysisData()
  deadline.value = Date.now() + 1000 * 60 * 60 // 重置倒计时
}

onMounted(() => {
  fetchAnalysisData()
})
</script>
