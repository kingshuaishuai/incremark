import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useIncremark, useDevTools, useBlockTransformer, Incremark, defaultPlugins, AutoScrollContainer, type AutoScrollContainerRef } from '@incremark/react'
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
    typewriterMode: '⌨️ 打字机',
    skip: '跳过',
    pause: '暂停',
    resume: '继续',
    typing: '输入中...',
    paused: '已暂停',
    charsPerTick: '字符/tick',
    intervalMs: 'ms/tick',
    randomStep: '随机步长',
    effectNone: '无动画',
    effectFadeIn: '渐入',
    effectTyping: '光标',
    autoScroll: '📜 自动滚动',
    scrollPaused: '已暂停',
    sampleMarkdown: `# 🚀 Incremark React 示例

欢迎使用 **Incremark**！这是一个专为 AI 流式输出设计的增量 Markdown 解析器。

## 📋 功能特点

- **增量解析**：只解析新增内容，节省 90% 以上的 CPU 开销
- **打字机效果**：逐字符显示，模拟真实打字体验
- **React 集成**：简洁的 Hooks API
- **GFM 支持**：表格、任务列表、删除线等

## ⌨️ 打字机效果

BlockTransformer 提供了打字机效果的支持：

- **逐字符显示**：控制每次显示的字符数
- **速度可调**：调节 tick 间隔实现不同速度
- **跳过功能**：随时跳过动画显示全部内容
- **插件系统**：代码块、图片等可整体显示

## 💻 代码示例

\`\`\`typescript
import { useIncremark, useBlockTransformer, Incremark } from '@incremark/react'

function App() {
  const { completedBlocks, append, finalize } = useIncremark()
  
  // 转换为 SourceBlock 格式
  const sourceBlocks = completedBlocks.map(block => ({
    id: block.id,
    node: block.node,
    status: block.status
  }))
  
  // 添加打字机效果
  const { displayBlocks, isProcessing, skip } = useBlockTransformer(sourceBlocks, {
    charsPerTick: 2,
    tickInterval: 50
  })
  
  return (
    <div>
      <Incremark blocks={displayBlocks} />
      {isProcessing && <button onClick={skip}>跳过</button>}
    </div>
  )
}
\`\`\`

## 📊 性能对比

| 指标 | 传统方式 | Incremark | 提升 |
|------|----------|-----------|------|
| 解析量 | ~50万字符 | ~5万字符 | 90% ↓ |
| CPU 占用 | 高 | 低 | 80% ↓ |
| 渲染帧率 | 卡顿 | 流畅 | ✅ |

## 📝 任务清单

- [x] 核心解析器
- [x] Vue 3 集成
- [x] React 集成
- [x] 打字机效果
- [ ] 更多扩展

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
    typewriterMode: '⌨️ Typewriter',
    skip: 'Skip',
    pause: 'Pause',
    resume: 'Resume',
    typing: 'Typing...',
    paused: 'Paused',
    charsPerTick: 'chars/tick',
    intervalMs: 'ms/tick',
    randomStep: 'Random Step',
    effectNone: 'None',
    effectFadeIn: 'Fade In',
    effectTyping: 'Cursor',
    autoScroll: '📜 Auto Scroll',
    scrollPaused: 'Paused',
    sampleMarkdown: `# 🚀 Incremark React Example

Welcome to **Incremark**! An incremental Markdown parser designed for AI streaming output.

## 📋 Features

- **Incremental Parsing**: Only parse new content, saving 90%+ CPU overhead
- **Typewriter Effect**: Character-by-character display for realistic typing experience
- **React Integration**: Clean Hooks API
- **GFM Support**: Tables, task lists, strikethrough, etc.

## ⌨️ Typewriter Effect

BlockTransformer provides typewriter effect support:

- **Character-by-character display**: Control chars displayed per tick
- **Adjustable speed**: Change tick interval for different speeds
- **Skip function**: Skip animation to show all content immediately
- **Plugin system**: Code blocks, images can display as a whole

## 💻 Code Example

\`\`\`typescript
import { useIncremark, useBlockTransformer, Incremark } from '@incremark/react'

function App() {
  const { completedBlocks, append, finalize } = useIncremark()
  
  // Convert to SourceBlock format
  const sourceBlocks = completedBlocks.map(block => ({
    id: block.id,
    node: block.node,
    status: block.status
  }))
  
  // Add typewriter effect
  const { displayBlocks, isProcessing, skip } = useBlockTransformer(sourceBlocks, {
    charsPerTick: 2,
    tickInterval: 50
  })
  
  return (
    <div>
      <Incremark blocks={displayBlocks} />
      {isProcessing && <button onClick={skip}>Skip</button>}
    </div>
  )
}
\`\`\`

## 📊 Performance Comparison

| Metric | Traditional | Incremark | Improvement |
|--------|-------------|-----------|-------------|
| Parse Volume | ~500K chars | ~50K chars | 90% ↓ |
| CPU Usage | High | Low | 80% ↓ |
| Frame Rate | Laggy | Smooth | ✅ |

## 📝 Task List

- [x] Core Parser
- [x] Vue 3 Integration
- [x] React Integration
- [x] Typewriter Effect
- [ ] More Extensions

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
  const { markdown, blocks, completedBlocks, pendingBlocks, append, finalize, reset: resetParser, render } = incremark

  // 挂载 DevTools
  useDevTools(incremark)

  // ============ 打字机效果（BlockTransformer） ============
  const [typewriterMode, setTypewriterMode] = useState(false)
  const [typewriterSpeed, setTypewriterSpeed] = useState(2)
  const [typewriterInterval, setTypewriterInterval] = useState(30)
  const [typewriterRandomStep, setTypewriterRandomStep] = useState(true)
  const [typewriterEffect, setTypewriterEffect] = useState<'none' | 'fade-in' | 'typing'>('typing')
  const [typewriterCursor, setTypewriterCursor] = useState('|')

  // 转换为 SourceBlock 格式
  const sourceBlocks = useMemo(() => {
    return completedBlocks.map(block => ({
      id: block.id,
      node: block.node,
      status: block.status as 'pending' | 'stable' | 'completed'
    }))
  }, [completedBlocks])

  // 计算 charsPerTick
  const computedCharsPerTick = useMemo(() => {
    if (typewriterRandomStep) {
      return [1, Math.max(2, typewriterSpeed)] as [number, number]
    }
    return typewriterSpeed
  }, [typewriterRandomStep, typewriterSpeed])

  // 使用 BlockTransformer
  const {
    displayBlocks,
    isProcessing,
    isPaused: isTypewriterPaused,
    effect: currentEffect,
    skip: skipTypewriter,
    pause: pauseTypewriter,
    resume: resumeTypewriter,
    reset: resetTransformer,
    setOptions: setTransformerOptions
  } = useBlockTransformer(sourceBlocks, {
    charsPerTick: computedCharsPerTick,
    tickInterval: typewriterInterval,
    effect: typewriterEffect,
    pauseOnHidden: true,
    plugins: defaultPlugins
  })

  // 监听速度/间隔/效果变化
  useEffect(() => {
    setTransformerOptions({ 
      charsPerTick: computedCharsPerTick, 
      tickInterval: typewriterInterval,
      effect: typewriterEffect
    })
  }, [computedCharsPerTick, typewriterInterval, typewriterEffect, setTransformerOptions])

  // 在 AST 节点末尾添加光标字符
  const addCursorToNode = useCallback((node: any, cursor: string = '|'): any => {
    const cloned = JSON.parse(JSON.stringify(node))
    
    function addToLast(n: any): boolean {
      if (n.children && n.children.length > 0) {
        for (let i = n.children.length - 1; i >= 0; i--) {
          if (addToLast(n.children[i])) {
            return true
          }
        }
        n.children.push({ type: 'text', value: cursor })
        return true
      }
      if (n.type === 'text' && typeof n.value === 'string') {
        n.value += cursor
        return true
      }
      if (typeof n.value === 'string') {
        n.value += cursor
        return true
      }
      return false
    }
    
    addToLast(cloned)
    return cloned
  }, [])


  // 根据模式选择要渲染的 blocks
  const renderBlocks = useMemo(() => {
    if (!typewriterMode) {
      return blocks
    }
    
    // 打字机模式：只使用 transformer 输出的 displayBlocks
    return displayBlocks.map((db, index) => {
      const isPending = !db.isDisplayComplete
      const isLastPending = isPending && index === displayBlocks.length - 1
      
      let node = db.displayNode
      
      // 光标效果：在最后一个 pending 块末尾添加光标字符
      if (typewriterEffect === 'typing' && isLastPending) {
        node = addCursorToNode(db.displayNode, typewriterCursor)
      }
      
      return {
        ...db,
        stableId: db.id,
        node,
        status: (db.isDisplayComplete ? 'completed' : 'pending') as 'pending' | 'stable' | 'completed',
        isLastPending, // 标记是否是最后一个 pending 块
        startOffset: 0,
        endOffset: 0,
        rawText: ''
      }
    })
  }, [typewriterMode, blocks, displayBlocks, typewriterEffect, typewriterCursor, addCursorToNode])

  // 统一的重置函数
  const reset = useCallback(() => {
    resetParser()
    resetTransformer()
  }, [resetParser, resetTransformer])

  const [isStreaming, setIsStreaming] = useState(false)
  const [benchmarkMode, setBenchmarkMode] = useState(false)
  
  // 自动滚动
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true)
  const scrollContainerRef = useRef<AutoScrollContainerRef>(null)
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

    const chunks = currentMarkdown.match(/[\s\S]{1,30}/g) || []

    for (const chunk of chunks) {
      append(chunk)
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
          <button className="secondary" onClick={reset} disabled={isStreaming || benchmarkRunning}>
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
          <label className="checkbox typewriter-toggle">
            <input 
              type="checkbox" 
              checked={typewriterMode} 
              onChange={(e) => setTypewriterMode(e.target.checked)} 
            />
            {t.typewriterMode}
          </label>
          <label className="checkbox auto-scroll-toggle">
            <input 
              type="checkbox" 
              checked={autoScrollEnabled} 
              onChange={(e) => setAutoScrollEnabled(e.target.checked)} 
            />
            {t.autoScroll}
            {scrollContainerRef.current?.isUserScrolledUp() && (
              <span className="scroll-paused-hint">({t.scrollPaused})</span>
            )}
          </label>
          {typewriterMode && (
            <>
              <label className="speed-control">
                <input 
                  type="range" 
                  value={typewriterSpeed} 
                  onChange={(e) => setTypewriterSpeed(Number(e.target.value))}
                  min="1" 
                  max="10" 
                  step="1"
                />
                <span className="speed-value">{typewriterSpeed} {t.charsPerTick}</span>
              </label>
              <label className="speed-control">
                <input 
                  type="range" 
                  value={typewriterInterval} 
                  onChange={(e) => setTypewriterInterval(Number(e.target.value))}
                  min="10" 
                  max="200" 
                  step="10"
                />
                <span className="speed-value">{typewriterInterval} {t.intervalMs}</span>
              </label>
              <label className="checkbox random-step-toggle">
                <input 
                  type="checkbox" 
                  checked={typewriterRandomStep} 
                  onChange={(e) => setTypewriterRandomStep(e.target.checked)}
                />
                {t.randomStep}
              </label>
              <select 
                value={typewriterEffect} 
                onChange={(e) => setTypewriterEffect(e.target.value as 'none' | 'fade-in' | 'typing')}
                className="effect-select"
              >
                <option value="none">{t.effectNone}</option>
                <option value="fade-in">{t.effectFadeIn}</option>
                <option value="typing">{t.effectTyping}</option>
              </select>
              {isProcessing && !isTypewriterPaused && (
                <button className="pause-btn" onClick={pauseTypewriter}>
                  ⏸️ {t.pause}
                </button>
              )}
              {isTypewriterPaused && (
                <button className="resume-btn" onClick={resumeTypewriter}>
                  ▶️ {t.resume}
                </button>
              )}
              {isProcessing && (
                <button className="skip-btn" onClick={skipTypewriter}>
                  ⏭️ {t.skip}
                </button>
              )}
            </>
          )}
        </div>
        <div className="stats">
          📝 {markdown.length} {t.chars} |
          ✅ {completedBlocks.length} {t.blocks} |
          ⏳ {pendingBlocks.length} {t.pending}
          {typewriterMode && isProcessing && ` | ⌨️ ${isTypewriterPaused ? t.paused : t.typing}`}
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

      <main className={`content ${typewriterMode ? `effect-${typewriterEffect}` : ''}`}>
        <AutoScrollContainer 
          ref={scrollContainerRef} 
          enabled={autoScrollEnabled}
          className="scroll-container"
        >
          <Incremark blocks={renderBlocks} showBlockStatus={true} />
        </AutoScrollContainer>
      </main>
    </div>
  )
}

export default App
