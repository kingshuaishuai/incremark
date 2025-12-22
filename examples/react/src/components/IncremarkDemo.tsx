import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import {
  useIncremark,
  useDevTools,
  Incremark,
  AutoScrollContainer,
  ThemeProvider,
  type AutoScrollContainerRef,
  type DesignTokens
} from '@incremark/react'

import { useBenchmark } from '../hooks'
import { BenchmarkPanel, CustomInputPanel } from './index'
import type { Messages } from '../locales'

interface IncremarkDemoProps {
  htmlEnabled: boolean
  sampleMarkdown: string
  t: Messages
}

export function IncremarkDemo({ htmlEnabled, sampleMarkdown, t }: IncremarkDemoProps) {
  // ============ 打字机配置 ============
  const [typewriterSpeed, setTypewriterSpeed] = useState(2)
  const [typewriterInterval, setTypewriterInterval] = useState(30)
  const [typewriterRandomStep, setTypewriterRandomStep] = useState(true)
  const [typewriterEffect, setTypewriterEffect] = useState<'none' | 'fade-in' | 'typing'>('typing')

  // 计算打字机配置
  const computedCharsPerTick = useMemo(() => {
    return typewriterRandomStep ? [1, Math.max(2, typewriterSpeed)] as [number, number] : typewriterSpeed
  }, [typewriterRandomStep, typewriterSpeed])

  // ============ Incremark（集成打字机） ============
  const incremark = useIncremark({ 
    gfm: true,
    htmlTree: htmlEnabled,
    typewriter: {
      enabled: false,
      charsPerTick: computedCharsPerTick,
      tickInterval: typewriterInterval,
      effect: typewriterEffect,
      cursor: '|'
    }
  })
  const { markdown, completedBlocks, pendingBlocks, append, finalize, reset, render, typewriter } = incremark

  useDevTools(incremark)

  // 监听打字机配置变化（副作用必须用 useEffect，避免 render 阶段触发更新导致卡顿/不生效）
  useEffect(() => {
    typewriter.setOptions({
      charsPerTick: computedCharsPerTick,
      tickInterval: typewriterInterval,
      effect: typewriterEffect
    })
  }, [computedCharsPerTick, typewriterInterval, typewriterEffect, typewriter])

  // ============ 状态 ============
  const [isStreaming, setIsStreaming] = useState(false)
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true)
  const scrollContainerRef = useRef<AutoScrollContainerRef>(null)
  const [customInputMode, setCustomInputMode] = useState(false)
  const [customMarkdown, setCustomMarkdown] = useState('')

  const currentMarkdown = useMemo(() =>
    customInputMode && customMarkdown.trim() ? customMarkdown : sampleMarkdown,
    [customInputMode, customMarkdown, sampleMarkdown]
  )

  // ============ 主题系统 ============
  const [themeMode, setThemeMode] = useState<'default' | 'dark' | 'custom'>('default')

  // 自定义主题示例 - 紫色主题（部分覆盖）
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

  // 计算当前主题
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
  const { 
    benchmarkMode, 
    setBenchmarkMode, 
    benchmarkRunning, 
    benchmarkProgress, 
    benchmarkStats, 
    runBenchmark 
  } = useBenchmark(append, finalize, reset)

  const handleRunBenchmark = useCallback(() => {
    runBenchmark(currentMarkdown)
  }, [runBenchmark, currentMarkdown])

  // ============ 流式输出 ============
  const simulateStream = useCallback(async () => {
    reset()
    setIsStreaming(true)

    const chunks = currentMarkdown.match(/[\s\S]{1,30}/g) || []

    for (const chunk of chunks) {
      append(chunk)
      await new Promise((r) => setTimeout(r, 30 + Math.random() * 50))
    }

    finalize()
    setIsStreaming(false)
  }, [append, finalize, reset, currentMarkdown])

  const renderAll = useCallback(() => {
    render(currentMarkdown)
  }, [render, currentMarkdown])

  return (
    <div className="demo-content">
      <div className="controls">
        <button className="primary" onClick={simulateStream} disabled={isStreaming || benchmarkRunning}>
          {isStreaming ? t.streaming : t.simulateAI}
        </button>
        <button className="secondary" onClick={renderAll} disabled={isStreaming || benchmarkRunning}>
          {t.renderOnce}
        </button>
        <button className="secondary" onClick={reset} disabled={isStreaming || benchmarkRunning}>
          {t.reset}
        </button>
        
        <label className="checkbox benchmark-toggle">
          <input type="checkbox" checked={benchmarkMode} onChange={(e) => setBenchmarkMode(e.target.checked)} />
          {t.benchmarkMode}
        </label>
        <label className="checkbox">
          <input type="checkbox" checked={customInputMode} onChange={(e) => setCustomInputMode(e.target.checked)} />
          {t.customInput}
        </label>
        <label className="checkbox typewriter-toggle">
          <input type="checkbox" checked={typewriter.enabled} onChange={(e) => typewriter.setEnabled(e.target.checked)} />
          {t.typewriterMode}
        </label>
        <label className="checkbox auto-scroll-toggle">
          <input type="checkbox" checked={autoScrollEnabled} onChange={(e) => setAutoScrollEnabled(e.target.checked)} />
          {t.autoScroll}
        </label>

        <select value={themeMode} onChange={(e) => setThemeMode(e.target.value as 'default' | 'dark' | 'custom')} className="theme-select">
          <option value="default">🌞 Light Theme</option>
          <option value="dark">🌙 Dark Theme</option>
          <option value="custom">💜 Custom Theme</option>
        </select>

        {typewriter.enabled && (
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
            {typewriter.isProcessing && !typewriter.isPaused && (
              <button className="pause-btn" onClick={typewriter.pause}>⏸️ {t.pause}</button>
            )}
            {typewriter.isPaused && (
              <button className="resume-btn" onClick={typewriter.resume}>▶️ {t.resume}</button>
            )}
            {typewriter.isProcessing && (
              <button className="skip-btn" onClick={typewriter.skip}>⏭️ {t.skip}</button>
            )}
          </>
        )}
      </div>

      <div className="stats">
        📝 {markdown.length} {t.chars} |
        ✅ {completedBlocks.length} {t.blocks} |
        ⏳ {pendingBlocks.length} {t.pending}
        {typewriter.enabled && typewriter.isProcessing && ` | ⌨️ ${typewriter.isPaused ? t.paused : t.typing}`}
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

      <main className={`content ${typewriter.enabled ? `effect-${typewriterEffect}` : ''}`}>
        <ThemeProvider theme={currentTheme}>
          <AutoScrollContainer ref={scrollContainerRef} enabled={autoScrollEnabled} className="scroll-container">
            <Incremark
              incremark={incremark}
              showBlockStatus={true}
            />
          </AutoScrollContainer>
        </ThemeProvider>
      </main>
    </div>
  )
}

