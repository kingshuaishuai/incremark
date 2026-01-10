# Custom Components

## Custom Node Rendering

::: code-group
```vue [Vue]
<script setup>
import { h } from 'vue'
import { IncremarkContent } from '@incremark/vue'

const CustomHeading = {
  props: ['node'],
  setup(props) {
    const level = props.node.depth
    return () => h(`h${level}`, { class: 'my-heading' }, props.node.children)
  }
}

const components = {
  heading: CustomHeading
}
</script>

<template>
  <IncremarkContent :content="content" :components="components" />
</template>
```

```tsx [React]
import { IncremarkContent } from '@incremark/react'

function CustomHeading({ node, children }) {
  const Tag = `h${node.depth}` as keyof JSX.IntrinsicElements
  return <Tag className="my-heading">{children}</Tag>
}

const components = {
  heading: CustomHeading
}

<IncremarkContent content={content} components={components} />
```

```svelte [Svelte]
<script lang="ts">
  import { IncremarkContent } from '@incremark/svelte'
  import CustomHeading from './CustomHeading.svelte'

  const components = {
    heading: CustomHeading
  }
</script>

<IncremarkContent {content} {components} />
```

```tsx [Solid]
import { IncremarkContent } from '@incremark/solid'
import CustomHeading from './CustomHeading'

const components = {
  heading: CustomHeading
}

<IncremarkContent content={content()} components={components} />
```
:::

## Component Types

| Type | Node |
|---|---|
| `heading` | Headings h1-h6 |
| `paragraph` | Paragraph |
| `code` | Code block (default rendering only) |
| `list` | List |
| `listItem` | List item |
| `table` | Table |
| `blockquote` | Blockquote |
| `thematicBreak` | Divider |
| `image` | Image |
| `link` | Link |
| `inlineCode` | Inline code |

## Code Component Behavior

::: tip Important
When customizing the `code` component, it only replaces the **default code block rendering**. The built-in Mermaid support and `customCodeBlocks` logic are preserved.
:::

The code block rendering follows this priority:

1. **customCodeBlocks**: Language-specific custom components (e.g., `echarts`, `mermaid`)
2. **Built-in Mermaid**: Automatic Mermaid diagram rendering
3. **components['code']**: Custom default code block (if provided)
4. **Default**: Built-in syntax highlighting with Shiki

This means:
- If you set `components: { code: MyCodeBlock }`, it only affects regular code blocks
- Mermaid diagrams will still use the built-in Mermaid renderer
- `customCodeBlocks` configurations take precedence

::: code-group
```vue [Vue]
<script setup>
import { IncremarkContent } from '@incremark/vue'
import MyCodeBlock from './MyCodeBlock.vue'

// This only replaces default code rendering
// Mermaid and customCodeBlocks are not affected
const components = {
  code: MyCodeBlock
}
</script>

<template>
  <IncremarkContent :content="content" :components="components" />
</template>
```

```tsx [React]
import { IncremarkContent } from '@incremark/react'

function MyCodeBlock({ node }) {
  return (
    <pre className="my-code">
      <code>{node.value}</code>
    </pre>
  )
}

const components = {
  code: MyCodeBlock
}

<IncremarkContent content={content} components={components} />
```

```svelte [Svelte]
<script lang="ts">
  import { IncremarkContent } from '@incremark/svelte'
  import MyCodeBlock from './MyCodeBlock.svelte'

  const components = {
    code: MyCodeBlock
  }
</script>

<IncremarkContent {content} {components} />
```

```tsx [Solid]
import { IncremarkContent } from '@incremark/solid'

function MyCodeBlock(props: { node: any }) {
  return (
    <pre class="my-code">
      <code>{props.node.value}</code>
    </pre>
  )
}

const components = {
  code: MyCodeBlock
}

<IncremarkContent content={content()} components={components} />
```
:::

### Custom Code Component Props

When creating a custom code component, your component will receive these props:

| Prop | Type | Description |
|---|---|---|
| `node` | `Code` | The code node from mdast |
| `theme` | `string` | Shiki theme name |
| `fallbackTheme` | `string` | Fallback theme when loading fails |
| `disableHighlight` | `boolean` | Whether to disable syntax highlighting |

The `node` object contains:
- `node.value`: The code content as a string
- `node.lang`: The language identifier (e.g., `'typescript'`, `'python'`)
- `node.meta`: Optional metadata after the language identifier
