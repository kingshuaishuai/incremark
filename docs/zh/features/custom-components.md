# 自定义组件

## 自定义节点渲染

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

## 组件类型

| 类型 | 节点 |
|---|---|
| `heading` | 标题 h1-h6 |
| `paragraph` | 段落 |
| `code` | 代码块 |
| `list` | 列表 |
| `listItem` | 列表项 |
| `table` | 表格 |
| `blockquote` | 引用 |
| `thematicBreak` | 分隔线 |
| `image` | 图片 |
| `link` | 链接 |
| `inlineCode` | 行内代码 |
