/**
 * MarkedAstBuilder 与 MicromarkAstBuilder 输出一致性测试
 *
 * 验证两个 AST 构建器在各种 Markdown 语法下的输出是否一致
 * 忽略 position 和 data 等元信息字段
 *
 * 测试策略：开启所有插件（gfm, math, htmlTree, containers）进行全面测试
 */
import { describe, it, expect } from 'vitest'
import { MarkedAstBuilder } from '../parser/ast/MarkedAstBuildter'
import { MicromarkAstBuilder } from '../parser/ast/MicromarkAstBuilder'

// ============ 完整配置（开启所有插件）============

const fullOptions = {
  gfm: true,
  math: true,
  htmlTree: true,
  containers: true
}

// ============ 测试用例 ============

const testCases = [
  // 基础语法
  {
    name: '标题 - 各级别',
    md: '# H1\n\n## H2\n\n### H3\n\n#### H4\n\n##### H5\n\n###### H6'
  },
  {
    name: '段落',
    md: 'This is a paragraph.\n\nThis is another paragraph.'
  },
  {
    name: '强调 - 粗体和斜体',
    md: 'This is **bold** and *italic* and ***bold italic*** text.'
  },
  {
    name: '行内代码',
    md: 'Use `code` and `another code` here.'
  },
  {
    name: '代码块 - 有语言',
    md: '```javascript\nconst x = 1;\nconsole.log(x);\n```'
  },
  {
    name: '代码块 - 无语言',
    md: '```\nplain code\n```'
  },
  {
    name: '分隔线',
    md: 'before\n\n---\n\nafter'
  },

  // 列表
  {
    name: '无序列表 - 简单',
    md: '- item 1\n- item 2\n- item 3'
  },
  {
    name: '有序列表 - 简单',
    md: '1. first\n2. second\n3. third'
  },
  {
    name: '有序列表 - 非1开始',
    md: '5. fifth\n6. sixth\n7. seventh'
  },
  {
    name: '嵌套列表',
    md: '- item 1\n  - nested 1\n  - nested 2\n- item 2'
  },
  {
    name: '任务列表',
    md: '- [ ] unchecked\n- [x] checked\n- [X] also checked'
  },

  // 链接和图片
  {
    name: '链接 - 简单',
    md: '[link](https://example.com)'
  },
  {
    name: '链接 - 带标题',
    md: '[link](https://example.com "title")'
  },
  {
    name: '图片 - 简单',
    md: '![alt](image.png)'
  },
  {
    name: '图片 - 带标题',
    md: '![alt](image.png "image title")'
  },

  // GFM 扩展
  {
    name: '表格',
    md: '| a | b | c |\n|---|---|---|\n| 1 | 2 | 3 |\n| 4 | 5 | 6 |'
  },
  {
    name: '表格 - 对齐',
    md: '| left | center | right |\n|:-----|:------:|------:|\n| 1 | 2 | 3 |'
  },
  {
    name: '删除线',
    md: '~~deleted text~~'
  },
  {
    name: '自动链接',
    md: 'Visit https://example.com for more.'
  },

  // 脚注
  {
    name: '脚注 - 简单',
    md: 'Text with footnote[^1].\n\n[^1]: Footnote content.'
  },
  {
    name: '脚注 - 多个',
    md: 'First[^a] and second[^b].\n\n[^a]: Note A\n\n[^b]: Note B'
  },

  // 复杂场景
  {
    name: '混合内容',
    md: `# Title

Paragraph with **bold** and *italic*.

- List item 1
- List item 2

\`\`\`js
code block
\`\`\`

> Blockquote

| Col A | Col B |
|-------|-------|
| 1     | 2     |
`
  },
  // 注意：内联 HTML 不在一致性测试中
  // Marked 会把 <span>text</span> 拆分为多个 text token，而 Micromark 会识别为 html 节点
  // 这是 Marked lexer 的设计限制，非关键问题

  // HTML 块级测试
  {
    name: 'HTML 块级',
    md: '<div>\n  <p>Block HTML</p>\n</div>'
  },
  {
    name: 'HTML 带属性',
    md: '<div class="container" id="main">\n  <span style="color: red">text</span>\n</div>'
  }
  // 启用 htmlTree 后，两个 builder 都会将块级 HTML 解析为 htmlElement 节点
  // Micromark: 转换为 paragraph + text
]

// ============ 工具函数 ============

/**
 * 规范化节点，移除不需要比较的字段
 */
function normalizeNode(node: any): any {
  if (!node) return node
  if (Array.isArray(node)) return node.map(normalizeNode)
  if (typeof node !== 'object') return node

  const result: any = {}
  const keys = Object.keys(node).sort()

  for (const key of keys) {
    // 忽略位置信息
    if (key === 'position') continue
    // 忽略 data 字段
    if (key === 'data') continue
    // 忽略 raw 字段
    if (key === 'raw') continue

    result[key] = normalizeNode(node[key])
  }

  return result
}

/**
 * 获取两个对象的差异（简化版）
 */
function getDifferences(obj1: any, obj2: any, path = ''): string[] {
  const diffs: string[] = []

  if (typeof obj1 !== typeof obj2) {
    diffs.push(`${path}: 类型不同 (${typeof obj1} vs ${typeof obj2})`)
    return diffs
  }

  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) {
      diffs.push(`${path}: 数组长度不同 (${obj1.length} vs ${obj2.length})`)
    }
    const maxLen = Math.max(obj1.length, obj2.length)
    for (let i = 0; i < maxLen; i++) {
      diffs.push(...getDifferences(obj1[i], obj2[i], `${path}[${i}]`))
    }
    return diffs
  }

  if (typeof obj1 === 'object' && obj1 !== null) {
    const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})])
    for (const key of allKeys) {
      diffs.push(...getDifferences(obj1?.[key], obj2?.[key], path ? `${path}.${key}` : key))
    }
    return diffs
  }

  if (obj1 !== obj2) {
    diffs.push(`${path}: ${JSON.stringify(obj1)} vs ${JSON.stringify(obj2)}`)
  }

  return diffs
}

// ============ 测试 ============

describe('MarkedAstBuilder vs MicromarkAstBuilder 一致性（全插件）', () => {
  const markedBuilder = new MarkedAstBuilder(fullOptions)
  const micromarkBuilder = new MicromarkAstBuilder(fullOptions)

  for (const testCase of testCases) {
    it(testCase.name, () => {
      const markedAst = markedBuilder.parse(testCase.md)
      const micromarkAst = micromarkBuilder.parse(testCase.md)

      const normalizedMarked = normalizeNode(markedAst)
      const normalizedMicromark = normalizeNode(micromarkAst)

      const isEqual =
        JSON.stringify(normalizedMarked) === JSON.stringify(normalizedMicromark)

      if (!isEqual) {
        const diffs = getDifferences(normalizedMarked, normalizedMicromark)
        console.log(`\n差异 [${testCase.name}]:`)
        diffs.slice(0, 10).forEach((d) => console.log(`  - ${d}`))
        if (diffs.length > 10) {
          console.log(`  ... 还有 ${diffs.length - 10} 个差异`)
        }
      }

      expect(normalizedMarked).toEqual(normalizedMicromark)
    })
  }
})

describe('特定字段对齐验证', () => {
  const markedBuilder = new MarkedAstBuilder(fullOptions)

  it('代码块应包含 meta: null', () => {
    const ast = markedBuilder.parse('```js\ncode\n```')
    const codeNode = ast.children[0] as any
    expect(codeNode.type).toBe('code')
    expect(codeNode.meta).toBe(null)
  })

  it('无序列表应有 start: null', () => {
    const ast = markedBuilder.parse('- item')
    const listNode = ast.children[0] as any
    expect(listNode.type).toBe('list')
    expect(listNode.ordered).toBe(false)
    expect(listNode.start).toBe(null)
  })

  it('有序列表应有 start: number', () => {
    const ast = markedBuilder.parse('1. item')
    const listNode = ast.children[0] as any
    expect(listNode.type).toBe('list')
    expect(listNode.ordered).toBe(true)
    expect(listNode.start).toBe(1)
  })

  it('有序列表非1开始应保留 start', () => {
    const ast = markedBuilder.parse('5. item')
    const listNode = ast.children[0] as any
    expect(listNode.start).toBe(5)
  })

  it('列表项应包含 checked: null（非任务列表）', () => {
    const ast = markedBuilder.parse('- item')
    const listNode = ast.children[0] as any
    const listItem = listNode.children[0]
    expect(listItem.checked).toBe(null)
  })

  it('任务列表项 checked 应为 boolean', () => {
    const ast = markedBuilder.parse('- [ ] unchecked\n- [x] checked')
    const listNode = ast.children[0] as any
    expect(listNode.children[0].checked).toBe(false)
    expect(listNode.children[1].checked).toBe(true)
  })

  it('链接无标题时应有 title: null', () => {
    const ast = markedBuilder.parse('[link](url)')
    const para = ast.children[0] as any
    const link = para.children[0]
    expect(link.type).toBe('link')
    expect(link.title).toBe(null)
  })

  it('链接有标题时应保留 title', () => {
    const ast = markedBuilder.parse('[link](url "my title")')
    const para = ast.children[0] as any
    const link = para.children[0]
    expect(link.title).toBe('my title')
  })

  it('图片无标题时应有 title: null', () => {
    const ast = markedBuilder.parse('![alt](url)')
    const para = ast.children[0] as any
    const image = para.children[0]
    expect(image.type).toBe('image')
    expect(image.title).toBe(null)
  })

  it('图片有标题时应保留 title', () => {
    const ast = markedBuilder.parse('![alt](url "img title")')
    const para = ast.children[0] as any
    const image = para.children[0]
    expect(image.title).toBe('img title')
  })
})

describe('HTML 解析行为验证', () => {
  it('未启用 htmlTree 时行为差异（已知）', () => {
    // 未启用 htmlTree 时，两个 builder 的 HTML 处理方式不同
    // Marked: 保留原始 html 节点
    // Micromark: 转换为 paragraph + text（更安全的默认行为）
    const markedBuilder = new MarkedAstBuilder({ gfm: true })
    const micromarkBuilder = new MicromarkAstBuilder({ gfm: true })

    const md = '<div>content</div>'

    const markedAst = markedBuilder.parse(md)
    const micromarkAst = micromarkBuilder.parse(md)

    // Marked 保留 html 节点
    expect((markedAst.children[0] as any).type).toBe('html')
    // Micromark 转为 paragraph + text
    expect((micromarkAst.children[0] as any).type).toBe('paragraph')
  })

  it('启用 htmlTree 后块级 HTML 输出一致（htmlElement）', () => {
    const markedBuilder = new MarkedAstBuilder(fullOptions)
    const micromarkBuilder = new MicromarkAstBuilder(fullOptions)

    const md = '<div><p>content</p></div>'

    const markedAst = markedBuilder.parse(md)
    const micromarkAst = micromarkBuilder.parse(md)

    // 两者都输出 htmlElement 节点
    expect((markedAst.children[0] as any).type).toBe('htmlElement')
    expect((micromarkAst.children[0] as any).type).toBe('htmlElement')

    // 结构也应一致
    expect((markedAst.children[0] as any).tagName).toBe('div')
    expect((micromarkAst.children[0] as any).tagName).toBe('div')
  })

  it('软换行处理一致（关闭 breaks 后）', () => {
    // 关闭 breaks: false 后，软换行不再转为 break 节点
    // 而是保留在 text 节点的 value 中，与 Micromark 一致
    const markedBuilder = new MarkedAstBuilder(fullOptions)
    const micromarkBuilder = new MicromarkAstBuilder(fullOptions)

    const md = 'line 1\nline 2'

    const markedAst = markedBuilder.parse(md)
    const micromarkAst = micromarkBuilder.parse(md)

    const markedPara = markedAst.children[0] as any
    const micromarkPara = micromarkAst.children[0] as any

    // 两者应该都只有一个 text 节点，包含换行符
    expect(markedPara.children.length).toBe(1)
    expect(micromarkPara.children.length).toBe(1)
    expect(markedPara.children[0].type).toBe('text')
    expect(markedPara.children[0].value).toBe('line 1\nline 2')
    expect(micromarkPara.children[0].value).toBe('line 1\nline 2')
  })

  it('硬换行（双空格）处理一致', () => {
    const markedBuilder = new MarkedAstBuilder(fullOptions)
    const micromarkBuilder = new MicromarkAstBuilder(fullOptions)

    const md = 'line 1  \nline 2'

    const markedAst = markedBuilder.parse(md)
    const micromarkAst = micromarkBuilder.parse(md)

    const markedPara = markedAst.children[0] as any
    const micromarkPara = micromarkAst.children[0] as any

    // 两者都应该有 break 节点
    expect(markedPara.children.length).toBe(3)
    expect(micromarkPara.children.length).toBe(3)
    expect(markedPara.children[1].type).toBe('break')
    expect(micromarkPara.children[1].type).toBe('break')
  })

  it('启用 htmlTree 后内联 HTML 输出一致（htmlElement）', () => {
    // 通过自定义 inlineHtml 扩展，Marked 现在也能正确识别内联 HTML
    const markedBuilder = new MarkedAstBuilder(fullOptions)
    const micromarkBuilder = new MicromarkAstBuilder(fullOptions)

    const md = 'Text with <span>inline</span> here.'

    const markedAst = markedBuilder.parse(md)
    const micromarkAst = micromarkBuilder.parse(md)

    const markedPara = markedAst.children[0] as any
    const micromarkPara = micromarkAst.children[0] as any

    // 两者都是 paragraph
    expect(markedPara.type).toBe('paragraph')
    expect(micromarkPara.type).toBe('paragraph')

    // 两者结构一致: [text "Text with ", htmlElement span, text " here."]
    expect(markedPara.children.length).toBe(3)
    expect(micromarkPara.children.length).toBe(3)

    // 两者都包含 htmlElement 节点
    expect(markedPara.children[1].type).toBe('htmlElement')
    expect(markedPara.children[1].tagName).toBe('span')

    expect(micromarkPara.children[1].type).toBe('htmlElement')
    expect(micromarkPara.children[1].tagName).toBe('span')

    // 完整一致性验证
    expect(normalizeNode(markedAst)).toEqual(normalizeNode(micromarkAst))
  })
})
