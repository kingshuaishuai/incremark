# Typewriter Effect

Incremark provides built-in typewriter effect support, displaying AI output content character by character to simulate a real typing experience.

## Features

- ✅ **Smooth Animation** - Powered by `requestAnimationFrame`
- ✅ **Random Step** - Support `charsPerTick: [1, 3]` for natural typing
- ✅ **Animation Effects** - Support `typing` cursor and `fade-in` effects
- ✅ **Auto Pause** - Automatically pauses when page is hidden
- ✅ **Plugin System** - Customize handling for special nodes
- ✅ **Cross-framework** - Framework-agnostic core with Vue/React adapters
- ✅ **Simple Integration** - Built into `useIncremark`, no separate hook needed

## Quick Start

Typewriter effect is now integrated into `useIncremark`. Just pass a `typewriter` configuration:

### Vue

```vue
<script setup>
import { useIncremark, Incremark } from '@incremark/vue'

const { blocks, append, finalize, reset, typewriter } = useIncremark({
  gfm: true,
  typewriter: {
    enabled: true,
    charsPerTick: [1, 3],  // Random 1-3 characters per tick
    tickInterval: 30,       // 30ms interval
    effect: 'typing',       // 'none' | 'fade-in' | 'typing'
    cursor: '|'             // Cursor character
  }
})
</script>

<template>
  <div :class="['content', `effect-${typewriter.effect.value}`]">
    <!-- blocks already includes typewriter effect! -->
    <Incremark :blocks="blocks" />
  </div>
  
  <!-- Control buttons -->
  <button v-if="typewriter.isProcessing.value" @click="typewriter.skip">
    Skip
  </button>
  <button v-if="typewriter.isPaused.value" @click="typewriter.resume">
    Resume
  </button>
</template>
```

### React

```tsx
import { useIncremark, Incremark } from '@incremark/react'

function App() {
  const { blocks, append, finalize, reset, typewriter } = useIncremark({
    gfm: true,
    typewriter: {
      enabled: true,
      charsPerTick: [1, 3],
      tickInterval: 30,
      effect: 'typing',
      cursor: '|'
    }
  })

  return (
    <div className={`content effect-${typewriter.effect}`}>
      {/* blocks already includes typewriter effect! */}
      <Incremark blocks={blocks} />
      
      {typewriter.isProcessing && (
        <button onClick={typewriter.skip}>Skip</button>
      )}
    </div>
  )
}
```

## Animation Effects

Incremark supports three animation effects:

### 1. None (`effect: 'none'`)

No visual effect, just gradual character display.

### 2. Typing Cursor (`effect: 'typing'`)

Shows a cursor character at the end of the currently typing block.

```css
/* The cursor is embedded in content, style the pending block if needed */
.effect-typing .incremark-pending {
  /* Optional styling */
}
```

### 3. Fade-in (`effect: 'fade-in'`) ✨ New

Each newly displayed character segment fades in smoothly. This creates a beautiful, flowing animation effect.

```css
/* Fade-in animation is built-in via .incremark-fade-in class */
.content.effect-fade-in .incremark-fade-in {
  animation: incremark-fade-in 0.3s ease-out forwards;
}

@keyframes incremark-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

The fade-in effect works by:
1. Tracking character "chunks" as they are displayed
2. Wrapping each chunk in a `<span class="incremark-fade-in">`
3. Each span has a unique key based on creation time, ensuring smooth concurrent animations

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable/disable typewriter (can toggle at runtime) |
| `charsPerTick` | `number \| [number, number]` | `[1, 3]` | Characters per tick, array for random range |
| `tickInterval` | `number` | `30` | Interval in milliseconds |
| `effect` | `'none' \| 'fade-in' \| 'typing'` | `'none'` | Animation effect |
| `cursor` | `string` | `'|'` | Cursor character (only for `typing` effect) |
| `pauseOnHidden` | `boolean` | `true` | Pause when page is hidden |
| `plugins` | `TransformerPlugin[]` | `defaultPlugins` | Plugin list (auto-included) |

## Dynamic Configuration

You can update typewriter settings at runtime:

### Vue

```vue
<script setup>
const { typewriter } = useIncremark({
  typewriter: { enabled: false }  // Start disabled
})

// Toggle enabled state
typewriter.enabled.value = true

// Update options
typewriter.setOptions({
  charsPerTick: [2, 5],
  tickInterval: 20,
  effect: 'fade-in'
})
</script>
```

### React

```tsx
const { typewriter } = useIncremark({
  typewriter: { enabled: false }
})

// Toggle enabled state
typewriter.setEnabled(true)

// Update options
typewriter.setOptions({
  charsPerTick: [2, 5],
  tickInterval: 20,
  effect: 'fade-in'
})
```

## Typewriter Controls

The `typewriter` object provides these controls:

| Property/Method | Vue Type | React Type | Description |
|-----------------|----------|------------|-------------|
| `enabled` | `Ref<boolean>` | `boolean` | Whether typewriter is enabled |
| `setEnabled` | - | `(enabled: boolean) => void` | Set enabled state (React) |
| `isProcessing` | `ComputedRef<boolean>` | `boolean` | Whether animation is ongoing |
| `isPaused` | `ComputedRef<boolean>` | `boolean` | Whether paused |
| `effect` | `ComputedRef<AnimationEffect>` | `AnimationEffect` | Current effect |
| `skip()` | `Function` | `Function` | Skip all animations |
| `pause()` | `Function` | `Function` | Pause animation |
| `resume()` | `Function` | `Function` | Resume animation |
| `setOptions()` | `Function` | `Function` | Update options dynamically |

## Speed Examples

| Scenario | charsPerTick | tickInterval | Effect |
|----------|--------------|--------------|--------|
| Slow typing | 1 | 100 | 1 char every 100ms |
| Normal speed | 2 | 50 | 2 chars every 50ms |
| Natural typing | [1, 3] | 30 | Random 1-3 chars every 30ms |
| Fast output | 5 | 30 | 5 chars every 30ms |
| Turbo mode | 10 | 10 | 10 chars every 10ms |

## Plugin System

### Default Plugins (Auto-included)

By default, `useIncremark` includes `defaultPlugins`:
- `imagePlugin` - Images display immediately (no text content)
- `thematicBreakPlugin` - Dividers display immediately (no text content)

### All Plugins

If you want code blocks, mermaid, math formulas to display as a whole:

```ts
import { allPlugins } from '@incremark/vue'  // or @incremark/react

const { blocks } = useIncremark({
  typewriter: {
    plugins: allPlugins  // Override default plugins
  }
})
```

`allPlugins` includes:
- `imagePlugin` - Images display immediately
- `thematicBreakPlugin` - Dividers display immediately
- `codeBlockPlugin` - Code blocks display as whole
- `mermaidPlugin` - Mermaid charts display as whole
- `mathPlugin` - Math formulas display as whole

### Custom Plugins

```ts
import { createPlugin } from '@incremark/vue'

// Make tables display as whole
const tablePlugin = createPlugin(
  'table',
  (node) => node.type === 'table',
  {
    countChars: () => 1,  // Count as 1 character
    sliceNode: (node, displayed, total) => displayed >= total ? node : null
  }
)

const { blocks } = useIncremark({
  typewriter: {
    plugins: [tablePlugin]  // Custom plugins (defaultPlugins still included)
  }
})
```

## With Auto Scroll

Typewriter effect usually needs auto scroll:

```vue
<script setup>
import { useIncremark, Incremark, AutoScrollContainer } from '@incremark/vue'

const { blocks, typewriter } = useIncremark({
  typewriter: { effect: 'fade-in' }
})
</script>

<template>
  <AutoScrollContainer class="content">
    <Incremark :blocks="blocks" />
  </AutoScrollContainer>
</template>

<style>
.content {
  max-height: 70vh;
  overflow: hidden;
}
</style>
```

See [Auto Scroll](./auto-scroll) guide for details.

## How It Works

```
Parser (Producer) → BlockTransformer (Middleware) → UI (Consumer)
     ↓                      ↓                          ↓
  Parse blocks        Control display speed       Render displayBlocks
```

BlockTransformer acts as middleware between parser and renderer:
- **Consumer Role**: Consumes `completedBlocks` from Parser
- **Producer Role**: Produces `displayBlocks` for UI rendering
- **Core Function**: Controls characters per tick and display interval

## Advanced: Using useBlockTransformer

For advanced use cases, you can still use `useBlockTransformer` separately:

```ts
import { useIncremark, useBlockTransformer } from '@incremark/vue'

const { completedBlocks } = useIncremark()

const sourceBlocks = computed(() => 
  completedBlocks.value.map(block => ({
    id: block.id,
    node: block.node,
    status: block.status
  }))
)

const { displayBlocks, isProcessing, skip } = useBlockTransformer(sourceBlocks, {
  charsPerTick: [1, 3],
  effect: 'fade-in'
})
```

## Next Steps

- [Auto Scroll](./auto-scroll) - AutoScrollContainer usage guide
- [Custom Components](./custom-components) - Custom rendering components
- [API Reference](/api/vue) - Complete API documentation
