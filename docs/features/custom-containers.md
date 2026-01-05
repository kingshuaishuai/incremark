# Custom Containers

## Markdown Syntax

```markdown
::: warning
This is a warning
:::

::: info Title
This is an info box
:::
```

## Defining Container Components

::: code-group
```vue [Vue]
<script setup>
import { IncremarkContent } from '@incremark/vue'
import WarningContainer from './WarningContainer.vue'
import InfoContainer from './InfoContainer.vue'

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
:::

## Container Component Props

| Prop | Type | Description |
|---|---|---|
| `node` | `ContainerNode` | Container node |
| `node.name` | `string` | Container name (warning, info, etc.) |
| `node.title` | `string?` | Container title |
| `children` | - | Container content |
