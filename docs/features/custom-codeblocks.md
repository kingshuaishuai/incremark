# Custom Code Blocks

## Custom Code Block Rendering

Useful for specialized rendering like mermaid, echarts, etc.

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

// Config: whether to render while pending
const codeBlockConfigs = {
  echarts: { takeOver: true }  // Render even when pending
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
  // node.value is code content
  // node.lang is language identifier
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

| Option | Type | Default | Description |
|---|---|---|---|
| `takeOver` | `boolean` | `false` | Take over rendering while pending |
