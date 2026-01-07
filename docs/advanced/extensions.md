# Extensions

Incremark's dual-engine architecture provides flexible extension mechanisms for both `micromark` and `marked` engines.

## Engine Selection

Choose the appropriate engine based on your extension needs:

| Engine | Extension Type | Best For |
|--------|---------------|----------|
| `micromark` | micromark + mdast extensions | Rich ecosystem, CommonMark compliance |
| `marked` | Custom token transformers | Maximum performance, simple extensions |

## Micromark Extensions

When using the `micromark` engine, you can leverage the rich ecosystem of existing extensions.

### Syntax Extensions

Use `micromark` extensions to support new syntax:

```vue
<script setup>
import { ref } from 'vue'
import { IncremarkContent } from '@incremark/vue'
import { gfmTable } from 'micromark-extension-gfm-table'

const content = ref('')
const isFinished = ref(false)

// Note: extensions option is for micromark engine only
// Use with MicromarkAstBuilder
import { MicromarkAstBuilder } from '@incremark/core/engines/micromark'

const parser = createIncremarkParser({
  astBuilder: MicromarkAstBuilder,
  extensions: [gfmTable()]
})
</script>

<template>
  <IncremarkContent 
    :content="content" 
    :is-finished="isFinished"
    :incremark-options="options" 
  />
</template>
```

### AST Extensions

Use `mdast-util-from-markdown` extensions to transform syntax to AST nodes:

```ts
import { gfmTableFromMarkdown } from 'mdast-util-gfm-table'

import { MicromarkAstBuilder } from '@incremark/core/engines/micromark'

const parser = createIncremarkParser({
  astBuilder: MicromarkAstBuilder,
  extensions: [gfmTable()],
  mdastExtensions: [gfmTableFromMarkdown()]
})
```

### Common Extension Packages

| Package | Description |
|---------|-------------|
| `micromark-extension-gfm` | Full GFM support |
| `micromark-extension-math` | Math formulas |
| `micromark-extension-directive` | Custom containers |
| `micromark-extension-frontmatter` | YAML frontmatter |

## Marked Extensions

The `marked` engine uses a custom extension system. Incremark has already extended `marked` with support for:

- **Footnotes**: `[^1]` references and `[^1]: content` definitions
- **Math**: `$inline$` and `$$block$$` formulas
- **Custom Containers**: `:::type` syntax
- **Inline HTML**: Structured HTML element parsing

### Custom Token Transformers

For the `marked` engine, you can provide custom token transformers:

```ts
import type { BlockTokenTransformer, InlineTokenTransformer } from '@incremark/core'

// Custom block transformer
const myBlockTransformer: BlockTokenTransformer = (token, ctx) => {
  if (token.type === 'myCustomBlock') {
    return {
      type: 'paragraph',
      children: [{ type: 'text', value: token.raw }]
    }
  }
  return null
}

// For marked engine (default), use customBlockTransformers
const parser = createIncremarkParser({
  // marked is default, no astBuilder needed
  customBlockTransformers: {
    myCustomBlock: myBlockTransformer
  }
})
```

### Built-in Transformers

You can access and extend the built-in transformers:

```ts
import { 
  getBuiltinBlockTransformers, 
  getBuiltinInlineTransformers 
} from '@incremark/core'

// Get all built-in transformers
const blockTransformers = getBuiltinBlockTransformers()
const inlineTransformers = getBuiltinInlineTransformers()

// Override specific transformer
const customTransformers = {
  ...blockTransformers,
  code: (token, ctx) => {
    // Custom code block handling
    return { type: 'code', value: token.text, lang: token.lang }
  }
}
```

## UI-Level Extensions

Beyond parser extensions, Incremark provides UI-level customization:

### Custom Components

Replace default rendering for any node type:

```vue
<IncremarkContent 
  :content="content" 
  :is-finished="isFinished"
  :components="{ heading: MyCustomHeading }"
/>
```

### Custom Code Blocks

Handle specific code languages with custom components:

```vue
<IncremarkContent 
  :content="content" 
  :is-finished="isFinished"
  :custom-code-blocks="{ echarts: MyEchartsRenderer }"
  :code-block-configs="{ echarts: { takeOver: true } }"
/>
```

### Custom Containers

Render `:::type` containers with custom components:

```vue
<IncremarkContent 
  :content="content" 
  :is-finished="isFinished"
  :custom-containers="{ 
    warning: WarningBox,
    info: InfoBox,
    tip: TipBox 
  }"
/>
```

## Extension Best Practices

1. **Choose the right engine**: Use `micromark` for complex syntax extensions, `marked` for performance-critical scenarios.

2. **Leverage existing packages**: The micromark ecosystem has many well-tested extensions.

3. **UI-level first**: For visual customization, prefer UI-level extensions (custom components) over parser extensions.

4. **Test thoroughly**: Custom extensions can affect parsing behavior across different markdown inputs.
