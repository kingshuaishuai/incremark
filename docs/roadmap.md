# 🗺️ Roadmap

Our future plans focus on enhancing the library's capabilities for building modern, accessible, and high-performance AI chat interfaces.

## ✨ Accomplished

### 🏗️ Core & Engine
- [x] **BlockTransformer**: Cross-framework architecture for consistent typewriter effects.
- [x] **Syntax Refinement**: Enhanced boundary parsing, commonmark compliance, and edge-case rendering.
- [x] **Incremental Engine**: State-aware parsing for $O(N)$ performance.
- [x] **Dual-Engine Architecture**: Support for both `marked` (fast, streaming-optimized) and `micromark` (stable, CommonMark-compliant) engines with tree-shaking optimization.
- [x] **Micromark Enhancement**: Improved HTML parsing and stability.
- [x] **Marked Enhancement**: Extended `marked` with footnotes, math, custom containers, and inline HTML parsing support.

### 🎨 Design System & Theme
- [x] **@incremark/theme**: Unified styles with DesignToken support in a separate package.
- [x] **ThemeProvider**: Context-based styling for all components.
- [x] **Thematic Components**: Built-in support for specialized markdown blocks.

### 🍱 Framework Components
- [x] **@incremark/vue**: Full-featured Vue component library.
- [x] **@incremark/react**: Full-featured React component library.
- [x] **@incremark/svelte**: Full-featured Svelte component library.
- [x] **IncremarkContent**: Declarative, easy-to-use entry component for all frameworks.

### 🔌 Features & Extensions
- [x] **GFM Support**: Full support for GitHub Flavored Markdown.
- [x] **Mermaid Support**: Integrated support for Mermaid diagrams within Markdown.
- [x] **Math Support**: Robust support for LaTeX math formulas via KaTeX.
- [x] **Custom Rendering**: Full support for custom markdown components.
- [x] **Custom Code Blocks**: Flexible configuration for partial or full rendering takeover.
- [x] **Custom Containers**: Support for `:::` container syntax.
- [x] **Footnotes**: Full support for markdown footnotes.
- [x] **HTML Parsing**: Robust handling of embedded HTML content.

---

## 🚀 Upcoming Features

### 🛠️ Markdown & Tooling
- [x] **Code Component Refactoring**: Decouple Mermaid and Default renderers to allow for better composition and customization.
- [ ] **DevTools Rewrite**: Rebuilding DevTools using Svelte for better DX.
- [ ] **sliceAST Optimization**: Further performance improvements for ultra-long documents.
- [ ] **Accessibility (A11y)**: Enhancing screen reader support and ARIA standards.
- [x] **SSR Support**: Optimization for Server-Side Rendering (Nuxt/Next.js).

### 🏗️ Big Vision: Incremental Chat UI Kit
A comprehensive set of pre-built UI components powered by the Incremark engine.

- [ ] **@incremark/chat-core**: Logic layer for message management, A2UI protocol, and mainstream LLM SDK adaptation.
- [ ] **@incremark/chat-vue**: High-level chat components for Vue.
  - [ ] **UI Adapters**: First-class support for `element-plus` and `shadcn-vue`.
- [ ] **@incremark/chat-react**: High-level chat components for React.
- [ ] **@incremark/chat-svelte**: High-level chat components for Svelte.

---

### 🔌 Plugin System
- [x] **Micromark Extensions**: Full support for `micromark` syntax extensions.
- [x] **mdast Extensions**: Full support for `mdast-util-from-markdown` AST extensions.
- [x] **Marked Extensions**: Custom token transformers for the `marked` engine.

---

## 🔮 Long-term Research
- [ ] **Collaborative Editing**: Researching solutions including: 1. Tiptap markdown parsing based on `micromark`, 2. Incremental appending scheme based on `incremark`.
