# Typewriter Effect

## Enable Typewriter Effect

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

```tsx [Solid]
import { createSignal } from 'solid-js'
import { IncremarkContent, type UseIncremarkOptions } from '@incremark/solid'

function App() {
  const [content, setContent] = createSignal('')
  const [isFinished, setIsFinished] = createSignal(false)

  const options: UseIncremarkOptions = {
    typewriter: {
      enabled: true,
      charsPerTick: [1, 3],
      tickInterval: 30,
      effect: 'typing'
    }
  }

  return (
    <IncremarkContent
      content={content()}
      isFinished={isFinished()}
      incremarkOptions={options}
    />
  )
}
```
:::

## Configuration

| Option | Type | Default | Description |
|---|---|---|---|
| `enabled` | `boolean` | `false` | Enable typewriter |
| `charsPerTick` | `number \| [min, max]` | `2` | Characters per tick |
| `tickInterval` | `number` | `50` | Update interval (ms) |
| `effect` | `'none' \| 'fade-in' \| 'typing'` | `'none'` | Animation effect |
| `cursor` | `string` | `'\|'` | Cursor character |

## Animation Effects

- **none**: No animation, display immediately.
- **fade-in**: Fade in effect, new characters opacity transition.
- **typing**: Typewriter effect with cursor.
