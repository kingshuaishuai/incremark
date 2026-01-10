# 自动滚动

## 使用 AutoScrollContainer

::: code-group
```vue [Vue]
<script setup>
import { ref } from 'vue'
import { IncremarkContent, AutoScrollContainer } from '@incremark/vue'

const content = ref('')
const isFinished = ref(false)
const scrollRef = ref()
</script>

<template>
  <AutoScrollContainer ref="scrollRef" :enabled="true" class="h-[500px]">
    <IncremarkContent :content="content" :is-finished="isFinished" />
  </AutoScrollContainer>
</template>
```

```tsx [React]
import { useRef } from 'react'
import { IncremarkContent, AutoScrollContainer } from '@incremark/react'

function App() {
  const scrollRef = useRef(null)

  return (
    <AutoScrollContainer ref={scrollRef} enabled className="h-[500px]">
      <IncremarkContent content={content} isFinished={isFinished} />
    </AutoScrollContainer>
  )
}
```

```svelte [Svelte]
<script lang="ts">
  import { IncremarkContent, AutoScrollContainer } from '@incremark/svelte'

  let content = $state('')
  let isFinished = $state(false)
</script>

<AutoScrollContainer enabled class="h-[500px]">
  <IncremarkContent {content} {isFinished} />
</AutoScrollContainer>
```

```tsx [Solid]
import { createSignal } from 'solid-js'
import { IncremarkContent, AutoScrollContainer } from '@incremark/solid'

function App() {
  const [content, setContent] = createSignal('')
  const [isFinished, setIsFinished] = createSignal(false)

  return (
    <AutoScrollContainer enabled class="h-[500px]">
      <IncremarkContent content={content()} isFinished={isFinished()} />
    </AutoScrollContainer>
  )
}
```
:::

## Props

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `enabled` | `boolean` | `true` |启用自动滚动 |
| `threshold` | `number` | `50` | 底部阈值（像素） |
| `behavior` | `ScrollBehavior` | `'instant'` | 滚动行为 |

## 暴露的方法

| 方法 | 说明 |
|---|---|
| `scrollToBottom()` | 强制滚动到底部 |
| `isUserScrolledUp()` | 用户是否手动向上滚动 |

## 行为说明

- 内容更新时自动滚动到底部。
- 用户向上滚动时暂停自动滚动。
- 用户滚动回底部时恢复自动滚动。
