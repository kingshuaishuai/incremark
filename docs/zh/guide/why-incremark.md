# 为什么选择 Incremark？

在大语言模型时代，展示 AI 生成的内容已经成为 Web 开发中最常见的需求之一。你可能会问：市面上已经有那么多 Markdown 渲染库了，为什么还需要一个新的？

这篇文章会诚实地回答这个问题。

## 我们要解决的问题

### AI 输出正在变得越来越长

如果你关注 AI 领域的趋势，会发现一个明显的规律：

- **2022 年**：GPT-3.5 的回复通常只有几百字
- **2023 年**：GPT-4 的回复可以达到 2,000-4,000 字
- **2024-2025 年**：OpenAI o1、DeepSeek R1 等推理模型会输出"思考过程"，可能超过 10,000+ 字

单次会话的 Token 量级正在从 4K 向 32K，甚至 128K 迈进。

**挑战**：对于前端开发者来说，渲染 500 字和渲染 50,000 字的 Markdown，完全是两个不同的问题。

### 传统解析器跟不上了

当你用传统的 Markdown 解析器处理 AI 流式输出时，会发生这样的事情：

```
Chunk 1: 解析 100 字符 ✓
Chunk 2: 解析 200 字符 (100 旧 + 100 新)
Chunk 3: 解析 300 字符 (200 旧 + 100 新)
...
Chunk 100: 解析 10,000 字符 😰
```

每当新的 chunk 到达，整个文档都要重新解析一遍。这是 **O(n²) 复杂度**。

对于一个 20KB 的文档，这意味着：
- **ant-design-x**：1,657 ms 总解析时间
- **markstream-vue**：5,755 ms（将近 6 秒！）
- **Incremark**：88 ms ✨

**差距不是 2 倍或 3 倍 —— 是 19 倍到 65 倍。**

## 为什么 Incremark 不一样

### 1. 真正的增量解析

Incremark 不只是"优化"传统方案 —— 它从根本上重新思考了流式 Markdown 应该如何工作。

```
Chunk 1: 解析 100 字符 → 缓存稳定块
Chunk 2: 仅解析 ~100 新字符（之前的已缓存）
Chunk 3: 仅解析 ~100 新字符（之前的已缓存）
...
Chunk 100: 仅解析 ~100 新字符
```

这是 **O(n) 复杂度**。文档越大，我们的优势越明显。

### 2. 双引擎架构

我们理解不同场景有不同的需求：

| 引擎 | 速度 | 最佳场景 |
|------|------|----------|
| **Marked**（默认） | ⚡⚡⚡⚡⚡ | 实时流式、AI 对话 |
| **Micromark** | ⚡⚡⚡ | 复杂文档、严格 CommonMark 兼容 |

你可以通过一个配置选项切换引擎。

### 3. 开箱即用的增强功能

原生 Marked 不支持脚注、数学公式或自定义容器。我们通过精心设计的扩展添加了这些功能：

- ✅ **脚注**：完整的 GFM 脚注支持（`[^1]`）
- ✅ **数学公式**：行内（`$...$`）和块级（`$$...$$`）公式
- ✅ **自定义容器**：`:::tip`、`:::warning`、`:::danger`
- ✅ **HTML 解析**：结构化的 HTML 树解析
- ✅ **乐观引用处理**：在流式输入时优雅处理未完成的链接

### 4. 框架无关

我们为所有主流框架提供一等支持：

```bash
# Vue
pnpm add @incremark/core @incremark/vue

# React
pnpm add @incremark/core @incremark/react

# Svelte
pnpm add @incremark/core @incremark/svelte
```

一个核心库，一致的 API，跨框架相同的特性。

## 诚实的性能对比

我们相信透明度。以下是我们在 38 个测试文件上的实际基准测试结果：

### 总体平均值

| 对比方案 | 平均优势 |
|----------|----------|
| vs Streamdown | 约**快 6.1 倍** |
| vs ant-design-x | 约**快 7.2 倍** |
| vs markstream-vue | 约**快 28.3 倍** |

### 我们没有更快的地方

我们不会隐瞒这一点：在某些基准测试中，Incremark 看起来比 Streamdown 慢：

| 文件 | Incremark | Streamdown | 原因 |
|------|-----------|------------|------|
| footnotes.md | 1.7 ms | 0.2 ms | Streamdown 不支持脚注 |
| FOOTNOTE_FIX_SUMMARY.md | 22.7 ms | 0.5 ms | 同上 — 跳过脚注解析 |

**这不是性能问题 —— 这是功能差异。** 我们选择完整实现脚注，因为它们对 AI 内容很重要。

### 我们真正的优势场景

对于标准 Markdown 内容，我们的优势很明显：

| 文件 | 行数 | Incremark | ant-design-x | 优势倍数 |
|------|------|-----------|--------------|----------|
| concepts.md | 91 | 12.0 ms | 53.6 ms | **4.5x** |
| OPTIMIZATION_SUMMARY.md | 391 | 19.1 ms | 217.8 ms | **11.4x** |
| test-md-01.md | 916 | 87.7 ms | 1656.9 ms | **18.9x** |

**文档越大，我们的优势越明显。**

## 谁应该使用 Incremark？

### ✅ 非常适合

- **AI 聊天应用**：Claude、ChatGPT、自定义 LLM 界面
- **长篇 AI 内容**：推理模型、代码生成、文档分析
- **实时编辑器**：协作式 Markdown 编辑
- **企业级 RAG 系统**：需要渲染大型文档的知识库
- **多框架团队**：在 Vue、React 和 Svelte 之间保持一致的行为

### ⚠️ 考虑其他方案

- **静态站点生成**：如果你在构建时预渲染 Markdown，更简单的库就够了
- **非常短的内容**：对于 500 字符以下的内容，性能差异可以忽略

## 更大的图景

我们不只是在构建一个库 —— 我们在为 AI 界面的未来做准备。

### 趋势很明确

- AI 输出正在变长（推理模型、思维链）
- 流式正在成为默认方式（更好的用户体验，更低的延迟）
- 用户期望即时反馈（没有加载动画，没有卡顿）

传统的 O(n²) 解析器根本无法扩展到这个未来。Incremark 的 O(n) 架构正是为此而生。

### 我们的承诺

我们承诺：
- **性能**：持续优化两个引擎
- **功能**：根据需要添加新的语法支持
- **稳定性**：彻底的测试和谨慎的版本控制
- **文档**：AI 友好的文档（查看我们的 `llms.txt`）

## 开始使用

准备好尝试了吗？只需要不到 5 分钟：

```bash
pnpm add @incremark/core @incremark/vue
```

```vue
<script setup>
import { ref } from 'vue'
import { IncremarkContent } from '@incremark/vue'

const content = ref('')
const isFinished = ref(false)

// 处理 AI 流式输出
async function handleStream(stream) {
  content.value = ''
  isFinished.value = false
  
  for await (const chunk of stream) {
    content.value += chunk
  }
  
  isFinished.value = true
}
</script>

<template>
  <IncremarkContent 
    :content="content" 
    :is-finished="isFinished"
    :incremark-options="{ gfm: true, math: true }"
  />
</template>
```

就这样。你的 AI 聊天刚刚快了 19 倍。

---

## 常见问题

### Q: Incremark 可以用于生产环境吗？

可以。核心解析引擎已经用真实的 AI 内容进行了广泛测试，包括未完成的代码块、嵌套列表和复杂脚注等边界情况。

### Q: 基于 WebAssembly 的解析器会让 Incremark 过时吗？

这是一个合理的担忧。基于 Rust 的 Wasm 解析器（如 `pulldown-cmark`）理论上可能更快。但是：

1. Wasm-JS 交互有开销（尤其是字符串传递）
2. 增量解析在 Wasm 中很难实现
3. 20KB 文档 88ms 的解析时间对人类来说已经是瞬间完成

只要我们保持目前的性能水平，Wasm 就不是威胁。

### Q: Incremark 和 `react-markdown` 相比如何？

`react-markdown` 是为静态文档设计的，不是为流式设计的。它在每次更新时都会重新渲染整个组件树，在 AI 流式输出时会造成严重的性能问题。Incremark 只更新发生变化的部分。

### Q: 我可以自定义渲染吗？

当然可以。三个框架包都支持自定义组件：

```vue
<IncremarkContent 
  :content="content" 
  :is-finished="isFinished"
  :custom-code-blocks="{ echarts: MyEchartsCodeBlock }"
  :custom-containers="{ warning: MyWarningContainer }"
  :components="{ heading: MyCustomHeading }"
/>
```

---

我们构建 Incremark 是因为我们自己需要它。希望它能帮助你构建更好的 AI 体验。

有问题？发现问题？[提交 GitHub Issue](https://github.com/kingshuaishuai/incremark/issues) 或查看我们的[文档](/)。

