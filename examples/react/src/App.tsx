import { useState, useCallback, useMemo } from 'react'
import { useIncremark, useDevTools, Incremark } from '@incremark/react'
import { createIncremarkParser } from '@incremark/core'

type Locale = 'zh' | 'en'

const i18n = {
  zh: {
    title: '🚀 Incremark React 示例',
    simulateAI: '模拟 AI 输出',
    streaming: '正在输出...',
    renderOnce: '一次性渲染',
    reset: '重置',
    chars: '字符',
    blocks: '块',
    pending: '待定',
    benchmark: '性能对比',
    benchmarkMode: '对比模式',
    runBenchmark: '运行对比测试',
    running: '测试中...',
    traditional: '传统方式',
    incremark: 'Incremark',
    totalTime: '总耗时',
    totalChars: '总解析量',
    speedup: '加速比',
    benchmarkNote: '传统方式每次收到新内容都重新解析全部文本，Incremark 只解析新增部分。',
    customInput: '自定义输入',
    inputPlaceholder: '在这里输入你的 Markdown 内容...',
    useExample: '使用示例',
    sampleMarkdown: `# 🚀 Incremark React 示例

欢迎使用 **Incremark**！这是一个专为 AI 流式输出设计的增量 Markdown 解析器。

## 📋 功能特点

- **增量解析**：只解析新增内容，节省 90% 以上的 CPU 开销
- **React 集成**：简洁的 Hooks API
- **GFM 支持**：表格、任务列表、删除线等

## 💻 代码示例

\`\`\`typescript
import { useIncremark, Incremark } from '@incremark/react'

function App() {
  const { blocks, append, finalize } = useIncremark()
  
  return <Incremark blocks={blocks} />
}
\`\`\`

## 📊 性能对比

| 指标 | 传统方式 | Incremark | 提升 |
|------|----------|-----------|------|
| 解析量 | ~50万字符 | ~5万字符 | 90% ↓ |
| CPU 占用 | 高 | 低 | 80% ↓ |
| 渲染帧率 | 卡顿 | 流畅 | ✅ |

## 📝 引用示例

> 💡 **提示**：Incremark 的核心优势是 **解析层增量化**，而非仅仅是渲染层优化。

**感谢使用 Incremark！** 🙏`
  },
  en: {
    title: '🚀 Incremark React Example',
    simulateAI: 'Simulate AI Output',
    streaming: 'Streaming...',
    renderOnce: 'Render Once',
    reset: 'Reset',
    chars: 'chars',
    blocks: 'blocks',
    pending: 'pending',
    benchmark: 'Benchmark',
    benchmarkMode: 'Comparison Mode',
    runBenchmark: 'Run Benchmark',
    running: 'Running...',
    traditional: 'Traditional',
    incremark: 'Incremark',
    totalTime: 'Total Time',
    totalChars: 'Total Parsed',
    speedup: 'Speedup',
    benchmarkNote: 'Traditional parsers re-parse all content on each new chunk. Incremark only parses new content.',
    customInput: 'Custom Input',
    inputPlaceholder: 'Enter your Markdown content here...',
    useExample: 'Use Example',
    sampleMarkdown: `# 🚀 Incremark React Example

Welcome to **Incremark**! An incremental Markdown parser designed for AI streaming output.

## 📋 Features

- **Incremental Parsing**: Only parse new content, saving 90%+ CPU overhead
- **React Integration**: Clean Hooks API
- **GFM Support**: Tables, task lists, strikethrough, etc.

## 💻 Code Example

\`\`\`typescript
import { useIncremark, Incremark } from '@incremark/react'

function App() {
  const { blocks, append, finalize } = useIncremark()
  
  return <Incremark blocks={blocks} />
}
\`\`\`

## 📊 Performance Comparison

| Metric | Traditional | Incremark | Improvement |
|--------|-------------|-----------|-------------|
| Parse Volume | ~500K chars | ~50K chars | 90% ↓ |
| CPU Usage | High | Low | 80% ↓ |
| Frame Rate | Laggy | Smooth | ✅ |

## 📝 Quote Example

> 💡 **Tip**: Incremark's core advantage is **parsing-level incrementalization**, not just render-level optimization.

**Thanks for using Incremark!** 🙏`
  }
}

function App() {
  const [locale, setLocale] = useState<Locale>(() => {
    return (localStorage.getItem('locale') as Locale) || 'zh'
  })

  const t = useMemo(() => i18n[locale], [locale])

  const toggleLocale = useCallback(() => {
    const newLocale = locale === 'zh' ? 'en' : 'zh'
    setLocale(newLocale)
    localStorage.setItem('locale', newLocale)
  }, [locale])

  const incremark = useIncremark({ gfm: true })
  const { markdown, blocks, completedBlocks, pendingBlocks, append, finalize, reset, render } = incremark

  // 挂载 DevTools
  useDevTools(incremark)

  const [isStreaming, setIsStreaming] = useState(false)
  const [benchmarkMode, setBenchmarkMode] = useState(false)
  const [customInputMode, setCustomInputMode] = useState(false)
  const [customMarkdown, setCustomMarkdown] = useState('')

  // 获取要使用的 Markdown 内容
  const currentMarkdown = useMemo(() => 
    customInputMode && customMarkdown.trim() ? customMarkdown : t.sampleMarkdown,
    [customInputMode, customMarkdown, t.sampleMarkdown]
  )
  const [benchmarkRunning, setBenchmarkRunning] = useState(false)
  const [benchmarkProgress, setBenchmarkProgress] = useState(0)
  const [benchmarkStats, setBenchmarkStats] = useState({
    traditional: { time: 0, parseCount: 0, totalChars: 0 },
    incremark: { time: 0, parseCount: 0, totalChars: 0 }
  })

  // Benchmark 对比测试
  const runBenchmarkComparison = useCallback(async () => {
    reset()
    setBenchmarkRunning(true)
    setBenchmarkProgress(0)
    
    const content = currentMarkdown
    const chunks = content.match(/[\s\S]{1,20}/g) || []
    
    // 1. 测试传统方式：每次都从头解析全部内容
    let traditionalTime = 0
    let traditionalParseCount = 0
    let traditionalTotalChars = 0
    let accumulated = ''
    
    for (let i = 0; i < chunks.length; i++) {
      accumulated += chunks[i]
      const start = performance.now()
      // 传统方式：每次都创建新 parser 并解析全部累积内容
      const traditionalParser = createIncremarkParser({ gfm: true })
      traditionalParser.append(accumulated)
      traditionalParser.finalize()
      traditionalParser.getCompletedBlocks()
      traditionalTime += performance.now() - start
      traditionalParseCount++
      traditionalTotalChars += accumulated.length
      setBenchmarkProgress(((i + 1) / chunks.length) * 50)
      await new Promise(r => setTimeout(r, 5))
    }
    
    // 2. 测试 Incremark 增量方式
    reset()
    let incremarkTime = 0
    let incremarkParseCount = 0
    let incremarkTotalChars = 0
    
    for (let i = 0; i < chunks.length; i++) {
      const start = performance.now()
      append(chunks[i])
      incremarkTime += performance.now() - start
      incremarkParseCount++
      incremarkTotalChars += chunks[i].length
      setBenchmarkProgress(50 + ((i + 1) / chunks.length) * 50)
      await new Promise(r => setTimeout(r, 5))
    }
    finalize()
    
    setBenchmarkStats({
      traditional: { time: traditionalTime, parseCount: traditionalParseCount, totalChars: traditionalTotalChars },
      incremark: { time: incremarkTime, parseCount: incremarkParseCount, totalChars: incremarkTotalChars }
    })
    
    setBenchmarkRunning(false)
    setBenchmarkProgress(100)
  }, [currentMarkdown, reset, append, finalize])

  // 模拟流式输入
  const simulateStream = useCallback(async () => {
    reset()
    setIsStreaming(true)

    // 将 Markdown 分成随机长度的 chunks
    const chunks = currentMarkdown.match(/[\s\S]{1,30}/g) || []

    for (const chunk of chunks) {
      append(chunk)
      // 模拟网络延迟
      await new Promise((r) => setTimeout(r, 30 + Math.random() * 50))
    }

    finalize()
    setIsStreaming(false)
  }, [append, finalize, reset, currentMarkdown])

  // 一次性渲染
  const renderAll = useCallback(() => {
    render(currentMarkdown)
  }, [render, currentMarkdown])

  return (
    <div className="app">
      <header className="header">
        <div className="header-top">
          <h1>{t.title}</h1>
          <button className="lang-toggle" onClick={toggleLocale}>
            {locale === 'zh' ? '🇺🇸 English' : '🇨🇳 中文'}
          </button>
        </div>
        <div className="controls">
          <button className="primary" onClick={simulateStream} disabled={isStreaming || benchmarkRunning}>
            {isStreaming ? t.streaming : t.simulateAI}
          </button>
          <button className="secondary" onClick={renderAll} disabled={isStreaming || benchmarkRunning}>
            {t.renderOnce}
          </button>
          <button className="secondary" onClick={() => reset()} disabled={isStreaming || benchmarkRunning}>
            {t.reset}
          </button>
          <label className="checkbox benchmark-toggle">
            <input 
              type="checkbox" 
              checked={benchmarkMode} 
              onChange={(e) => setBenchmarkMode(e.target.checked)} 
            />
            {t.benchmarkMode}
          </label>
          <label className="checkbox">
            <input 
              type="checkbox" 
              checked={customInputMode} 
              onChange={(e) => setCustomInputMode(e.target.checked)} 
            />
            {t.customInput}
          </label>
        </div>
        <div className="stats">
          📝 {markdown.length} {t.chars} | ✅ {completedBlocks.length} {t.blocks} | ⏳{' '}
          {pendingBlocks.length} {t.pending}
        </div>
      </header>

      {/* Benchmark Panel */}
      {benchmarkMode && (
        <div className="benchmark-panel">
          <div className="benchmark-header">
            <h2>⚡ {t.benchmark}</h2>
            <button 
              className="benchmark-btn"
              onClick={runBenchmarkComparison} 
              disabled={benchmarkRunning}
            >
              {benchmarkRunning ? t.running : t.runBenchmark}
            </button>
          </div>
          
          {benchmarkRunning && (
            <div className="benchmark-progress">
              <div className="progress-bar" style={{ width: `${benchmarkProgress}%` }}></div>
            </div>
          )}
          
          {benchmarkStats.traditional.time > 0 && (
            <div className="benchmark-results">
              <div className="benchmark-card traditional">
                <h3>🐢 {t.traditional}</h3>
                <div className="stat">
                  <span className="label">{t.totalTime}</span>
                  <span className="value">{benchmarkStats.traditional.time.toFixed(2)} ms</span>
                </div>
                <div className="stat">
                  <span className="label">{t.totalChars}</span>
                  <span className="value">{(benchmarkStats.traditional.totalChars / 1000).toFixed(1)}K</span>
                </div>
              </div>
              
              <div className="benchmark-card incremark">
                <h3>🚀 {t.incremark}</h3>
                <div className="stat">
                  <span className="label">{t.totalTime}</span>
                  <span className="value">{benchmarkStats.incremark.time.toFixed(2)} ms</span>
                </div>
                <div className="stat">
                  <span className="label">{t.totalChars}</span>
                  <span className="value">{(benchmarkStats.incremark.totalChars / 1000).toFixed(1)}K</span>
                </div>
              </div>
              
              <div className="benchmark-card speedup">
                <h3>📈 {t.speedup}</h3>
                <div className="speedup-value">
                  {(benchmarkStats.traditional.time / benchmarkStats.incremark.time).toFixed(1)}x
                </div>
              </div>
            </div>
          )}
          
          <p className="benchmark-note">💡 {t.benchmarkNote}</p>
        </div>
      )}

      {/* Custom Input Panel */}
      {customInputMode && (
        <div className="input-panel">
          <div className="input-header">
            <span>✏️ {t.customInput}</span>
            <button 
              className="use-example-btn" 
              onClick={() => setCustomMarkdown(t.sampleMarkdown)}
            >
              {t.useExample}
            </button>
          </div>
          <textarea 
            value={customMarkdown}
            onChange={(e) => setCustomMarkdown(e.target.value)}
            placeholder={t.inputPlaceholder}
            className="markdown-input"
            rows={8}
          />
        </div>
      )}

      <main className="content">
        <Incremark blocks={blocks} showBlockStatus={true} />
      </main>
    </div>
  )
}

export default App
