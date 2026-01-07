/**
 * Micromark 引擎入口（稳定模式）
 *
 * 单独导入此模块可以实现 tree-shaking，避免打包 marked 相关依赖
 *
 * @example
 * ```ts
 * import { createMicromarkParser } from '@incremark/core/engines/micromark'
 *
 * const parser = createMicromarkParser({ gfm: true, math: true })
 * ```
 */

export { MicromarkAstBuilder } from '../../parser/ast/MicromarkAstBuilder'
export type {
  EngineParserOptions,
  IncremarkPlugin,
  MicromarkEngineExtension,
  IAstBuilder
} from '../../parser/ast/types'

// 导出创建解析器的工厂函数
import { MicromarkAstBuilder } from '../../parser/ast/MicromarkAstBuilder'
import type { EngineParserOptions } from '../../parser/ast/types'

/**
 * 创建 Micromark 引擎的 AST 构建器
 */
export function createMicromarkBuilder(options: EngineParserOptions = {}): MicromarkAstBuilder {
  return new MicromarkAstBuilder(options)
}
