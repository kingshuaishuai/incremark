# 打字机效果

Incremark 提供内置的打字机效果支持，逐字显示 AI 输出内容，模拟真实打字体验。

## 特性

- ✅ **流畅动画** - 基于 `requestAnimationFrame` 实现
- ✅ **随机步长** - 支持 `charsPerTick: [1, 3]` 实现自然打字
- ✅ **动画效果** - 支持 `typing` 光标和 `fade-in` 渐入效果
- ✅ **自动暂停** - 页面不可见时自动暂停
- ✅ **插件系统** - 自定义特殊节点处理
- ✅ **跨框架** - 框架无关核心，Vue/React 适配器
- ✅ **简单集成** - 内置于 `useIncremark`，无需单独 hook

## 快速开始

打字机效果现已集成到 `useIncremark` 中，只需传入 `typewriter` 配置即可：

### Vue

```vue
<script setup>
import { useIncremark, Incremark } from '@incremark/vue'

const { blocks, append, finalize, reset, typewriter } = useIncremark({
  gfm: true,
  typewriter: {
    enabled: true,
    charsPerTick: [1, 3],  // 每次随机 1-3 个字符
    tickInterval: 30,       // 30ms 间隔
    effect: 'typing',       // 'none' | 'fade-in' | 'typing'
    cursor: '|'             // 光标字符
  }
})
</script>

<template>
  <div :class="['content', `effect-${typewriter.effect.value}`]">
    <!-- blocks 已包含打字机效果！ -->
    <Incremark :blocks="blocks" />
  </div>
  
  <!-- 控制按钮 -->
  <button v-if="typewriter.isProcessing.value" @click="typewriter.skip">
    跳过
  </button>
  <button v-if="typewriter.isPaused.value" @click="typewriter.resume">
    继续
  </button>
</template>
```

### React

```tsx
import { useIncremark, Incremark } from '@incremark/react'

function App() {
  const { blocks, append, finalize, reset, typewriter } = useIncremark({
    gfm: true,
    typewriter: {
      enabled: true,
      charsPerTick: [1, 3],
      tickInterval: 30,
      effect: 'typing',
      cursor: '|'
    }
  })

  return (
    <div className={`content effect-${typewriter.effect}`}>
      {/* blocks 已包含打字机效果！ */}
      <Incremark blocks={blocks} />
      
      {typewriter.isProcessing && (
        <button onClick={typewriter.skip}>跳过</button>
      )}
    </div>
  )
}
```

## 动画效果

Incremark 支持三种动画效果：

### 1. 无效果 (`effect: 'none'`)

无视觉效果，只是逐字显示。

### 2. 打字光标 (`effect: 'typing'`)

在当前打字块末尾显示光标字符。

```css
/* 光标嵌入在内容中，可以自定义 pending 块样式 */
.effect-typing .incremark-pending {
  /* 可选样式 */
}
```

### 3. 渐入效果 (`effect: 'fade-in'`) ✨ 新增

每个新显示的字符段都会平滑渐入，创造优美流畅的动画效果。

```css
/* 渐入动画通过 .incremark-fade-in 类内置 */
.content.effect-fade-in .incremark-fade-in {
  animation: incremark-fade-in 0.3s ease-out forwards;
}

@keyframes incremark-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

渐入效果的工作原理：
1. 跟踪显示的字符 "chunks"
2. 每个 chunk 用 `<span class="incremark-fade-in">` 包裹
3. 每个 span 有基于创建时间的唯一 key，确保并发动画流畅

## 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|-----|------|-------|------|
| `enabled` | `boolean` | `true` | 启用/禁用打字机（可运行时切换） |
| `charsPerTick` | `number \| [number, number]` | `[1, 3]` | 每次显示字符数，数组表示随机范围 |
| `tickInterval` | `number` | `30` | 间隔毫秒 |
| `effect` | `'none' \| 'fade-in' \| 'typing'` | `'none'` | 动画效果 |
| `cursor` | `string` | `'|'` | 光标字符（仅 `typing` 效果） |
| `pauseOnHidden` | `boolean` | `true` | 页面不可见时暂停 |
| `plugins` | `TransformerPlugin[]` | `defaultPlugins` | 插件列表（自动包含） |

## 动态配置

可以在运行时更新打字机设置：

### Vue

```vue
<script setup>
const { typewriter } = useIncremark({
  typewriter: { enabled: false }  // 初始禁用
})

// 切换启用状态
typewriter.enabled.value = true

// 更新选项
typewriter.setOptions({
  charsPerTick: [2, 5],
  tickInterval: 20,
  effect: 'fade-in'
})
</script>
```

### React

```tsx
const { typewriter } = useIncremark({
  typewriter: { enabled: false }
})

// 切换启用状态
typewriter.setEnabled(true)

// 更新选项
typewriter.setOptions({
  charsPerTick: [2, 5],
  tickInterval: 20,
  effect: 'fade-in'
})
```

## 打字机控制

`typewriter` 对象提供以下控制：

| 属性/方法 | Vue 类型 | React 类型 | 说明 |
|----------|---------|-----------|------|
| `enabled` | `Ref<boolean>` | `boolean` | 是否启用 |
| `setEnabled` | - | `(enabled: boolean) => void` | 设置启用状态（React） |
| `isProcessing` | `ComputedRef<boolean>` | `boolean` | 是否正在动画 |
| `isPaused` | `ComputedRef<boolean>` | `boolean` | 是否暂停 |
| `effect` | `ComputedRef<AnimationEffect>` | `AnimationEffect` | 当前效果 |
| `skip()` | `Function` | `Function` | 跳过所有动画 |
| `pause()` | `Function` | `Function` | 暂停动画 |
| `resume()` | `Function` | `Function` | 恢复动画 |
| `setOptions()` | `Function` | `Function` | 动态更新选项 |

## 速度示例

| 场景 | charsPerTick | tickInterval | 效果 |
|-----|--------------|--------------|------|
| 慢速打字 | 1 | 100 | 每 100ms 1 个字符 |
| 正常速度 | 2 | 50 | 每 50ms 2 个字符 |
| 自然打字 | [1, 3] | 30 | 每 30ms 随机 1-3 个字符 |
| 快速输出 | 5 | 30 | 每 30ms 5 个字符 |
| 极速模式 | 10 | 10 | 每 10ms 10 个字符 |

## 插件系统

### 默认插件（自动包含）

默认情况下，`useIncremark` 包含 `defaultPlugins`：
- `imagePlugin` - 图片立即显示（无文本内容）
- `thematicBreakPlugin` - 分割线立即显示（无文本内容）

### 全部插件

如果希望代码块、mermaid、数学公式整体显示：

```ts
import { allPlugins } from '@incremark/vue'  // 或 @incremark/react

const { blocks } = useIncremark({
  typewriter: {
    plugins: allPlugins  // 覆盖默认插件
  }
})
```

`allPlugins` 包含：
- `imagePlugin` - 图片立即显示
- `thematicBreakPlugin` - 分割线立即显示
- `codeBlockPlugin` - 代码块整体显示
- `mermaidPlugin` - Mermaid 图表整体显示
- `mathPlugin` - 数学公式整体显示

### 自定义插件

```ts
import { createPlugin } from '@incremark/vue'

// 让表格整体显示
const tablePlugin = createPlugin(
  'table',
  (node) => node.type === 'table',
  {
    countChars: () => 1,  // 计为 1 个字符
    sliceNode: (node, displayed, total) => displayed >= total ? node : null
  }
)

const { blocks } = useIncremark({
  typewriter: {
    plugins: [tablePlugin]  // 自定义插件（defaultPlugins 仍然包含）
  }
})
```

## 配合自动滚动

打字机效果通常需要自动滚动：

```vue
<script setup>
import { useIncremark, Incremark, AutoScrollContainer } from '@incremark/vue'

const { blocks, typewriter } = useIncremark({
  typewriter: { effect: 'fade-in' }
})
</script>

<template>
  <AutoScrollContainer class="content">
    <Incremark :blocks="blocks" />
  </AutoScrollContainer>
</template>

<style>
.content {
  max-height: 70vh;
  overflow: hidden;
}
</style>
```

详见 [自动滚动](./auto-scroll) 指南。

## 工作原理

```
解析器 (生产者) → BlockTransformer (中间件) → UI (消费者)
     ↓                      ↓                     ↓
   解析块              控制显示速度           渲染 displayBlocks
```

BlockTransformer 作为解析器和渲染器之间的中间件：
- **消费者角色**：消费解析器的 `completedBlocks`
- **生产者角色**：为 UI 产出 `displayBlocks`
- **核心功能**：控制每次显示字符数和间隔时间

## 高级：使用 useBlockTransformer

对于高级用例，仍可单独使用 `useBlockTransformer`：

```ts
import { useIncremark, useBlockTransformer } from '@incremark/vue'

const { completedBlocks } = useIncremark()

const sourceBlocks = computed(() => 
  completedBlocks.value.map(block => ({
    id: block.id,
    node: block.node,
    status: block.status
  }))
)

const { displayBlocks, isProcessing, skip } = useBlockTransformer(sourceBlocks, {
  charsPerTick: [1, 3],
  effect: 'fade-in'
})
```

## 下一步

- [自动滚动](./auto-scroll) - AutoScrollContainer 使用指南
- [自定义组件](./custom-components) - 自定义渲染组件
- [API 参考](/api/vue) - 完整 API 文档
