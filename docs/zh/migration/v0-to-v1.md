# 从 v0 迁移到 v1

## 破坏性变更

### 弃用的 API

- **`useStreamRenderer`** 已移除。请改用 `useIncremark` 或 `IncremarkContent` 组件。

### 组件 Props

重构了 `IncremarkContent` 的 props：

- `options` 现在是 `incremarkOptions`。
- `data` 现在是 `content`。

## Svelte 适配

对于 Svelte 5 支持：

- 使用 `onclick` 代替 `on:click`。
- 在示例中使用 Runes 语法 (`$state`)。
