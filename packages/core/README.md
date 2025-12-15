# @incremark/core

增量式 Markdown 解析器核心库。

🇨🇳 中文 | **[🇺🇸 English](./README.en.md)**

## 特性

- 🚀 **增量解析** - 只解析新增内容，已完成的块不再重复处理
- 🔄 **流式友好** - 专为 AI 流式输出场景设计
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
```

## 与框架集成

- Vue: [@incremark/vue](../vue)
- React: [@incremark/react](../react)

## License

MIT

