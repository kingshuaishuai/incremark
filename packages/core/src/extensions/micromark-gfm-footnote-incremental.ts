/**
 * @file GFM 脚注扩展的增量解析补丁
 * 
 * @description
 * GFM 脚注扩展会检查 parser.gfmFootnotes 来验证定义是否存在。
 * 在增量解析场景下，定义可能在引用之后才出现，导致引用无法被正确解析。
 * 
 * 本补丁移除定义检查，使脚注引用总是被解析为 footnoteReference。
 * 
 * @module micromark-gfm-footnote-incremental
 * 
 * @features
 * - ✅ 移除脚注引用的定义检查（支持前向引用）
 * - ✅ 覆盖 text[91] (`[`) 和 text[93] (`]`) 的处理
 * - ✅ 延迟验证：解析时不检查定义是否存在
 */

import type { Extension, Code, State, TokenizeContext, Tokenizer } from 'micromark-util-types'
import { gfmFootnote } from 'micromark-extension-gfm-footnote'
import { normalizeIdentifier } from 'micromark-util-normalize-identifier'
import { codes, constants } from 'micromark-util-symbol'
import { markdownLineEndingOrSpace } from 'micromark-util-character'

/**
 * 创建支持增量解析的 GFM 脚注扩展
 * 
 * 这个扩展基于官方 gfmFootnote()，但移除了定义检查，支持前向引用
 * 
 * @returns Micromark 扩展对象
 * 
 * @example
 * ```typescript
 * import { gfmFootnoteIncremental } from './micromark-gfm-footnote-incremental'
 * 
 * const extensions = [
 *   gfm(),
 *   micromarkReferenceExtension(),
 *   gfmFootnoteIncremental() // 最后添加，确保覆盖
 * ]
 * ```
 */
export function gfmFootnoteIncremental(): Extension {
  const original = gfmFootnote()
  
  return {
    ...original,
    text: {
      ...original.text,
      // 覆盖 text[91] (`[` 的处理) - 这是脚注引用解析的起点
      [codes.leftSquareBracket]: {
        ...original.text![codes.leftSquareBracket],
        tokenize: tokenizeGfmFootnoteCallIncremental
      },
      // 覆盖 text[93] (`]` 的处理) - 用于处理 ![^1] 这样的情况
      [codes.rightSquareBracket]: {
        ...original.text![codes.rightSquareBracket],
        tokenize: tokenizePotentialGfmFootnoteCallIncremental
      }
    }
  }
}

/**
 * Tokenize 脚注引用 `[^id]`，移除定义检查
 * 
 * 🔑 关键修改：不检查 parser.gfmFootnotes，总是允许解析脚注引用
 * 
 * @param effects - Token 生成器
 * @param ok - 成功时的状态函数
 * @param nok - 失败时的状态函数
 * @returns 起始状态函数
 */
function tokenizeGfmFootnoteCallIncremental(
  this: TokenizeContext,
  effects: Parameters<Tokenizer>[0],
  ok: State,
  nok: State
): State {
  const self = this
  let size = 0
  let data = false

  return start

  /**
   * 脚注引用起始位置
   * 
   * ```markdown
   * > | a [^b] c
   *       ^
   * ```
   */
  function start(code: Code): State | undefined {
    if (code !== codes.leftSquareBracket) {
      return nok(code)
    }

    effects.enter('gfmFootnoteCall')
    effects.enter('gfmFootnoteCallLabelMarker')
    effects.consume(code)
    effects.exit('gfmFootnoteCallLabelMarker')
    return callStart
  }

  /**
   * 在 `[` 之后，期望 `^`
   * 
   * ```markdown
   * > | a [^b] c
   *        ^
   * ```
   */
  function callStart(code: Code): State | undefined {
    if (code !== codes.caret) {
      return nok(code)
    }

    effects.enter('gfmFootnoteCallMarker')
    effects.consume(code)
    effects.exit('gfmFootnoteCallMarker')
    effects.enter('gfmFootnoteCallString')
    const token = effects.enter('chunkString')
    token.contentType = 'string'
    return callData
  }

  /**
   * 在脚注标识符中
   * 
   * ```markdown
   * > | a [^b] c
   *         ^
   * ```
   */
  function callData(code: Code): State | undefined {
    if (
      // 太长
      size > constants.linkReferenceSizeMax ||
      // 右括号但没有数据
      (code === codes.rightSquareBracket && !data) ||
      // EOF、换行、空格、制表符、左括号不支持
      code === codes.eof ||
      code === codes.leftSquareBracket ||
      markdownLineEndingOrSpace(code)
    ) {
      return nok(code)
    }

    if (code === codes.rightSquareBracket) {
      effects.exit('chunkString')
      effects.exit('gfmFootnoteCallString')

      // 🔑 关键修改：移除定义检查
      // 原始代码：
      // const token = effects.exit('gfmFootnoteCallString')
      // if (!defined.includes(normalizeIdentifier(self.sliceSerialize(token)))) {
      //   return nok(code)
      // }

      effects.enter('gfmFootnoteCallLabelMarker')
      effects.consume(code)
      effects.exit('gfmFootnoteCallLabelMarker')
      effects.exit('gfmFootnoteCall')
      return ok
    }

    if (!markdownLineEndingOrSpace(code)) {
      data = true
    }

    size++
    effects.consume(code)
    return code === codes.backslash ? callEscape : callData
  }

  /**
   * 在转义字符之后
   * 
   * ```markdown
   * > | a [^b\c] d
   *           ^
   * ```
   */
  function callEscape(code: Code): State | undefined {
    if (
      code === codes.leftSquareBracket ||
      code === codes.backslash ||
      code === codes.rightSquareBracket
    ) {
      effects.consume(code)
      size++
      return callData
    }

    return callData(code)
  }
}

/**
 * Tokenize 潜在的脚注引用 `![^id]`，移除定义检查
 * 
 * 用于处理图片标记后的脚注引用（虽然这不是标准语法，但 GFM 会尝试解析）
 * 
 * @param effects - Token 生成器
 * @param ok - 成功时的状态函数
 * @param nok - 失败时的状态函数
 * @returns 起始状态函数
 */
function tokenizePotentialGfmFootnoteCallIncremental(
  this: TokenizeContext,
  effects: Parameters<Tokenizer>[0],
  ok: State,
  nok: State
): State {
  const self = this
  let index = self.events.length
  let labelStart: any

  // 查找开始的 labelImage token
  while (index--) {
    const token = self.events[index][1]
    if (token.type === 'labelImage') {
      labelStart = token
      break
    }

    // 如果走得太远就退出
    if (
      token.type === 'gfmFootnoteCall' ||
      token.type === 'labelLink' ||
      token.type === 'label' ||
      token.type === 'image' ||
      token.type === 'link'
    ) {
      break
    }
  }

  return start

  function start(code: Code): State | undefined {
    if (code !== codes.rightSquareBracket) {
      return nok(code)
    }

    if (!labelStart || !labelStart._balanced) {
      return nok(code)
    }

    const id = normalizeIdentifier(
      self.sliceSerialize({
        start: labelStart.end,
        end: self.now()
      })
    )

    // 只检查是否以 ^ 开头，不检查定义是否存在
    if (id.codePointAt(0) !== codes.caret) {
      return nok(code)
    }

    // 🔑 关键修改：移除定义检查
    // 原始代码：
    // const defined = self.parser.gfmFootnotes || (self.parser.gfmFootnotes = [])
    // if (!defined.includes(id.slice(1))) {
    //   return nok(code)
    // }

    effects.enter('gfmFootnoteCallLabelMarker')
    effects.consume(code)
    effects.exit('gfmFootnoteCallLabelMarker')
    return ok(code)
  }
}

