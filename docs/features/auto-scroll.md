# Auto Scroll

## Using AutoScrollContainer

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
:::

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `enabled` | `boolean` | `true` | Enable auto scroll |
| `threshold` | `number` | `50` | Bottom threshold (pixels) |
| `behavior` | `ScrollBehavior` | `'instant'` | Scroll behavior |

## Exposed Methods

| Method | Description |
|---|---|
| `scrollToBottom()` | Force scroll to bottom |
| `isUserScrolledUp()` | Whether user manually scrolled up |

## Behavior

- Auto scrolls to bottom when content updates.
- Pauses auto scroll when user scrolls up.
- Resumes auto scroll when user scrolls back to bottom.
