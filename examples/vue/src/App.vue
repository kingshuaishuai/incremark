<script setup lang="ts">
import { ref, h, defineComponent } from 'vue'
import { useIncremark, useDevTools } from '../../../packages/vue/src/composables'
import { Incremark } from '../../../packages/vue/src/components'
// @ts-ignore - 类型声明
import { math } from 'micromark-extension-math'
// @ts-ignore - 类型声明
import { mathFromMarkdown } from 'mdast-util-math'
// KaTeX 样式
import 'katex/dist/katex.min.css'

// 使用 composable 获取所有数据和方法（包含 math 扩展）
const incremark = useIncremark({
  gfm: true,
  extensions: [math()],
  mdastExtensions: [mathFromMarkdown()]
})
const { markdown, blocks, completedBlocks, pendingBlocks, append, finalize, reset, isLoading } = incremark

// 使用独立的 DevTools
useDevTools(incremark)

const isStreaming = ref(false)

// 示例 Markdown 内容
const sampleMarkdown = `# 🚀 Incremark Vue 示例

欢迎使用 **Incremark**！这是一个专为 AI 流式输出设计的增量 Markdown 解析器。

## 📋 功能特点

- **增量解析**：只解析新增内容，节省 90% 以上的 CPU 开销
- **Mermaid 图表**：支持流程图、时序图等
- **LaTeX 公式**：支持数学公式渲染
- **GFM 支持**：表格、任务列表、删除线等

## 📐 数学公式

行内公式：质能方程 $E = mc^2$ 是物理学中最著名的公式之一。

块级公式 - 欧拉公式：

$$
e^{i\\pi} + 1 = 0
$$

二次方程的求根公式：

$$
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

## 📊 Mermaid 图表

### 流程图

\`\`\`mermaid
flowchart TD
    A[开始] --> B{条件判断}
    B -->|是| C[执行操作]
    B -->|否| D[跳过]
    C --> E[结束]
    D --> E
\`\`\`

### 时序图

\`\`\`mermaid
sequenceDiagram
    participant U as 用户
    participant C as 客户端
    participant S as 服务器
    U->>C: 输入消息
    C->>S: 发送请求
    S-->>C: 流式响应
    C-->>U: 实时渲染
\`\`\`

## 💻 代码示例

\`\`\`typescript
import { useIncremark, Incremark } from '@incremark/vue'
import { math } from 'micromark-extension-math'
import { mathFromMarkdown } from 'mdast-util-math'

const { append, finalize } = useIncremark({
  gfm: true,
  extensions: [math()],
  mdastExtensions: [mathFromMarkdown()]
})
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
- [x] Mermaid 图表
- [x] LaTeX 公式
- [ ] React 集成

> 💡 **提示**：Incremark 的核心优势是**解析层增量化**，而非仅仅是渲染层优化。

**感谢使用 Incremark！** 🙏
`

// 自定义标题组件示例
const CustomHeading = defineComponent({
  props: {
    node: { type: Object, required: true }
  },
  setup(props) {
    return () => {
      const text = (props.node as any).children?.[0]?.value || ''
      const level = (props.node as any).depth
      return h(`h${level}`, { class: 'custom-heading' }, `✨ ${text}`)
    }
  }
})

// 是否使用自定义组件
const useCustomComponents = ref(false)

const customComponents = {
  heading: CustomHeading
}

// 模拟流式输出
async function simulateStream() {
  reset()
  isStreaming.value = true

  // const chunks = sampleMarkdown.match(/[\s\S]{1,20}/g) || []
  const chunks = sampleMarkdown.split('');

  for (const chunk of chunks) {
    append(chunk)
    await new Promise((resolve) => setTimeout(resolve, 30))
  }

  finalize()
  isStreaming.value = false
}

// 一次性渲染
function renderOnce() {
  reset()
  append(sampleMarkdown)
  finalize()
}
</script>

<template>
  <div class="app">
    <header>
      <h1>🚀 Incremark Vue Example</h1>
      <div class="controls">
        <button @click="simulateStream" :disabled="isStreaming">
          {{ isStreaming ? '正在输出...' : '模拟 AI 输出' }}
        </button>
        <button @click="renderOnce" :disabled="isStreaming">一次性渲染</button>
        <button @click="reset" :disabled="isStreaming">重置</button>
        <label class="checkbox">
          <input type="checkbox" v-model="useCustomComponents" />
          使用自定义组件
        </label>
        <span class="stats">
          📝 {{ markdown.length }} 字符 |
          ✅ {{ completedBlocks.length }} 块 |
          ⏳ {{ pendingBlocks.length }} 待定
        </span>
      </div>
    </header>

    <main class="content">
      <!-- 直接传入 blocks，不需要 ref -->
      <Incremark
        :blocks="blocks"
        :components="useCustomComponents ? customComponents : {}"
        :show-block-status="true"
      />
    </main>
    <!-- DevTools 通过 useDevTools 自动挂载 -->
  </div>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f5f5;
  min-height: 100vh;
  color: #333;
}

.app {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

header {
  margin-bottom: 1.5rem;
}

header h1 {
  font-size: 1.75rem;
  margin-bottom: 1rem;
  color: #1a1a1a;
}

.controls {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
  padding: 1rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

button {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  background: #3b82f6;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover:not(:disabled) {
  background: #2563eb;
}

button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.stats {
  margin-left: auto;
  font-size: 0.875rem;
  color: #666;
}

.content {
  background: #fff;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 500px;
  max-height: 70vh;
  overflow-y: auto;
}

/* 自定义标题样式 */
.custom-heading {
  color: #7c3aed;
  border-bottom: 2px solid #7c3aed;
  padding-bottom: 0.5rem;
}

/* Markdown 内容样式 */
.content h1 {
  font-size: 1.875rem;
  margin: 1rem 0;
}
.content h2 {
  font-size: 1.5rem;
  margin: 1rem 0 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e5e7eb;
}
.content h3 {
  font-size: 1.25rem;
  margin: 0.75rem 0 0.5rem;
}
.content p {
  margin: 0.75rem 0;
  line-height: 1.7;
}
.content ul,
.content ol {
  margin: 0.75rem 0;
  padding-left: 1.5rem;
}
.content li {
  margin: 0.25rem 0;
}
.content code {
  background: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.875em;
}
.content pre {
  background: #1f2937;
  color: #e5e7eb;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1rem 0;
}
.content pre code {
  background: transparent;
  padding: 0;
}
.content table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}
.content th,
.content td {
  border: 1px solid #e5e7eb;
  padding: 0.5rem 1rem;
  text-align: left;
}
.content th {
  background: #f9fafb;
  font-weight: 600;
}
.content blockquote {
  border-left: 4px solid #3b82f6;
  padding-left: 1rem;
  margin: 1rem 0;
  color: #4b5563;
}
.content hr {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 1.5rem 0;
}
.content a {
  color: #3b82f6;
  text-decoration: none;
}
.content a:hover {
  text-decoration: underline;
}
</style>
