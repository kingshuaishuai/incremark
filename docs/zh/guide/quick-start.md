# 快速开始

在 5 分钟内完成特定框架的集成并运行。

## 安装

::: code-group
```bash [pnpm]
pnpm add @incremark/vue @incremark/theme
# 或
pnpm add @incremark/react @incremark/theme
# 或
pnpm add @incremark/svelte @incremark/theme
```

```bash [npm]
npm install @incremark/vue @incremark/theme
```

```bash [yarn]
yarn add @incremark/vue @incremark/theme
```
:::

## 基础用法

::: code-group
```vue [Vue]
<script setup>
import { ref } from 'vue'
import { IncremarkContent } from '@incremark/vue'
import '@incremark/theme/styles.css' // [!code hl]

const content = ref('')
const isFinished = ref(false)

async function simulateStream() {
  content.value = ''
  isFinished.value = false

  const text = '# Hello\n\nThis is **Incremark**!'
  for (const chunk of text.match(/[\s\S]{1,5}/g) || []) {
    content.value += chunk
    await new Promise(r => setTimeout(r, 50))
  }
  isFinished.value = true
}
</script>

<template>
  <button @click="simulateStream">Start</button>
  <IncremarkContent :content="content" :is-finished="isFinished" />
</template>
```

```tsx [React]
import { useState } from 'react'
import { IncremarkContent } from '@incremark/react'
import '@incremark/theme/styles.css' // [!code hl]

function App() {
  const [content, setContent] = useState('')
  const [isFinished, setIsFinished] = useState(false)

  async function simulateStream() {
    setContent('')
    setIsFinished(false)

    const text = '# Hello\n\nThis is **Incremark**!'
    let acc = ''
    for (const chunk of text.match(/[\s\S]{1,5}/g) || []) {
      acc += chunk
      setContent(acc)
      await new Promise(r => setTimeout(r, 50))
    }
    setIsFinished(true)
  }

  return (
    <>
      <button onClick={simulateStream}>Start</button>
      <IncremarkContent content={content} isFinished={isFinished} />
    </>
  )
}
```

```svelte [Svelte]
<script lang="ts">
  import { IncremarkContent } from '@incremark/svelte'
  import '@incremark/theme/styles.css' // [!code hl]

  let content = $state('')
  let isFinished = $state(false)

  async function simulateStream() {
    content = ''
    isFinished = false

    const text = '# Hello\n\nThis is **Incremark**!'
    for (const chunk of text.match(/[\s\S]{1,5}/g) || []) {
      content += chunk
      await new Promise(r => setTimeout(r, 50))
    }
    isFinished = true
  }
</script>

<button onclick={simulateStream}>Start</button>
<IncremarkContent {content} {isFinished} />
```
:::

## 使用流模式

```vue
<script setup>
import { IncremarkContent } from '@incremark/vue'

async function* fetchAIStream() {
  const res = await fetch('/api/chat', { method: 'POST' })
  const reader = res.body!.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    yield decoder.decode(value)
  }
}
</script>

<template>
  <IncremarkContent :stream="fetchAIStream" />
</template>
```

## 数学公式 (可选)

如果你需要支持数学公式 (Katex)，请确保也导入了 Katex 的 CSS：

```ts
import 'katex/dist/katex.min.css'
```

