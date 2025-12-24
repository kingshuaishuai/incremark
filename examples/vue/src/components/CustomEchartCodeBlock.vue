<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  codeStr: string
  lang?: string
}>()

const chartRef = ref<HTMLDivElement>()
const error = ref('')
const loading = ref(false)

async function renderChart() {
  if (!props.codeStr) return
  
  error.value = ''
  loading.value = true

  try {    
    // 解析代码字符串（假设是 JSON 格式的配置）
    let option: any
    try {
      option = JSON.parse(props.codeStr)
      console.log(option)
    } catch (e) {
      // 如果不是 JSON，尝试作为 JavaScript 代码执行（仅示例，生产环境需要更安全的处理）
      error.value = 'ECharts 配置必须是有效的 JSON 格式'
      return
    }

    if (!chartRef.value) return

    // 创建或更新图表
    const chart = echarts.getInstanceByDom(chartRef.value)
    if (chart) {
      chart.setOption(option)
    } else {
      const newChart = echarts.init(chartRef.value)
      newChart.setOption(option)
    }
  } catch (e: any) {
    error.value = e.message || '渲染失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  console.log('props.codeStr', props.codeStr)
  renderChart()
})

watch(() => props.codeStr, renderChart)
</script>

<template>
  <div class="custom-echart-code-block">
    <div class="echart-header">
      <span class="language">ECHART</span>
    </div>
    <div class="echart-content">
      <div v-if="loading" class="echart-loading">加载中...</div>
      <div v-else-if="error" class="echart-error">{{ error }}</div>
      <div ref="chartRef" class="echart-chart" style="width: 100%; height: 400px;"></div>
    </div>
  </div>
</template>

<!-- 样式已移动到共享的 styles.css -->

