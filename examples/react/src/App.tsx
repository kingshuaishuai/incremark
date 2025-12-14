import { useState, useCallback } from 'react'
import { useIncremark, useDevTools, Incremark } from '@incremark/react'

const sampleMarkdown = `# 🚀 Incremark React 示例

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

**感谢使用 Incremark！** 🙏
`

function App() {
  const incremark = useIncremark({ gfm: true })
  const { markdown, blocks, completedBlocks, pendingBlocks, append, finalize, reset, isLoading } =
    incremark

  // 挂载 DevTools
  useDevTools(incremark)

  const [isStreaming, setIsStreaming] = useState(false)

  // 模拟流式输入
  const simulateStream = useCallback(async () => {
    reset()
    setIsStreaming(true)

    // 将 Markdown 分成随机长度的 chunks
    const chunks = sampleMarkdown.match(/[\s\S]{1,30}/g) || []

    for (const chunk of chunks) {
      append(chunk)
      // 模拟网络延迟
      await new Promise((r) => setTimeout(r, 30 + Math.random() * 50))
    }

    finalize()
    setIsStreaming(false)
  }, [append, finalize, reset])

  // 一次性渲染
  const renderAll = useCallback(() => {
    reset()
    append(sampleMarkdown)
    finalize()
  }, [append, finalize, reset])

  return (
    <div className="app">
      <header className="header">
        <h1>🚀 Incremark React Example</h1>
        <div className="controls">
          <button className="primary" onClick={simulateStream} disabled={isStreaming}>
            {isStreaming ? '正在输出...' : '模拟 AI 输出'}
          </button>
          <button className="secondary" onClick={renderAll} disabled={isStreaming}>
            一次性渲染
          </button>
          <button className="secondary" onClick={reset} disabled={isStreaming}>
            重置
          </button>
        </div>
        <div className="stats">
          📝 {markdown.length} 字符 | ✅ {completedBlocks.length} 块 | ⏳ {pendingBlocks.length}{' '}
          待定
        </div>
      </header>

      <main className="content">
        <Incremark blocks={blocks} showBlockStatus={true} />
      </main>
    </div>
  )
}

export default App

