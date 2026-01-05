# DevTools

## Enable DevTools

::: code-group
```vue [Vue]
<script setup>
import { useIncremark, useDevTools, Incremark } from '@incremark/vue'

const incremark = useIncremark()
useDevTools(incremark)
</script>

<template>
  <Incremark :blocks="incremark.blocks" />
</template>
```

```tsx [React]
import { useIncremark, useDevTools, Incremark } from '@incremark/react'

function App() {
  const incremark = useIncremark()
  useDevTools(incremark)

  return <Incremark blocks={incremark.blocks} />
}
```

```svelte [Svelte]
<script lang="ts">
  import { useIncremark, useDevTools, Incremark } from '@incremark/svelte'

  const incremark = useIncremark()
  useDevTools(incremark)
</script>

<Incremark blocks={incremark.blocks} />
```
:::

## Configuration

```ts
useDevTools(incremark, {
  open: false,                    // Initially open
  position: 'bottom-right',       // Position
  theme: 'dark'                   // Theme
})
```
