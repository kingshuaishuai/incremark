<!--
  @file IncremarkDemo.svelte - Incremark 演示组件
  @description 主要的演示组件，包含所有功能
-->

<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  // @ts-ignore
  import { math } from 'micromark-extension-math'
  // @ts-ignore
  import { mathFromMarkdown } from 'mdast-util-math'
  import { 
    useIncremark, 
    useDevTools, 
    Incremark, 
    AutoScrollContainer, 
    ThemeProvider,
    type DesignTokens 
  } from '@incremark/svelte'
  import { useBenchmark } from '../composables'
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
  }

  let {
    htmlEnabled,
    sampleMarkdown,
    t
  }: Props = $props()

  // ============ 打字机配置 ============
  let typewriterSpeed = $state(2)
  let typewriterInterval = $state(30)
  let typewriterRandomStep = $state(true)
  let typewriterEffect = $state<'none' | 'fade-in' | 'typing'>('typing')

  // ============ 初始化 Incremark（集成打字机） ============
  // useIncremark 只在初始化时使用配置，不会响应式更新
  // 对于需要响应式更新的部分（如 typewriter 配置），通过 typewriter.setOptions 来更新
  // 注意：htmlEnabled 的变化会通过 App.svelte 的 key 来重新创建组件，所以这里使用初始值是预期的
  // 使用常量来避免响应式变量捕获警告
  const INITIAL_TYPEWRITER_SPEED = 2
  const INITIAL_TYPEWRITER_INTERVAL = 30
  const INITIAL_TYPEWRITER_EFFECT: 'none' | 'fade-in' | 'typing' = 'typing'
  
  // 使用 IIFE 来获取 htmlEnabled 的初始值，避免警告
  const incremark = (() => {
    const initialHtmlEnabled = htmlEnabled
    return useIncremark({
      gfm: true,
      containers: true,
      htmlTree: initialHtmlEnabled,
      extensions: [math()],
      mdastExtensions: [mathFromMarkdown()],
      typewriter: {
        enabled: false,
        charsPerTick: [1, Math.max(2, INITIAL_TYPEWRITER_SPEED)] as [number, number],
        tickInterval: INITIAL_TYPEWRITER_INTERVAL,
        effect: INITIAL_TYPEWRITER_EFFECT,
        cursor: '|'
      }
    })
  })()

  const { markdown, completedBlocks, pendingBlocks, append, finalize, reset, render, typewriter } = incremark

  useDevTools(incremark)

  // 提取 typewriter stores 为响应式变量
  let typewriterEnabled = $state(false)
  let typewriterIsProcessing = $state(false)
  let typewriterIsPaused = $state(false)

  // 使用 onMount 和 onDestroy 来管理订阅
  let unsubscribeEnabled: (() => void) | null = null
  let unsubscribeProcessing: (() => void) | null = null
  let unsubscribePaused: (() => void) | null = null

  onMount(() => {
    unsubscribeEnabled = typewriter.enabled.subscribe(v => { typewriterEnabled = v })
    unsubscribeProcessing = typewriter.isProcessing.subscribe(v => { typewriterIsProcessing = v })
    unsubscribePaused = typewriter.isPaused.subscribe(v => { typewriterIsPaused = v })
  })

  onDestroy(() => {
    unsubscribeEnabled?.()
    unsubscribeProcessing?.()
    unsubscribePaused?.()
  })

  // 监听打字机配置变化
  $effect(() => {
    typewriter.setOptions({
      charsPerTick: typewriterRandomStep
        ? [1, Math.max(2, typewriterSpeed)] as [number, number]
        : typewriterSpeed,
      tickInterval: typewriterInterval,
      effect: typewriterEffect
    })
  })

  // ============ 流式输出 ============
  let isStreaming = $state(false)

  async function simulateStream() {
    reset()
    isStreaming = true

    const content = customInputMode && customMarkdown.trim() 
      ? customMarkdown 
      : sampleMarkdown
    const chunks = content.match(/[\s\S]{1,20}/g) || []

    for (const chunk of chunks) {
      append(chunk)
      await new Promise((resolve) => setTimeout(resolve, 30))
    }

    finalize()
    isStreaming = false
  }

  function renderOnce() {
    const content = customInputMode && customMarkdown.trim() 
      ? customMarkdown 
      : sampleMarkdown
    render(content)
  }

  // ============ 自动滚动 ============
  let autoScrollEnabled = $state(true)
  let scrollContainerRef: ReturnType<typeof AutoScrollContainer> | undefined = $state();

  // ============ 自定义输入 ============
  let customInputMode = $state(false)
  let customMarkdown = $state('')

  // ============ Benchmark ============
  const { benchmarkMode, benchmarkRunning, benchmarkProgress, benchmarkStats, runBenchmark } = 
    useBenchmark(append, finalize, reset)

  function handleRunBenchmark() {
    const content = customInputMode && customMarkdown.trim() 
      ? customMarkdown 
      : sampleMarkdown
    runBenchmark(content)
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

  // ============ 主题系统 ============
  let themeMode = $state<'default' | 'dark' | 'custom'>('default')

  // 自定义主题示例 - 紫色主题（部分覆盖）
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
  const isDisabled = $derived(isStreaming || $benchmarkRunning)
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
      <input type="checkbox" bind:checked={$benchmarkMode} />
      {t.benchmarkMode}
    </label>
    <label class="checkbox">
      <input type="checkbox" bind:checked={customInputMode} />
      {t.customInput}
    </label>
    <label class="checkbox typewriter-toggle">
      <input 
        type="checkbox" 
        checked={typewriterEnabled} 
        onchange={() => typewriter.setEnabled(!typewriterEnabled)} 
      />
      {t.typewriterMode}
    </label>
    <label class="checkbox auto-scroll-toggle">
      <input type="checkbox" bind:checked={autoScrollEnabled} />
      {t.autoScroll}
    </label>

    <select bind:value={themeMode} class="theme-select">
      <option value="default">🌞 Light Theme</option>
      <option value="dark">🌙 Dark Theme</option>
      <option value="custom">💜 Custom Theme</option>
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
      {#if typewriterIsProcessing && !typewriterIsPaused}
        <button class="pause-btn" onclick={() => typewriter.pause()}>
          ⏸️ {t.pause}
        </button>
      {/if}
      {#if typewriterIsPaused}
        <button class="resume-btn" onclick={() => typewriter.resume()}>
          ▶️ {t.resume}
        </button>
      {/if}
      {#if typewriterIsProcessing}
        <button class="skip-btn" onclick={() => typewriter.skip()}>
          ⏭️ {t.skip}
        </button>
      {/if}
    {/if}
    
    <span class="stats">
      📝 {$markdown.length} {t.chars} |
      ✅ {$completedBlocks.length} {t.blocks} |
      ⏳ {$pendingBlocks.length} {t.pending}
      {#if typewriterEnabled && typewriterIsProcessing}
        | ⌨️ {typewriterIsPaused ? t.paused : t.typing}
      {/if}
    </span>
  </div>

  {#if $benchmarkMode}
    <BenchmarkPanel
      stats={$benchmarkStats}
      running={$benchmarkRunning}
      progress={$benchmarkProgress}
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
    <ThemeProvider theme={currentTheme}>
      <AutoScrollContainer 
        bind:this={scrollContainerRef} 
        enabled={autoScrollEnabled} 
        class="scroll-container"
      >
        <Incremark
          {incremark}
          components={useCustomComponents ? customComponents : {}}
          {customContainers}
          {customCodeBlocks}
          showBlockStatus={true}
        />
      </AutoScrollContainer>
    </ThemeProvider>
  </main>
</div>

