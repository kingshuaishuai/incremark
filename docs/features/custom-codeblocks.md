# Custom Code Blocks

## Overview

Incremark provides a layered architecture for code block customization:

1. **customCodeBlocks**: Language-specific custom components (highest priority)
2. **Built-in Mermaid**: Automatic Mermaid diagram support
3. **components['code']**: Custom default code rendering
4. **Default**: Built-in Shiki syntax highlighting

## Custom Code Block Rendering

Useful for specialized rendering like echarts, custom diagrams, etc.

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

function EchartsBlock({ codeStr, lang, completed, takeOver }) {
  // codeStr is code content
  // lang is language identifier
  // completed indicates if the block is complete
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

## Custom Code Block Props

When creating a custom code block component, your component will receive these props:

| Prop | Type | Description |
|---|---|---|
| `codeStr` | `string` | The code content |
| `lang` | `string` | Language identifier |
| `completed` | `boolean` | Whether the block is complete |
| `takeOver` | `boolean` | Whether takeOver mode is enabled |

## codeBlockConfigs

| Option | Type | Default | Description |
|---|---|---|---|
| `takeOver` | `boolean` | `false` | Take over rendering while pending |

## Built-in Mermaid Support

::: tip
Mermaid diagrams are supported out of the box! No configuration needed.
:::

Incremark automatically renders Mermaid diagrams with:
- Debounced rendering for streaming input
- Preview/source toggle
- Copy functionality
- Dark theme by default

```markdown
\`\`\`mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> A
\`\`\`
```

If you want to override the built-in Mermaid rendering, use `customCodeBlocks`:

::: code-group
```vue [Vue]
<script setup>
import { IncremarkContent } from '@incremark/vue'
import MyMermaidBlock from './MyMermaidBlock.vue'

const customCodeBlocks = {
  mermaid: MyMermaidBlock  // Override built-in Mermaid
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

## Comparison with components['code']

| Feature | customCodeBlocks | components['code'] |
|---|---|---|
| Scope | Specific languages | All code blocks (fallback) |
| Priority | Highest | Lower than customCodeBlocks and Mermaid |
| Use case | Specialized rendering (echarts, diagrams) | Custom syntax highlighting theme |
| Props | `codeStr`, `lang`, `completed`, `takeOver` | `node`, `theme`, `fallbackTheme`, `disableHighlight` |

See [Custom Components](/features/custom-components) for more details on `components['code']`.
