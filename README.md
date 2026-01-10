# Incremark

增量式 Markdown 解析器，专为 AI 流式输出设计。

[![npm version](https://img.shields.io/npm/v/@incremark/core)](https://www.npmjs.com/package/@incremark/core)
[![license](https://img.shields.io/npm/l/@incremark/core)](./LICENSE)

🇨🇳 中文 | **[🇺🇸 English](./README.en.md)**

📖 [文档](https://www.incremark.com/) | 🎮 [Vue Demo](https://vue.incremark.com/) | ⚛️ [React Demo](https://react.incremark.com/)

## 为什么选择 Incremark？

传统 Markdown 解析器每次收到新内容都会**重新解析整个文档**，导致 O(n²) 的复杂度。Incremark 的增量解析实现了 O(n) —— 文档越大，优势越明显：

| 文件 | 行数 | Incremark | Streamdown | markstream | ant-design-x |
|------|------|-----------|------------|------------|--------------|
| concepts.md | 91 | 12.0 ms | 50.5 ms (**4.2x**) | 381.9 ms (**31.9x**) | 53.6 ms (**4.5x**) |
| comparison.md | 109 | 20.5 ms | 74.0 ms (**3.6x**) | 552.2 ms (**26.9x**) | 85.2 ms (**4.1x**) |
| complex-html.md | 147 | 9.0 ms | 58.8 ms (**6.6x**) | 279.3 ms (**31.1x**) | 57.2 ms (**6.4x**) |
| OPTIMIZATION_SUMMARY.md | 391 | 19.1 ms | 208.4 ms (**10.9x**) | 980.6 ms (**51.3x**) | 217.8 ms (**11.4x**) |
| test-md-01.md | 916 | 87.7 ms | 1441.1 ms (**16.4x**) | 5754.7 ms (**65.6x**) | 1656.9 ms (**18.9x**) |
| **总计 (38个文件)** | **6484** | **519.4 ms** | **3190.3 ms** (**6.1x**) | **14683.9 ms** (**28.3x**) | **3728.6 ms** (**7.2x**) |

> 📊 基准测试: 38 个真实 Markdown 文件，共 128.55 KB。[查看完整结果 →](https://www.incremark.com/zh/advanced/engines)

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
pnpm add @incremark/vue @incremark/theme
```

```vue
<script setup>
import { ref } from 'vue'
import { IncremarkContent } from '@incremark/vue'
import '@incremark/theme/styles.css'

const content = ref('')
const isFinished = ref(false)

async function handleAIStream(stream) {
  for await (const chunk of stream) {
    content.value += chunk
  }
  isFinished.value = true
}
</script>

<template>
  <IncremarkContent :content="content" :is-finished="isFinished" />
</template>
```

### React

```bash
pnpm add @incremark/react @incremark/theme
```

```tsx
import { useState } from 'react'
import { IncremarkContent } from '@incremark/react'
import '@incremark/theme/styles.css'

function App() {
  const [content, setContent] = useState('')
  const [isFinished, setIsFinished] = useState(false)

  async function handleAIStream(stream: ReadableStream) {
    const reader = stream.getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      setContent(prev => prev + new TextDecoder().decode(value))
    }
    setIsFinished(true)
  }

  return <IncremarkContent content={content} isFinished={isFinished} />
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

## 路线图

- [ ] 🔧 DevTools Svelte 重构
- [ ] 🎨 主题包分离
- [ ] 🟠 Svelte / ⚡ Solid 支持
- [ ] 💭 AI 场景增强 (thinking block, tool call, 引用标注)

[查看完整路线图 →](https://www.incremark.com/zh/roadmap)

## 文档

完整文档请访问：[https://www.incremark.com/](https://www.incremark.com/)

## 在线演示

- 🎮 [Vue Demo](https://vue.incremark.com/) - Vue 3 集成示例
- ⚛️ [React Demo](https://react.incremark.com/) - React 集成示例

## License

MIT
