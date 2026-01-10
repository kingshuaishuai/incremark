/* @jsxImportSource solid-js */

import {
  createSignal,
  createEffect,
  Show
} from 'solid-js'
import { MicromarkAstBuilder } from '@incremark/core/engines/micromark'
import {
  IncremarkContent,
  AutoScrollContainer,
  ThemeProvider,
  ConfigProvider,
  type DesignTokens,
  type UseIncremarkOptions,
  type IncremarkLocale
} from '@incremark/solid'
import { CustomHeading, CustomWarningContainer, CustomInfoContainer, CustomTipContainer, BenchmarkPanel, CustomInputPanel, type BenchmarkStats } from './index'
import { CustomEchartCodeBlock } from './CustomEchartCodeBlock'
import type { Messages } from '../hooks/useLocale'

export interface IncremarkDemoProps {
  htmlEnabled: boolean
  sampleMarkdown: string
  t: Messages
  locale?: IncremarkLocale
}

// ============ 自定义容器 ============
const customContainers = {
  warning: CustomWarningContainer,
  info: CustomInfoContainer,
  tip: CustomTipContainer
}

// ============ 自定义组件 ============
const customComponents = { heading: CustomHeading }

// ============ 主题系统 ============
function createThemeSignals() {
  const [themeMode, setThemeMode] = createSignal<'default' | 'dark' | 'custom'>('default')

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

  const currentTheme = () => {
    switch (themeMode()) {
      case 'dark':
        return 'dark'
      case 'custom':
        return customThemeOverride
      default:
        return 'default'
    }
  }

  return { themeMode, setThemeMode, currentTheme }
}

export function IncremarkDemo(props: IncremarkDemoProps) {
  const theme = createThemeSignals()

  // ============ 自定义代码块配置（放在函数内避免循环依赖）============
  const customCodeBlocks = {
    echarts: CustomEchartCodeBlock,
  }

  const codeBlockConfigs = {
    echarts: {
      takeOver: true,
    }
  }

  // ============ 打字机配置 ============
  const [typewriterEnabled, setTypewriterEnabled] = createSignal(false)
  const [typewriterSpeed, setTypewriterSpeed] = createSignal(2)
  const [typewriterInterval, setTypewriterInterval] = createSignal(30)
  const [typewriterRandomStep, setTypewriterRandomStep] = createSignal(true)
  const [typewriterEffect, setTypewriterEffect] = createSignal<'none' | 'fade-in' | 'typing'>('typing')

  // ============ 数学公式配置 ============
  const [mathTexEnabled, setMathTexEnabled] = createSignal(false)

  // ============ 引擎配置 ============
  const [engineType, setEngineType] = createSignal<'marked' | 'micromark'>('marked')

  // ============ 内容状态 ============
  const [mdContent, setMdContent] = createSignal('')
  const [isFinished, setIsFinished] = createSignal(false)

  // ============ 流式输出 ============
  const [isStreaming, setIsStreaming] = createSignal(false)

  // ============ 自动滚动 ============
  const [autoScrollEnabled, setAutoScrollEnabled] = createSignal(true)

  // ============ 自定义输入 ============
  const [customInputMode, setCustomInputMode] = createSignal(false)
  const [customMarkdown, setCustomMarkdown] = createSignal('')

  // ============ 自定义组件开关 ============
  const [useCustomComponents, setUseCustomComponents] = createSignal(false)

  // ============ Benchmark ============
  const [benchmarkMode, setBenchmarkMode] = createSignal(false)
  const [benchmarkRunning, setBenchmarkRunning] = createSignal(false)
  const [benchmarkProgress, setBenchmarkProgress] = createSignal(0)
  const [benchmarkStats, setBenchmarkStats] = createSignal<BenchmarkStats>({
    traditional: { time: 0, parseCount: 0, totalChars: 0 },
    incremark: { time: 0, parseCount: 0, totalChars: 0 }
  })

  // ============ Incremark 配置（响应式） ============
  const incremarkOptions = () => ({
    gfm: true,
    math: mathTexEnabled() ? { tex: true } : true,
    htmlTree: props.htmlEnabled,
    containers: true,
    astBuilder: engineType() === 'micromark' ? MicromarkAstBuilder : undefined,
    typewriter: {
      enabled: typewriterEnabled(),
      charsPerTick: typewriterRandomStep()
        ? [1, Math.max(2, typewriterSpeed())] as [number, number]
        : typewriterSpeed(),
      tickInterval: typewriterInterval(),
      effect: typewriterEffect(),
      cursor: '|'
    }
  })

  async function simulateStream() {
    setMdContent('')
    setIsFinished(false)
    setIsStreaming(true)

    await new Promise(resolve => setTimeout(resolve, 0))

    const content = customInputMode() && customMarkdown().trim()
      ? customMarkdown()
      : props.sampleMarkdown
    const chunks = content.match(/[\s\S]{1,20}/g) || []

    // 性能监测
    const updateTimes: number[] = []
    console.log(`[Perf] Starting stream with ${chunks.length} chunks`)

    for (const chunk of chunks) {
      const start = performance.now()
      setMdContent(prev => prev + chunk)
      const elapsed = performance.now() - start
      updateTimes.push(elapsed)
      await new Promise(resolve => setTimeout(resolve, 30))
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

    setIsFinished(true)
    setIsStreaming(false)
  }

  function renderOnce() {
    const content = customInputMode() && customMarkdown().trim()
      ? customMarkdown()
      : props.sampleMarkdown
    setMdContent(content)
    setIsFinished(true)
  }

  function reset() {
    setMdContent('')
    setIsFinished(false)
  }

  async function handleRunBenchmark() {
    const content = customInputMode() && customMarkdown().trim()
      ? customMarkdown()
      : props.sampleMarkdown

    setBenchmarkRunning(true)
    setBenchmarkProgress(0)

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
      setMdContent(accumulated)
      traditionalTime += performance.now() - start
      traditionalParseCount++
      traditionalTotalChars += accumulated.length
      setBenchmarkProgress(((i + 1) / chunks.length) * 50)
      await new Promise(r => setTimeout(r, 5))
    }

    // 2. 测试增量方式
    setMdContent('')
    setIsFinished(false)
    let incremarkTime = 0
    let incremarkParseCount = 0
    let incremarkTotalChars = 0

    for (let i = 0; i < chunks.length; i++) {
      const start = performance.now()
      setMdContent(prev => prev + chunks[i])
      incremarkTime += performance.now() - start
      incremarkParseCount++
      incremarkTotalChars += chunks[i].length
      setBenchmarkProgress(50 + ((i + 1) / chunks.length) * 50)
      await new Promise(r => setTimeout(r, 5))
    }

    setIsFinished(true)

    setBenchmarkStats({
      traditional: { time: traditionalTime, parseCount: traditionalParseCount, totalChars: traditionalTotalChars },
      incremark: { time: incremarkTime, parseCount: incremarkParseCount, totalChars: incremarkTotalChars }
    })

    setBenchmarkRunning(false)
  }

  // ============ 解析器配置变化时重置内容 ============
  createEffect(() => {
    engineType()
    mathTexEnabled()
    reset()
  })

  return (
    <div class="demo-content">
      <div class="controls">
        <button onClick={simulateStream} disabled={isStreaming() || benchmarkRunning()}>
          {isStreaming() ? props.t.streaming : props.t.simulateAI}
        </button>
        <button onClick={renderOnce} disabled={isStreaming() || benchmarkRunning()}>
          {props.t.renderOnce}
        </button>
        <button onClick={reset} disabled={isStreaming() || benchmarkRunning()}>
          {props.t.reset}
        </button>

        <label class="checkbox">
          <input
            type="checkbox"
            checked={useCustomComponents()}
            onChange={(e) => setUseCustomComponents(e.currentTarget.checked)}
          />
          {props.t.customComponents}
        </label>
        <label class="checkbox benchmark-toggle">
          <input
            type="checkbox"
            checked={benchmarkMode()}
            onChange={(e) => setBenchmarkMode(e.currentTarget.checked)}
          />
          {props.t.benchmarkMode}
        </label>
        <label class="checkbox">
          <input
            type="checkbox"
            checked={customInputMode()}
            onChange={(e) => setCustomInputMode(e.currentTarget.checked)}
          />
          {props.t.customInput}
        </label>
        <label class="checkbox typewriter-toggle">
          <input
            type="checkbox"
            checked={typewriterEnabled()}
            onChange={(e) => setTypewriterEnabled(e.currentTarget.checked)}
          />
          {props.t.typewriterMode}
        </label>
        <label class="checkbox auto-scroll-toggle">
          <input
            type="checkbox"
            checked={autoScrollEnabled()}
            onChange={(e) => setAutoScrollEnabled(e.currentTarget.checked)}
          />
          {props.t.autoScroll}
        </label>
        <label class="checkbox tex-toggle" title={props.t.texTooltip}>
          <input
            type="checkbox"
            checked={mathTexEnabled()}
            onChange={(e) => setMathTexEnabled(e.currentTarget.checked)}
          />
          {props.t.mathTex}
        </label>

        <select
          value={engineType()}
          onChange={(e) => setEngineType(e.currentTarget.value as any)}
          class="engine-select"
          title={props.t.engineTooltip}
        >
          <option value="marked">{props.t.engineMarked}</option>
          <option value="micromark">{props.t.engineMicromark}</option>
        </select>

        <select
          value={theme.themeMode()}
          onChange={(e) => theme.setThemeMode(e.currentTarget.value as any)}
          class="theme-select"
        >
          <option value="default">Light Theme</option>
          <option value="dark">Dark Theme</option>
          <option value="custom">Custom Theme</option>
        </select>

        <Show when={typewriterEnabled()}>
          <label class="speed-control">
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={typewriterSpeed()}
              onInput={(e) => setTypewriterSpeed(parseInt(e.currentTarget.value))}
            />
            <span class="speed-value">
              {typewriterSpeed()} {props.t.charsPerTick}
            </span>
          </label>
          <label class="speed-control">
            <input
              type="range"
              min="10"
              max="200"
              step="10"
              value={typewriterInterval()}
              onInput={(e) => setTypewriterInterval(parseInt(e.currentTarget.value))}
            />
            <span class="speed-value">
              {typewriterInterval()} {props.t.intervalMs}
            </span>
          </label>
          <label class="checkbox random-step-toggle">
            <input
              type="checkbox"
              checked={typewriterRandomStep()}
              onChange={(e) => setTypewriterRandomStep(e.currentTarget.checked)}
            />
            {props.t.randomStep}
          </label>
          <select
            value={typewriterEffect()}
            onChange={(e) => setTypewriterEffect(e.currentTarget.value as any)}
            class="effect-select"
          >
            <option value="none">{props.t.effectNone}</option>
            <option value="fade-in">{props.t.effectFadeIn}</option>
            <option value="typing">{props.t.effectTyping}</option>
          </select>
        </Show>

        <span class="stats">
          {mdContent().length} {props.t.chars}
        </span>
      </div>

      <Show when={benchmarkMode()}>
        <BenchmarkPanel
          stats={benchmarkStats()}
          running={benchmarkRunning()}
          progress={benchmarkProgress()}
          t={props.t}
          onRun={handleRunBenchmark}
        />
      </Show>

      <Show when={customInputMode()}>
        <CustomInputPanel
          value={customMarkdown()}
          t={props.t}
          onChange={setCustomMarkdown}
          onUseExample={() => setCustomMarkdown(props.sampleMarkdown)}
        />
      </Show>

      <main class={`content ${typewriterEnabled() ? `effect-${typewriterEffect()}` : ''}`}>
        <ConfigProvider locale={props.locale}>
          <ThemeProvider theme={theme.currentTheme()}>
            <AutoScrollContainer enabled={autoScrollEnabled()} class="scroll-container">
              <IncremarkContent
                content={mdContent()}
                isFinished={isFinished()}
                incremarkOptions={incremarkOptions()}
                components={useCustomComponents() ? customComponents : {}}
                customContainers={customContainers}
                customCodeBlocks={customCodeBlocks}
                codeBlockConfigs={codeBlockConfigs}
                showBlockStatus={true}
              />
            </AutoScrollContainer>
          </ThemeProvider>
        </ConfigProvider>
      </main>
    </div>
  )
}
