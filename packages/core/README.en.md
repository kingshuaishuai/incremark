# @incremark/core

Incremental Markdown parser core library.

**[🇨🇳 中文](./README.md)** | 🇺🇸 English

## Features

- 🚀 **Incremental Parsing** - Only parse new content, completed blocks are never re-processed
- 🔄 **Streaming Friendly** - Designed for AI streaming output scenarios
- 🎯 **Smart Boundary Detection** - Accurate Markdown block boundary recognition
- 📦 **Framework Agnostic** - Works with any frontend framework

## Installation

```bash
pnpm add @incremark/core
```

## Quick Start

```ts
import { createIncremarkParser } from '@incremark/core'

const parser = createIncremarkParser({ gfm: true })

// Simulate streaming input
parser.append('# Hello\n')
parser.append('\nWorld')
parser.finalize()

// Get results
console.log(parser.getCompletedBlocks())
console.log(parser.getAst())
```

## API

### createIncremarkParser(options)

Create a parser instance.

```ts
interface ParserOptions {
  gfm?: boolean              // Enable GFM
  containers?: boolean       // Enable ::: containers
  extensions?: Extension[]   // micromark extensions
  mdastExtensions?: Extension[]  // mdast extensions
}
```

### parser.append(chunk)

Append content, returns incremental update.

### parser.finalize()

Complete parsing.

### parser.reset()

Reset state.

### parser.render(content)

Render complete Markdown at once (reset + append + finalize).

```ts
const update = parser.render('# Hello World')
console.log(update.completed) // completed blocks
```

### parser.getBuffer()

Get current buffer content.

### parser.getCompletedBlocks()

Get completed blocks.

### parser.getPendingBlocks()

Get pending blocks.

### parser.getAst()

Get complete AST.

## Type Definitions

```ts
interface ParsedBlock {
  id: string
  status: 'pending' | 'stable' | 'completed'
  node: RootContent
  startOffset: number
  endOffset: number
  rawText: string
}
```

## Framework Integration

- Vue: [@incremark/vue](../vue)
- React: [@incremark/react](../react)

## License

MIT

