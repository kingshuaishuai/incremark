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

```tsx [Solid]
import { IncremarkContent } from '@incremark/solid'
import CustomHeading from './CustomHeading'

const components = {
  heading: CustomHeading
}

<IncremarkContent content={content()} components={components} />
```
:::

## 组件类型

| 类型 | 节点 |
|---|---|
| `heading` | 标题 h1-h6 |
| `paragraph` | 段落 |
| `code` | 代码块（仅默认渲染） |
| `list` | 列表 |
| `listItem` | 列表项 |
| `table` | 表格 |
| `blockquote` | 引用 |
| `thematicBreak` | 分隔线 |
| `image` | 图片 |
| `link` | 链接 |
| `inlineCode` | 行内代码 |

## 代码组件行为

::: tip 重要提示
当自定义 `code` 组件时，它只会替换**默认的代码块渲染**。内置的 Mermaid 支持和 `customCodeBlocks` 逻辑会被保留。
:::

代码块渲染遵循以下优先级：

1. **customCodeBlocks**: 语言特定的自定义组件（如 `echarts`、`mermaid`）
2. **内置 Mermaid**: 自动的 Mermaid 图表渲染
3. **components['code']**: 自定义的默认代码块（如果提供）
4. **默认**: 使用 Shiki 的内置语法高亮

这意味着：
- 如果你设置 `components: { code: MyCodeBlock }`，它只影响普通代码块
- Mermaid 图表仍然会使用内置的 Mermaid 渲染器
- `customCodeBlocks` 配置具有更高的优先级

::: code-group
```vue [Vue]
<script setup>
import { IncremarkContent } from '@incremark/vue'
import MyCodeBlock from './MyCodeBlock.vue'

// 这只会替换默认的代码渲染
// Mermaid 和 customCodeBlocks 不受影响
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
:::

### 自定义代码组件 Props

创建自定义代码组件时，你的组件将接收以下 props：

| Prop | 类型 | 说明 |
|---|---|---|
| `node` | `Code` | 来自 mdast 的代码节点 |
| `theme` | `string` | Shiki 主题名称 |
| `fallbackTheme` | `string` | 加载失败时的回退主题 |
| `disableHighlight` | `boolean` | 是否禁用语法高亮 |

`node` 对象包含：
- `node.value`: 代码内容字符串
- `node.lang`: 语言标识符（如 `'typescript'`、`'python'`）
- `node.meta`: 语言标识符后的可选元数据
