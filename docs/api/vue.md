# @incremark/vue

Vue 3 integration library.

## Installation

```bash
pnpm add @incremark/core @incremark/vue
```

## Composables

### useIncremark

Core Composable to create and manage parser instance.

```ts
function useIncremark(options?: UseIncremarkOptions): UseIncremarkReturn
```

#### Parameters

```ts
interface UseIncremarkOptions extends ParserOptions {
  /** Typewriter effect configuration */
  typewriter?: TypewriterOptions
}

interface TypewriterOptions {
  /** Enable typewriter effect (default: true if typewriter is provided) */
  enabled?: boolean
  /** Characters per tick, can be a number or range [min, max] */
  charsPerTick?: number | [number, number]
  /** Update interval in ms */
  tickInterval?: number
  /** Animation effect: 'none' | 'fade-in' | 'typing' */
  effect?: AnimationEffect
  /** Cursor character (only for 'typing' effect) */
  cursor?: string
  /** Pause when page is hidden */
  pauseOnHidden?: boolean
  /** Custom transformer plugins */
  plugins?: TransformerPlugin[]
}
```

Inherits from `@incremark/core`'s `ParserOptions`.

#### Returns

```ts
interface UseIncremarkReturn {
  /** Collected complete Markdown string */
  markdown: Ref<string>
  /** Completed blocks list */
  completedBlocks: ShallowRef<ParsedBlock[]>
  /** Pending blocks list */
  pendingBlocks: ShallowRef<ParsedBlock[]>
  /** Current complete AST */
  ast: ComputedRef<Root>
  /** All blocks (completed + pending), with stable ID (includes typewriter effect if enabled) */
  blocks: ComputedRef<Array<ParsedBlock & { stableId: string; isLastPending?: boolean }>>
  /** Is loading */
  isLoading: Ref<boolean>
  /** Is finalized */
  isFinalized: Ref<boolean>
  /** Append content */
  append: (chunk: string) => IncrementalUpdate
  /** Finalize parsing */
  finalize: () => IncrementalUpdate
  /** Force abort */
  abort: () => IncrementalUpdate
  /** Reset parser */
  reset: () => void
  /** One-shot render complete Markdown */
  render: (content: string) => IncrementalUpdate
  /** Parser instance */
  parser: IncremarkParser
  /** Typewriter controls (if typewriter is enabled) */
  typewriter?: TypewriterControls
}
```

### useBlockTransformer

Typewriter effect Composable, acting as middleware between parser and renderer.

```ts
function useBlockTransformer<T = unknown>(
  sourceBlocks: Ref<SourceBlock<T>[]> | ComputedRef<SourceBlock<T>[]>,
  options?: UseBlockTransformerOptions
): UseBlockTransformerReturn<T>
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `sourceBlocks` | `Ref<SourceBlock[]>` | Source blocks (usually from `completedBlocks`) |
| `options.charsPerTick` | `number` | Characters per tick (default: 2) |
| `options.tickInterval` | `number` | Tick interval in ms (default: 50) |
| `options.plugins` | `TransformerPlugin[]` | Plugin list |

#### Returns

```ts
interface UseBlockTransformerReturn<T = unknown> {
  /** Display blocks for rendering */
  displayBlocks: ComputedRef<DisplayBlock<T>[]>
  /** Is processing */
  isProcessing: ComputedRef<boolean>
  /** Skip all animations */
  skip: () => void
  /** Reset state */
  reset: () => void
  /** Dynamically update config */
  setOptions: (options: { charsPerTick?: number; tickInterval?: number }) => void
  /** Transformer instance */
  transformer: BlockTransformer<T>
}
```

#### Example

```vue
<script setup>
import { computed, ref, watch } from 'vue'
import { useIncremark, useBlockTransformer, Incremark, defaultPlugins } from '@incremark/vue'

const { completedBlocks, append, finalize, reset: resetParser } = useIncremark()

const typewriterSpeed = ref(2)
const typewriterInterval = ref(50)

const sourceBlocks = computed(() => 
  completedBlocks.value.map(block => ({
    id: block.id,
    node: block.node,
    status: block.status
  }))
)

const { displayBlocks, isProcessing, skip, setOptions } = useBlockTransformer(sourceBlocks, {
  charsPerTick: typewriterSpeed.value,
  tickInterval: typewriterInterval.value,
  plugins: defaultPlugins
})

watch([typewriterSpeed, typewriterInterval], ([speed, interval]) => {
  setOptions({ charsPerTick: speed, tickInterval: interval })
})

const renderBlocks = computed(() => 
  displayBlocks.value.map(db => ({
    id: db.id,
    stableId: db.id,
    node: db.displayNode,
    status: db.isDisplayComplete ? 'completed' : 'pending'
  }))
)
</script>

<template>
  <Incremark :blocks="renderBlocks" />
  <button v-if="isProcessing" @click="skip">Skip</button>
</template>
```

### useStreamRenderer

> **Deprecated**: This composable is deprecated. `useIncremark` now returns blocks with `stableId` by default.

Legacy composable for adding stable IDs to blocks for Vue's key attribute.

```ts
function useStreamRenderer(options: UseStreamRendererOptions): UseStreamRendererReturn
```

#### Parameters

```ts
interface UseStreamRendererOptions {
  completedBlocks: Ref<ParsedBlock[]>
  pendingBlocks: Ref<ParsedBlock[]>
}
```

#### Returns

```ts
interface UseStreamRendererReturn {
  stableCompletedBlocks: ComputedRef<BlockWithStableId[]>
  stablePendingBlocks: ComputedRef<BlockWithStableId[]>
  allStableBlocks: ComputedRef<BlockWithStableId[]>
}
```

### useDevTools

DevTools Composable, one-line enable developer tools.

```ts
function useDevTools(
  incremark: UseIncremarkReturn,
  options?: UseDevToolsOptions
): IncremarkDevTools
```

#### Parameters

- `incremark` - Return value of `useIncremark`
- `options` - DevTools config options

```ts
interface UseDevToolsOptions {
  /** Initially open */
  open?: boolean
  /** Position */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  /** Theme */
  theme?: 'dark' | 'light'
}
```

## Components

### Incremark

Main render component.

```vue
<!-- Recommended: Pass incremark object (auto-provides context) -->
<Incremark :incremark="incremark" />

<!-- Or use blocks directly -->
<Incremark 
  :blocks="blocks"
  :components="customComponents"
  :show-block-status="true"
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `incremark` | `UseIncremarkReturn` | - | **Recommended**: Incremark instance (auto-provides definitions context) |
| `blocks` | `Array<ParsedBlock & { stableId: string }>` | - | Blocks to render (required if `incremark` is not provided) |
| `components` | `Record<string, Component>` | `{}` | Custom component mapping |
| `showBlockStatus` | `boolean` | `true` | Show block status border |

### IncremarkRenderer

Single block render component.

```vue
<IncremarkRenderer :node="block.node" :components="customComponents" />
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `node` | `RootContent` | Required | AST node |
| `components` | `Record<string, Component>` | `{}` | Custom component mapping |

### AutoScrollContainer

Auto-scroll container for streaming content scenarios.

```vue
<AutoScrollContainer 
  ref="scrollRef" 
  :enabled="true"
  :threshold="50"
  behavior="instant"
>
  <Incremark :blocks="blocks" />
</AutoScrollContainer>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable auto-scroll |
| `threshold` | `number` | `50` | Bottom threshold to trigger auto-scroll (pixels) |
| `behavior` | `ScrollBehavior` | `'instant'` | Scroll behavior |

#### Exposed Methods (via ref)

| Method | Description |
|--------|-------------|
| `scrollToBottom()` | Force scroll to bottom |
| `isUserScrolledUp()` | Returns whether user manually scrolled up |
| `container` | Container DOM element reference |

#### How it works

- Auto-scroll to bottom when content updates
- Pause auto-scroll when user manually scrolls up
- Resume auto-scroll when user scrolls back to bottom
- Reset auto-scroll state when scrollbar disappears

### IncremarkHtmlElement

HTML element render component for HTML fragments.

```vue
<script setup>
import { IncremarkHtmlElement } from '@incremark/vue'

const customComponents = {
  htmlElement: IncremarkHtmlElement
}
</script>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `node` | `HtmlElementNode` | Required | HTML element AST node |

### IncremarkFootnotes

Footnotes list component (rendered automatically when using `Incremark` with `incremark` prop).

```vue
<!-- Automatically rendered when using: -->
<Incremark :incremark="incremark" />

<!-- Or manually: -->
<template>
  <IncremarkFootnotes />
</template>
```

Footnotes are automatically displayed at the bottom of the document when `isFinalized` is true.

### ThemeProvider

Theme provider component for applying themes.

```vue
<script setup>
import { ThemeProvider } from '@incremark/vue'
import { darkTheme } from '@incremark/theme'
</script>

<template>
  <ThemeProvider theme="dark">
    <Incremark :incremark="incremark" />
  </ThemeProvider>
</template>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `theme` | `'default' \| 'dark' \| DesignTokens \| Partial<DesignTokens>` | Required | Theme configuration |

### Built-in Render Components

Can be imported individually:

- `IncremarkHeading` - Headings
- `IncremarkParagraph` - Paragraphs
- `IncremarkCode` - Code blocks
- `IncremarkList` - Lists
- `IncremarkTable` - Tables
- `IncremarkBlockquote` - Blockquotes
- `IncremarkThematicBreak` - Thematic breaks
- `IncremarkMath` - Math formulas
- `IncremarkInline` - Inline content
- `IncremarkDefault` - Default/unknown types
- `IncremarkHtmlElement` - HTML elements

## Composables

### useProvideDefinations / useDefinationsContext

Composables for managing definitions and footnotes.

```vue
<script setup>
import { useProvideDefinations, useDefinationsContext } from '@incremark/vue'

// In parent component
const { definitions, footnoteDefinitions } = useProvideDefinations()

// In child component
const { definitions, footnoteDefinitions, footnoteReferenceOrder } = useDefinationsContext()
</script>
```

## Theme

### Design Tokens

```ts
import { type DesignTokens, defaultTheme, darkTheme } from '@incremark/theme'
```

### Theme Utilities

```ts
import {
  applyTheme,
  generateCSSVars,
  mergeTheme
} from '@incremark/theme'
```

## Plugins

Plugins exported from `@incremark/vue`:

```ts
import {
  defaultPlugins,      // Default plugins (images, breaks display immediately)
  allPlugins,          // All plugins (code blocks etc display as whole)
  codeBlockPlugin,
  mermaidPlugin,
  imagePlugin,
  mathPlugin,
  thematicBreakPlugin,
  createPlugin
} from '@incremark/vue'
```

## Usage Examples

### Basic Usage

```vue
<script setup>
import { useIncremark, useDevTools, Incremark } from '@incremark/vue'

const incremark = useIncremark({ gfm: true })
const { blocks, append, finalize, reset } = incremark

useDevTools(incremark)

async function handleStream(stream) {
  reset()
  for await (const chunk of stream) {
    append(chunk)
  }
  finalize()
}
</script>

<template>
  <!-- Recommended: Pass incremark object -->
  <Incremark :incremark="incremark" />
</template>
```

### With HTML Fragments

HTML fragments in Markdown are automatically parsed and rendered:

```vue
<script setup>
import { useIncremark, Incremark } from '@incremark/vue'

const incremark = useIncremark()
// Markdown with HTML:
// <div class="custom">Hello</div>
</script>

<template>
  <Incremark :incremark="incremark" />
</template>
```

### With Footnotes

Footnotes are automatically rendered at the bottom:

```vue
<script setup>
import { useIncremark, Incremark } from '@incremark/vue'

const incremark = useIncremark()
// Markdown with footnotes:
// Text[^1] and more[^2]
// 
// [^1]: First footnote
// [^2]: Second footnote
</script>

<template>
  <Incremark :incremark="incremark" />
</template>
```

### With Theme

```vue
<script setup>
import { useIncremark, Incremark, ThemeProvider } from '@incremark/vue'
import { darkTheme } from '@incremark/theme'

const incremark = useIncremark()
</script>

<template>
  <ThemeProvider theme="dark">
    <Incremark :incremark="incremark" />
  </ThemeProvider>
</template>
```

### Typewriter Effect + Auto-scroll

```vue
<script setup>
import { computed, ref } from 'vue'
import { 
  useIncremark, 
  useBlockTransformer, 
  Incremark, 
  AutoScrollContainer,
  defaultPlugins 
} from '@incremark/vue'

const { completedBlocks, append, finalize, reset: resetParser } = useIncremark()
const scrollRef = ref()

const sourceBlocks = computed(() => 
  completedBlocks.value.map(b => ({ id: b.id, node: b.node, status: b.status }))
)

const { displayBlocks, isProcessing, skip, reset: resetTransformer } = useBlockTransformer(sourceBlocks, {
  charsPerTick: 2,
  tickInterval: 50,
  plugins: defaultPlugins
})

const renderBlocks = computed(() => 
  displayBlocks.value.map(db => ({
    id: db.id,
    stableId: db.id,
    node: db.displayNode,
    status: db.isDisplayComplete ? 'completed' : 'pending'
  }))
)

function reset() {
  resetParser()
  resetTransformer()
}
</script>

<template>
  <AutoScrollContainer ref="scrollRef" class="content">
    <Incremark :blocks="renderBlocks" />
  </AutoScrollContainer>
  <button v-if="isProcessing" @click="skip">Skip</button>
</template>
```
