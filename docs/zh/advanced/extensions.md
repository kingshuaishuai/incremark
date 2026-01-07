# 扩展功能

Incremark 的双引擎架构为 `micromark` 和 `marked` 引擎提供了灵活的扩展机制。

## 引擎选择

根据你的扩展需求选择合适的引擎：

| 引擎 | 扩展类型 | 适用场景 |
|------|---------|---------|
| `micromark` | micromark + mdast 扩展 | 丰富的生态，CommonMark 兼容 |
| `marked` | 自定义 Token 转换器 | 极致性能，简单扩展 |

## Micromark 扩展

使用 `micromark` 引擎时，可以利用丰富的现有扩展生态。

### 语法扩展

使用 `micromark` 扩展支持新语法：

```vue
<script setup>
import { ref } from 'vue'
import { IncremarkContent } from '@incremark/vue'
import { gfmTable } from 'micromark-extension-gfm-table'

const content = ref('')
const isFinished = ref(false)

// 注意：extensions 选项仅用于 micromark 引擎
// 需要配合 MicromarkAstBuilder 使用
import { MicromarkAstBuilder } from '@incremark/core/engines/micromark'

const parser = createIncremarkParser({
  astBuilder: MicromarkAstBuilder,
  extensions: [gfmTable()]
})
</script>

<template>
  <IncremarkContent 
    :content="content" 
    :is-finished="isFinished"
    :incremark-options="options" 
  />
</template>
```

### AST 扩展

使用 `mdast-util-from-markdown` 扩展将语法转换为 AST 节点：

```ts
import { gfmTableFromMarkdown } from 'mdast-util-gfm-table'

import { MicromarkAstBuilder } from '@incremark/core/engines/micromark'

const parser = createIncremarkParser({
  astBuilder: MicromarkAstBuilder,
  extensions: [gfmTable()],
  mdastExtensions: [gfmTableFromMarkdown()]
})
```

### 常用扩展包

| 包名 | 描述 |
|-----|------|
| `micromark-extension-gfm` | 完整 GFM 支持 |
| `micromark-extension-math` | 数学公式 |
| `micromark-extension-directive` | 自定义容器 |
| `micromark-extension-frontmatter` | YAML frontmatter |

## Marked 扩展

`marked` 引擎使用自定义扩展系统。Incremark 已经为 `marked` 扩展了以下功能：

- **脚注**: `[^1]` 引用和 `[^1]: content` 定义
- **数学公式**: `$inline$` 和 `$$block$$` 公式
- **自定义容器**: `:::type` 语法
- **内联 HTML**: 结构化 HTML 元素解析

### 自定义 Token 转换器

对于 `marked` 引擎，你可以提供自定义的 Token 转换器：

```ts
import type { BlockTokenTransformer, InlineTokenTransformer } from '@incremark/core'

// 自定义块级转换器
const myBlockTransformer: BlockTokenTransformer = (token, ctx) => {
  if (token.type === 'myCustomBlock') {
    return {
      type: 'paragraph',
      children: [{ type: 'text', value: token.raw }]
    }
  }
  return null
}

// 对于 marked 引擎（默认），使用 customBlockTransformers
const parser = createIncremarkParser({
  // marked 是默认引擎，无需指定 astBuilder
  customBlockTransformers: {
    myCustomBlock: myBlockTransformer
  }
})
```

### 内置转换器

你可以访问和扩展内置转换器：

```ts
import { 
  getBuiltinBlockTransformers, 
  getBuiltinInlineTransformers 
} from '@incremark/core'

// 获取所有内置转换器
const blockTransformers = getBuiltinBlockTransformers()
const inlineTransformers = getBuiltinInlineTransformers()

// 覆盖特定转换器
const customTransformers = {
  ...blockTransformers,
  code: (token, ctx) => {
    // 自定义代码块处理
    return { type: 'code', value: token.text, lang: token.lang }
  }
}
```

## UI 层扩展

除了解析器扩展，Incremark 还提供 UI 层的自定义能力：

### 自定义组件

替换任意节点类型的默认渲染：

```vue
<IncremarkContent 
  :content="content" 
  :is-finished="isFinished"
  :components="{ heading: MyCustomHeading }"
/>
```

### 自定义代码块

为特定语言的代码块使用自定义组件：

```vue
<IncremarkContent 
  :content="content" 
  :is-finished="isFinished"
  :custom-code-blocks="{ echarts: MyEchartsRenderer }"
  :code-block-configs="{ echarts: { takeOver: true } }"
/>
```

### 自定义容器

使用自定义组件渲染 `:::type` 容器：

```vue
<IncremarkContent 
  :content="content" 
  :is-finished="isFinished"
  :custom-containers="{ 
    warning: WarningBox,
    info: InfoBox,
    tip: TipBox 
  }"
/>
```

## 扩展最佳实践

1. **选择合适的引擎**: 复杂语法扩展使用 `micromark`，性能敏感场景使用 `marked`。

2. **利用现有包**: micromark 生态有很多经过充分测试的扩展。

3. **优先 UI 层扩展**: 对于视觉定制，优先使用 UI 层扩展（自定义组件）而非解析器扩展。

4. **充分测试**: 自定义扩展可能影响不同 Markdown 输入的解析行为。
