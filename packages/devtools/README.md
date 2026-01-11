# @incremark/devtools

Incremark 的开发者工具，框架无关。

🇨🇳 中文 | **[🇺🇸 English](./README.en.md)**

## 特性

- 🔍 **实时状态** - 查看解析状态、块列表、AST
- 📊 **时间线** - 记录每次 append 操作
- 🌐 **国际化** - 支持中英文界面
- 🎨 **主题** - 支持 dark/light 主题
- 📦 **框架无关** - 可在 Vue、React、Svelte、Solid 或原生 JS 中使用
- 🔌 **多解析器** - 同时监控多个 parser 实例

## 安装

```bash
pnpm add @incremark/devtools
```

## 使用

### 与 Vue 配合

```vue
<script setup>
import { createDevTools } from '@incremark/devtools'
import { IncremarkContent } from '@incremark/vue'
import { onMounted, onUnmounted } from 'vue'

const devtools = createDevTools({
  locale: 'zh-CN'
})

onMounted(() => {
  devtools.mount()
})

onUnmounted(() => {
  devtools.unmount()
})
</script>

<template>
  <IncremarkContent
    :content="markdown"
    :devtools="devtools"
    devtoolsId="main-parser"
    devtoolsLabel="主内容"
  />
</template>
```

### 与 React 配合

```tsx
import { createDevTools } from '@incremark/devtools'
import { IncremarkContent } from '@incremark/react'
import { useEffect, useRef } from 'react'

function App() {
  const devtools = useRef(createDevTools({
    locale: 'zh-CN'
  }))

  useEffect(() => {
    devtools.current.mount()
    return () => devtools.current.unmount()
  }, [])

  return (
    <IncremarkContent
      content={markdown}
      devtools={devtools.current}
      devtoolsId="main-parser"
      devtoolsLabel="主内容"
    />
  )
}
```

### 与 Svelte 配合

```svelte
<script lang="ts">
  import { createDevTools } from '@incremark/devtools'
  import { IncremarkContent } from '@incremark/svelte'
  import { onMount, onDestroy } from 'svelte'

  let devtools = createDevTools({
    locale: 'zh-CN'
  })

  onMount(() => {
    devtools.mount()
  })

  onDestroy(() => {
    devtools.unmount()
  })
</script>

<IncremarkContent
  {content}
  {devtools}
  devtoolsId="main-parser"
  devtoolsLabel="主内容"
/>
```

### 与 Solid 配合

```tsx
import { createDevTools } from '@incremark/devtools'
import { IncremarkContent } from '@incremark/solid'
import { onMount, onCleanup } from 'solid-js'

const devtools = createDevTools({
  locale: 'zh-CN'
})

onMount(() => {
  devtools.mount()
})

onCleanup(() => {
  devtools.unmount()
})

return (
  <IncremarkContent
    content={markdown()}
    devtools={devtools}
    devtoolsId="main-parser"
    devtoolsLabel="主内容"
  />
)
```

### 独立使用

```ts
import { createIncremarkParser } from '@incremark/core'
import { createDevTools } from '@incremark/devtools'

const parser = createIncremarkParser()
const devtools = createDevTools({
  locale: 'zh-CN'
})

devtools.mount()

// 注册 parser
devtools.register(parser, {
  id: 'my-parser',
  label: 'My Parser'
})

// 设置回调
parser.setOnChange((state) => {
  // DevTools 会自动更新
})

// 清理
devtools.unregister('my-parser')
devtools.unmount()
```

## API

### createDevTools(options?)

创建 DevTools 实例。

```ts
const devtools = createDevTools({
  open: false,                    // 初始是否打开面板
  position: 'bottom-right',       // 位置
  theme: 'dark',                  // 主题
  locale: 'zh-CN'                 // 语言: 'zh-CN' | 'en-US'
})
```

### devtools.mount()

挂载 DevTools 到 DOM。

```ts
devtools.mount()
```

### devtools.unmount()

从 DOM 卸载 DevTools。

```ts
devtools.unmount()
```

### devtools.register(parser, options)

注册一个 parser 实例。

```ts
devtools.register(parser, {
  id: 'unique-id',      // 唯一标识符
  label: 'Display Name' // 显示名称
})
```

### devtools.unregister(id)

注销指定的 parser。

```ts
devtools.unregister('unique-id')
```

### setLocale(locale)

动态设置 DevTools 语言。

```ts
import { setLocale } from '@incremark/devtools'

setLocale('zh-CN')  // 切换到中文
setLocale('en-US')  // 切换到英文
```

## 配置选项

```ts
interface DevToolsOptions {
  open?: boolean           // 初始是否打开面板，默认 false
  position?: Position      // 位置，默认 'bottom-right'
  theme?: 'dark' | 'light' // 主题，默认 'dark'
  locale?: Locale          // 语言，默认 'en-US'
}

type Position = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
type Locale = 'zh-CN' | 'en-US'
```

## 功能面板

| 面板 | 功能 |
|------|------|
| **Overview** | 显示字符数、块数量、节点类型分布、流式处理状态等统计 |
| **Blocks** | 查看所有解析出的块，包括块详情、状态、原始文本、AST 节点 |
| **AST** | JSON 格式的完整抽象语法树，可交互展开/折叠 |
| **Timeline** | append 操作历史，带时间戳和块数变化 |

## 类型

```ts
import type {
  IncremarkDevTools,
  DevToolsOptions,
  DevToolsState,
  AppendRecord,
  ParserRegistration,
  RegisterOptions,
  Locale,
  I18nMessages
} from '@incremark/devtools'
```

## License

MIT
