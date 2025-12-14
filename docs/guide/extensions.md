# Extension Support

Incremark supports enhancing functionality through micromark and mdast extensions.

## GFM (GitHub Flavored Markdown)

Supported by default, enable with `gfm: true`:

```ts
const { blocks } = useIncremark({ gfm: true })
```

Includes:
- ✅ Tables
- ✅ Task lists
- ✅ Strikethrough
- ✅ Autolinks

## Math Formulas

### Installation

```bash
pnpm add micromark-extension-math mdast-util-math katex
```

### Configuration

::: code-group

```vue [Vue]
<script setup>
import { useIncremark } from '@incremark/vue'
import { math } from 'micromark-extension-math'
import { mathFromMarkdown } from 'mdast-util-math'
import 'katex/dist/katex.min.css'

const { blocks } = useIncremark({
  extensions: [math()],
  mdastExtensions: [mathFromMarkdown()]
})
</script>
```

```tsx [React]
import { useIncremark } from '@incremark/react'
import { math } from 'micromark-extension-math'
import { mathFromMarkdown } from 'mdast-util-math'
import 'katex/dist/katex.min.css'

function App() {
  const { blocks } = useIncremark({
    extensions: [math()],
    mdastExtensions: [mathFromMarkdown()]
  })
}
```

:::

### Syntax

```markdown
Inline formula: $E = mc^2$

Block formula:
$$
\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$
```

## Custom Containers

### Enable Boundary Detection

```ts
const { blocks } = useIncremark({
  containers: true  // or { marker: ':', minMarkerLength: 3 }
})
```

### Install Extensions

```bash
pnpm add micromark-extension-directive mdast-util-directive
```

### Configuration

```ts
import { directive } from 'micromark-extension-directive'
import { directiveFromMarkdown } from 'mdast-util-directive'

const { blocks } = useIncremark({
  containers: true,
  extensions: [directive()],
  mdastExtensions: [directiveFromMarkdown()]
})
```

### Syntax

```markdown
:::warning
This is a warning box
:::

:::info{title="Tip"}
Info box with title
:::
```

## Custom Extensions

### Create micromark Extension

```ts
import type { Extension } from 'micromark-util-types'

const myExtension: Extension = {
  // Define syntax rules
}
```

### Create mdast Extension

```ts
import type { Extension } from 'mdast-util-from-markdown'

const myMdastExtension: Extension = {
  enter: {
    myNode(token) {
      // Handle entering node
    }
  },
  exit: {
    myNode(token) {
      // Handle exiting node
    }
  }
}
```

### Usage

```ts
const { blocks } = useIncremark({
  extensions: [myExtension],
  mdastExtensions: [myMdastExtension]
})
```

## Boundary Detection Considerations

When adding custom syntax, ensure Incremark can correctly detect block boundaries.

For blocks requiring closing markers (like `:::` containers), enable the `containers` option:

```ts
const { blocks } = useIncremark({
  containers: {
    marker: ':',
    minMarkerLength: 3,
    allowedNames: ['warning', 'info', 'tip']
  }
})
```

This way Incremark will wait for the closing marker before marking the block as complete.
