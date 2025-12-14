# @incremark/devtools

Standalone DevTools library, usable in any framework.

## Installation

```bash
pnpm add @incremark/devtools
```

## Usage

### Method 1: With Framework Integration

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
}
```

:::

### Method 2: Direct Usage

```ts
import { createIncremarkParser } from '@incremark/core'
import { mountDevTools } from '@incremark/devtools'

const parser = createIncremarkParser()
const onChangeCallback = mountDevTools()
parser.setOnChange(onChangeCallback)

// Use parser
parser.append('# Hello')
parser.finalize()
```

## API

### mountDevTools

Create and mount DevTools instance, returns a callback for the parser.

```ts
function mountDevTools(
  options?: DevToolsOptions,
  target?: HTMLElement | string
): (state: ParserState) => void
```

#### Parameters

- `options` - DevTools configuration options
- `target` - Mount target, defaults to `'body'`

```ts
interface DevToolsOptions {
  /** Initially open */
  open?: boolean
  /** Position */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  /** Theme */
  theme?: 'dark' | 'light'
}
```

#### Returns

Returns a callback function to pass to `parser.setOnChange()`.

### IncremarkDevTools

DevTools class for more fine-grained control.

```ts
class IncremarkDevTools {
  constructor(options?: DevToolsOptions)
  
  /** Mount to DOM */
  mount(target?: HTMLElement | string): void
  
  /** Unmount from DOM */
  unmount(): void
  
  /** Update state */
  update(state: ParserState): void
  
  /** Get current state */
  getState(): DevToolsState
}
```

## State Types

```ts
interface DevToolsState {
  isOpen: boolean
  activeTab: 'overview' | 'blocks' | 'ast' | 'timeline'
  parserState: ParserState | null
  appendHistory: AppendRecord[]
}

interface AppendRecord {
  timestamp: number
  chunk: string
  completedCount: number
  pendingCount: number
}
```

## Custom Styling

DevTools uses CSS variables that can be overridden:

```css
.incremark-devtools {
  --devtools-bg: #1e1e1e;
  --devtools-text: #e0e0e0;
  --devtools-border: #333;
  --devtools-accent: #4fc3f7;
}
```
