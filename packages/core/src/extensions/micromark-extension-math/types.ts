/**
 * micromark-extension-math 类型定义
 *
 * 支持的语法：
 * - 行内公式：$...$ 和可选的 \(...\)
 * - 块级公式：$$...$$ 和可选的 \[...\]
 */

import type { Extension } from 'micromark-util-types'

/**
 * 数学公式扩展配置
 */
export interface MathOptions {
  /**
   * 是否支持单个 $ 符号的行内公式 (default: `true`)
   *
   * 单个 $ 在 Pandoc 等工具中广泛使用，但可能与普通文本中的美元符号冲突。
   * 如果关闭此选项，需要使用两个或更多 $ 符号来表示行内公式。
   */
  singleDollarTextMath?: boolean | null | undefined

  /**
   * 启用 TeX 风格的公式分隔符 (default: `false`)
   *
   * 开启后同时支持：
   * - 行内公式：\(...\)
   * - 块级公式：\[...\]
   *
   * 这是 LaTeX/TeX 原生语法，MathJax 和 KaTeX 都支持。
   */
  tex?: boolean | null | undefined
}

/**
 * 解析后的配置（所有选项都有默认值）
 */
export interface ResolvedMathOptions {
  singleDollarTextMath: boolean
  tex: boolean
}

/**
 * 解析配置，填充默认值
 */
export function resolveMathOptions(options?: MathOptions | null): ResolvedMathOptions {
  return {
    singleDollarTextMath: options?.singleDollarTextMath ?? true,
    tex: options?.tex ?? false,
  }
}

/**
 * 扩展 micromark 类型
 */
declare module 'micromark-util-types' {
  interface CompileData {
    mathFlowOpen?: boolean
  }

  interface TokenTypeMap {
    mathFlow: 'mathFlow'
    mathFlowFence: 'mathFlowFence'
    mathFlowFenceMeta: 'mathFlowFenceMeta'
    mathFlowFenceSequence: 'mathFlowFenceSequence'
    mathFlowValue: 'mathFlowValue'
    mathText: 'mathText'
    mathTextData: 'mathTextData'
    mathTextPadding: 'mathTextPadding'
    mathTextSequence: 'mathTextSequence'
  }
}

export type { Extension }
