import { describe, it, expect, beforeEach } from 'vitest'
import { IncremarkParser, createIncremarkParser } from '../parser/IncremarkParser'

describe('IncremarkParser', () => {
  let parser: IncremarkParser

  beforeEach(() => {
    parser = createIncremarkParser()
  })

  describe('基本解析', () => {
    it('解析单个段落', () => {
      parser.append('Hello, World!')
      const result = parser.finalize()

      expect(result.ast.children).toHaveLength(1)
      expect(result.ast.children[0].type).toBe('paragraph')
    })

    it('解析多个段落', () => {
      parser.append('第一段\n\n第二段')
      const result = parser.finalize()

      expect(result.ast.children).toHaveLength(2)
    })

    it('解析标题', () => {
      parser.append('# 标题一\n\n## 标题二\n\n内容')
      const result = parser.finalize()

      expect(result.ast.children).toHaveLength(3)
      expect(result.ast.children[0].type).toBe('heading')
      expect(result.ast.children[1].type).toBe('heading')
    })

    it('解析代码块', () => {
      parser.append('```js\nconsole.log("hi")\n```\n\n段落')
      const result = parser.finalize()

      expect(result.ast.children).toHaveLength(2)
      expect(result.ast.children[0].type).toBe('code')
    })
  })

  describe('增量解析', () => {
    it('逐字符输入', () => {
      const text = '# Hi\n\nOK'
      for (const char of text) {
        parser.append(char)
      }
      const result = parser.finalize()

      expect(result.ast.children).toHaveLength(2)
      expect(result.ast.children[0].type).toBe('heading')
      expect(result.ast.children[1].type).toBe('paragraph')
    })

    it('标题后换行立即完成', () => {
      const update1 = parser.append('# 标题\n')
      expect(update1.completed).toHaveLength(1)
      expect(update1.completed[0].node.type).toBe('heading')
    })

    it('代码块作为整体处理', () => {
      parser.append('```js\n')
      const update1 = parser.append('code\n')
      expect(update1.pending[0]?.node.type).toBe('code')

      parser.append('```\n')
      parser.append('\n')
      const update2 = parser.append('后续\n')
      // 代码块结束后应该被标记为完成
      const allCompleted = parser.getCompletedBlocks()
      expect(allCompleted.some((b) => b.node.type === 'code')).toBe(true)
    })

    it('块计数不减少', () => {
      const chunks = ['# 标题', '\n', '\n', '段落', '\n', '\n', '```', 'js\n', 'code\n', '```']
      let prevCount = 0

      for (const chunk of chunks) {
        const update = parser.append(chunk)
        expect(update.ast.children.length).toBeGreaterThanOrEqual(prevCount)
        prevCount = update.ast.children.length
      }
    })
  })

  describe('GFM 扩展', () => {
    it('解析表格', () => {
      parser.append('| A | B |\n|---|---|\n| 1 | 2 |')
      const result = parser.finalize()

      expect(result.ast.children[0].type).toBe('table')
    })
  })

  describe('重置功能', () => {
    it('reset 清空状态', () => {
      parser.append('# 标题\n\n内容')
      parser.finalize()
      expect(parser.getCompletedBlocks().length).toBeGreaterThan(0)

      parser.reset()
      expect(parser.getCompletedBlocks()).toHaveLength(0)
      expect(parser.getBuffer()).toBe('')
    })
  })
})

