# HTML 元素

Incremark 可以解析和渲染嵌入在 Markdown 中的原始 HTML 片段。

## 用法

启用 `htmlTree` 选项。

```markdown
这是 <b>粗体</b> ，这是 <span style="color: red">红色文本</span>。

<div>
  <h3>块级 HTML</h3>
  <p>HTML 块内的内容</p>
</div>
```

## 配置

::: code-group
```vue [Vue]
<script setup>
import { IncremarkContent } from '@incremark/vue'
</script>

<template>
  <IncremarkContent
    :content="content"
    :incremark-options="{ htmlTree: true }"
  />
</template>
```

```tsx [React]
import { IncremarkContent } from '@incremark/react'

<IncremarkContent
  content={content}
  incremarkOptions={{ htmlTree: true }}
/>
```

```svelte [Svelte]
<script lang="ts">
  import { IncremarkContent } from '@incremark/svelte'
</script>

<IncremarkContent {content} incremarkOptions={{ htmlTree: true }} />
```
:::

## 安全警告

⚠️ **XSS 风险**：启用 `htmlTree` 允许渲染任意 HTML。在将内容传递给 Incremark 之前，请确保内容来源可信或已净化。
