# @incremark/devtools

Developer tools for Incremark, framework agnostic.

**[🇨🇳 中文](./README.md)** | 🇺🇸 English

## Features

- 🔍 **Real-time State** - View parsing state, block list, AST
- 📊 **Timeline** - Record each append operation
- 🎨 **Themes** - Supports dark/light themes
- 📦 **Framework Agnostic** - Works with Vue, React, or vanilla JS

## Installation

```bash
pnpm add @incremark/devtools
```

## Usage

### With Vue

```ts
import { useIncremark, useDevTools } from '@incremark/vue'

const incremark = useIncremark()
useDevTools(incremark)
```

### With React

```tsx
import { useIncremark, useDevTools } from '@incremark/react'

function App() {
  const incremark = useIncremark()
  useDevTools(incremark)
}
```

### Standalone Usage

```ts
import { createIncremarkParser } from '@incremark/core'
import { mountDevTools } from '@incremark/devtools'

const parser = createIncremarkParser()
parser.setOnChange(mountDevTools())
```

## API

### mountDevTools(options?, target?)

Create and mount DevTools, returns onChange callback.

```ts
const callback = mountDevTools({
  open: false,
  position: 'bottom-right',
  theme: 'dark'
})

parser.setOnChange(callback)
```

### IncremarkDevTools

DevTools class for fine-grained control.

```ts
const devtools = new IncremarkDevTools(options)
devtools.mount()
devtools.update(parserState)
devtools.unmount()
```

## Configuration Options

```ts
interface DevToolsOptions {
  open?: boolean           // Initially open
  position?: Position      // Position
  theme?: 'dark' | 'light' // Theme
}

type Position = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
```

## Feature Panels

| Panel | Function |
|-------|----------|
| Overview | Shows character count, block count, etc. |
| Blocks | View all parsed blocks |
| AST | Complete AST in JSON format |
| Timeline | History of append operations |

## License

MIT

