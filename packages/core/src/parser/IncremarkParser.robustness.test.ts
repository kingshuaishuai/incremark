/**
 * 健壮性测试
 * 测试边界情况、异常输入和极端场景
 */

import { describe, it, expect } from 'vitest'
import { IncremarkParser } from './IncremarkParser'

describe('健壮性测试', () => {
  describe('空输入和边界情况', () => {
    it('空字符串输入', () => {
      const parser = new IncremarkParser()
      const result = parser.append('')
      expect(result.ast.children.length).toBe(0)

      const final = parser.finalize()
      expect(final.ast.children.length).toBe(0)
    })

    it('多次空字符串输入', () => {
      const parser = new IncremarkParser()
      for (let i = 0; i < 100; i++) {
        parser.append('')
      }
      const result = parser.finalize()
      expect(result.ast.children.length).toBe(0)
    })

    it('只有空白字符', () => {
      const parser = new IncremarkParser()
      parser.append('   \n\n\t\t\n   \n')
      const result = parser.finalize()
      expect(result.ast).toBeDefined()
    })

    it('只有换行符', () => {
      const parser = new IncremarkParser()
      parser.append('\n\n\n\n\n')
      const result = parser.finalize()
      expect(result.ast).toBeDefined()
    })

    it('单个字符', () => {
      const parser = new IncremarkParser()
      parser.append('a')
      const result = parser.finalize()
      expect(result.ast.children.length).toBe(1)
    })

    it('单个换行符', () => {
      const parser = new IncremarkParser()
      parser.append('\n')
      const result = parser.finalize()
      expect(result.ast).toBeDefined()
    })
  })

  describe('特殊字符处理', () => {
    it('Unicode 字符', () => {
      const parser = new IncremarkParser()
      parser.append('# 中文标题 🎉\n\n这是一段包含日文（日本語）和韩文（한국어）的内容。')
      const result = parser.finalize()
      expect(result.ast.children.length).toBe(2)
    })

    it('Emoji 表情', () => {
      const parser = new IncremarkParser()
      parser.append('# 🚀🎨🔥\n\n段落 😀😁😂🤣')
      const result = parser.finalize()
      expect(result.ast.children.length).toBe(2)
    })

    it('零宽字符', () => {
      const parser = new IncremarkParser()
      // 零宽空格 U+200B, 零宽非连接符 U+200C, 零宽连接符 U+200D
      parser.append('Hello\u200B\u200C\u200DWorld')
      const result = parser.finalize()
      expect(result.ast).toBeDefined()
    })

    it('控制字符', () => {
      const parser = new IncremarkParser()
      parser.append('Hello\x00\x01\x02World')
      const result = parser.finalize()
      expect(result.ast).toBeDefined()
    })

    it('反斜杠转义', () => {
      const parser = new IncremarkParser()
      parser.append('\\# 不是标题\n\n\\*\\*不是粗体\\*\\*')
      const result = parser.finalize()
      expect(result.ast).toBeDefined()
    })
  })

  describe('畸形 Markdown', () => {
    it('未闭合的代码块', () => {
      const parser = new IncremarkParser()
      parser.append('```javascript\nconst x = 1;\n// 没有闭合')
      const result = parser.finalize()
      expect(result.ast).toBeDefined()
    })

    it('不匹配的代码块标记', () => {
      const parser = new IncremarkParser()
      parser.append('```\n代码\n~~~')
      const result = parser.finalize()
      expect(result.ast).toBeDefined()
    })

    it('嵌套的代码块标记', () => {
      const parser = new IncremarkParser()
      parser.append('````\n```\ncode\n```\n````')
      const result = parser.finalize()
      expect(result.ast).toBeDefined()
    })

    it('不完整的链接', () => {
      const parser = new IncremarkParser()
      parser.append('[链接文字(没有URL\n\n[另一个](')
      const result = parser.finalize()
      expect(result.ast).toBeDefined()
    })

    it('不完整的图片', () => {
      const parser = new IncremarkParser()
      parser.append('![alt](')
      const result = parser.finalize()
      expect(result.ast).toBeDefined()
    })

    it('嵌套的强调标记', () => {
      const parser = new IncremarkParser()
      parser.append('***混乱**的*标记***')
      const result = parser.finalize()
      expect(result.ast).toBeDefined()
    })

    it('不匹配的表格列', () => {
      const parser = new IncremarkParser()
      parser.append('| A | B | C |\n|---|---|\n| 1 | 2 | 3 | 4 | 5 |')
      const result = parser.finalize()
      expect(result.ast).toBeDefined()
    })
  })

  describe('极端嵌套', () => {
    it('深层引用嵌套', () => {
      const parser = new IncremarkParser()
      let content = ''
      for (let i = 0; i < 50; i++) {
        content += '>'.repeat(i + 1) + ' 第 ' + (i + 1) + ' 层\n'
      }
      parser.append(content)
      const result = parser.finalize()
      expect(result.ast).toBeDefined()
    })

    it('深层列表嵌套', () => {
      const parser = new IncremarkParser()
      let content = ''
      for (let i = 0; i < 20; i++) {
        content += '  '.repeat(i) + '- 第 ' + (i + 1) + ' 层\n'
      }
      parser.append(content)
      const result = parser.finalize()
      expect(result.ast).toBeDefined()
    })

    it('混合嵌套', () => {
      const parser = new IncremarkParser()
      const content = `
> 引用
> - 列表
>   > 嵌套引用
>   > - 嵌套列表
>   >   > 更深的引用
>   >   > \`\`\`
>   >   > code
>   >   > \`\`\`
`
      parser.append(content)
      const result = parser.finalize()
      expect(result.ast).toBeDefined()
    })
  })

  describe('超长内容', () => {
    it('非常长的行', () => {
      const parser = new IncremarkParser()
      const longLine = 'a'.repeat(100000)
      parser.append(longLine)
      const result = parser.finalize()
      expect(result.ast.children.length).toBe(1)
    })

    it('大量短行', () => {
      const parser = new IncremarkParser()
      let content = ''
      for (let i = 0; i < 10000; i++) {
        content += 'line ' + i + '\n\n'
      }
      parser.append(content)
      const result = parser.finalize()
      expect(result.ast.children.length).toBe(10000)
    })

    it('大文档分块解析', () => {
      const parser = new IncremarkParser()
      let content = ''
      for (let i = 0; i < 1000; i++) {
        content += `## 标题 ${i}\n\n段落内容 ${i}。\n\n`
      }

      // 分块解析
      const chunkSize = 1000
      for (let i = 0; i < content.length; i += chunkSize) {
        const chunk = content.slice(i, i + chunkSize)
        const update = parser.append(chunk)
        expect(update.ast).toBeDefined()
      }

      const result = parser.finalize()
      expect(result.ast.children.length).toBe(2000) // 1000 标题 + 1000 段落
    })
  })

  describe('换行符处理', () => {
    it('Windows 换行符 (CRLF)', () => {
      const parser = new IncremarkParser()
      parser.append('# 标题\r\n\r\n段落内容\r\n')
      const result = parser.finalize()
      expect(result.ast.children.length).toBeGreaterThan(0)
    })

    it('Mac 旧式换行符 (CR)', () => {
      const parser = new IncremarkParser()
      parser.append('# 标题\r\r段落内容\r')
      const result = parser.finalize()
      expect(result.ast).toBeDefined()
    })

    it('混合换行符', () => {
      const parser = new IncremarkParser()
      parser.append('行1\n行2\r\n行3\r行4')
      const result = parser.finalize()
      expect(result.ast).toBeDefined()
    })
  })

  describe('API 调用顺序', () => {
    it('多次 finalize', () => {
      const parser = new IncremarkParser()
      parser.append('# Hello')

      const result1 = parser.finalize()
      const result2 = parser.finalize()
      const result3 = parser.finalize()

      expect(result1.ast.children.length).toBe(1)
      expect(result2.ast.children.length).toBe(1)
      expect(result3.ast.children.length).toBe(1)
    })

    it('finalize 后继续 append', () => {
      const parser = new IncremarkParser()
      parser.append('# Hello')
      parser.finalize()

      // finalize 后再 append
      parser.append('\n\n## World')
      const result = parser.finalize()

      expect(result.ast.children.length).toBe(2)
    })

    it('交替 append 和 getAst', () => {
      const parser = new IncremarkParser()

      for (let i = 0; i < 10; i++) {
        parser.append(`段落 ${i}\n\n`)
        const ast = parser.getAst()
        expect(ast).toBeDefined()
        expect(ast.type).toBe('root')
      }

      const final = parser.finalize()
      expect(final.ast.children.length).toBe(10)
    })

    it('多次 reset', () => {
      const parser = new IncremarkParser()

      for (let i = 0; i < 100; i++) {
        parser.append('# 标题 ' + i)
        parser.finalize()
        parser.reset()
      }

      // 最后一次
      parser.append('# 最终标题')
      const result = parser.finalize()
      expect(result.ast.children.length).toBe(1)
    })

    it('abort 后继续使用', () => {
      const parser = new IncremarkParser()
      parser.append('# Hello\n\nWorld')
      parser.abort()

      parser.append('\n\n# New')
      const result = parser.finalize()

      expect(result.ast.children.length).toBe(3)
    })
  })

  describe('选项处理', () => {
    it('空选项对象', () => {
      const parser = new IncremarkParser({})
      parser.append('# Hello')
      const result = parser.finalize()
      expect(result.ast.children.length).toBe(1)
    })

    it('undefined 选项', () => {
      const parser = new IncremarkParser(undefined)
      parser.append('# Hello')
      const result = parser.finalize()
      expect(result.ast.children.length).toBe(1)
    })

    it('容器选项为 true', () => {
      const parser = new IncremarkParser({ containers: true })
      parser.append(':::note\n内容\n:::')
      const result = parser.finalize()
      expect(result.ast).toBeDefined()
    })

    it('容器选项为对象', () => {
      const parser = new IncremarkParser({
        containers: { marker: ':', minMarkerLength: 3 }
      })
      parser.append(':::note\n内容\n:::')
      const result = parser.finalize()
      expect(result.ast).toBeDefined()
    })
  })

  describe('并发稳定性模拟', () => {
    it('快速连续 append', () => {
      const parser = new IncremarkParser()

      // 模拟快速连续的 chunk
      const chunks = 'Hello World! This is a test.'.split('')
      for (const chunk of chunks) {
        const update = parser.append(chunk)
        expect(update.ast).toBeDefined()
      }

      const result = parser.finalize()
      expect(result.ast.children.length).toBe(1)
    })

    it('交错的大小 chunk', () => {
      const parser = new IncremarkParser()

      const content = '# 标题\n\n段落1\n\n段落2\n\n```\ncode\n```'
      let i = 0

      while (i < content.length) {
        // 交替使用 1 字符和 10 字符的 chunk
        const size = i % 2 === 0 ? 1 : 10
        const chunk = content.slice(i, Math.min(i + size, content.length))
        parser.append(chunk)
        i += size
      }

      const result = parser.finalize()
      expect(result.ast.children.length).toBe(4)
    })
  })

  describe('字符串字面量中的特殊序列', () => {
    it('包含 \\n 字面量的代码', () => {
      const parser = new IncremarkParser()
      parser.append('```\nconst str = "line1\\nline2";\n```')
      const result = parser.finalize()
      expect(result.ast.children.length).toBe(1)
    })

    it('包含反引号的代码块', () => {
      const parser = new IncremarkParser()
      parser.append('````\n```\n内层代码块\n```\n````')
      const result = parser.finalize()
      expect(result.ast.children.length).toBe(1)
    })

    it('行内代码中的特殊字符', () => {
      const parser = new IncremarkParser()
      parser.append('这是 `const x = "`; \\n \\` \\\\` 行内代码')
      const result = parser.finalize()
      expect(result.ast).toBeDefined()
    })
  })

  describe('getBuffer 和 getCompletedBlocks', () => {
    it('getBuffer 返回完整缓冲区', () => {
      const parser = new IncremarkParser()
      parser.append('Hello ')
      parser.append('World')

      expect(parser.getBuffer()).toBe('Hello World')
    })

    it('getCompletedBlocks 返回副本', () => {
      const parser = new IncremarkParser()
      parser.append('# 标题\n\n')

      const blocks1 = parser.getCompletedBlocks()
      const blocks2 = parser.getCompletedBlocks()

      expect(blocks1).not.toBe(blocks2) // 不是同一引用
      expect(blocks1).toEqual(blocks2) // 内容相同
    })
  })
})

