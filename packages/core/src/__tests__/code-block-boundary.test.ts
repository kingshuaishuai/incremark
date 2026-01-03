/**
 * P0-5: 代码块边界检测测试
 *
 * 测试目标：
 * 1. 基础代码块的边界检测
 * 2. 不同 fence 字符（` 和 ~）的边界检测
 * 3. 代码块内包含空行的处理
 * 4. 嵌套代码块的处理
 * 5. 代码块与后续内容的边界
 * 6. 缩进代码块的边界检测
 */

import { describe, it, expect } from 'vitest'
import { IncremarkParser } from '../parser/IncremarkParser'
import { normalizeAst } from './helpers/test-utils'

describe('P0-5: 代码块边界检测', () => {
  it('基础代码块 - 代码块后接段落', () => {
    const markdown = `\`\`\`
代码内容
\`\`\`

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

  it('基础代码块 - 多行代码块', () => {
    const markdown = `\`\`\`
第一行代码
第二行代码
第三行代码
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

  it('基础代码块 - 代码块后接标题', () => {
    const markdown = `\`\`\`
代码内容
\`\`\`

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

  it('基础代码块 - 代码块后接列表', () => {
    const markdown = `\`\`\`
代码内容
\`\`\`

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

  it('基础代码块 - 代码块后接引用块', () => {
    const markdown = `\`\`\`
代码内容
\`\`\`

> 引用内容`

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

  it('代码块内包含空行', () => {
    const markdown = `\`\`\`
第一行代码


第三行代码
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

  it('代码块内包含特殊字符 - 反引号', () => {
    const markdown = `\`\`\`
代码中包含 \` 反引号
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

  it('代码块内包含特殊字符 - 波浪号', () => {
    const markdown = `\`\`\`
代码中包含 ~ 波浪号
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

  it('不同 fence 字符 - 使用 ~ 作为 fence', () => {
    const markdown = `\`\`\`
代码内容
\`\`\`

~~~
代码内容
~~~`

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

  it('不同 fence 长度 - 3 个反引号', () => {
    const markdown = `\`\`\`
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

  it('不同 fence 长度 - 4 个反引号', () => {
    const markdown = `\`\`\`\`
代码内容
\`\`\`\``

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

  it('不同 fence 长度 - 5 个反引号', () => {
    const markdown = `\`\`\`\`\`
代码内容
\`\`\`\`\``

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

  it('带语言标记的代码块', () => {
    const markdown = `\`\`\`javascript
const x = 1;
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

  it('多个连续代码块', () => {
    const markdown = `\`\`\`
代码块 1
\`\`\`

\`\`\`
代码块 2
\`\`\`

\`\`\`
代码块 3
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

  it('代码块 - 流式解析', () => {
    const markdown = `\`\`\`
代码内容
\`\`\`

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

  it('代码块 - 代码块后接分割线', () => {
    const markdown = `\`\`\`
代码内容
\`\`\`

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

  it('代码块 - 空代码块', () => {
    const markdown = `\`\`\`
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

  it('代码块 - 代码块内只有空行', () => {
    const markdown = `\`\`\`


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

  it('代码块 - 逐字符解析', () => {
    const markdown = `\`\`\`
代码内容
\`\`\`

段落内容`

    // 一次性解析
    const onePassParser = new IncremarkParser()
    onePassParser.append(markdown)
    const onePass = normalizeAst(onePassParser.getAst())

    // 增量解析（逐字符）
    const incrementalParser = new IncremarkParser()
    for (let i = 0; i < markdown.length; i++) {
      incrementalParser.append(markdown[i])
    }
    const incremental = normalizeAst(incrementalParser.getAst())

    expect(incremental).toEqual(onePass)
  })
})

