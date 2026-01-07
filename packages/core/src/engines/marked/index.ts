/**
 * Marked 引擎入口（极速模式）
 *
 * 单独导入此模块可以实现 tree-shaking，避免打包 micromark 相关依赖
 *
 * @example
 * ```ts
 * import { createMarkedParser } from '@incremark/core/engines/marked'
 *
 * const parser = createMarkedParser({ gfm: true, math: true })
 * ```
 */

export { MarkedAstBuilder, AstBuilder } from '../../parser/ast/MarkedAstBuildter'
export type {
  EngineParserOptions,
  IncremarkPlugin,
  MarkedEngineExtension,
  IAstBuilder
} from '../../parser/ast/types'

// 导出创建解析器的工厂函数
import { MarkedAstBuilder } from '../../parser/ast/MarkedAstBuildter'
import type { EngineParserOptions } from '../../parser/ast/types'

/**
 * 创建 Marked 引擎的 AST 构建器
 */
export function createMarkedBuilder(options: EngineParserOptions = {}): MarkedAstBuilder {
  return new MarkedAstBuilder(options)
}
