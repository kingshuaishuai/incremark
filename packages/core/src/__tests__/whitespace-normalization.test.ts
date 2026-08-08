/**
 * 特殊空白字符归一化测试
 *
 * MarkedAstBuilder.parse() 在解析前会把某些特殊空白字符替换成 ASCII 空格，
 * 目的是防止它们出现在 URL 里时让链接识别失败（"URL 截断"）。原实现替换了
 * 三种字符：NBSP（\u00A0）、ZWSP（\u200b）、NNBSP（\u202f）。
 *
 * 但 NBSP 和 NNBSP 本身就匹配 JS 的 `\s`，marked 自身的自动链接/URL 匹配
 * 已经会在它们那里正确截断——替换它们不会带来任何截断收益，只会把代码块、
 * 行内代码里字面出现的这两种空格静默改写成普通空格，与 marked 自身对同一
 * 段文本的解析结果产生分歧。只有 ZWSP 不匹配 `\s`，需要手动替换才能截断。
 *
 * 修复后：只替换 ZWSP；NBSP/NNBSP 的 URL 截断保护不受影响（marked 原生
 * 处理），但不再破坏代码内容。
 */

import { describe, it, expect } from 'vitest'
import { marked } from 'marked'
import { MarkedAstBuilder } from '../parser/ast/MarkedAstBuildter'

const NBSP = '\u00A0'
const ZWSP = '\u200b'
const NNBSP = '\u202f'

describe('特殊空白字符归一化 - 不应破坏代码内容', () => {
  it('围栏代码块里字面的 NBSP 应该被保留，与 marked 一致', () => {
    const markdown = '```\nconst s = "a' + NBSP + 'b"\n```\n'

    const markedText = (marked.lexer(markdown)[0] as { text: string }).text
    expect(markedText.includes(NBSP)).toBe(true)

    const root = new MarkedAstBuilder({}).parse(markdown)
    const value = (root.children[0] as { value: string }).value
    expect(value.includes(NBSP)).toBe(true)
    expect(value).toBe(markedText)
  })

  it('围栏代码块里字面的 NNBSP 应该被保留，与 marked 一致', () => {
    const markdown = '```\nconst s = "a' + NNBSP + 'b"\n```\n'

    const markedText = (marked.lexer(markdown)[0] as { text: string }).text
    expect(markedText.includes(NNBSP)).toBe(true)

    const root = new MarkedAstBuilder({}).parse(markdown)
    const value = (root.children[0] as { value: string }).value
    expect(value.includes(NNBSP)).toBe(true)
    expect(value).toBe(markedText)
  })

  it('行内代码里字面的 NBSP 应该被保留', () => {
    const markdown = '`a' + NBSP + 'b`\n'

    const root = new MarkedAstBuilder({}).parse(markdown)
    const paragraph = root.children[0] as { children: Array<{ type: string; value?: string }> }
    const inlineCode = paragraph.children.find((c) => c.type === 'inlineCode')
    expect(inlineCode).toBeDefined()
    expect((inlineCode as { value: string }).value.includes(NBSP)).toBe(true)
  })

  it('ZWSP 仍然被替换成空格（保留原有的 URL 截断保护）', () => {
    const markdown = `https://ex.com/a${ZWSP}b\n`

    const root = new MarkedAstBuilder({}).parse(markdown)
    const paragraph = root.children[0] as {
      children: Array<{ type: string; url?: string; value?: string }>
    }
    const link = paragraph.children.find((c) => c.type === 'link')
    expect(link).toBeDefined()
    expect((link as { url: string }).url).toBe('https://ex.com/a')
  })

  it('URL 中的 NBSP 依然会被 marked 原生截断（无需归一化）', () => {
    const markdown = `https://ex.com/a${NBSP}b\n`

    const root = new MarkedAstBuilder({}).parse(markdown)
    const paragraph = root.children[0] as {
      children: Array<{ type: string; url?: string }>
    }
    const link = paragraph.children.find((c) => c.type === 'link')
    expect(link).toBeDefined()
    expect((link as { url: string }).url).toBe('https://ex.com/a')
  })

  it('URL 中的 NNBSP 依然会被 marked 原生截断（无需归一化）', () => {
    const markdown = `https://ex.com/a${NNBSP}b\n`

    const root = new MarkedAstBuilder({}).parse(markdown)
    const paragraph = root.children[0] as {
      children: Array<{ type: string; url?: string }>
    }
    const link = paragraph.children.find((c) => c.type === 'link')
    expect(link).toBeDefined()
    expect((link as { url: string }).url).toBe('https://ex.com/a')
  })
})
