# 扩展支持

Incremark 支持通过 micromark 和 mdast 扩展增强功能。

## GFM（GitHub Flavored Markdown）

默认支持，通过 `gfm: true` 启用：

```ts
const { blocks } = useIncremark({ gfm: true })
```

包含：
- ✅ 表格
- ✅ 任务列表
- ✅ 删除线
- ✅ 自动链接

## 数学公式

### 安装

```bash
pnpm add micromark-extension-math mdast-util-math katex
```

### 配置

::: code-group

```vue [Vue]
<script setup>
import { useIncremark } from '@incremark/vue'
import { math } from 'micromark-extension-math'
import { mathFromMarkdown } from 'mdast-util-math'
import 'katex/dist/katex.min.css'

const { blocks } = useIncremark({
  extensions: [math()],
  mdastExtensions: [mathFromMarkdown()]
})
</script>
```

```tsx [React]
import { useIncremark } from '@incremark/react'
import { math } from 'micromark-extension-math'
import { mathFromMarkdown } from 'mdast-util-math'
import 'katex/dist/katex.min.css'

function App() {
  const { blocks } = useIncremark({
    extensions: [math()],
    mdastExtensions: [mathFromMarkdown()]
  })
}
```

:::

### 语法

```markdown
行内公式：$E = mc^2$

块级公式：
$$
\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$
```

## 自定义容器

### 启用边界检测

```ts
const { blocks } = useIncremark({
  containers: true  // 或 { marker: ':', minMarkerLength: 3 }
})
```

### 安装扩展

```bash
pnpm add micromark-extension-directive mdast-util-directive
```

### 配置

```ts
import { directive } from 'micromark-extension-directive'
import { directiveFromMarkdown } from 'mdast-util-directive'

const { blocks } = useIncremark({
  containers: true,
  extensions: [directive()],
  mdastExtensions: [directiveFromMarkdown()]
})
```

### 语法

```markdown
:::warning
这是一个警告框
:::

:::info{title="提示"}
带标题的信息框
:::
```

## 自定义扩展

### 创建 micromark 扩展

```ts
import type { Extension } from 'micromark-util-types'

const myExtension: Extension = {
  // 定义语法规则
}
```

### 创建 mdast 扩展

```ts
import type { Extension } from 'mdast-util-from-markdown'

const myMdastExtension: Extension = {
  enter: {
    myNode(token) {
      // 处理进入节点
    }
  },
  exit: {
    myNode(token) {
      // 处理退出节点
    }
  }
}
```

### 使用

```ts
const { blocks } = useIncremark({
  extensions: [myExtension],
  mdastExtensions: [myMdastExtension]
})
```

## 边界检测注意事项

添加自定义语法时，需要确保 Incremark 能正确检测块边界。

对于需要闭合标记的块（如 `:::` 容器），启用 `containers` 选项：

```ts
const { blocks } = useIncremark({
  containers: {
    marker: ':',
    minMarkerLength: 3,
    allowedNames: ['warning', 'info', 'tip']
  }
})
```

这样 Incremark 会等待闭合标记后才将块标记为完成。

