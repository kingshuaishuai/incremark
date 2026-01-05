# Themes

## Using ThemeProvider

::: code-group
```vue [Vue]
<script setup>
import { IncremarkContent, ThemeProvider } from '@incremark/vue'
</script>

<template>
  <ThemeProvider theme="dark">
    <IncremarkContent :content="content" />
  </ThemeProvider>
</template>
```

```tsx [React]
import { IncremarkContent, ThemeProvider } from '@incremark/react'

<ThemeProvider theme="dark">
  <IncremarkContent content={content} />
</ThemeProvider>
```

```svelte [Svelte]
<script lang="ts">
  import { IncremarkContent, ThemeProvider } from '@incremark/svelte'
</script>

<ThemeProvider theme="dark">
  <IncremarkContent {content} />
</ThemeProvider>
```
:::

## Built-in Themes

- `default` - Light theme
- `dark` - Dark theme

## Custom Theme

```ts
import { type DesignTokens } from '@incremark/vue'

const customTheme: Partial<DesignTokens> = {
  color: {
    brand: {
      primary: '#8b5cf6',
      primaryHover: '#7c3aed'
    }
  }
}

<ThemeProvider :theme="customTheme">
```
