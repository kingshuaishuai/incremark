# 自定义代码块

## 概述

Incremark 为代码块自定义提供了分层架构：

1. **customCodeBlocks**: 语言特定的自定义组件（最高优先级）
2. **内置 Mermaid**: 自动的 Mermaid 图表支持
3. **components['code']**: 自定义默认代码渲染
4. **默认**: 使用 Shiki 的内置语法高亮

## 自定义代码块渲染

适用于需要特殊渲染的场景，如 echarts、自定义图表等。

::: code-group
```vue [Vue]
<script setup>
import { IncremarkContent } from '@incremark/vue'
import EchartsBlock from './EchartsBlock.vue'
import PlantUMLBlock from './PlantUMLBlock.vue'

const customCodeBlocks = {
  echarts: EchartsBlock,
  plantuml: PlantUMLBlock
}

// 配置：是否在 pending 状态就开始渲染
const codeBlockConfigs = {
  echarts: { takeOver: true }  // 即使在 pending 状态也渲染
}
</script>

<template>
  <IncremarkContent
    :content="content"
    :custom-code-blocks="customCodeBlocks"
    :code-block-configs="codeBlockConfigs"
  />
</template>
```

```tsx [React]
import { IncremarkContent } from '@incremark/react'

function EchartsBlock({ codeStr, lang, completed, takeOver }) {
  // codeStr 是代码内容
  // lang 是语言标识符
  // completed 表示代码块是否完成
  return <div className="echarts">{codeStr}</div>
}

const customCodeBlocks = {
  echarts: EchartsBlock
}

<IncremarkContent
  content={content}
  customCodeBlocks={customCodeBlocks}
/>
```

```svelte [Svelte]
<script lang="ts">
  import { IncremarkContent } from '@incremark/svelte'
  import EchartsBlock from './EchartsBlock.svelte'

  const customCodeBlocks = {
    echarts: EchartsBlock
  }
</script>

<IncremarkContent {content} {customCodeBlocks} />
```
:::

## 自定义代码块 Props

创建自定义代码块组件时，你的组件将接收以下 props：

| Prop | 类型 | 说明 |
|---|---|---|
| `codeStr` | `string` | 代码内容 |
| `lang` | `string` | 语言标识符 |
| `completed` | `boolean` | 代码块是否完成 |
| `takeOver` | `boolean` | 是否启用 takeOver 模式 |

## codeBlockConfigs

| 选项 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `takeOver` | `boolean` | `false` | 是否在 pending 状态接管渲染 |

## 内置 Mermaid 支持

::: tip
Mermaid 图表开箱即用！无需任何配置。
:::

Incremark 自动渲染 Mermaid 图表，具备以下特性：
- 流式输入时的防抖渲染
- 预览/源码切换
- 复制功能
- 默认深色主题

```markdown
\`\`\`mermaid
graph TD
    A[开始] --> B{能用吗?}
    B -->|是| C[太棒了!]
    B -->|否| D[调试]
    D --> A
\`\`\`
```

如果你想覆盖内置的 Mermaid 渲染，使用 `customCodeBlocks`：

::: code-group
```vue [Vue]
<script setup>
import { IncremarkContent } from '@incremark/vue'
import MyMermaidBlock from './MyMermaidBlock.vue'

const customCodeBlocks = {
  mermaid: MyMermaidBlock  // 覆盖内置 Mermaid
}
</script>

<template>
  <IncremarkContent
    :content="content"
    :custom-code-blocks="customCodeBlocks"
  />
</template>
```
:::

## 与 components['code'] 的对比

| 特性 | customCodeBlocks | components['code'] |
|---|---|---|
| 作用范围 | 特定语言 | 所有代码块（作为回退） |
| 优先级 | 最高 | 低于 customCodeBlocks 和 Mermaid |
| 使用场景 | 特殊渲染（echarts、图表） | 自定义语法高亮主题 |
| Props | `codeStr`, `lang`, `completed`, `takeOver` | `node`, `theme`, `fallbackTheme`, `disableHighlight` |

更多关于 `components['code']` 的详情请参见[自定义组件](/zh/features/custom-components)。
