# 脚注

Incremark 开箱即支持 GFM 脚注。

## 用法

在配置中启用 `gfm` 选项。

```markdown
这是一个脚注引用[^1]。

[^1]: 这是脚注定义。
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
    :incremark-options="{ gfm: true }"
  />
</template>
```

```tsx [React]
import { IncremarkContent } from '@incremark/react'

<IncremarkContent
  content={content}
  incremarkOptions={{ gfm: true }}
/>
```

```svelte [Svelte]
<script lang="ts">
  import { IncremarkContent } from '@incremark/svelte'
</script>

<IncremarkContent {content} incremarkOptions={{ gfm: true }} />
```
:::

## 渲染

脚注会自动收集并渲染在内容底部。您可以使用 CSS 自定义外观，或通过覆盖 `footnoteDefinition` 组件来自定义。
