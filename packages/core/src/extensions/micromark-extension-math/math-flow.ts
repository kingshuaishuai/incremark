/**
 * 块级数学公式解析器
 *
 * 支持：
 * - $$...$$ 语法（Markdown 标准）
 * - \[...\] 语法（LaTeX 标准，需要配置开启）
 */

import { factorySpace } from 'micromark-factory-space'
import { markdownLineEnding } from 'micromark-util-character'
import { codes, constants, types } from 'micromark-util-symbol'
import type { Construct, State, TokenizeContext, Tokenizer } from 'micromark-util-types'
import type { ResolvedMathOptions } from './types'

/**
 * 创建 $$ 符号的块级数学公式构造器
 */
export function mathFlow(_options: ResolvedMathOptions): Construct {
  return {
    tokenize: tokenizeMathFenced,
    concrete: true,
    name: 'mathFlow',
  }
}

/**
 * 非懒惰续行构造器
 */
const nonLazyContinuation: Construct = {
  tokenize: tokenizeNonLazyContinuation,
  partial: true,
}

/**
 * 主 tokenizer - $$...$$ 语法
 */
function tokenizeMathFenced(
  this: TokenizeContext,
  effects: Parameters<Tokenizer>[0],
  ok: Parameters<Tokenizer>[1],
  nok: Parameters<Tokenizer>[2]
): State {
  const self = this
  const tail = self.events[self.events.length - 1]
  const initialSize =
    tail && tail[1].type === types.linePrefix
      ? tail[2].sliceSerialize(tail[1], true).length
      : 0
  let sizeOpen = 0

  return start

  /**
   * 开始解析 $$
   */
  function start(code: number | null): State | undefined {
    if (code !== codes.dollarSign) return nok(code)

    effects.enter('mathFlow')
    effects.enter('mathFlowFence')
    effects.enter('mathFlowFenceSequence')
    return sequenceOpen(code)
  }

  /**
   * 解析开始序列 $$, $$$...
   */
  function sequenceOpen(code: number | null): State | undefined {
    if (code === codes.dollarSign) {
      effects.consume(code)
      sizeOpen++
      return sequenceOpen
    }

    // 块级公式需要至少 2 个 $
    if (sizeOpen < 2) {
      return nok(code)
    }

    effects.exit('mathFlowFenceSequence')
    return factorySpace(effects, metaBefore, types.whitespace)(code) as State | undefined
  }

  /**
   * 在 meta 之前
   */
  function metaBefore(code: number | null): State | undefined {
    if (code === codes.eof || markdownLineEnding(code)) {
      return metaAfter(code)
    }

    effects.enter('mathFlowFenceMeta')
    effects.enter(types.chunkString, { contentType: constants.contentTypeString })
    return meta(code)
  }

  /**
   * 解析 meta
   */
  function meta(code: number | null): State | undefined {
    if (code === codes.eof || markdownLineEnding(code)) {
      effects.exit(types.chunkString)
      effects.exit('mathFlowFenceMeta')
      return metaAfter(code)
    }

    // meta 中不能有 $
    if (code === codes.dollarSign) {
      return nok(code)
    }

    effects.consume(code)
    return meta
  }

  /**
   * meta 之后
   */
  function metaAfter(code: number | null): State | undefined {
    effects.exit('mathFlowFence')

    if (self.interrupt) {
      return ok(code)
    }

    return effects.attempt(nonLazyContinuation, beforeNonLazyContinuation, after)(code) as
      | State
      | undefined
  }

  /**
   * 非懒惰续行之前
   */
  function beforeNonLazyContinuation(code: number | null): State | undefined {
    return effects.attempt(
      { tokenize: tokenizeClosingFence, partial: true },
      after,
      contentStart
    )(code) as State | undefined
  }

  /**
   * 内容开始
   */
  function contentStart(code: number | null): State | undefined {
    return (
      initialSize
        ? factorySpace(effects, beforeContentChunk, types.linePrefix, initialSize + 1)
        : beforeContentChunk
    )(code) as State | undefined
  }

  /**
   * 内容块之前
   */
  function beforeContentChunk(code: number | null): State | undefined {
    if (code === codes.eof) {
      return after(code)
    }

    if (markdownLineEnding(code)) {
      return effects.attempt(nonLazyContinuation, beforeNonLazyContinuation, after)(code) as
        | State
        | undefined
    }

    effects.enter('mathFlowValue')
    return contentChunk(code)
  }

  /**
   * 内容块
   */
  function contentChunk(code: number | null): State | undefined {
    if (code === codes.eof || markdownLineEnding(code)) {
      effects.exit('mathFlowValue')
      return beforeContentChunk(code)
    }

    effects.consume(code)
    return contentChunk
  }

  /**
   * 结束
   */
  function after(code: number | null): State | undefined {
    effects.exit('mathFlow')
    return ok(code)
  }

  /**
   * 关闭围栏 tokenizer
   */
  function tokenizeClosingFence(
    this: TokenizeContext,
    effects: Parameters<Tokenizer>[0],
    ok: Parameters<Tokenizer>[1],
    nok: Parameters<Tokenizer>[2]
  ): State {
    let size = 0

    return factorySpace(
      effects,
      beforeSequenceClose,
      types.linePrefix,
      self.parser.constructs.disable?.null?.includes('codeIndented')
        ? undefined
        : constants.tabSize
    ) as State

    /**
     * 关闭序列之前
     */
    function beforeSequenceClose(code: number | null): State | undefined {
      effects.enter('mathFlowFence')
      effects.enter('mathFlowFenceSequence')
      return sequenceClose(code)
    }

    /**
     * 关闭序列
     */
    function sequenceClose(code: number | null): State | undefined {
      if (code === codes.dollarSign) {
        size++
        effects.consume(code)
        return sequenceClose
      }

      if (size < sizeOpen) {
        return nok(code)
      }

      effects.exit('mathFlowFenceSequence')
      return factorySpace(effects, afterSequenceClose, types.whitespace)(code) as State | undefined
    }

    /**
     * 关闭序列之后
     */
    function afterSequenceClose(code: number | null): State | undefined {
      if (code === codes.eof || markdownLineEnding(code)) {
        effects.exit('mathFlowFence')
        return ok(code)
      }

      return nok(code)
    }
  }
}

/**
 * 创建 \[ 符号的块级数学公式构造器
 */
export function mathFlowTex(_options: ResolvedMathOptions): Construct {
  return {
    tokenize: tokenizeMathFencedTex,
    concrete: true,
    name: 'mathFlowTex',
  }
}

/**
 * 主 tokenizer - \[...\] 语法
 */
function tokenizeMathFencedTex(
  this: TokenizeContext,
  effects: Parameters<Tokenizer>[0],
  ok: Parameters<Tokenizer>[1],
  nok: Parameters<Tokenizer>[2]
): State {
  const self = this

  return start

  /**
   * 开始解析 \[
   */
  function start(code: number | null): State | undefined {
    if (code !== codes.backslash) return nok(code)

    effects.enter('mathFlow')
    effects.enter('mathFlowFence')
    effects.enter('mathFlowFenceSequence')
    effects.consume(code) // consume \
    return afterBackslash
  }

  /**
   * 在 \ 之后，期望 [
   */
  function afterBackslash(code: number | null): State | undefined {
    if (code !== codes.leftSquareBracket) {
      return nok(code)
    }

    effects.consume(code) // consume [
    effects.exit('mathFlowFenceSequence')
    effects.exit('mathFlowFence')

    if (self.interrupt) {
      return ok(code)
    }

    // 继续解析内容（同一行或下一行）
    return contentStart
  }

  /**
   * 内容开始
   */
  function contentStart(code: number | null): State | undefined {
    // 检查是否是关闭序列 \]
    if (code === codes.backslash) {
      return effects.attempt(
        { tokenize: tokenizeClosingFenceTex, partial: true },
        afterClose,
        beginContent
      )(code) as State | undefined
    }

    return beginContent(code)
  }

  /**
   * 开始内容块
   */
  function beginContent(code: number | null): State | undefined {
    if (code === codes.eof) {
      return after(code)
    }

    if (markdownLineEnding(code)) {
      return effects.attempt(nonLazyContinuation, afterLineEnding, after)(code) as
        | State
        | undefined
    }

    effects.enter('mathFlowValue')
    return contentChunk(code)
  }

  /**
   * 行结束后
   */
  function afterLineEnding(code: number | null): State | undefined {
    return contentStart(code)
  }

  /**
   * 内容块
   */
  function contentChunk(code: number | null): State | undefined {
    if (code === codes.eof) {
      effects.exit('mathFlowValue')
      return after(code)
    }

    if (markdownLineEnding(code)) {
      effects.exit('mathFlowValue')
      return effects.attempt(nonLazyContinuation, afterLineEnding, after)(code) as
        | State
        | undefined
    }

    if (code === codes.backslash) {
      effects.exit('mathFlowValue')
      return effects.attempt(
        { tokenize: tokenizeClosingFenceTex, partial: true },
        afterClose,
        continueContent
      )(code) as State | undefined
    }

    effects.consume(code)
    return contentChunk
  }

  /**
   * 继续内容（在尝试关闭失败后）
   */
  function continueContent(code: number | null): State | undefined {
    effects.enter('mathFlowValue')
    return contentChunk(code)
  }

  /**
   * 关闭后
   */
  function afterClose(code: number | null): State | undefined {
    return after(code)
  }

  /**
   * 结束
   */
  function after(code: number | null): State | undefined {
    effects.exit('mathFlow')
    return ok(code)
  }

  /**
   * 关闭围栏 tokenizer - \]
   */
  function tokenizeClosingFenceTex(
    this: TokenizeContext,
    effects: Parameters<Tokenizer>[0],
    ok: Parameters<Tokenizer>[1],
    nok: Parameters<Tokenizer>[2]
  ): State {
    return beforeSequenceClose

    /**
     * 关闭序列之前
     */
    function beforeSequenceClose(code: number | null): State | undefined {
      if (code !== codes.backslash) {
        return nok(code)
      }

      effects.enter('mathFlowFence')
      effects.enter('mathFlowFenceSequence')
      effects.consume(code)
      return afterBackslashClose
    }

    /**
     * 在 \ 之后检查 ]
     */
    function afterBackslashClose(code: number | null): State | undefined {
      if (code !== codes.rightSquareBracket) {
        return nok(code)
      }

      effects.consume(code)
      effects.exit('mathFlowFenceSequence')
      effects.exit('mathFlowFence')
      return ok(code)
    }
  }
}

/**
 * 非懒惰续行 tokenizer
 */
function tokenizeNonLazyContinuation(
  this: TokenizeContext,
  effects: Parameters<Tokenizer>[0],
  ok: Parameters<Tokenizer>[1],
  nok: Parameters<Tokenizer>[2]
): State {
  const self = this

  return start

  function start(code: number | null): State | undefined {
    if (code === null) {
      return ok(code)
    }

    if (!markdownLineEnding(code)) {
      return nok(code)
    }

    effects.enter(types.lineEnding)
    effects.consume(code)
    effects.exit(types.lineEnding)
    return lineStart
  }

  function lineStart(code: number | null): State | undefined {
    return self.parser.lazy[self.now().line] ? nok(code) : ok(code)
  }
}
