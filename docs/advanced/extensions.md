# Extensions

## micromark Extensions

Use existing `micromark` extensions to support new syntax.

```ts
import { gfmTable } from 'micromark-extension-gfm-table'

const options = {
  extensions: [gfmTable()]
}

<IncremarkContent :incremark-options="options" />
```

## mdast Extensions

Use `mdast-util-from-markdown` extensions to transform syntax to AST.

```ts
import { gfmTableFromMarkdown } from 'mdast-util-gfm-table'

const options = {
  mdastExtensions: [gfmTableFromMarkdown()]
}
```
