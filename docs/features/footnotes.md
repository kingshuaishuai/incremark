# Footnotes

Incremark supports GFM footnotes out of the box.

## Usage

Enable the `gfm` option in your configuration.

```markdown
Here is a footnote reference[^1].

[^1]: This is the footnote definition.
```

## Configuration

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

## Rendering

Footnotes are automatically collected and rendered at the bottom of the content. You can customize the look using CSS or by overriding the `footnoteDefinition` component.
