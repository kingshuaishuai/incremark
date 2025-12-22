# 自定义组件

Incremark 支持自定义渲染组件，覆盖默认的渲染行为。

## 组件映射

通过 `components` prop 传入自定义组件：

::: code-group

```vue [Vue]
<script setup>
import { useIncremark, Incremark } from '@incremark/vue'
import MyHeading from './MyHeading.vue'

const { blocks } = useIncremark()

const components = {
  heading: MyHeading
}
</script>

<template>
  <Incremark :blocks="blocks" :components="components" />
</template>
```

```tsx [React]
import { useIncremark, Incremark } from '@incremark/react'
import MyHeading from './MyHeading'

function App() {
  const { blocks } = useIncremark()
  
  const components = {
    heading: MyHeading
  }
  
  return <Incremark blocks={blocks} components={components} />
}
```

```svelte [Svelte]
<script lang="ts">
  import { useIncremark, Incremark } from '@incremark/svelte'
  import MyHeading from './MyHeading.svelte'

  const incremark = useIncremark()
  const { blocks } = incremark

  const components = {
    heading: MyHeading
  }
</script>

<Incremark {blocks} components={components} />
```

:::

## 支持的节点类型

| 类型 | 说明 | node 属性 |
|------|------|-----------|
| `heading` | 标题 | `depth`, `children` |
| `paragraph` | 段落 | `children` |
| `code` | 代码块 | `lang`, `value` |
| `list` | 列表 | `ordered`, `children` |
| `blockquote` | 引用 | `children` |
| `table` | 表格 | `children` |
| `thematicBreak` | 分隔线 | - |
| `math` | 数学公式 | `value` |
| `inlineMath` | 行内公式 | `value` |

## 示例：自定义代码块

带语法高亮和复制按钮的代码块：

::: code-group

```vue [Vue]
<!-- CustomCode.vue -->
<script setup>
import { ref, computed, onMounted } from 'vue'
import { codeToHtml } from 'shiki'

const props = defineProps<{
  node: { lang?: string; value: string }
}>()

const html = ref('')
const copied = ref(false)

onMounted(async () => {
  html.value = await codeToHtml(props.node.value, {
    lang: props.node.lang || 'text',
    theme: 'github-dark'
  })
})

async function copy() {
  await navigator.clipboard.writeText(props.node.value)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}
</script>

<template>
  <div class="code-block">
    <div class="header">
      <span>{{ node.lang }}</span>
      <button @click="copy">{{ copied ? '✓' : '复制' }}</button>
    </div>
    <div v-html="html" />
  </div>
</template>
```

```tsx [React]
// CustomCode.tsx
import { useState, useEffect } from 'react'
import { codeToHtml } from 'shiki'

export function CustomCode({ node }) {
  const [html, setHtml] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    codeToHtml(node.value, {
      lang: node.lang || 'text',
      theme: 'github-dark'
    }).then(setHtml)
  }, [node.value, node.lang])

  const copy = async () => {
    await navigator.clipboard.writeText(node.value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="code-block">
      <div className="header">
        <span>{node.lang}</span>
        <button onClick={copy}>{copied ? '✓' : '复制'}</button>
      </div>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
```

```svelte [Svelte]
<!-- CustomCode.svelte -->
<script lang="ts">
  import { onMount } from 'svelte'
  import { codeToHtml } from 'shiki'

  interface Props {
    node: { lang?: string; value: string }
  }

  let { node }: Props = $props()

  let html = $state('')
  let copied = $state(false)

  onMount(async () => {
    html = await codeToHtml(node.value, {
      lang: node.lang || 'text',
      theme: 'github-dark'
    })
  })

  async function copy() {
    await navigator.clipboard.writeText(node.value)
    copied = true
    setTimeout(() => copied = false, 2000)
  }
</script>

<div class="code-block">
  <div class="header">
    <span>{node.lang}</span>
    <button on:click={copy}>{copied ? '✓' : '复制'}</button>
  </div>
  {@html html}
</div>
```

:::

## 示例：Mermaid 图表

```vue
<!-- MermaidBlock.vue -->
<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{
  node: { lang: string; value: string }
}>()

const svgRef = ref<HTMLDivElement>()
const error = ref('')

async function render() {
  if (props.node.lang !== 'mermaid') return
  
  try {
    const mermaid = (await import('mermaid')).default
    mermaid.initialize({ startOnLoad: false })
    
    const { svg } = await mermaid.render('mermaid-' + Date.now(), props.node.value)
    if (svgRef.value) {
      svgRef.value.innerHTML = svg
    }
  } catch (e) {
    error.value = e.message
  }
}

onMounted(render)
watch(() => props.node.value, render)
</script>

<template>
  <div v-if="node.lang === 'mermaid'" class="mermaid-block">
    <div v-if="error" class="error">{{ error }}</div>
    <div v-else ref="svgRef" />
  </div>
  <!-- 其他代码块回退到默认渲染 -->
  <pre v-else><code>{{ node.value }}</code></pre>
</template>
```

## 访问上下文

自定义组件可以访问父级上下文：

::: code-group

```vue [Vue]
<!-- 父组件 -->
<script setup>
import { provide } from 'vue'

provide('incremark-theme', 'dark')
</script>

<!-- 子组件 -->
<script setup>
import { inject } from 'vue'

const theme = inject('incremark-theme', 'light')
</script>
```

```tsx [React]
// 父组件
import { createContext, useContext } from 'react'

const ThemeContext = createContext('light')

function Parent() {
  return (
    <ThemeContext.Provider value="dark">
      <Incremark blocks={blocks} />
    </ThemeContext.Provider>
  )
}

// 子组件
function CustomComponent() {
  const theme = useContext(ThemeContext)
  return <div className={`theme-${theme}`}>...</div>
}
```

```svelte [Svelte]
<!-- 父组件 -->
<script lang="ts">
  import { setContext } from 'svelte'
  
  setContext('incremark-theme', 'dark')
</script>

<!-- 子组件 -->
<script lang="ts">
  import { getContext } from 'svelte'
  
  const theme = getContext('incremark-theme') || 'light'
</script>
```

:::

