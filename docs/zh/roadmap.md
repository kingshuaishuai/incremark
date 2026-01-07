# 🗺️ 路线图

我们未来的计划专注于增强库的能力，以构建现代、无障碍且高性能的 AI 聊天界面。

## ✨ 已完成

### 🏗️ 核心引擎
- [x] **BlockTransformer**: 跨框架打字机效果实现，确保渲染一致性。
- [x] **语法完善**: 修复边界情况解析与渲染，增加更完善的 commonmark 测试用例。
- [x] **增量解析**: 实现 O(N) 性能的状态感知解析引擎。
- [x] **双引擎架构**: 支持 `marked`（极速流式优化）和 `micromark`（稳定 CommonMark 兼容）双引擎，支持 tree-shaking 优化。
- [x] **Micromark 增强**: 提升 HTML 解析能力与稳定性。
- [x] **Marked 增强**: 为 `marked` 扩展脚注、数学公式、自定义容器、内联 HTML 解析等功能。

### 🎨 设计系统与主题
- [x] **@incremark/theme**: 统一各组件库样式，支持 DesignToken，并拆分为独立子包。
- [x] **ThemeProvider**: 统一的样式上下文管理组件。
- [x] **主题组件支持**: 内置多种 Markdown 块级主题组件。

###  Bento 组件库
- [x] **@incremark/vue**: 完整的 Vue 组件集成。
- [x] **@incremark/react**: 完整的 React 组件集成。
- [x] **@incremark/svelte**: 完整的 Svelte 组件集成。
- [x] **IncremarkContent**: 简单易用的声明式入口组件。

### 🔌 功能与扩展
- [x] **GFM 支持**: 支持 GFM 语法。
- [x] **Mermaid 支持**: 支持在 Markdown 中嵌入 Mermaid 图表。
- [x] **Math 支持**: 支持在 Markdown 中嵌入 Math 公式。
- [x] **自定义组件**: 支持自定义 Markdown 渲染组件。
- [x] **自定义代码块**: 支持全接管或完成时渲染接管。
- [x] **自定义容器**: 支持 `:::` 容器块语法。
- [x] **脚注支持**: 完整的 Markdown 脚注功能。
- [x] **HTML 解析**: 支持在 Markdown 中嵌入 HTML 标签。

---

## 🚀 即将进行

### 🛠️ Markdown 与工具
- [x] **Code 组件重构**: 解耦 Mermaid 与默认渲染器，提升定制化能力。
- [ ] **devtools 重构**: 使用 Svelte 重构开发工具，提升开发体验。
- [ ] **sliceAST 优化**: 针对超长文档的进一步性能优化。
- [ ] **a11y 支持**: 完善屏幕阅读器支持与 ARIA 规范。
- [x] **SSR 支持**: 针对 Nuxt/Next.js 的服务端渲染优化。

### 🏗️ 大计划: 基于增量渲染的 chat-ui 组件库
利用 Incremark 引擎打造的一套开箱即用的 AI 聊天 UI 组件。

- [ ] **@incremark/chat-core**: 消息管理逻辑层，支持 A2UI 协议及主流 SDK 适配。
- [ ] **@incremark/chat-vue**: 基于 Vue 的高阶聊天组件。
  - [ ] **UI 适配器**: 优先适配 `element-plus` 和 `shadcn-vue`。
- [ ] **@incremark/chat-react**: 基于 React 的高阶聊天组件。
- [ ] **@incremark/chat-svelte**: 基于 Svelte 的高阶聊天组件。

---

### 🔌 插件系统
- [x] **Micromark 扩展**: 完整支持 `micromark` 语法扩展。
- [x] **mdast 扩展**: 完整支持 `mdast-util-from-markdown` AST 扩展。
- [x] **Marked 扩展**: 为 `marked` 引擎提供自定义 Token 转换器。

---

## 🔮 长期研究
- [ ] **协作编辑**: 1. 基于 micromark 的 tiptap markdown 解析方案， 2. 基于 incremark 的增量追加方案。
