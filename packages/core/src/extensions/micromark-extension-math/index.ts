/**
 * micromark-extension-math
 *
 * micromark 数学公式扩展，支持：
 * - 行内公式：$...$ 和可选的 \(...\)
 * - 块级公式：$$...$$ 和可选的 \[...\]
 *
 * @example
 * ```ts
 * import { math } from './extensions/micromark-extension-math'
 *
 * // 基础用法（只支持 $ 和 $$ 语法）
 * const ext = math()
 *
 * // 开启 TeX 风格分隔符（支持 \(...\) 和 \[...\]）
 * const extWithTex = math({ tex: true })
 * ```
 */

import { codes } from 'micromark-util-symbol'
import type { Extension } from 'micromark-util-types'
import { mathFlow, mathFlowTex } from './math-flow'
import { mathText, mathTextTex } from './math-text'
import { resolveMathOptions, type MathOptions } from './types'

// 导出类型
export type { MathOptions } from './types'

/**
 * 创建 micromark 数学公式扩展
 *
 * @param options - 配置选项
 * @returns micromark 扩展
 */
export function math(options?: MathOptions | null): Extension {
  const resolved = resolveMathOptions(options)

  const extension: Extension = {
    flow: {
      [codes.dollarSign]: mathFlow(resolved),
    },
    text: {
      [codes.dollarSign]: mathText(resolved),
    },
  }

  // 如果开启了 TeX 风格分隔符
  if (resolved.tex) {
    extension.flow![codes.backslash] = mathFlowTex(resolved)
    extension.text![codes.backslash] = mathTextTex(resolved)
  }

  return extension
}
