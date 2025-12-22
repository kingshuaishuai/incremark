# @incremark/theme

Incremark Theme Package - Unified Theme System

## Installation

```bash
pnpm add @incremark/theme
```

## Usage

### Basic Usage

Import styles in your React or Vue application:

```tsx
// React
import '@incremark/react/styles.css'
// Or import directly from theme package
import '@incremark/theme/styles.css'
```

```vue
<!-- Vue -->
<style>
@import '@incremark/vue/style.css';
/* Or import directly from theme package */
@import '@incremark/theme/styles.css';
</style>
```

### Theme Configuration

```tsx
import { applyTheme, themes, type ThemeConfig } from '@incremark/theme'

// Use preset theme
const container = document.querySelector('.incremark')
if (container) {
  applyTheme(container as HTMLElement, themes.dark)
}

// Custom theme
const customTheme: ThemeConfig = {
  fontFamily: 'Georgia, serif',
  color: '#2c3e50',
  pendingBorderColor: '#e74c3c',
  codeBackground: '#1e1e1e'
}

applyTheme(container as HTMLElement, customTheme)
```

### CSS Variables

The theme package supports customization through CSS variables:

```css
.incremark {
  --incremark-font-family: 'Your Font', sans-serif;
  --incremark-color: #333;
  --incremark-pending-border-color: #a855f7;
  --incremark-code-background: #24292e;
  --incremark-code-header-background: #1f2428;
  --incremark-blockquote-border-color: #3b82f6;
  --incremark-blockquote-background: #f0f7ff;
}
```

## API

### `ThemeConfig`

Theme configuration interface:

```typescript
interface ThemeConfig {
  fontFamily?: string
  lineHeight?: string
  color?: string
  pendingBorderColor?: string
  codeBackground?: string
  codeHeaderBackground?: string
  blockquoteBorderColor?: string
  blockquoteBackground?: string
}
```

### `themes`

Preset themes:

- `themes.default` - Default theme
- `themes.dark` - Dark theme
- `themes.light` - Light theme

### `applyTheme(element, config)`

Apply theme configuration to a DOM element.

### `getThemeCSSVariables(config)`

Get theme CSS variables string.

## Style Classes

The theme package provides a unified CSS class name system:

- `.incremark` - Main container
- `.incremark-block` - Block container
- `.incremark-heading` - Heading
- `.incremark-paragraph` - Paragraph
- `.incremark-code` - Code block
- `.incremark-inline-code` - Inline code
- `.incremark-list` - List
- `.incremark-table` - Table
- `.incremark-blockquote` - Blockquote
- `.incremark-hr` - Horizontal rule
- `.incremark-math-inline` - Inline math
- `.incremark-math-block` - Block math
- `.incremark-mermaid` - Mermaid diagram

## Migration Guide

### Migrating from Previous Versions

If you previously used `@incremark/react/styles.css` or Vue component scoped styles, now you just need to:

1. Ensure `@incremark/theme` package is installed
2. Import theme styles: `import '@incremark/theme/styles.css'`
3. All style class names remain unchanged, backward compatible

