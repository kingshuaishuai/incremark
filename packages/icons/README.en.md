# @incremark/icons

**[🇨🇳 中文](./README.md)** | 🇺🇸 English

Incremark icon library, providing pure SVG icons for Vue, React, and Svelte sub-packages.

## Installation

```bash
pnpm add @incremark/icons
```

## Usage

```ts
import { GravityMermaid, LucideCopy } from '@incremark/icons'

// Each icon is exported as an SVG string, export name matches SVG filename
console.log(LucideCopy) // '<svg>...</svg>'
```

## Adding New Icons

1. Place SVG file in `svgs/` directory (filename becomes export name)
2. Run `pnpm build`

## Design Principles

- **Filename is export name**: SVG filename directly becomes the export name
- Uses `currentColor` to support CSS color inheritance
- Icon source: https://icones.js.org/

