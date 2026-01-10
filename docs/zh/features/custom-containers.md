# 自定义容器

## Markdown 语法

```markdown
::: warning
这是一个警告
:::

::: info 标题
这是一个信息框
:::
```

## 定义容器组件

::: code-group
```vue [Vue]
<script setup>
import { IncremarkContent } from '@incremark/vue'
import WarningContainer from './WarningContainer.vue'
import InfoContainer from './InfoContainer.vue'
-
const customContainers = {
  warning: WarningContainer,
  info: InfoContainer
}
</script>

<template>
  <IncremarkContent
    :content="content"
    :incremark-options="{ containers: true }"
    :custom-containers="customContainers"
  />
</template>
```

```tsx [React]
import { IncremarkContent } from '@incremark/react'

function WarningContainer({ node, children }) {
  return (
    <div className="warning-box">
      <div className="warning-title">{node.title || 'Warning'}</div>
      <div className="warning-content">{children}</div>
    </div>
  )
}

const customContainers = {
  warning: WarningContainer
}

<IncremarkContent
  content={content}
  incremarkOptions={{ containers: true }}
  customContainers={customContainers}
/>
```

```svelte [Svelte]
<script lang="ts">
  import { IncremarkContent } from '@incremark/svelte'
  import WarningContainer from './WarningContainer.svelte'

  const customContainers = {
    warning: WarningContainer
  }
</script>

<IncremarkContent
  {content}
  incremarkOptions={{ containers: true }}
  {customContainers}
/>
```

```tsx [Solid]
import { IncremarkContent } from '@incremark/solid'

function WarningContainer(props: { node: any; children: any }) {
  return (
    <div class="warning-box">
      <div class="warning-title">{props.node.title || 'Warning'}</div>
      <div class="warning-content">{props.children}</div>
    </div>
  )
}

const customContainers = {
  warning: WarningContainer
}

<IncremarkContent
  content={content()}
  incremarkOptions={{ containers: true }}
  customContainers={customContainers}
/>
```
:::

## 容器组件 Props

| 属性 | 类型 | 说明 |
|---|---|---|
| `node` | `ContainerNode` | 容器节点 |
| `node.name` | `string` | 容器名称 (warning, info 等) |
| `node.title` | `string?` | 容器标题 |
| `children` | - | 容器内容 |
