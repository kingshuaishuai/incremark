# 自定义代码块

## 自定义代码块渲染

适用于需要特殊渲染的场景，如 mermaid、echarts 等。

::: code-group
```vue [Vue]
<script setup>
import { IncremarkContent } from '@incremark/vue'
import MermaidBlock from './MermaidBlock.vue'
import EchartsBlock from './EchartsBlock.vue'

const customCodeBlocks = {
  mermaid: MermaidBlock,
  echarts: EchartsBlock
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

function MermaidBlock({ node }) {
  // node.value 是代码内容
  // node.lang 是语言标识符
  return <div className="mermaid">{node.value}</div>
}

const customCodeBlocks = {
  mermaid: MermaidBlock
}

<IncremarkContent
  content={content}
  customCodeBlocks={customCodeBlocks}
/>
```

```svelte [Svelte]
<script lang="ts">
  import { IncremarkContent } from '@incremark/svelte'
  import MermaidBlock from './MermaidBlock.svelte'

  const customCodeBlocks = {
    mermaid: MermaidBlock
  }
</script>

<IncremarkContent {content} {customCodeBlocks} />
```
:::

## codeBlockConfigs

| 选项 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `takeOver` | `boolean` | `false` | 是否在 pending 状态接管渲染 |
