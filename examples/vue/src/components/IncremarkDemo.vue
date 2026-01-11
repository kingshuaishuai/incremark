<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { IncremarkContent, AutoScrollContainer, ThemeProvider, ConfigProvider, type DesignTokens, type UseIncremarkOptions, type IncremarkLocale } from '@incremark/vue'
import { MicromarkAstBuilder } from '@incremark/core/engines/micromark'
import type { IncremarkDevTools } from '@incremark/devtools'

import { BenchmarkPanel, CustomInputPanel, CustomHeading, CustomWarningContainer, CustomInfoContainer, CustomTipContainer, CustomEchartCodeBlock } from './index'
import type { BenchmarkStats } from '../composables'
import type { Messages } from '../locales'

const props = defineProps<{
  htmlEnabled: boolean
  sampleMarkdown: string
  t: Messages
  locale?: IncremarkLocale
  devtools?: IncremarkDevTools
}>()

// ============ 打字机配置 ============
const typewriterEnabled = ref(false)
const typewriterSpeed = ref(2)
const typewriterInterval = ref(30)
const typewriterRandomStep = ref(true)
const typewriterEffect = ref<'none' | 'fade-in' | 'typing'>('typing')

// ============ 数学公式配置 ============
const mathTexEnabled = ref(false)

// ============ 引擎配置 ============
const engineType = ref<'marked' | 'micromark'>('marked')

// ============ 内容状态 ============
const mdContent = ref('')
const isFinished = ref(false)

// ============ Incremark 配置（响应式） ============
const incremarkOptions = computed<UseIncremarkOptions>(() => ({
  gfm: true,
  math: mathTexEnabled.value ? { tex: true } : true,
  htmlTree: props.htmlEnabled,
  containers: true,
  astBuilder: engineType.value === 'micromark' ? MicromarkAstBuilder : undefined,
  typewriter: {
    enabled: typewriterEnabled.value,
    charsPerTick: typewriterRandomStep.value
      ? [1, Math.max(2, typewriterSpeed.value)] as [number, number]
      : typewriterSpeed.value,
    tickInterval: typewriterInterval.value,
    effect: typewriterEffect.value,
    cursor: '|'
  }
}))

// ============ 流式输出 ============
const isStreaming = ref(false)

async function simulateStream() {
  mdContent.value = ''
  isFinished.value = false
  isStreaming.value = true

  await nextTick();

  const content = customInputMode.value && customMarkdown.value.trim()
    ? customMarkdown.value
    : props.sampleMarkdown
  const chunks = content.match(/[\s\S]{1,20}/g) || []

  // 性能监测
  const updateTimes: number[] = []
  console.log(`[Perf] Starting stream with ${chunks.length} chunks`)

  for (const chunk of chunks) {
    const start = performance.now()
    mdContent.value += chunk
    await nextTick() // 等待 DOM 更新完成
    const elapsed = performance.now() - start
    updateTimes.push(elapsed)
    await new Promise((resolve) => setTimeout(resolve, 30))
  }

  // 输出性能统计
  const avg = updateTimes.reduce((a, b) => a + b, 0) / updateTimes.length
  const max = Math.max(...updateTimes)
  const min = Math.min(...updateTimes)
  console.log(`[Perf] Stream completed:`)
  console.log(`  - Chunks: ${chunks.length}`)
  console.log(`  - Avg update: ${avg.toFixed(2)}ms`)
  console.log(`  - Min update: ${min.toFixed(2)}ms`)
  console.log(`  - Max update: ${max.toFixed(2)}ms`)
  console.log(`  - Updates > 16ms (frame drop): ${updateTimes.filter(t => t > 16).length}`)

  isFinished.value = true
  isStreaming.value = false
}

function renderOnce() {
  const content = customInputMode.value && customMarkdown.value.trim()
    ? customMarkdown.value
    : props.sampleMarkdown
  mdContent.value = content
  isFinished.value = true
}

function reset() {
  mdContent.value = ''
  isFinished.value = false
}

// ============ 解析器配置变化时重置内容 ============
// 当引擎或 math 配置变化时，重置 demo 的本地状态
watch([engineType, mathTexEnabled], () => {
  reset()
})

// ============ 自动滚动 ============
const autoScrollEnabled = ref(true)

// ============ 自定义输入 ============
const customInputMode = ref(false)
const customMarkdown = ref('')

// ============ Benchmark ============
const benchmarkMode = ref(false)
const benchmarkRunning = ref(false)
const benchmarkProgress = ref(0)
const benchmarkStats = ref<BenchmarkStats>({
  traditional: { time: 0, parseCount: 0, totalChars: 0 },
  incremark: { time: 0, parseCount: 0, totalChars: 0 }
})

async function handleRunBenchmark() {
  const content = customInputMode.value && customMarkdown.value.trim()
    ? customMarkdown.value
    : props.sampleMarkdown

  benchmarkRunning.value = true
  benchmarkProgress.value = 0

  const chunks = content.match(/[\s\S]{1,20}/g) || []

  // 1. 测试传统方式：模拟每次重新渲染
  let traditionalTime = 0
  let traditionalParseCount = 0
  let traditionalTotalChars = 0
  let accumulated = ''

  for (let i = 0; i < chunks.length; i++) {
    accumulated += chunks[i]
    const start = performance.now()
    // 模拟传统方式：每次都重新设置完整内容
    mdContent.value = accumulated
    traditionalTime += performance.now() - start
    traditionalParseCount++
    traditionalTotalChars += accumulated.length
    benchmarkProgress.value = ((i + 1) / chunks.length) * 50
    await new Promise(r => setTimeout(r, 5))
  }

  // 2. 测试增量方式
  mdContent.value = ''
  isFinished.value = false
  let incremarkTime = 0
  let incremarkParseCount = 0
  let incremarkTotalChars = 0

  for (let i = 0; i < chunks.length; i++) {
    const start = performance.now()
    mdContent.value += chunks[i]
    incremarkTime += performance.now() - start
    incremarkParseCount++
    incremarkTotalChars += chunks[i].length
    benchmarkProgress.value = 50 + ((i + 1) / chunks.length) * 50
    await new Promise(r => setTimeout(r, 5))
  }

  isFinished.value = true

  benchmarkStats.value = {
    traditional: { time: traditionalTime, parseCount: traditionalParseCount, totalChars: traditionalTotalChars },
    incremark: { time: incremarkTime, parseCount: incremarkParseCount, totalChars: incremarkTotalChars }
  }

  benchmarkRunning.value = false
}

// ============ 自定义组件 ============
const useCustomComponents = ref(false)
const customComponents = { heading: CustomHeading }

// ============ 自定义容器 ============
const customContainers = {
  warning: CustomWarningContainer,
  info: CustomInfoContainer,
  tip: CustomTipContainer,
}

// ============ 自定义代码块 ============
const customCodeBlocks = {
  echarts: CustomEchartCodeBlock,
}

// ============ 代码块配置 ============
const codeBlockConfigs = {
  echarts: {
    takeOver: true,
  }
}

// ============ 主题系统 ============
const themeMode = ref<'default' | 'dark' | 'custom'>('default')

const customThemeOverride: Partial<DesignTokens> = {
  color: {
    brand: {
      primary: '#8b5cf6',
      primaryHover: '#7c3aed',
      primaryActive: '#6d28d9',
      primaryLight: '#a78bfa'
    }
  } as any
}

const currentTheme = computed<'default' | 'dark' | DesignTokens | Partial<DesignTokens>>(() => {
  switch (themeMode.value) {
    case 'dark':
      return 'dark'
    case 'custom':
      return customThemeOverride
    default:
      return 'default'
  }
})

// 暴露方法供父组件调用
defineExpose({
  reset,
  renderOnce,
  mdContent,
  isStreaming,
  benchmarkRunning
})
</script>

<template>
  <div class="demo-content">
    <div class="controls">
      <button @click="simulateStream" :disabled="isStreaming || benchmarkRunning">
        {{ isStreaming ? t.streaming : t.simulateAI }}
      </button>
      <button @click="renderOnce" :disabled="isStreaming || benchmarkRunning">{{ t.renderOnce }}</button>
      <button @click="reset" :disabled="isStreaming || benchmarkRunning">{{ t.reset }}</button>

      <label class="checkbox">
        <input type="checkbox" v-model="useCustomComponents" />
        {{ t.customComponents }}
      </label>
      <label class="checkbox benchmark-toggle">
        <input type="checkbox" v-model="benchmarkMode" />
        {{ t.benchmarkMode }}
      </label>
      <label class="checkbox">
        <input type="checkbox" v-model="customInputMode" />
        {{ t.customInput }}
      </label>
      <label class="checkbox typewriter-toggle">
        <input type="checkbox" v-model="typewriterEnabled" />
        {{ t.typewriterMode }}
      </label>
      <label class="checkbox auto-scroll-toggle">
        <input type="checkbox" v-model="autoScrollEnabled" />
        {{ t.autoScroll }}
      </label>
      <label class="checkbox tex-toggle" :title="t.texTooltip">
        <input type="checkbox" v-model="mathTexEnabled" />
        {{ t.mathTex }}
      </label>

      <select v-model="engineType" class="engine-select" :title="t.engineTooltip">
        <option value="marked">{{ t.engineMarked }}</option>
        <option value="micromark">{{ t.engineMicromark }}</option>
      </select>

      <select v-model="themeMode" class="theme-select">
        <option value="default">Light Theme</option>
        <option value="dark">Dark Theme</option>
        <option value="custom">Custom Theme</option>
      </select>

      <template v-if="typewriterEnabled">
        <label class="speed-control">
          <input type="range" v-model.number="typewriterSpeed" min="1" max="10" step="1" />
          <span class="speed-value">{{ typewriterSpeed }} {{ t.charsPerTick }}</span>
        </label>
        <label class="speed-control">
          <input type="range" v-model.number="typewriterInterval" min="10" max="200" step="10" />
          <span class="speed-value">{{ typewriterInterval }} {{ t.intervalMs }}</span>
        </label>
        <label class="checkbox random-step-toggle">
          <input type="checkbox" v-model="typewriterRandomStep" />
          {{ t.randomStep }}
        </label>
        <select v-model="typewriterEffect" class="effect-select">
          <option value="none">{{ t.effectNone }}</option>
          <option value="fade-in">{{ t.effectFadeIn }}</option>
          <option value="typing">{{ t.effectTyping }}</option>
        </select>
      </template>

      <span class="stats">
        {{ mdContent.length }} {{ t.chars }}
      </span>
    </div>

    <BenchmarkPanel
      v-if="benchmarkMode"
      :stats="benchmarkStats"
      :running="benchmarkRunning"
      :progress="benchmarkProgress"
      :t="t"
      @run="handleRunBenchmark"
    />

    <CustomInputPanel
      v-if="customInputMode"
      v-model="customMarkdown"
      :t="t"
      @use-example="customMarkdown = sampleMarkdown"
    />

    <main :class="['content', typewriterEnabled && `effect-${typewriterEffect}`]">
      <ConfigProvider :locale="locale">
        <ThemeProvider :theme="currentTheme">
          <AutoScrollContainer :enabled="autoScrollEnabled" class="scroll-container">
            <IncremarkContent
              :content="mdContent"
              :is-finished="isFinished"
              :incremark-options="incremarkOptions"
              :components="useCustomComponents ? customComponents : {}"
              :custom-containers="customContainers"
              :custom-code-blocks="customCodeBlocks"
              :code-block-configs="codeBlockConfigs"
              :show-block-status="true"
              :devtools="devtools"
            />
          </AutoScrollContainer>
        </ThemeProvider>
      </ConfigProvider>
    </main>
  </div>
</template>
