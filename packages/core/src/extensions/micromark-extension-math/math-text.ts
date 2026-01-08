/**
 * 行内数学公式解析器
 *
 * 支持：
 * - $...$ 语法（Markdown 标准）
 * - \(...\) 语法（LaTeX 标准，需要配置开启）
 */

import { markdownLineEnding } from 'micromark-util-character'
import { codes, types } from 'micromark-util-symbol'
import type {
  Construct,
  Previous,
  Resolver,
  State,
  Token,
  TokenizeContext,
  Tokenizer,
} from 'micromark-util-types'
import type { ResolvedMathOptions } from './types'

/**
 * 创建 $ 符号的行内数学公式构造器
 */
export function mathText(options: ResolvedMathOptions): Construct {
  return {
    tokenize: tokenizeMathText,
    resolve: resolveMathText,
    previous: previousDollar,
    name: 'mathText',
  }

  /**
   * 主 tokenizer
   */
  function tokenizeMathText(
    this: TokenizeContext,
    effects: Parameters<Tokenizer>[0],
    ok: Parameters<Tokenizer>[1],
    nok: Parameters<Tokenizer>[2]
  ): State {
    const self = this
    let sizeOpen = 0
    let size: number
    let token: Token

    return start

    /**
     * 开始解析 $
     */
    function start(code: number | null): State | undefined {
      if (code !== codes.dollarSign) return nok(code)
      if (!previousDollar.call(self, self.previous)) return nok(code)

      effects.enter('mathText')
      effects.enter('mathTextSequence')
      return sequenceOpen(code)
    }

    /**
     * 解析开始序列 $, $$, $$$...
     */
    function sequenceOpen(code: number | null): State | undefined {
      if (code === codes.dollarSign) {
        effects.consume(code)
        sizeOpen++
        return sequenceOpen
      }

      // 如果只有一个 $ 且禁用了单 $ 语法
      if (sizeOpen < 2 && !options.singleDollarTextMath) {
        return nok(code)
      }

      effects.exit('mathTextSequence')
      return between(code)
    }

    /**
     * 在内容中间
     */
    function between(code: number | null): State | undefined {
      if (code === codes.eof) {
        return nok(code)
      }

      if (code === codes.dollarSign) {
        token = effects.enter('mathTextSequence')
        size = 0
        return sequenceClose(code)
      }

      if (code === codes.space) {
        effects.enter('space')
        effects.consume(code)
        effects.exit('space')
        return between
      }

      if (markdownLineEnding(code)) {
        effects.enter(types.lineEnding)
        effects.consume(code)
        effects.exit(types.lineEnding)
        return between
      }

      // 数据内容
      effects.enter('mathTextData')
      return data(code)
    }

    /**
     * 解析数据内容
     */
    function data(code: number | null): State | undefined {
      if (
        code === codes.eof ||
        code === codes.space ||
        code === codes.dollarSign ||
        markdownLineEnding(code)
      ) {
        effects.exit('mathTextData')
        return between(code)
      }

      effects.consume(code)
      return data
    }

    /**
     * 解析结束序列
     */
    function sequenceClose(code: number | null): State | undefined {
      if (code === codes.dollarSign) {
        effects.consume(code)
        size++
        return sequenceClose
      }

      // 匹配成功
      if (size === sizeOpen) {
        effects.exit('mathTextSequence')
        effects.exit('mathText')
        return ok(code)
      }

      // 数量不匹配，当作数据处理
      token.type = 'mathTextData'
      return data(code)
    }
  }
}

/**
 * 创建 \( 符号的行内数学公式构造器
 */
export function mathTextTex(options: ResolvedMathOptions): Construct {
  return {
    tokenize: tokenizeMathTextTex,
    resolve: resolveMathText,
    previous: previousBackslash,
    name: 'mathTextTex',
  }

  /**
   * 主 tokenizer - \(...\) 语法
   */
  function tokenizeMathTextTex(
    this: TokenizeContext,
    effects: Parameters<Tokenizer>[0],
    ok: Parameters<Tokenizer>[1],
    nok: Parameters<Tokenizer>[2]
  ): State {
    const self = this

    return start

    /**
     * 开始解析 \
     */
    function start(code: number | null): State | undefined {
      if (code !== codes.backslash) return nok(code)
      if (!previousBackslash.call(self, self.previous)) return nok(code)

      effects.enter('mathText')
      effects.enter('mathTextSequence')
      effects.consume(code) // consume \
      return afterBackslash
    }

    /**
     * 在 \ 之后，期望 (
     */
    function afterBackslash(code: number | null): State | undefined {
      if (code !== codes.leftParenthesis) {
        return nok(code)
      }

      effects.consume(code) // consume (
      effects.exit('mathTextSequence')
      return between
    }

    /**
     * 在内容中间
     */
    function between(code: number | null): State | undefined {
      if (code === codes.eof) {
        return nok(code)
      }

      // 检查结束序列 \)
      if (code === codes.backslash) {
        effects.enter('mathTextSequence')
        effects.consume(code)
        return checkClose
      }

      if (code === codes.space) {
        effects.enter('space')
        effects.consume(code)
        effects.exit('space')
        return between
      }

      if (markdownLineEnding(code)) {
        effects.enter(types.lineEnding)
        effects.consume(code)
        effects.exit(types.lineEnding)
        return between
      }

      // 数据内容
      effects.enter('mathTextData')
      return data(code)
    }

    /**
     * 检查是否是结束序列 \)
     */
    function checkClose(code: number | null): State | undefined {
      if (code === codes.rightParenthesis) {
        effects.consume(code)
        effects.exit('mathTextSequence')
        effects.exit('mathText')
        return ok
      }

      // 不是结束序列，需要把 \ 当作数据的一部分
      effects.exit('mathTextSequence')

      // 如果下一个字符是 backslash、空格或行结束，直接回到 between
      // 这样避免创建空的 mathTextData
      if (code === codes.backslash || code === codes.space || markdownLineEnding(code) || code === codes.eof) {
        return between(code)
      }

      // 否则进入数据模式
      effects.enter('mathTextData')
      return data(code)
    }

    /**
     * 解析数据内容
     */
    function data(code: number | null): State | undefined {
      if (code === codes.eof) {
        effects.exit('mathTextData')
        return nok(code)
      }

      if (code === codes.backslash) {
        effects.exit('mathTextData')
        return between(code)
      }

      if (code === codes.space || markdownLineEnding(code)) {
        effects.exit('mathTextData')
        return between(code)
      }

      effects.consume(code)
      return data
    }
  }
}

/**
 * 解析器 - 处理空白填充
 */
const resolveMathText: Resolver = (events) => {
  let tailExitIndex = events.length - 4
  let headEnterIndex = 3
  let index: number
  let enter: number | undefined

  // 如果开头和结尾是 EOL 或空格
  if (
    (events[headEnterIndex][1].type === types.lineEnding ||
      events[headEnterIndex][1].type === 'space') &&
    (events[tailExitIndex][1].type === types.lineEnding ||
      events[tailExitIndex][1].type === 'space')
  ) {
    index = headEnterIndex

    // 检查是否有数据
    while (++index < tailExitIndex) {
      if (events[index][1].type === 'mathTextData') {
        // 有数据，则填充
        events[tailExitIndex][1].type = 'mathTextPadding'
        events[headEnterIndex][1].type = 'mathTextPadding'
        headEnterIndex += 2
        tailExitIndex -= 2
        break
      }
    }
  }

  // 合并相邻的空格和数据
  index = headEnterIndex - 1
  tailExitIndex++

  while (++index <= tailExitIndex) {
    if (enter === undefined) {
      if (index !== tailExitIndex && events[index][1].type !== types.lineEnding) {
        enter = index
      }
    } else if (index === tailExitIndex || events[index][1].type === types.lineEnding) {
      events[enter][1].type = 'mathTextData'

      if (index !== enter + 2) {
        events[enter][1].end = events[index - 1][1].end
        events.splice(enter + 2, index - enter - 2)
        tailExitIndex -= index - enter - 2
        index = enter + 2
      }

      enter = undefined
    }
  }

  return events
}

/**
 * 检查前一个字符是否允许 $ 开始数学公式
 */
function previousDollar(this: TokenizeContext, code: number | null): boolean {
  return (
    code !== codes.dollarSign ||
    this.events[this.events.length - 1][1].type === types.characterEscape
  )
}

/**
 * 检查前一个字符是否允许 \ 开始数学公式
 */
function previousBackslash(this: TokenizeContext, code: number | null): boolean {
  // \ 前面不能是另一个 \（转义情况）
  return (
    code !== codes.backslash ||
    this.events[this.events.length - 1][1].type === types.characterEscape
  )
}
