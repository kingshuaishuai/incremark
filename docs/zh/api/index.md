# API 参考文档

Incremark 所有类型和组件的集中参考。

## 组件 (Components)

### `<IncremarkContent />`

渲染 Markdown 内容的主要组件。

**Props (`IncremarkContentProps`)**:

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `content` | `string` | - | 要渲染的 Markdown 字符串（content 模式）。 |
| `stream` | `() => AsyncGenerator<string>` | - | 用于流式内容的异步生成器函数（stream 模式）。 |
| `isFinished` | `boolean` | `false` | 内容生成是否完成（content 模式必需）。 |
| `incremarkOptions` | `UseIncremarkOptions` | - | 解析器和打字机效果的配置选项。 |
| `components` | `ComponentMap` | `{}` | 自定义组件，用于覆盖默认元素的渲染。 |
| `customContainers` | `Record<string, Component>` | `{}` | 用于 `::: name` 语法的自定义容器组件。 |
| `customCodeBlocks` | `Record<string, Component>` | `{}` | 特定语言的自定义代码块组件。 |
| `codeBlockConfigs` | `Record<string, CodeBlockConfig>` | `{}` | 代码块配置（例如 `takeOver`）。 |
| `showBlockStatus` | `boolean` | `false` | 是否可视化块的处理状态（pending/completed）。 |
| `pendingClass` | `string` | `'incremark-pending'` | 应用于 pending 状态块的 CSS 类。 |

### `<AutoScrollContainer />`

当内容更新时自动滚动到底部的容器组件。

**Props**:

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | `boolean` | `true` | 是否启用自动滚动功能。 |
| `threshold` | `number` | `50` | 触发自动滚动的底部距离阈值（像素）。 |
| `behavior` | `ScrollBehavior` | `'instant'` | 滚动行为 (`'auto'`, `'smooth'`, `'instant'`)。 |

## 组合式函数 / Hooks

### `useIncremark`

用于高级用法和细粒度控制的核心 Hook。

**选项 (`UseIncremarkOptions`)**:

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `gfm` | `boolean` | `true` | 启用 GitHub Flavored Markdown 支持。 |
| `math` | `boolean` | `true` | 启用数学公式 (KaTeX) 支持。 |
| `htmlTree` | `boolean` | `true` | 启用原始 HTML 标签解析。 |
| `containers` | `boolean` | `true` | 启用自定义容器语法 `:::`。 |
| `typewriter` | `TypewriterOptions` | - | 打字机效果配置。 |

**返回值 (`UseIncremarkReturn`)**:

| 属性 | 类型 | 说明 |
|------|------|------|
| `blocks` | `Ref<Block[]>` | 具有稳定 ID 的解析块响应式数组。 |
| `append` | `(chunk: string) => void` | 向解析器追加新的内容块。 |
| `render` | `(content: string) => void` | 渲染完整或更新的内容字符串。 |
| `reset` | `() => void` | 重置解析器状态并清空所有块。 |
| `finalize` | `() => void` | 将所有块标记为已完成。 |
| `isDisplayComplete` | `Ref<boolean>` | 打字机效果是否已显示完所有内容。 |

## 配置类型

### `TypewriterOptions`

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | `boolean` | `false` | 启用打字机效果。 |
| `charsPerTick` | `number \| [number, number]` | `2` | 每次显示的字符数（或范围）。 |
| `tickInterval` | `number` | `50` | 更新间隔（毫秒）。 |
| `effect` | `'none' \| 'fade-in' \| 'typing'` | `'none'` | 动画风格。 |
| `cursor` | `string` | `'|'` | 打字效果的光标字符。 |
