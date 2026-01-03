/**
 * P0-4: 引用块边界检测测试
 *
 * 测试目标：
 * 1. 单层引用块的边界检测
 * 2. 多层嵌套引用块的边界检测
 * 3. 引用块与后续内容的边界
 * 4. 引用块内包含其他块（列表、代码块等）
 * 5. 引用块与空行的交互
 */

import { describe, it, expect } from 'vitest'
import { IncremarkParser } from '../parser/IncremarkParser'
import { normalizeAst } from './helpers/test-utils'

describe('P0-4: 引用块边界检测', () => {
  it('单层引用块 - 引用块后接段落', () => {
    const markdown = `> 引用内容

这是一个段落`

    // 一次性解析
    const onePassParser = new IncremarkParser()
    onePassParser.append(markdown)
    const onePass = normalizeAst(onePassParser.getAst())

    // 增量解析（逐行）
    const incrementalParser = new IncremarkParser()
    const lines = markdown.split('\n')
    for (const line of lines) {
      incrementalParser.append(line + '\n')
    }
    const incremental = normalizeAst(incrementalParser.getAst())

    expect(incremental).toEqual(onePass)
  })

  it('单层引用块 - 多行引用块', () => {
    const markdown = `> 第一行引用
> 第二行引用
> 第三行引用`

    // 一次性解析
    const onePassParser = new IncremarkParser()
    onePassParser.append(markdown)
    const onePass = normalizeAst(onePassParser.getAst())

    // 增量解析（逐行）
    const incrementalParser = new IncremarkParser()
    const lines = markdown.split('\n')
    for (const line of lines) {
      incrementalParser.append(line + '\n')
    }
    const incremental = normalizeAst(incrementalParser.getAst())

    expect(incremental).toEqual(onePass)
  })

  it('单层引用块 - 引用块后接标题', () => {
    const markdown = `> 引用内容

# 标题`

    // 一次性解析
    const onePassParser = new IncremarkParser()
    onePassParser.append(markdown)
    const onePass = normalizeAst(onePassParser.getAst())

    // 增量解析（逐行）
    const incrementalParser = new IncremarkParser()
    const lines = markdown.split('\n')
    for (const line of lines) {
      incrementalParser.append(line + '\n')
    }
    const incremental = normalizeAst(incrementalParser.getAst())

    expect(incremental).toEqual(onePass)
  })

  it('单层引用块 - 引用块后接列表', () => {
    const markdown = `> 引用内容

- 列表项 1
- 列表项 2`

    // 一次性解析
    const onePassParser = new IncremarkParser()
    onePassParser.append(markdown)
    const onePass = normalizeAst(onePassParser.getAst())

    // 增量解析（逐行）
    const incrementalParser = new IncremarkParser()
    const lines = markdown.split('\n')
    for (const line of lines) {
      incrementalParser.append(line + '\n')
    }
    const incremental = normalizeAst(incrementalParser.getAst())

    expect(incremental).toEqual(onePass)
  })

  it('单层引用块 - 引用块后接代码块', () => {
    const markdown = `> 引用内容

\`\`\`
代码内容
\`\`\``

    // 一次性解析
    const onePassParser = new IncremarkParser()
    onePassParser.append(markdown)
    const onePass = normalizeAst(onePassParser.getAst())

    // 增量解析（逐行）
    const incrementalParser = new IncremarkParser()
    const lines = markdown.split('\n')
    for (const line of lines) {
      incrementalParser.append(line + '\n')
    }
    const incremental = normalizeAst(incrementalParser.getAst())

    expect(incremental).toEqual(onePass)
  })

  it('嵌套引用块 - 二层嵌套', () => {
    const markdown = `> 外层引用
> > 内层引用
> > 内层引用继续
> 外层引用继续`

    // 一次性解析
    const onePassParser = new IncremarkParser()
    onePassParser.append(markdown)
    const onePass = normalizeAst(onePassParser.getAst())

    // 增量解析（逐行）
    const incrementalParser = new IncremarkParser()
    const lines = markdown.split('\n')
    for (const line of lines) {
      incrementalParser.append(line + '\n')
    }
    const incremental = normalizeAst(incrementalParser.getAst())

    expect(incremental).toEqual(onePass)
  })

  it('嵌套引用块 - 三层嵌套', () => {
    const markdown = `> 第一层
> > 第二层
> > > 第三层
> > 第二层继续
> 第一层继续`

    // 一次性解析
    const onePassParser = new IncremarkParser()
    onePassParser.append(markdown)
    const onePass = normalizeAst(onePassParser.getAst())

    // 增量解析（逐行）
    const incrementalParser = new IncremarkParser()
    const lines = markdown.split('\n')
    for (const line of lines) {
      incrementalParser.append(line + '\n')
    }
    const incremental = normalizeAst(incrementalParser.getAst())

    expect(incremental).toEqual(onePass)
  })

  it('嵌套引用块 - 多个引用块', () => {
    const markdown = `> 引用块 1

> 引用块 2

> 引用块 3`

    // 一次性解析
    const onePassParser = new IncremarkParser()
    onePassParser.append(markdown)
    const onePass = normalizeAst(onePassParser.getAst())

    // 增量解析（逐行）
    const incrementalParser = new IncremarkParser()
    const lines = markdown.split('\n')
    for (const line of lines) {
      incrementalParser.append(line + '\n')
    }
    const incremental = normalizeAst(incrementalParser.getAst())

    expect(incremental).toEqual(onePass)
  })

  it('引用块包含列表', () => {
    const markdown = `> 引用内容：
> - 列表项 1
> - 列表项 2
> - 列表项 3`

    // 一次性解析
    const onePassParser = new IncremarkParser()
    onePassParser.append(markdown)
    const onePass = normalizeAst(onePassParser.getAst())

    // 增量解析（逐行）
    const incrementalParser = new IncremarkParser()
    const lines = markdown.split('\n')
    for (const line of lines) {
      incrementalParser.append(line + '\n')
    }
    const incremental = normalizeAst(incrementalParser.getAst())

    expect(incremental).toEqual(onePass)
  })

  it('引用块包含代码块', () => {
    const markdown = `> 引用内容：
> 
> \`\`\`
> 代码内容
> \`\`\``

    // 一次性解析
    const onePassParser = new IncremarkParser()
    onePassParser.append(markdown)
    const onePass = normalizeAst(onePassParser.getAst())

    // 增量解析（逐行）
    const incrementalParser = new IncremarkParser()
    const lines = markdown.split('\n')
    for (const line of lines) {
      incrementalParser.append(line + '\n')
    }
    const incremental = normalizeAst(incrementalParser.getAst())

    expect(incremental).toEqual(onePass)
  })

  it('引用块包含标题', () => {
    const markdown = `> 引用内容：
> 
> # 引用中的标题`

    // 一次性解析
    const onePassParser = new IncremarkParser()
    onePassParser.append(markdown)
    const onePass = normalizeAst(onePassParser.getAst())

    // 增量解析（逐行）
    const incrementalParser = new IncremarkParser()
    const lines = markdown.split('\n')
    for (const line of lines) {
      incrementalParser.append(line + '\n')
    }
    const incremental = normalizeAst(incrementalParser.getAst())

    expect(incremental).toEqual(onePass)
  })

  it('引用块包含嵌套列表', () => {
    const markdown = `> 引用内容：
> - 外层列表项 1
>   - 内层列表项 1
>   - 内层列表项 2
> - 外层列表项 2`

    // 一次性解析
    const onePassParser = new IncremarkParser()
    onePassParser.append(markdown)
    const onePass = normalizeAst(onePassParser.getAst())

    // 增量解析（逐行）
    const incrementalParser = new IncremarkParser()
    const lines = markdown.split('\n')
    for (const line of lines) {
      incrementalParser.append(line + '\n')
    }
    const incremental = normalizeAst(incrementalParser.getAst())

    expect(incremental).toEqual(onePass)
  })

  it('引用块 - 流式解析', () => {
    const markdown = `> 引用内容

段落内容`

    // 一次性解析
    const onePassParser = new IncremarkParser()
    onePassParser.append(markdown)
    const onePass = normalizeAst(onePassParser.getAst())

    // 增量解析（小 chunk）
    const incrementalParser = new IncremarkParser()
    const chunkSize = 3
    for (let i = 0; i < markdown.length; i += chunkSize) {
      incrementalParser.append(markdown.slice(i, i + chunkSize))
    }
    const incremental = normalizeAst(incrementalParser.getAst())

    expect(incremental).toEqual(onePass)
  })

  it('引用块 - 引用块后接另一个引用块', () => {
    const markdown = `> 第一个引用块

> 第二个引用块`

    // 一次性解析
    const onePassParser = new IncremarkParser()
    onePassParser.append(markdown)
    const onePass = normalizeAst(onePassParser.getAst())

    // 增量解析（逐行）
    const incrementalParser = new IncremarkParser()
    const lines = markdown.split('\n')
    for (const line of lines) {
      incrementalParser.append(line + '\n')
    }
    const incremental = normalizeAst(incrementalParser.getAst())

    expect(incremental).toEqual(onePass)
  })

  it('引用块 - 引用块后接分割线', () => {
    const markdown = `> 引用内容

---

段落`

    // 一次性解析
    const onePassParser = new IncremarkParser()
    onePassParser.append(markdown)
    const onePass = normalizeAst(onePassParser.getAst())

    // 增量解析（逐行）
    const incrementalParser = new IncremarkParser()
    const lines = markdown.split('\n')
    for (const line of lines) {
      incrementalParser.append(line + '\n')
    }
    const incremental = normalizeAst(incrementalParser.getAst())

    expect(incremental).toEqual(onePass)
  })
})

