<script lang="ts">
  import * as echarts from 'echarts'

  interface Props {
    codeStr: string
    lang?: string
  }

  let { codeStr }: Props = $props()

  let chartRef: HTMLDivElement | undefined = $state();
  let error = $state('')
  let loading = $state(false)

  async function renderChart() {
    if (!codeStr) return

    error = ''
    loading = true

    try {
      // 解析代码字符串（假设是 JSON 格式的配置）
      let option: any
      try {
        option = JSON.parse(codeStr)
        console.log(option)
      } catch (e) {
        // 如果不是 JSON，尝试作为 JavaScript 代码执行（仅示例，生产环境需要更安全的处理）
        error = 'ECharts 配置必须是有效的 JSON 格式'
        loading = false
        return
      }

      if (!chartRef) {
        loading = false
        return
      }

      // 创建或更新图表
      const chart = echarts.getInstanceByDom(chartRef)
      if (chart) {
        chart.setOption(option)
      } else {
        const newChart = echarts.init(chartRef)
        newChart.setOption(option)
      }
    } catch (e: any) {
      error = e.message || '渲染失败'
    } finally {
      loading = false
    }
  }

  $effect(() => {
    renderChart()
  })
</script>

<div class="custom-echart-code-block">
  <div class="echart-header">
    <span class="language">ECHART</span>
  </div>
  <div class="echart-content">
    {#if loading}
      <div class="echart-loading">加载中...</div>
    {:else if error}
      <div class="echart-error">{error}</div>
    {:else}
      <div bind:this={chartRef} class="echart-chart" style="width: 100%; height: 400px;"></div>
    {/if}
  </div>
</div>

