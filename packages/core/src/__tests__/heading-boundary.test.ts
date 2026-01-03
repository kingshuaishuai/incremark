/**
 * P0-3: 标题边界检测测试
 *
 * 测试目标：
 * 1. ATX 标题（# 到 ######）的边界检测
 * 2. Setext 标题（=== 和 --- 下划线）的边界检测
 * 3. 标题与后续内容的边界
 * 4. 多个连续标题的边界
 * 5. 标题与空行的交互
 */

import { describe, it, expect } from 'vitest'
import { IncremarkParser } from '../parser/IncremarkParser'
import { normalizeAst } from './helpers/test-utils'

describe('P0-3: 标题边界检测', () => {
  it('ATX 标题 - 单行标题后接段落', () => {
    const markdown = `# 标题 1

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

  it('ATX 标题 - 多个连续标题', () => {
    const markdown = `# 标题 1
## 标题 2
### 标题 3`

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

  it('ATX 标题 - 标题后接代码块', () => {
    const markdown = `# 标题

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

  it('ATX 标题 - 标题后接列表', () => {
    const markdown = `# 标题

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

  it('ATX 标题 - 标题后接引用块', () => {
    const markdown = `# 标题

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

  it('Setext 标题 - === 下划线标题', () => {
    const markdown = `标题 1
===

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

  it('Setext 标题 - --- 下划线标题', () => {
    const markdown = `标题 2
---

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

  it('Setext 标题 - 多个 Setext 标题', () => {
    const markdown = `标题 1
===
标题 2
---
标题 3
===`

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

  it('Setext 标题 - 混合 ATX 和 Setext', () => {
    const markdown = `# ATX 标题
标题 2
===
### ATX 子标题
标题 3
---`

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

  it('标题 - 标题内空行后接内容', () => {
    const markdown = `# 标题

段落 1

段落 2`

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

  it('标题 - 标题后接分割线', () => {
    const markdown = `# 标题

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

  it('标题 - 所有级别的 ATX 标题', () => {
    const markdown = `# 标题 1
## 标题 2
### 标题 3
#### 标题 4
##### 标题 5
###### 标题 6`

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

  it('标题 - 流式解析标题', () => {
    const markdown = `# 标题

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
})

