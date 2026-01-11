<!--
  @file IncremarkDemo.svelte - Incremark 演示组件
  @description 主要的演示组件，包含所有功能
-->

<script lang="ts">
  import {
    IncremarkContent,
    AutoScrollContainer,
    ThemeProvider,
    ConfigProvider,
    type DesignTokens,
    type UseIncremarkOptions,
    type IncremarkLocale
  } from '@incremark/svelte'
  import { MicromarkAstBuilder } from '@incremark/core/engines/micromark'
  import {
    BenchmarkPanel,
    CustomInputPanel,
    CustomHeading,
    CustomWarningContainer,
    CustomInfoContainer,
    CustomTipContainer,
    CustomEchartCodeBlock
  } from './index'
  import type { Messages } from '../locales'
  import type { IncremarkDevTools } from '@incremark/devtools'

  interface BenchmarkStats {
    traditional: { time: number; parseCount: number; totalChars: number }
    incremark: { time: number; parseCount: number; totalChars: number }
  }

  /**
   * 组件 Props
   */
  interface Props {
    /** 是否启用 HTML 模式 */
    htmlEnabled: boolean
    /** 示例 Markdown 内容 */
    sampleMarkdown: string
    /** 国际化消息 */
    t: Messages
    /** Incremark locale */
    locale?: IncremarkLocale
    /** DevTools 实例 */
    devtools?: IncremarkDevTools | null
  }

  let {
    htmlEnabled,
    sampleMarkdown,
    t,
    locale,
    devtools
  }: Props = $props()

  // ============ 打字机配置 ============
  let typewriterEnabled = $state(false)
  let typewriterSpeed = $state(2)
  let typewriterInterval = $state(30)
  let typewriterRandomStep = $state(true)
  let typewriterEffect = $state<'none' | 'fade-in' | 'typing'>('typing')

  // ============ 数学公式配置 ============
  let mathTexEnabled = $state(false)

  // ============ 引擎配置 ============
  let engineType = $state<'marked' | 'micromark'>('marked')

  // ============ 内容状态 ============
  let mdContent = $state('')
  let isFinished = $state(false)

  const sleep = (ms: number = 0) => new Promise(resolve => setTimeout(resolve, ms));

  const nextTick = () => sleep(0);

  // ============ Incremark 配置（响应式） ============
  const incremarkOptions = $derived<UseIncremarkOptions>({
    gfm: true,
    math: mathTexEnabled ? { tex: true } : true,
    htmlTree: htmlEnabled,
    containers: true,
    astBuilder: engineType === 'micromark' ? MicromarkAstBuilder : undefined,
    typewriter: {
      enabled: typewriterEnabled,
      charsPerTick: typewriterRandomStep
        ? [1, Math.max(2, typewriterSpeed)] as [number, number]
        : typewriterSpeed,
      tickInterval: typewriterInterval,
      effect: typewriterEffect,
      cursor: '|'
    }
  })

  // ============ 解析器配置变化时重置内容 ============
  // 当引擎或 math 配置变化时，重置 demo 的本地状态
  let isFirstRender = true
  $effect(() => {
    // 订阅配置变化
    engineType
    mathTexEnabled
    if (isFirstRender) {
      isFirstRender = false
      return
    }
    reset()
  })

  // ============ 流式输出 ============
  let isStreaming = $state(false)

  async function simulateStream() {
    mdContent = ''
    isFinished = false
    isStreaming = true

    await nextTick();

    const content = customInputMode && customMarkdown.trim()
      ? customMarkdown
      : sampleMarkdown
    const chunks = content.match(/[\s\S]{1,20}/g) || []

    // 性能监测
    const updateTimes: number[] = []
    console.log(`[Perf] Starting stream with ${chunks.length} chunks`)

    for (const chunk of chunks) {
      const start = performance.now()
      mdContent += chunk
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

    isFinished = true
    isStreaming = false
  }

  function renderOnce() {
    const content = customInputMode && customMarkdown.trim()
      ? customMarkdown
      : sampleMarkdown
    mdContent = content
    isFinished = true
  }

  function reset() {
    mdContent = ''
    isFinished = false
  }

  // ============ 自动滚动 ============
  let autoScrollEnabled = $state(true)

  // ============ 自定义输入 ============
  let customInputMode = $state(false)
  let customMarkdown = $state('')

  // ============ Benchmark ============
  let benchmarkMode = $state(false)
  let benchmarkRunning = $state(false)
  let benchmarkProgress = $state(0)
  let benchmarkStats = $state<BenchmarkStats>({
    traditional: { time: 0, parseCount: 0, totalChars: 0 },
    incremark: { time: 0, parseCount: 0, totalChars: 0 }
  })

  async function handleRunBenchmark() {
    const content = customInputMode && customMarkdown.trim()
      ? customMarkdown
      : sampleMarkdown

    benchmarkRunning = true
    benchmarkProgress = 0

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
      mdContent = accumulated
      traditionalTime += performance.now() - start
      traditionalParseCount++
      traditionalTotalChars += accumulated.length
      benchmarkProgress = ((i + 1) / chunks.length) * 50
      await new Promise(r => setTimeout(r, 5))
    }

    // 2. 测试增量方式
    mdContent = ''
    isFinished = false
    let incremarkTime = 0
    let incremarkParseCount = 0
    let incremarkTotalChars = 0

    for (let i = 0; i < chunks.length; i++) {
      const start = performance.now()
      mdContent += chunks[i]
      incremarkTime += performance.now() - start
      incremarkParseCount++
      incremarkTotalChars += chunks[i].length
      benchmarkProgress = 50 + ((i + 1) / chunks.length) * 50
      await new Promise(r => setTimeout(r, 5))
    }

    isFinished = true

    benchmarkStats = {
      traditional: { time: traditionalTime, parseCount: traditionalParseCount, totalChars: traditionalTotalChars },
      incremark: { time: incremarkTime, parseCount: incremarkParseCount, totalChars: incremarkTotalChars }
    }

    benchmarkRunning = false
  }

  // ============ 自定义组件 ============
  let useCustomComponents = $state(false)
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
  let themeMode = $state<'default' | 'dark' | 'custom'>('default')

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

  // 计算当前主题
  const currentTheme = $derived.by<'default' | 'dark' | DesignTokens | Partial<DesignTokens>>(() => {
    switch (themeMode) {
      case 'dark':
        return 'dark'
      case 'custom':
        return customThemeOverride
      default:
        return 'default'
    }
  })

  // 计算是否禁用按钮
  const isDisabled = $derived(isStreaming || benchmarkRunning)
</script>

<div class="demo-content">
  <div class="controls">
    <button onclick={simulateStream} disabled={isDisabled}>
      {isStreaming ? t.streaming : t.simulateAI}
    </button>
    <button onclick={renderOnce} disabled={isDisabled}>{t.renderOnce}</button>
    <button onclick={reset} disabled={isDisabled}>{t.reset}</button>

    <label class="checkbox">
      <input type="checkbox" bind:checked={useCustomComponents} />
      {t.customComponents}
    </label>
    <label class="checkbox benchmark-toggle">
      <input type="checkbox" bind:checked={benchmarkMode} />
      {t.benchmarkMode}
    </label>
    <label class="checkbox">
      <input type="checkbox" bind:checked={customInputMode} />
      {t.customInput}
    </label>
    <label class="checkbox typewriter-toggle">
      <input type="checkbox" bind:checked={typewriterEnabled} />
      {t.typewriterMode}
    </label>
    <label class="checkbox auto-scroll-toggle">
      <input type="checkbox" bind:checked={autoScrollEnabled} />
      {t.autoScroll}
    </label>
    <label class="checkbox tex-toggle" title={t.texTooltip}>
      <input type="checkbox" bind:checked={mathTexEnabled} />
      {t.mathTex}
    </label>

    <select bind:value={engineType} class="engine-select" title={t.engineTooltip}>
      <option value="marked">{t.engineMarked}</option>
      <option value="micromark">{t.engineMicromark}</option>
    </select>

    <select bind:value={themeMode} class="theme-select">
      <option value="default">Light Theme</option>
      <option value="dark">Dark Theme</option>
      <option value="custom">Custom Theme</option>
    </select>

    {#if typewriterEnabled}
      <label class="speed-control">
        <input
          type="range"
          bind:value={typewriterSpeed}
          min="1"
          max="10"
          step="1"
        />
        <span class="speed-value">{typewriterSpeed} {t.charsPerTick}</span>
      </label>
      <label class="speed-control">
        <input
          type="range"
          bind:value={typewriterInterval}
          min="10"
          max="200"
          step="10"
        />
        <span class="speed-value">{typewriterInterval} {t.intervalMs}</span>
      </label>
      <label class="checkbox random-step-toggle">
        <input type="checkbox" bind:checked={typewriterRandomStep} />
        {t.randomStep}
      </label>
      <select bind:value={typewriterEffect} class="effect-select">
        <option value="none">{t.effectNone}</option>
        <option value="fade-in">{t.effectFadeIn}</option>
        <option value="typing">{t.effectTyping}</option>
      </select>
    {/if}

    <span class="stats">
      {mdContent.length} {t.chars}
    </span>
  </div>

  {#if benchmarkMode}
    <BenchmarkPanel
      stats={benchmarkStats}
      running={benchmarkRunning}
      progress={benchmarkProgress}
      {t}
      onRun={handleRunBenchmark}
    />
  {/if}

  {#if customInputMode}
    <CustomInputPanel
      bind:value={customMarkdown}
      {t}
      onUseExample={() => customMarkdown = sampleMarkdown}
    />
  {/if}

  <main class="content" class:effect-none={typewriterEnabled && typewriterEffect === 'none'} class:effect-fade-in={typewriterEnabled && typewriterEffect === 'fade-in'} class:effect-typing={typewriterEnabled && typewriterEffect === 'typing'}>
    <ConfigProvider {locale}>
      <ThemeProvider theme={currentTheme}>
        <AutoScrollContainer
          enabled={autoScrollEnabled}
          class="scroll-container"
        >
          <IncremarkContent
            content={mdContent}
            isFinished={isFinished}
            incremarkOptions={incremarkOptions}
            components={useCustomComponents ? customComponents : {}}
            {customContainers}
            {customCodeBlocks}
            {codeBlockConfigs}
            showBlockStatus={true}
            devtools={devtools ?? undefined}
          />
        </AutoScrollContainer>
      </ThemeProvider>
    </ConfigProvider>
  </main>
</div>
