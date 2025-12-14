import { describe, it, expect } from 'vitest'
import {
  detectFenceStart,
  detectFenceEnd,
  isEmptyLine,
  isHeading,
  isThematicBreak,
  isListItemStart,
  isBlockquoteStart,
  detectContainer,
  createInitialContext
} from './index'

describe('块检测器', () => {
  describe('detectFenceStart', () => {
    it('检测反引号 fence', () => {
      const result = detectFenceStart('```js')
      expect(result).toEqual({ char: '`', length: 3 })
    })

    it('检测波浪号 fence', () => {
      const result = detectFenceStart('~~~python')
      expect(result).toEqual({ char: '~', length: 3 })
    })

    it('检测更长的 fence', () => {
      const result = detectFenceStart('`````')
      expect(result).toEqual({ char: '`', length: 5 })
    })

    it('非 fence 返回 null', () => {
      expect(detectFenceStart('普通文本')).toBeNull()
      expect(detectFenceStart('``不够长')).toBeNull()
    })
  })

  describe('detectFenceEnd', () => {
    it('匹配相同长度', () => {
      const context = { ...createInitialContext(), inFencedCode: true, fenceChar: '`', fenceLength: 3 }
      expect(detectFenceEnd('```', context)).toBe(true)
    })

    it('匹配更长的结束', () => {
      const context = { ...createInitialContext(), inFencedCode: true, fenceChar: '`', fenceLength: 3 }
      expect(detectFenceEnd('`````', context)).toBe(true)
    })

    it('不匹配更短的', () => {
      const context = { ...createInitialContext(), inFencedCode: true, fenceChar: '`', fenceLength: 5 }
      expect(detectFenceEnd('```', context)).toBe(false)
    })
  })

  describe('isEmptyLine', () => {
    it('空行', () => {
      expect(isEmptyLine('')).toBe(true)
      expect(isEmptyLine('   ')).toBe(true)
      expect(isEmptyLine('\t')).toBe(true)
    })

    it('非空行', () => {
      expect(isEmptyLine('内容')).toBe(false)
      expect(isEmptyLine('  a  ')).toBe(false)
    })
  })

  describe('isHeading', () => {
    it('有效标题', () => {
      expect(isHeading('# H1')).toBe(true)
      expect(isHeading('## H2')).toBe(true)
      expect(isHeading('###### H6')).toBe(true)
    })

    it('无效标题', () => {
      expect(isHeading('####### H7')).toBe(false) // 超过 6 级
      expect(isHeading('#没有空格')).toBe(false)
      expect(isHeading('普通文本')).toBe(false)
    })
  })

  describe('isThematicBreak', () => {
    it('有效水平线', () => {
      expect(isThematicBreak('---')).toBe(true)
      expect(isThematicBreak('***')).toBe(true)
      expect(isThematicBreak('___')).toBe(true)
      expect(isThematicBreak('-----')).toBe(true)
    })

    it('无效水平线', () => {
      expect(isThematicBreak('--')).toBe(false)
      expect(isThematicBreak('- - -')).toBe(false) // 有空格
    })
  })

  describe('isListItemStart', () => {
    it('无序列表', () => {
      expect(isListItemStart('- item')).toEqual({ ordered: false, indent: 0 })
      expect(isListItemStart('  * item')).toEqual({ ordered: false, indent: 2 })
    })

    it('有序列表', () => {
      expect(isListItemStart('1. item')).toEqual({ ordered: true, indent: 0 })
      expect(isListItemStart('  99. item')).toEqual({ ordered: true, indent: 2 })
    })

    it('非列表', () => {
      expect(isListItemStart('普通文本')).toBeNull()
    })
  })

  describe('isBlockquoteStart', () => {
    it('有效引用', () => {
      expect(isBlockquoteStart('> quote')).toBe(true)
      expect(isBlockquoteStart('  > quote')).toBe(true)
    })

    it('无效引用', () => {
      expect(isBlockquoteStart('    > 太多缩进')).toBe(false)
    })
  })

  describe('detectContainer', () => {
    it('检测容器开始', () => {
      const result = detectContainer('::: warning')
      expect(result).toEqual({ name: 'warning', markerLength: 3, isEnd: false })
    })

    it('检测容器结束', () => {
      const result = detectContainer(':::')
      expect(result).toEqual({ name: '', markerLength: 3, isEnd: true })
    })

    it('检测更长的标记', () => {
      const result = detectContainer('::::: outer')
      expect(result).toEqual({ name: 'outer', markerLength: 5, isEnd: false })
    })

    it('名称白名单', () => {
      const config = { allowedNames: ['warning', 'info'] }
      expect(detectContainer('::: warning', config)).not.toBeNull()
      expect(detectContainer('::: danger', config)).toBeNull()
    })

    it('非容器语法', () => {
      expect(detectContainer('普通文本')).toBeNull()
      expect(detectContainer(':: 太短')).toBeNull()
    })
  })
})

