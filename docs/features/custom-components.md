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
:::

## Component Types

| Type | Node |
|---|---|
| `heading` | Headings h1-h6 |
| `paragraph` | Paragraph |
| `code` | Code block |
| `list` | List |
| `listItem` | List item |
| `table` | Table |
| `blockquote` | Blockquote |
| `thematicBreak` | Divider |
| `image` | Image |
| `link` | Link |
| `inlineCode` | Inline code |
