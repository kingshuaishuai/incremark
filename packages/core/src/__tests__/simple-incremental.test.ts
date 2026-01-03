/**
 * 简单的增量解析一致性测试
 * 
 * 用于快速验证基础功能
 */

import { describe, it, expect } from 'vitest'
import { IncremarkParser } from '../parser/IncremarkParser'
import { normalizeAst } from './helpers/test-utils'

describe('简单增量解析测试', () => {
  it('标题 - 逐字符', () => {
    const markdown = '# 标题'

    // 一次解析
    const onePassParser = new IncremarkParser()
    onePassParser.append(markdown)
    onePassParser.finalize()
    const onePass = normalizeAst(onePassParser.getAst())

    // 逐字符增量解析
    const incrementalParser = new IncremarkParser()
    for (const char of markdown) {
      incrementalParser.append(char)
    }
    incrementalParser.finalize()
    const incremental = normalizeAst(incrementalParser.getAst())

    expect(incremental).toEqual(onePass)
    console.log('✅ 标题逐字符解析一致')
  })

  it('标题 - 逐行', () => {
    const markdown = '# 标题\n\n段落'

    // 一次解析
    const onePassParser = new IncremarkParser()
    onePassParser.append(markdown)
    onePassParser.finalize()
    const onePass = normalizeAst(onePassParser.getAst())

    // 逐行增量解析
    const incrementalParser = new IncremarkParser()
    const lines = markdown.split('\n')
    for (let i = 0; i < lines.length; i++) {
      incrementalParser.append(lines[i] + (i < lines.length - 1 ? '\n' : ''))
    }
    incrementalParser.finalize()
    const incremental = normalizeAst(incrementalParser.getAst())

    expect(incremental).toEqual(onePass)
    console.log('✅ 标题逐行解析一致')
  })

  it('代码块', () => {
    const markdown = '```javascript\nconsole.log("Hello");\n```'

    // 一次解析
    const onePassParser = new IncremarkParser()
    onePassParser.append(markdown)
    onePassParser.finalize()
    const onePass = normalizeAst(onePassParser.getAst())

    // 逐字符增量解析
    const incrementalParser = new IncremarkParser()
    for (const char of markdown) {
      incrementalParser.append(char)
    }
    incrementalParser.finalize()
    const incremental = normalizeAst(incrementalParser.getAst())

    expect(incremental).toEqual(onePass)
    console.log('✅ 代码块解析一致')
  })

  it('列表', () => {
    const markdown = '- 第一项\n- 第二项\n- 第三项'

    // 一次解析
    const onePassParser = new IncremarkParser()
    onePassParser.append(markdown)
    onePassParser.finalize()
    const onePass = normalizeAst(onePassParser.getAst())

    // 逐字符增量解析
    const incrementalParser = new IncremarkParser()
    for (const char of markdown) {
      incrementalParser.append(char)
    }
    incrementalParser.finalize()
    const incremental = normalizeAst(incrementalParser.getAst())

    expect(incremental).toEqual(onePass)
    console.log('✅ 列表解析一致')
  })

  it('引用块', () => {
    const markdown = '> 引用内容\n> 第二行'

    // 一次解析
    const onePassParser = new IncremarkParser()
    onePassParser.append(markdown)
    onePassParser.finalize()
    const onePass = normalizeAst(onePassParser.getAst())

    // 逐字符增量解析
    const incrementalParser = new IncremarkParser()
    for (const char of markdown) {
      incrementalParser.append(char)
    }
    incrementalParser.finalize()
    const incremental = normalizeAst(incrementalParser.getAst())

    expect(incremental).toEqual(onePass)
    console.log('✅ 引用块解析一致')
  })

  it('脚注', () => {
    const markdown = '段落[^1]。\n\n[^1]: 脚注内容。'

    // 一次解析
    const onePassParser = new IncremarkParser({ gfm: true })
    onePassParser.append(markdown)
    onePassParser.finalize()
    const onePass = normalizeAst(onePassParser.getAst())

    // 逐字符增量解析
    const incrementalParser = new IncremarkParser({ gfm: true })
    for (const char of markdown) {
      incrementalParser.append(char)
    }
    incrementalParser.finalize()
    const incremental = normalizeAst(incrementalParser.getAst())

    expect(incremental).toEqual(onePass)
    console.log('✅ 脚注解析一致')
  })

  it('混合内容', () => {
    const markdown = `# 标题

段落内容。

- 列表项 1
- 列表项 2

\`\`\`javascript
const x = 1;
\`\`\`

> 引用内容

脚注[^1]。

[^1]: 脚注说明。`

    // 一次解析
    const onePassParser = new IncremarkParser({ gfm: true })
    onePassParser.append(markdown)
    onePassParser.finalize()
    const onePass = normalizeAst(onePassParser.getAst())

    // 逐字符增量解析
    const incrementalParser = new IncremarkParser({ gfm: true })
    for (const char of markdown) {
      incrementalParser.append(char)
    }
    incrementalParser.finalize()
    const incremental = normalizeAst(incrementalParser.getAst())

    expect(incremental).toEqual(onePass)
    console.log('✅ 混合内容解析一致')
  })
})
