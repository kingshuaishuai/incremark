/* @jsxImportSource solid-js */

import { Component, createEffect, createSignal, onMount, Show } from 'solid-js'
import * as echarts from 'echarts'

export interface CustomEchartCodeBlockProps {
  codeStr: string
  lang?: string
  completed: boolean
  takeOver?: boolean
}

/**
 * ECharts 自定义代码块组件
 *
 * 渲染 ECharts 图表的代码块
 */
export const CustomEchartCodeBlock: Component<CustomEchartCodeBlockProps> = (props) => {
  let chartRef: HTMLDivElement | undefined
  const [error, setError] = createSignal('')

  // 是否应该显示图表
  const shouldShowChart = () => props.completed

  async function renderChart() {
    if (!props.codeStr) return

    setError('')

    try {
      const option = JSON.parse(props.codeStr)

      if (!chartRef) return

      const chart = echarts.getInstanceByDom(chartRef)
      if (chart) {
        chart.setOption(option)
      } else {
        echarts.init(chartRef).setOption(option)
      }
    } catch (e: any) {
      setError(e.message || '渲染失败')
    }
  }

  // 监听 completed 变化
  createEffect(() => {
    const isCompleted = props.completed

    // 如果应该显示图表，等待 DOM 更新后渲染
    if (props.takeOver === true || isCompleted) {
      // 使用 setTimeout 确保 DOM 已更新（对齐 Vue 的 nextTick）
      setTimeout(() => {
        renderChart()
      }, 0)
    }
  })

  onMount(() => {
    renderChart()
  })

  return (
    <div class="custom-echart-code-block">
      <div class="echart-header">
        <span class="language">ECHART</span>
      </div>
      <div class="echart-content">
        {/* loading 状态 */}
        <Show when={!shouldShowChart()}>
          <div class="echart-loading">解析中...</div>
        </Show>
        {/* 错误 */}
        <Show when={shouldShowChart() && error()}>
          <div class="echart-error">{error()}</div>
        </Show>
        {/* 图表（无 Show，始终存在） */}
        <div
          ref={chartRef}
          class="echart-chart"
          style={{ width: '100%', height: '400px', display: shouldShowChart() ? 'block' : 'none' }}
        />
      </div>
    </div>
  )
}
