# @incremark/shared

Incremark 共享工具包 - Vue 和 React 共享的逻辑和工具函数。

## 功能

- **HTML 处理**：处理 HTML 节点配对，自动补全缺失的结束标签
- **文本处理**：处理带 chunks 的文本节点，支持渐入动画
- **类型定义**：共享的类型定义

## 使用

```typescript
import {
  type TextNodeWithChunks,
  hasChunks,
  getStableText,
  isHtmlNode,
  processHtmlNodes
} from '@incremark/shared'
```

## API

### `processHtmlNodes(nodes: PhrasingContent[]): PhrasingContent[]`

处理 HTML 节点数组，配对开始和结束标签。如果遇到开始标签但没有对应的结束标签，会自动补上结束标签。

### `hasChunks(node: PhrasingContent): node is TextNodeWithChunks`

类型守卫，检查是否是带 chunks 的文本节点。

### `getStableText(node: TextNodeWithChunks): string`

获取文本节点的稳定部分（不需要动画的部分）。

### `isHtmlNode(node: PhrasingContent): node is HTML`

类型守卫，检查是否是 HTML 节点。

### `extractTagName(html: string): HtmlTagInfo | null`

提取 HTML 标签名和相关信息。

