# 打字机效果

## 启用打字机效果

::: code-group
```vue [Vue]
<script setup>
import { ref, computed } from 'vue'
import { IncremarkContent, type UseIncremarkOptions } from '@incremark/vue'

const content = ref('')
const isFinished = ref(false)

const options = computed<UseIncremarkOptions>(() => ({
  typewriter: {
    enabled: true,
    charsPerTick: [1, 3],
    tickInterval: 30,
    effect: 'typing'
  }
}))
</script>

<template>
  <IncremarkContent
    :content="content"
    :is-finished="isFinished"
    :incremark-options="options"
  />
</template>
```

```tsx [React]
import { IncremarkContent, UseIncremarkOptions } from '@incremark/react'

const options: UseIncremarkOptions = {
  typewriter: {
    enabled: true,
    charsPerTick: [1, 3],
    tickInterval: 30,
    effect: 'typing'
  }
}

<IncremarkContent
  content={content}
  isFinished={isFinished}
  incremarkOptions={options}
/>
```

```svelte [Svelte]
<script lang="ts">
  import { IncremarkContent, type UseIncremarkOptions } from '@incremark/svelte'

  let content = $state('')
  let isFinished = $state(false)

  const options: UseIncremarkOptions = {
    typewriter: {
      enabled: true,
      charsPerTick: [1, 3],
      tickInterval: 30,
      effect: 'typing'
    }
  }
</script>

<IncremarkContent {content} {isFinished} incremarkOptions={options} />
```
:::

## 配置

| 选项 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `enabled` | `boolean` | `false` | 启用打字机 |
| `charsPerTick` | `number \| [min, max]` | `2` | 每次显示的字符数 |
| `tickInterval` | `number` | `50` | 更新间隔 (ms) |
| `effect` | `'none' \| 'fade-in' \| 'typing'` | `'none'` | 动画效果 |
| `cursor` | `string` | `'\|'` | 光标字符 |

## 动画效果说明

- **none**：无动画，直接显示。
- **fade-in**：淡入效果，新字符透明度过渡。
- **typing**：打字机效果，带有光标。
