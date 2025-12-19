# Incremark

增量式 Markdown 解析器，专为 AI 流式输出设计。

[![npm version](https://img.shields.io/npm/v/@incremark/core)](https://www.npmjs.com/package/@incremark/core)
[![license](https://img.shields.io/npm/l/@incremark/core)](./LICENSE)

🇨🇳 中文 | **[🇺🇸 English](./README.en.md)**

📖 [文档](https://www.incremark.com/) | 🎮 [Vue Demo](https://vue.incremark.com/) | ⚛️ [React Demo](https://react.incremark.com/)

## 为什么选择 Incremark？

传统 Markdown 解析器在 AI 流式输出场景中存在性能问题：每次收到新内容都要重新解析全部文本。Incremark 采用增量解析策略，**只解析新增内容**，已完成的块不再重复处理。

| 文档大小 | 传统方式 | Incremark | 加速比 |
|---------|---------|-----------|--------|
| ~1KB | 0.4 秒 | 0.17 秒 | **2x** |
| ~5KB | 10 秒 | 0.9 秒 | **10x** |
| ~10KB | 40 秒 | 1.8 秒 | **20x** |
| ~20KB | 183 秒 | 4 秒 | **46x** |

## 包

| 包 | 说明 | 版本 |
|---|---|---|
| [@incremark/core](./packages/core) | 核心解析器 | ![npm](https://img.shields.io/npm/v/@incremark/core) |
| [@incremark/vue](./packages/vue) | Vue 3 集成 | ![npm](https://img.shields.io/npm/v/@incremark/vue) |
| [@incremark/react](./packages/react) | React 集成 | ![npm](https://img.shields.io/npm/v/@incremark/react) |
| [@incremark/devtools](./packages/devtools) | 开发者工具 | ![npm](https://img.shields.io/npm/v/@incremark/devtools) |

## 快速开始

### Vue

```bash
pnpm add @incremark/core @incremark/vue
```

```vue
<script setup>
import { useIncremark, Incremark } from '@incremark/vue'

const { blocks, append, finalize, reset } = useIncremark({ gfm: true })

async function handleAIStream(stream) {
  reset()
  for await (const chunk of stream) {
    append(chunk)
  }
  finalize()
}
</script>

<template>
  <Incremark :blocks="blocks" />
</template>
```

### React

```bash
pnpm add @incremark/core @incremark/react
```

```tsx
import { useIncremark, Incremark } from '@incremark/react'

function App() {
  const { blocks, append, finalize, reset } = useIncremark({ gfm: true })

  async function handleAIStream(stream: ReadableStream) {
    reset()
    const reader = stream.getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      append(new TextDecoder().decode(value))
    }
    finalize()
  }

  return <Incremark blocks={blocks} />
}
```

## 特性

- ⚡ **增量解析** - 只解析新增内容
- 🔄 **流式友好** - 支持逐字符/逐行输入
- 🎯 **边界检测** - 智能识别块边界
- 🔌 **框架无关** - 核心库可独立使用
- 📊 **DevTools** - 内置开发者工具
- 🎨 **可定制** - 支持自定义渲染组件
- 📐 **扩展支持** - GFM、数学公式、Mermaid 等

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发
pnpm dev

# 运行 Vue 示例
pnpm example:vue

# 运行 React 示例
pnpm example:react

# 启动文档
pnpm docs

# 运行测试
pnpm test

# 构建
pnpm build
```

## 文档

完整文档请访问：[https://www.incremark.com/](https://www.incremark.com/)

## 在线演示

- 🎮 [Vue Demo](https://vue.incremark.com/) - Vue 3 集成示例
- ⚛️ [React Demo](https://react.incremark.com/) - React 集成示例

## License

MIT
