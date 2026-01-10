# @incremark/core

增量式 Markdown 解析器核心库。

🇨🇳 中文 | **[🇺🇸 English](./README.en.md)**

## 特性

- 🚀 **增量解析** - 只解析新增内容，已完成的块不再重复处理
- 🔄 **流式友好** - 专为 AI 流式输出场景设计
- ⌨️ **打字机效果** - 内置 BlockTransformer 实现逐字符显示
- 🎯 **智能边界检测** - 准确识别 Markdown 块边界
- 📦 **框架无关** - 可与任何前端框架配合使用

## 安装

```bash
pnpm add @incremark/core
```

## 快速开始

```ts
import { createIncremarkParser } from '@incremark/core'

const parser = createIncremarkParser({ gfm: true })

// 模拟流式输入
parser.append('# Hello\n')
parser.append('\nWorld')
parser.finalize()

// 获取结果
console.log(parser.getCompletedBlocks())
console.log(parser.getAst())
```

## API

### createIncremarkParser(options)

创建解析器实例。

```ts
interface ParserOptions {
  gfm?: boolean              // 启用 GFM
  containers?: boolean       // 启用 ::: 容器
  extensions?: Extension[]   // micromark 扩展
  mdastExtensions?: Extension[]  // mdast 扩展
}
```

### parser.append(chunk)

追加内容，返回增量更新。

### parser.finalize()

完成解析。

### parser.reset()

重置状态。

### parser.render(content)

一次性渲染完整 Markdown（reset + append + finalize）。

```ts
const update = parser.render('# Hello World')
console.log(update.completed) // 已完成的块
```

### parser.getBuffer()

获取当前缓冲区内容。

### parser.getCompletedBlocks()

获取已完成的块。

### parser.getPendingBlocks()

获取待处理的块。

### parser.getAst()

获取完整 AST。

## 与框架集成

对于日常使用，建议直接使用框架集成包，它们已内置增量解析和打字机效果支持：

```vue
<!-- Vue -->
<script setup>
import { ref } from 'vue'
import { IncremarkContent } from '@incremark/vue'

const content = ref('')
const isFinished = ref(false)

async function simulateStream() {
  content.value = ''
  isFinished.value = false

  const text = '# Hello\n\nThis is **Incremark**!'
  for (const chunk of text.match(/[\s\S]{1,5}/g) || []) {
    content.value += chunk  // 增量追加
    await new Promise(r => setTimeout(r, 50))
  }
  isFinished.value = true
}
</script>

<template>
  <IncremarkContent
    :content="content"
    :is-finished="isFinished"
    :incremark-options="{ typewriter: { enabled: true } }"
  />
</template>
```

```tsx
// React
import { useState } from 'react'
import { IncremarkContent } from '@incremark/react'

function App() {
  const [content, setContent] = useState('')
  const [isFinished, setIsFinished] = useState(false)

  async function simulateStream() {
    setContent('')
    setIsFinished(false)

    const text = '# Hello\n\nThis is **Incremark**!'
    const chunks = text.match(/[\s\S]{1,5}/g) || []
    for (const chunk of chunks) {
      setContent(prev => prev + chunk)  // 增量追加
      await new Promise(r => setTimeout(r, 50))
    }
    setIsFinished(true)
  }

  return (
    <IncremarkContent
      content={content}
      isFinished={isFinished}
      incremarkOptions={{ typewriter: { enabled: true } } }
    />
  )
}
```

## 高级用法：BlockTransformer

`BlockTransformer` 是打字机效果控制器，作为解析器和渲染器之间的中间层。仅在需要自定义渲染逻辑时使用。

```ts
import { createBlockTransformer, defaultPlugins } from '@incremark/core'

const transformer = createBlockTransformer({
  charsPerTick: 2,      // 每次显示 2 个字符
  tickInterval: 50,     // 每 50ms 显示一次
  plugins: defaultPlugins,
  onChange: (displayBlocks) => {
    // 更新 UI
    render(displayBlocks)
  }
})

// 推送源 blocks
transformer.push(sourceBlocks)

// 跳过动画
transformer.skip()

// 重置
transformer.reset()

// 销毁
transformer.destroy()
```

### 配置选项

```ts
interface TransformerOptions {
  charsPerTick?: number       // 每次显示的字符数（默认：2）
  tickInterval?: number       // 显示间隔 ms（默认：50）
  plugins?: TransformerPlugin[] // 插件列表
  onChange?: (blocks: DisplayBlock[]) => void
}
```

### 插件系统

```ts
import {
  defaultPlugins,  // 默认插件（图片、分隔线立即显示）
  allPlugins,      // 完整插件（代码块等整体显示）
  codeBlockPlugin,
  mermaidPlugin,
  imagePlugin,
  mathPlugin,
  thematicBreakPlugin,
  createPlugin
} from '@incremark/core'

// 自定义插件
const myPlugin = createPlugin('my-plugin', 
  (node) => node.type === 'myType',
  { countChars: () => 1 }
)
```

## 类型定义

```ts
interface ParsedBlock {
  id: string
  status: 'pending' | 'stable' | 'completed'
  node: RootContent
  startOffset: number
  endOffset: number
  rawText: string
}

interface SourceBlock {
  id: string
  node: RootContent
  status: 'pending' | 'stable' | 'completed'
  meta?: unknown
}

interface DisplayBlock {
  id: string
  sourceNode: RootContent
  displayNode: RootContent
  displayedChars: number
  totalChars: number
  isDisplayComplete: boolean
  meta?: unknown
}
```

## License

MIT
