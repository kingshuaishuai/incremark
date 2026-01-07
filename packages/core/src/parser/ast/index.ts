/**
 * AST 构建器模块
 *
 * 默认只导出 MarkedAstBuilder（极速模式），支持 tree-shaking
 * MicromarkAstBuilder 需要从 '@incremark/core/engines/micromark' 单独导入
 */

// 类型定义
export type {
  EngineType,
  IAstBuilder,
  IncremarkPlugin,
  MarkedEngineExtension,
  MicromarkEngineExtension,
  EngineParserOptions
} from './types'

export {
  extractMarkedExtensions,
  extractMicromarkExtensions,
  validatePluginsForEngine
} from './types'

// 默认只导出 MarkedAstBuilder（极速模式），实现 tree-shaking
export { MarkedAstBuilder } from './MarkedAstBuildter'

// Token 转换助手（用于自定义扩展）
export type {
  TransformContext,
  BlockTokenTransformer,
  InlineTokenTransformer
} from './markedHelpers'

export {
  transformBlockToken,
  transformInlineToken,
  getBuiltinBlockTransformers,
  getBuiltinInlineTransformers
} from './markedHelpers'

// 重导出 mdast 扩展类型（方便用户使用）
export type { Math, InlineMath } from 'mdast-util-math'
export type { ContainerDirective, LeafDirective, TextDirective, Directives } from 'mdast-util-directive'

// 项目自定义的 mdast 扩展类型
export type { HtmlElementNode, HtmlTreeExtensionOptions } from '../../extensions/html-extension'

// ⚠️ 不在这里导出 MicromarkAstBuilder，避免打包时包含 micromark 依赖
// 如需使用 micromark，请从 '@incremark/core/engines/micromark' 导入
