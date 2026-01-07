# @incremark/icons

🇨🇳 中文 | **[🇺🇸 English](./README.en.md)**

Incremark 图标库，提供纯 SVG 图标供 Vue、React、Svelte 子包使用。

## 安装

```bash
pnpm add @incremark/icons
```

## 使用

```ts
import { GravityMermaid, LucideCopy } from '@incremark/icons'

// 每个图标导出的是 SVG 字符串，导出名与 SVG 文件名一致
console.log(LucideCopy) // '<svg>...</svg>'
```

## 添加新图标

1. 将 SVG 文件放入 `svgs/` 目录（文件名即导出名）
2. 运行 `pnpm build`

## 设计原则

- **文件名即导出名**：SVG 文件名直接作为 export 名称
- 使用 `currentColor` 以支持 CSS 颜色继承
- 图标来源：https://icones.js.org/
