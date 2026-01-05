# 扩展功能

## micromark 扩展

使用现有的 `micromark` 扩展以支持新语法。

```ts
import { gfmTable } from 'micromark-extension-gfm-table'

const options = {
  extensions: [gfmTable()]
}

<IncremarkContent :incremark-options="options" />
```

## mdast 扩展

使用 `mdast-util-from-markdown` 扩展将语法转换为 AST。

```ts
import { gfmTableFromMarkdown } from 'mdast-util-gfm-table'

const options = {
  mdastExtensions: [gfmTableFromMarkdown()]
}
```
