import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import {
  IncremarkContent,
  AutoScrollContainer,
  ThemeProvider,
  ConfigProvider,
  type AutoScrollContainerRef,
  type DesignTokens,
  type UseIncremarkOptions,
  type IncremarkLocale
} from '@incremark/react'
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

interface BenchmarkStats {
  traditional: { time: number; parseCount: number; totalChars: number }
  incremark: { time: number; parseCount: number; totalChars: number }
}

interface IncremarkDemoProps {
  htmlEnabled: boolean
  sampleMarkdown: string
  t: Messages
  locale?: IncremarkLocale
}

export function IncremarkDemo({ htmlEnabled, sampleMarkdown, t, locale }: IncremarkDemoProps) {
  // ============ 打字机配置 ============
  const [typewriterEnabled, setTypewriterEnabled] = useState(false)
  const [typewriterSpeed, setTypewriterSpeed] = useState(2)
  const [typewriterInterval, setTypewriterInterval] = useState(30)
  const [typewriterRandomStep, setTypewriterRandomStep] = useState(true)
  const [typewriterEffect, setTypewriterEffect] = useState<'none' | 'fade-in' | 'typing'>('typing')

  // ============ 数学公式配置 ============
  const [mathTexEnabled, setMathTexEnabled] = useState(false)

  // ============ 引擎配置 ============
  const [engineType, setEngineType] = useState<'marked' | 'micromark'>('marked')

  // ============ 内容状态 ============
  const [mdContent, setMdContent] = useState('')
  const [isFinished, setIsFinished] = useState(false)

  // ============ Incremark 配置（响应式） ============
  const incremarkOptions = useMemo<UseIncremarkOptions>(() => ({
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
  }), [htmlEnabled, typewriterEnabled, typewriterSpeed, typewriterInterval, typewriterRandomStep, typewriterEffect, mathTexEnabled, engineType])

  // ============ 引擎切换时重置内容并重建组件 ============
  // 注意：只有 engineType 变化需要重建组件，math 等配置可以通过 updateOptions 动态更新
  const isFirstRenderRef = useRef(true)
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      return
    }
    // 引擎切换时重置内容
    setMdContent('')
    setIsFinished(false)
  }, [engineType])

  // ============ 状态 ============
  const [isStreaming, setIsStreaming] = useState(false)
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true)
  const scrollContainerRef = useRef<AutoScrollContainerRef>(null)
  const [customInputMode, setCustomInputMode] = useState(false)
  const [customMarkdown, setCustomMarkdown] = useState('')

  // ============ 自定义组件 ============
  const [useCustomComponents, setUseCustomComponents] = useState(false)
  const customComponents = useMemo(() => ({ heading: CustomHeading }), [])

  const currentMarkdown = useMemo(() =>
    customInputMode && customMarkdown.trim() ? customMarkdown : sampleMarkdown,
    [customInputMode, customMarkdown, sampleMarkdown]
  )

  // ============ 主题系统 ============
  const [themeMode, setThemeMode] = useState<'default' | 'dark' | 'custom'>('default')

  const customThemeOverride: Partial<DesignTokens> = useMemo(() => ({
    color: {
      brand: {
        primary: '#8b5cf6',
        primaryHover: '#7c3aed',
        primaryActive: '#6d28d9',
        primaryLight: '#a78bfa'
      }
    } as any
  }), [])

  const currentTheme = useMemo<'default' | 'dark' | DesignTokens | Partial<DesignTokens>>(() => {
    switch (themeMode) {
      case 'dark':
        return 'dark'
      case 'custom':
        return customThemeOverride
      default:
        return 'default'
    }
  }, [themeMode, customThemeOverride])

  // ============ Benchmark ============
  const [benchmarkMode, setBenchmarkMode] = useState(false)
  const [benchmarkRunning, setBenchmarkRunning] = useState(false)
  const [benchmarkProgress, setBenchmarkProgress] = useState(0)
  const [benchmarkStats, setBenchmarkStats] = useState<BenchmarkStats>({
    traditional: { time: 0, parseCount: 0, totalChars: 0 },
    incremark: { time: 0, parseCount: 0, totalChars: 0 }
  })

  const sleep = (ms: number = 0) => new Promise(resolve => setTimeout(resolve, ms));

  const nextTick = () => sleep(0);

  const handleRunBenchmark = useCallback(async () => {
    const content = currentMarkdown

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
  }, [currentMarkdown])

  // ============ 流式输出 ============
  const simulateStream = useCallback(async () => {
    setMdContent('')
    setIsFinished(false)
    setIsStreaming(true)

    await nextTick();

    const chunks = currentMarkdown.match(/[\s\S]{1,20}/g) || []

    for (const chunk of chunks) {
      setMdContent(prev => prev + chunk)
      await new Promise((r) => setTimeout(r, 30))
    }

    setIsFinished(true)
    setIsStreaming(false)
  }, [currentMarkdown])

  const renderOnce = useCallback(() => {
    setMdContent(currentMarkdown)
    setIsFinished(true)
  }, [currentMarkdown])

  const reset = useCallback(() => {
    setMdContent('')
    setIsFinished(false)
  }, [])

  // ============ 自定义容器 ============
  const customContainers = useMemo(() => ({
    warning: CustomWarningContainer,
    info: CustomInfoContainer,
    tip: CustomTipContainer,
  }), [])

  // ============ 自定义代码块 ============
  const customCodeBlocks = useMemo(() => ({
    echarts: CustomEchartCodeBlock,
  }), [])

  // ============ 代码块配置 ============
  const codeBlockConfigs = useMemo(() => ({
    echarts: {
      takeOver: true,
    }
  }), [])

  return (
    <div className="demo-content">
      <div className="controls">
        <button onClick={simulateStream} disabled={isStreaming || benchmarkRunning}>
          {isStreaming ? t.streaming : t.simulateAI}
        </button>
        <button onClick={renderOnce} disabled={isStreaming || benchmarkRunning}>{t.renderOnce}</button>
        <button onClick={reset} disabled={isStreaming || benchmarkRunning}>{t.reset}</button>

        <label className="checkbox">
          <input type="checkbox" checked={useCustomComponents} onChange={(e) => setUseCustomComponents(e.target.checked)} />
          {t.customComponents}
        </label>
        <label className="checkbox benchmark-toggle">
          <input type="checkbox" checked={benchmarkMode} onChange={(e) => setBenchmarkMode(e.target.checked)} />
          {t.benchmarkMode}
        </label>
        <label className="checkbox">
          <input type="checkbox" checked={customInputMode} onChange={(e) => setCustomInputMode(e.target.checked)} />
          {t.customInput}
        </label>
        <label className="checkbox typewriter-toggle">
          <input type="checkbox" checked={typewriterEnabled} onChange={(e) => setTypewriterEnabled(e.target.checked)} />
          {t.typewriterMode}
        </label>
        <label className="checkbox auto-scroll-toggle">
          <input type="checkbox" checked={autoScrollEnabled} onChange={(e) => setAutoScrollEnabled(e.target.checked)} />
          {t.autoScroll}
        </label>
        <label className="checkbox math-tex-toggle" title={t.texTooltip}>
          <input type="checkbox" checked={mathTexEnabled} onChange={(e) => setMathTexEnabled(e.target.checked)} />
          {t.mathTex}
        </label>

        <select value={engineType} onChange={(e) => setEngineType(e.target.value as 'marked' | 'micromark')} className="engine-select" title={t.engineTooltip}>
          <option value="marked">{t.engineMarked}</option>
          <option value="micromark">{t.engineMicromark}</option>
        </select>

        <select value={themeMode} onChange={(e) => setThemeMode(e.target.value as 'default' | 'dark' | 'custom')} className="theme-select">
          <option value="default">Light Theme</option>
          <option value="dark">Dark Theme</option>
          <option value="custom">Custom Theme</option>
        </select>

        {typewriterEnabled && (
          <>
            <label className="speed-control">
              <input type="range" value={typewriterSpeed} onChange={(e) => setTypewriterSpeed(Number(e.target.value))} min="1" max="10" step="1" />
              <span className="speed-value">{typewriterSpeed} {t.charsPerTick}</span>
            </label>
            <label className="speed-control">
              <input type="range" value={typewriterInterval} onChange={(e) => setTypewriterInterval(Number(e.target.value))} min="10" max="200" step="10" />
              <span className="speed-value">{typewriterInterval} {t.intervalMs}</span>
            </label>
            <label className="checkbox random-step-toggle">
              <input type="checkbox" checked={typewriterRandomStep} onChange={(e) => setTypewriterRandomStep(e.target.checked)} />
              {t.randomStep}
            </label>
            <select value={typewriterEffect} onChange={(e) => setTypewriterEffect(e.target.value as 'none' | 'fade-in' | 'typing')} className="effect-select">
              <option value="none">{t.effectNone}</option>
              <option value="fade-in">{t.effectFadeIn}</option>
              <option value="typing">{t.effectTyping}</option>
            </select>
          </>
        )}

        <span className="stats">
          {mdContent.length} {t.chars}
        </span>
      </div>

      {benchmarkMode && (
        <BenchmarkPanel
          stats={benchmarkStats}
          running={benchmarkRunning}
          progress={benchmarkProgress}
          t={t}
          onRun={handleRunBenchmark}
        />
      )}

      {customInputMode && (
        <CustomInputPanel
          value={customMarkdown}
          onChange={setCustomMarkdown}
          onUseExample={() => setCustomMarkdown(sampleMarkdown)}
          t={t}
        />
      )}

      <main className={typewriterEnabled ? `content effect-${typewriterEffect}` : 'content'}>
        <ConfigProvider locale={locale}>
          <ThemeProvider theme={currentTheme}>
            <AutoScrollContainer ref={scrollContainerRef} enabled={autoScrollEnabled} className="scroll-container">
              <IncremarkContent
                content={mdContent}
                isFinished={isFinished}
                incremarkOptions={incremarkOptions}
                components={useCustomComponents ? customComponents : {}}
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
