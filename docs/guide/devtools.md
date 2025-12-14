# DevTools

Incremark includes built-in developer tools to help debug and optimize.

## Enable

::: code-group

```ts [Vue]
import { useIncremark, useDevTools } from '@incremark/vue'

const incremark = useIncremark()
useDevTools(incremark)
```

```tsx [React]
import { useIncremark, useDevTools } from '@incremark/react'

function App() {
  const incremark = useIncremark()
  useDevTools(incremark)
  // ...
}
```

```ts [Vanilla]
import { createIncremarkParser } from '@incremark/core'
import { mountDevTools } from '@incremark/devtools'

const parser = createIncremarkParser({
  onChange: mountDevTools()
})
```

:::

## Panels

### Overview

Displays current parsing state:

- 📝 Total characters
- ✅ Completed block count
- ⏳ Pending block count
- 🔄 Loading state

### Blocks

View all parsed blocks:

- Block type and ID
- Status indicator (completed/pending)
- Click to view detailed AST

### AST

JSON format display of complete AST:

- Collapsible tree structure
- Highlight current block

### Timeline

Record each append operation:

- Timestamp
- Chunk content
- Block change statistics

## Configuration Options

```ts
useDevTools(incremark, {
  open: false,           // Initially open
  position: 'bottom-right',  // Position
  theme: 'dark'          // Theme
})
```

### position

- `bottom-right` (default)
- `bottom-left`
- `top-right`
- `top-left`

### theme

- `dark` (default)
- `light`

## Control Methods

```ts
const devtools = useDevTools(incremark)

devtools.open()    // Open panel
devtools.close()   // Close panel
devtools.toggle()  // Toggle state
```

## Production Environment

DevTools can be used in production, but it's recommended to control via environment variables:

```ts
if (import.meta.env.DEV) {
  useDevTools(incremark)
}
```
