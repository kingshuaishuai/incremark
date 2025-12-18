<script setup lang="ts">
import { ref, h, defineComponent, computed, watch } from 'vue'
import { useIncremark, useDevTools, useBlockTransformer } from '../../../packages/vue/src/composables'
import { Incremark, AutoScrollContainer } from '../../../packages/vue/src/components'
import { createIncremarkParser, defaultPlugins } from '../../../packages/core/src'
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
const { markdown, blocks, completedBlocks, pendingBlocks, append, finalize, reset: resetParser, render, isLoading } = incremark

// 使用独立的 DevTools
useDevTools(incremark)

// ============ 打字机效果（BlockTransformer） ============
const typewriterMode = ref(false)
const typewriterSpeed = ref(2) // 每 tick 字符数
const typewriterInterval = ref(30) // tick 间隔（毫秒）
const typewriterRandomStep = ref(true) // 是否使用随机步长
const typewriterEffect = ref<'none' | 'fade-in' | 'typing'>('typing') // 动画效果
const typewriterCursor = ref('|') // 光标字符

// 只使用 completedBlocks 作为 transformer 的输入
// 因为 completedBlocks 的 id 是稳定的，而 pendingBlocks 每次 append 都会重新生成 id
const sourceBlocks = computed(() => {
  return completedBlocks.value.map(block => ({
    id: block.id,
    node: block.node,
    status: block.status as 'pending' | 'stable' | 'completed'
  }))
})

// 计算 charsPerTick：如果启用随机步长，使用 [1, speed]，否则使用固定值
const computedCharsPerTick = computed(() => {
  if (typewriterRandomStep.value) {
    return [1, Math.max(2, typewriterSpeed.value)] as [number, number]
  }
  return typewriterSpeed.value
})

// 使用 BlockTransformer 包装 completedBlocks
const { 
  displayBlocks, 
  isProcessing, 
  isPaused: isTypewriterPaused,
  effect: currentEffect,
  skip: skipTypewriter,
  pause: pauseTypewriter,
  resume: resumeTypewriter,
  reset: resetTransformer,
  setOptions: setTransformerOptions,
  transformer
} = useBlockTransformer(sourceBlocks, {
  charsPerTick: computedCharsPerTick.value,
  tickInterval: typewriterInterval.value,
  effect: typewriterEffect.value,
  pauseOnHidden: true, // 页面不可见时自动暂停
  plugins: defaultPlugins
})

// 监听速度/间隔/效果变化，动态更新 transformer 配置
watch([computedCharsPerTick, typewriterInterval, typewriterEffect], ([speed, interval, effect]) => {
  setTransformerOptions({ 
    charsPerTick: speed, 
    tickInterval: interval,
    effect: effect
  })
})

// 在 AST 节点末尾添加光标字符
function addCursorToNode(node: any, cursor: string = '|'): any {
  const cloned = JSON.parse(JSON.stringify(node))
  
  function addToLast(n: any): boolean {
    // 如果有 children，递归到最后一个子节点
    if (n.children && n.children.length > 0) {
      // 从最后一个子节点开始尝试
      for (let i = n.children.length - 1; i >= 0; i--) {
        if (addToLast(n.children[i])) {
          return true
        }
      }
      // 如果所有子节点都失败了，在末尾添加一个文本节点
      n.children.push({ type: 'text', value: cursor })
      return true
    }
    // 如果是文本节点，直接添加
    if (n.type === 'text' && typeof n.value === 'string') {
      n.value += cursor
      return true
    }
    // 如果有 value 属性（如 inlineCode），添加到 value
    if (typeof n.value === 'string') {
      n.value += cursor
      return true
    }
    return false
  }
  
  addToLast(cloned)
  return cloned
}

// 根据模式选择要渲染的 blocks
const renderBlocks = computed(() => {
  if (!typewriterMode.value) {
    return blocks.value
  }
  
  // 打字机模式：只使用 transformer 输出的 displayBlocks
  // 不显示 pending blocks，避免内容闪烁
  return displayBlocks.value.map((db, index) => {
    const isPending = !db.isDisplayComplete
    const isLastPending = isPending && index === displayBlocks.value.length - 1
    
    let node = db.displayNode
    
    // 光标效果：在最后一个 pending 块末尾添加光标字符
    if (typewriterEffect.value === 'typing' && isLastPending) {
      node = addCursorToNode(db.displayNode, typewriterCursor.value)
    }
    
    return {
      id: db.id,
      stableId: db.id,
      status: (db.isDisplayComplete ? 'completed' : 'pending') as 'pending' | 'stable' | 'completed',
      isLastPending, // 标记是否是最后一个 pending 块
      node,
      startOffset: 0,
      endOffset: 0,
      rawText: ''
    }
  })
})

// 统一的重置函数
function reset() {
  resetParser()
  resetTransformer()
}

const isStreaming = ref(false)

// 国际化
const locale = ref<'zh' | 'en'>((localStorage.getItem('locale') as 'zh' | 'en') || 'zh')

const i18n = {
  zh: {
    title: '🚀 Incremark Vue 示例',
    simulateAI: '模拟 AI 输出',
    streaming: '正在输出...',
    renderOnce: '一次性渲染',
    reset: '重置',
    customComponents: '使用自定义组件',
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
    parseCount: '解析次数',
    totalChars: '总解析量',
    speedup: '加速比',
    benchmarkNote: '传统方式每次收到新内容都重新解析全部文本，Incremark 只解析新增部分。',
    customInput: '自定义输入',
    inputPlaceholder: '在这里输入你的 Markdown 内容...',
    useExample: '使用示例',
    typewriterMode: '⌨️ 打字机',
    typewriterSpeed: '速度',
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
    sampleMarkdown: `# 🚀 Incremark Vue 示例

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

**感谢使用 Incremark！** 🙏`
  },
  en: {
    title: '🚀 Incremark Vue Example',
    simulateAI: 'Simulate AI Output',
    streaming: 'Streaming...',
    renderOnce: 'Render Once',
    reset: 'Reset',
    customComponents: 'Use Custom Components',
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
    parseCount: 'Parse Count',
    totalChars: 'Total Parsed',
    speedup: 'Speedup',
    benchmarkNote: 'Traditional parsers re-parse all content on each new chunk. Incremark only parses new content.',
    customInput: 'Custom Input',
    inputPlaceholder: 'Enter your Markdown content here...',
    useExample: 'Use Example',
    typewriterMode: '⌨️ Typewriter',
    typewriterSpeed: 'Speed',
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
    sampleMarkdown: `# 🚀 Incremark Vue Example

Welcome to **Incremark**! An incremental Markdown parser designed for AI streaming output.

## 📋 Features

- **Incremental Parsing**: Only parse new content, saving 90%+ CPU overhead
- **Mermaid Charts**: Support for flowcharts, sequence diagrams, etc.
- **LaTeX Formulas**: Math formula rendering support
- **GFM Support**: Tables, task lists, strikethrough, etc.

## 📐 Math Formulas

Inline formula: The mass-energy equation $E = mc^2$ is one of the most famous formulas in physics.

Block formula - Euler's formula:

$$
e^{i\\pi} + 1 = 0
$$

Quadratic formula:

$$
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

## 📊 Mermaid Charts

### Flowchart

\`\`\`mermaid
flowchart TD
    A[Start] --> B{Condition}
    B -->|Yes| C[Execute]
    B -->|No| D[Skip]
    C --> E[End]
    D --> E
\`\`\`

### Sequence Diagram

\`\`\`mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant S as Server
    U->>C: Input message
    C->>S: Send request
    S-->>C: Streaming response
    C-->>U: Real-time render
\`\`\`

## 💻 Code Example

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

## 📊 Performance Comparison

| Metric | Traditional | Incremark | Improvement |
|--------|-------------|-----------|-------------|
| Parse Volume | ~500K chars | ~50K chars | 90% ↓ |
| CPU Usage | High | Low | 80% ↓ |
| Frame Rate | Laggy | Smooth | ✅ |

## 📝 Task List

- [x] Core parser
- [x] Vue 3 integration
- [x] Mermaid charts
- [x] LaTeX formulas
- [ ] React integration

> 💡 **Tip**: Incremark's core advantage is **parsing-level incrementalization**, not just render-level optimization.

**Thanks for using Incremark!** 🙏`
  }
}

const t = computed(() => i18n[locale.value])

function toggleLocale() {
  locale.value = locale.value === 'zh' ? 'en' : 'zh'
  localStorage.setItem('locale', locale.value)
  reset()
}

// 自动滚动
const autoScrollEnabled = ref(true)
const scrollContainerRef = ref<InstanceType<typeof AutoScrollContainer> | null>(null)

// 自定义输入模式
const customInputMode = ref(false)
const customMarkdown = ref('')

// 示例 Markdown 内容
const sampleMarkdown = computed(() => 
  customInputMode.value && customMarkdown.value.trim() 
    ? customMarkdown.value 
    : t.value.sampleMarkdown
)

// Benchmark 模式
const benchmarkMode = ref(false)
const benchmarkStats = ref({
  traditional: { time: 0, parseCount: 0, totalChars: 0 },
  incremark: { time: 0, parseCount: 0, totalChars: 0 }
})
const benchmarkRunning = ref(false)
const benchmarkProgress = ref(0)

// 传统解析方式 - 每次都重新解析全部内容
async function runBenchmarkComparison() {
  reset()
  benchmarkRunning.value = true
  benchmarkProgress.value = 0
  
  const content = sampleMarkdown.value
  const chunks = content.match(/[\s\S]{1,20}/g) || []
  
  // 1. 测试传统方式：每次追加都重新从头解析全部内容
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
    traditionalParser.getCompletedBlocks() // 获取结果
    traditionalTime += performance.now() - start
    traditionalParseCount++
    traditionalTotalChars += accumulated.length
    benchmarkProgress.value = ((i + 1) / chunks.length) * 50
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
    benchmarkProgress.value = 50 + ((i + 1) / chunks.length) * 50
    await new Promise(r => setTimeout(r, 5))
  }
  finalize()
  
  benchmarkStats.value = {
    traditional: { time: traditionalTime, parseCount: traditionalParseCount, totalChars: traditionalTotalChars },
    incremark: { time: incremarkTime, parseCount: incremarkParseCount, totalChars: incremarkTotalChars }
  }
  
  benchmarkRunning.value = false
  benchmarkProgress.value = 100
}


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

  const chunks = sampleMarkdown.value.match(/[\s\S]{1,20}/g) || []

  for (const chunk of chunks) {
    append(chunk)
    await new Promise((resolve) => setTimeout(resolve, 30))
  }

  finalize()
  isStreaming.value = false
}

// 一次性渲染
function renderOnce() {
  render(sampleMarkdown.value)
}
</script>

<template>
  <div class="app">
    <header>
      <div class="header-top">
        <h1>{{ t.title }}</h1>
        <button class="lang-toggle" @click="toggleLocale">
          {{ locale === 'zh' ? '🇺🇸 English' : '🇨🇳 中文' }}
        </button>
      </div>
      <div class="controls">
        <button @click="simulateStream" :disabled="isStreaming || benchmarkRunning">
          {{ isStreaming ? t.streaming : t.simulateAI }}
        </button>
        <button @click="renderOnce" :disabled="isStreaming || benchmarkRunning">{{ t.renderOnce }}</button>
        <button @click="reset" :disabled="isStreaming || benchmarkRunning">{{ t.reset }}</button>
        <label class="checkbox">
          <input type="checkbox" v-model="useCustomComponents" />
          {{ t.customComponents }}
        </label>
        <label class="checkbox benchmark-toggle">
          <input type="checkbox" v-model="benchmarkMode" />
          {{ t.benchmarkMode }}
        </label>
        <label class="checkbox">
          <input type="checkbox" v-model="customInputMode" />
          {{ t.customInput }}
        </label>
        <label class="checkbox typewriter-toggle">
          <input type="checkbox" v-model="typewriterMode" />
          {{ t.typewriterMode }}
        </label>
        <label class="checkbox auto-scroll-toggle">
          <input type="checkbox" v-model="autoScrollEnabled" />
          {{ t.autoScroll }}
          <span v-if="scrollContainerRef?.isUserScrolledUp?.()" class="scroll-paused-hint">
            ({{ t.scrollPaused }})
          </span>
        </label>
        <template v-if="typewriterMode">
          <label class="speed-control">
            <input 
              type="range" 
              v-model.number="typewriterSpeed" 
              min="1" 
              max="10" 
              step="1"
            />
            <span class="speed-value">{{ typewriterSpeed }} {{ t.charsPerTick }}</span>
          </label>
          <label class="speed-control">
            <input 
              type="range" 
              v-model.number="typewriterInterval" 
              min="10" 
              max="200" 
              step="10"
            />
            <span class="speed-value">{{ typewriterInterval }} {{ t.intervalMs }}</span>
          </label>
          <label class="checkbox random-step-toggle">
            <input type="checkbox" v-model="typewriterRandomStep" />
            {{ t.randomStep }}
          </label>
          <select v-model="typewriterEffect" class="effect-select">
            <option value="none">{{ t.effectNone }}</option>
            <option value="fade-in">{{ t.effectFadeIn }}</option>
            <option value="typing">{{ t.effectTyping }}</option>
          </select>
          <button 
            v-if="isProcessing && !isTypewriterPaused" 
            class="pause-btn"
            @click="pauseTypewriter"
          >
            ⏸️ {{ t.pause }}
          </button>
          <button 
            v-if="isTypewriterPaused" 
            class="resume-btn"
            @click="resumeTypewriter"
          >
            ▶️ {{ t.resume }}
          </button>
          <button 
            v-if="isProcessing" 
            class="skip-btn"
            @click="skipTypewriter"
          >
            ⏭️ {{ t.skip }}
          </button>
        </template>
        <span class="stats">
          📝 {{ markdown.length }} {{ t.chars }} |
          ✅ {{ completedBlocks.length }} {{ t.blocks }} |
          ⏳ {{ pendingBlocks.length }} {{ t.pending }}
          <template v-if="typewriterMode && isProcessing">
            | ⌨️ {{ isTypewriterPaused ? t.paused : t.typing }}
          </template>
        </span>
      </div>
    </header>

    <!-- Benchmark Panel -->
    <div v-if="benchmarkMode" class="benchmark-panel">
      <div class="benchmark-header">
        <h2>⚡ {{ t.benchmark }}</h2>
        <button 
          class="benchmark-btn"
          @click="runBenchmarkComparison" 
          :disabled="benchmarkRunning"
        >
          {{ benchmarkRunning ? t.running : t.runBenchmark }}
        </button>
      </div>
      
      <div v-if="benchmarkRunning" class="benchmark-progress">
        <div class="progress-bar" :style="{ width: benchmarkProgress + '%' }"></div>
      </div>
      
      <div v-if="benchmarkStats.traditional.time > 0" class="benchmark-results">
        <div class="benchmark-card traditional">
          <h3>🐢 {{ t.traditional }}</h3>
          <div class="stat">
            <span class="label">{{ t.totalTime }}</span>
            <span class="value">{{ benchmarkStats.traditional.time.toFixed(2) }} ms</span>
          </div>
          <div class="stat">
            <span class="label">{{ t.totalChars }}</span>
            <span class="value">{{ (benchmarkStats.traditional.totalChars / 1000).toFixed(1) }}K</span>
          </div>
        </div>
        
        <div class="benchmark-card incremark">
          <h3>🚀 {{ t.incremark }}</h3>
          <div class="stat">
            <span class="label">{{ t.totalTime }}</span>
            <span class="value">{{ benchmarkStats.incremark.time.toFixed(2) }} ms</span>
          </div>
          <div class="stat">
            <span class="label">{{ t.totalChars }}</span>
            <span class="value">{{ (benchmarkStats.incremark.totalChars / 1000).toFixed(1) }}K</span>
          </div>
        </div>
        
        <div class="benchmark-card speedup">
          <h3>📈 {{ t.speedup }}</h3>
          <div class="speedup-value">
            {{ (benchmarkStats.traditional.time / benchmarkStats.incremark.time).toFixed(1) }}x
          </div>
        </div>
      </div>
      
      <p class="benchmark-note">💡 {{ t.benchmarkNote }}</p>
    </div>

    <!-- Custom Input Panel -->
    <div v-if="customInputMode" class="input-panel">
      <div class="input-header">
        <span>✏️ {{ t.customInput }}</span>
        <button class="use-example-btn" @click="customMarkdown = t.sampleMarkdown">
          {{ t.useExample }}
        </button>
      </div>
      <textarea 
        v-model="customMarkdown"
        :placeholder="t.inputPlaceholder"
        class="markdown-input"
        rows="8"
      ></textarea>
    </div>

    <main :class="['content', typewriterMode && `effect-${typewriterEffect}`]">
      <AutoScrollContainer 
        ref="scrollContainerRef" 
        :enabled="autoScrollEnabled"
        class="scroll-container"
      >
        <!-- 根据模式选择 blocks 或 displayBlocks -->
        <Incremark
          :blocks="renderBlocks"
          :components="useCustomComponents ? customComponents : {}"
          :show-block-status="true"
        />
      </AutoScrollContainer>
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

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

header h1 {
  font-size: 1.75rem;
  color: #1a1a1a;
}

.lang-toggle {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 0.4rem 0.8rem;
  font-size: 0.875rem;
}

.lang-toggle:hover:not(:disabled) {
  background: #e5e7eb;
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

/* 打字机效果控件 */
.typewriter-toggle input {
  accent-color: #8b5cf6;
}

.speed-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.speed-control input[type="range"] {
  width: 80px;
  accent-color: #8b5cf6;
}

.speed-value {
  font-size: 0.75rem;
  color: #666;
  min-width: 70px;
}

.skip-btn,
.pause-btn,
.resume-btn {
  background: #8b5cf6;
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
}

.skip-btn:hover:not(:disabled),
.pause-btn:hover:not(:disabled),
.resume-btn:hover:not(:disabled) {
  background: #7c3aed;
}

.pause-btn {
  background: #f59e0b;
}

.pause-btn:hover:not(:disabled) {
  background: #d97706;
}

.resume-btn {
  background: #10b981;
}

.resume-btn:hover:not(:disabled) {
  background: #059669;
}

.effect-select {
  padding: 0.3rem 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid #ddd;
  background: white;
  font-size: 0.85rem;
  cursor: pointer;
}

.effect-select:hover {
  border-color: #8b5cf6;
}

.random-step-toggle {
  font-size: 0.85rem;
}

.stats {
  margin-left: auto;
  font-size: 0.875rem;
  color: #666;
}

.content {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 500px;
  max-height: 70vh;
  overflow: hidden;
}

.scroll-container {
  height: 100%;
  max-height: 70vh;
  padding: 2rem;
}

.auto-scroll-toggle input {
  accent-color: #3b82f6;
}

.scroll-paused-hint {
  color: #f59e0b;
  font-size: 0.75rem;
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
/* 表格容器（支持横向滚动） */
.content .table-wrapper {
  overflow-x: auto;
  margin: 1rem 0;
}

.content table {
  width: 100%;
  border-collapse: collapse;
  min-width: 400px;
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

/* 图片和媒体样式 */
.content img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1rem 0;
}

.content video,
.content iframe {
  max-width: 100%;
  border-radius: 8px;
  margin: 1rem 0;
}

/* 任务列表样式 */
.content input[type="checkbox"] {
  margin-right: 0.5rem;
  accent-color: #3b82f6;
}

/* 删除线样式 */
.content del {
  color: #9ca3af;
}

/* 强调样式 */
.content strong {
  font-weight: 600;
  color: #1f2937;
}

.content em {
  font-style: italic;
}

/* 内联代码区分 pre code */
.content :not(pre) > code {
  background: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.875em;
  color: #e11d48;
}

/* 长内容自动换行 */
.content p,
.content li {
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* Custom Input Panel */
.input-panel {
  background: #fff;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-weight: 500;
}

.use-example-btn {
  background: #e5e7eb;
  color: #374151;
  padding: 0.3rem 0.8rem;
  font-size: 0.8rem;
}

.use-example-btn:hover {
  background: #d1d5db;
}

.markdown-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: 'Fira Code', 'Monaco', monospace;
  font-size: 0.875rem;
  resize: vertical;
  line-height: 1.5;
}

.markdown-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Benchmark Panel */
.benchmark-toggle input {
  accent-color: #10b981;
}

.benchmark-panel {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  color: #f1f5f9;
}

.benchmark-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.benchmark-header h2 {
  font-size: 1.25rem;
  margin: 0;
}

.benchmark-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  padding: 0.5rem 1.5rem;
}

.benchmark-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

.benchmark-progress {
  height: 4px;
  background: #334155;
  border-radius: 2px;
  margin-bottom: 1rem;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #3b82f6);
  transition: width 0.3s ease;
}

.benchmark-results {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.benchmark-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.benchmark-card h3 {
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
  opacity: 0.9;
}

.benchmark-card.traditional {
  border-left: 3px solid #ef4444;
}

.benchmark-card.incremark {
  border-left: 3px solid #10b981;
}

.benchmark-card.speedup {
  border-left: 3px solid #3b82f6;
}

.benchmark-card .stat {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  margin: 0.25rem 0;
}

.benchmark-card .label {
  opacity: 0.7;
}

.benchmark-card .value {
  font-weight: 600;
}

.speedup-value {
  font-size: 2rem;
  font-weight: 700;
  color: #3b82f6;
}

.benchmark-note {
  font-size: 0.85rem;
  opacity: 0.7;
  margin: 0;
}

@media (max-width: 600px) {
  .benchmark-results {
    grid-template-columns: 1fr;
  }
}

/* ============ 打字机动画效果 ============ */

/* 渐入效果 - 使用 animation-delay 控制每个字符的动画时机 */
.incremark-fade-in {
  animation: incremark-fade-in 0.4s ease-out both;
}

@keyframes incremark-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 打字机光标效果 - 光标字符已直接添加到内容中 */
.content.effect-typing .incremark-block.incremark-pending {
  /* 光标字符已内嵌在内容中 */
}
</style>
