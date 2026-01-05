# API Reference

A centralized reference for all Incremark types and components.

## Components

### `<IncremarkContent />`

The main component for rendering Markdown content.

**Props (`IncremarkContentProps`)**:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | - | The Markdown string to render (content mode). |
| `stream` | `() => AsyncGenerator<string>` | - | Async generator function for streaming content (stream mode). |
| `isFinished` | `boolean` | `false` | Whether the content generation is finished (required for content mode). |
| `incremarkOptions` | `UseIncremarkOptions` | - | Configuration options for the parser and typewriter effect. |
| `components` | `ComponentMap` | `{}` | Custom components to override default element rendering. |
| `customContainers` | `Record<string, Component>` | `{}` | Custom container components for `::: name` syntax. |
| `customCodeBlocks` | `Record<string, Component>` | `{}` | Custom code block components for specific languages. |
| `codeBlockConfigs` | `Record<string, CodeBlockConfig>` | `{}` | Configuration for code blocks (e.g., `takeOver`). |
| `showBlockStatus` | `boolean` | `false` | Whether to visualize block processing status (pending/completed). |
| `pendingClass` | `string` | `'incremark-pending'` | CSS class applied to pending blocks. |

### `<AutoScrollContainer />`

A container that automatically scrolls to the bottom when content updates.

**Props**:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Whether auto-scroll functionality is active. |
| `threshold` | `number` | `50` | Distance in pixels from bottom to trigger auto-scroll. |
| `behavior` | `ScrollBehavior` | `'instant'` | Scroll behavior (`'auto'`, `'smooth'`, `'instant'`). |

## Composables / Hooks

### `useIncremark`

The core hook for advanced usage and fine-grained control.

**Options (`UseIncremarkOptions`)**:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `gfm` | `boolean` | `true` | Enable GitHub Flavored Markdown support. |
| `math` | `boolean` | `true` | Enable Math (KaTeX) support. |
| `htmlTree` | `boolean` | `true` | Enable parsing of raw HTML tags. |
| `containers` | `boolean` | `true` | Enable custom container syntax `:::`. |
| `typewriter` | `TypewriterOptions` | - | Configuration for typewriter effect. |

**Returns (`UseIncremarkReturn`)**:

| Property | Type | Description |
|----------|------|-------------|
| `blocks` | `Ref<Block[]>` | Reactive array of parsed blocks with stable IDs. |
| `append` | `(chunk: string) => void` | Append new content chunk to the parser. |
| `render` | `(content: string) => void` | Render a complete or updated content string. |
| `reset` | `() => void` | Reset parser state and clear all blocks. |
| `finalize` | `() => void` | Mark all blocks as completed. |
| `isDisplayComplete` | `Ref<boolean>` | Whether the typewriter effect has finished displaying all content. |

## Configuration Types

### `TypewriterOptions`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `false` | Enable typewriter effect. |
| `charsPerTick` | `number \| [number, number]` | `2` | Characters to reveal per tick (or range). |
| `tickInterval` | `number` | `50` | ms between ticks. |
| `effect` | `'none' \| 'fade-in' \| 'typing'` | `'none'` | Animation style. |
| `cursor` | `string` | `'|'` | Cursor character for typing effect. |
