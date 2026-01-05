# HTML Elements

Incremark can parse and render raw HTML fragments embedded in Markdown.

## Usage

Enable the `htmlTree` option.

```markdown
This is <b>bold</b> and this is <span style="color: red">red</span>.

<div>
  <h3>Block HTML</h3>
  <p>Content inside HTML block</p>
</div>
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

## Security Warning

⚠️ **XSS Risk**: Enabling `htmlTree` allows rendering of arbitrary HTML. Ensure that the content source is trusted or sanitized before passing it to Incremark.
