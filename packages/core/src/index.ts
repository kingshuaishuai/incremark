/**
 * @incremark/core
 *
 * 增量式 Markdown 解析器核心库
 *
 * 提供流式解析 Markdown 文本的能力
 * 专为 AI 流式输出场景设计
 *
 * 支持两种解析引擎：
 * - marked（默认）：极速模式，速度更快
 * - micromark：稳定模式，更可靠，支持 div 内嵌 markdown
 *
 * Tree-shaking 说明：
 * - 默认只打包 marked 引擎
 * - 如需使用 micromark，通过 astBuilder 选项注入
 *
 * @example
 * ```ts
 * // 使用默认的 marked 引擎（极速模式）
 * import { createIncremarkParser } from '@incremark/core'
 * const parser = createIncremarkParser({ gfm: true, math: true })
 *
 * // 使用 micromark 引擎（需要单独导入，支持 tree-shaking）
 * import { createIncremarkParser } from '@incremark/core'
 * import { MicromarkAstBuilder } from '@incremark/core/engines/micromark'
 * const parser = createIncremarkParser({
 *   astBuilder: MicromarkAstBuilder,
 *   gfm: true
 * })
 * ```
 */

// ============ 核心解析器 ============
export { IncremarkParser, createIncremarkParser } from './parser'
export type { IncremarkParserOptions, AstBuilderClass } from './parser/IncremarkParser'

// ============ 核心类型 ============
export type {
  // 解析器相关
  ParserOptions,
  ParserState,
  ParsedBlock,
  IncrementalUpdate,
  BlockStatus,
  AstNode,
  // mdast 类型（用户处理 AST 时需要）
  Root,
  RootContent
} from './types'

// ============ 引擎相关类型 ============
export type {
  EngineType,
  IAstBuilder,
  IncremarkPlugin,
  MarkedEngineExtension,
  MicromarkEngineExtension,
  EngineParserOptions
} from './parser/ast/types'

// ============ AST 构建器（默认只导出 Marked，支持 tree-shaking） ============
export {
  MarkedAstBuilder,
} from './parser/ast'
// MicromarkAstBuilder 需要从 '@incremark/core/engines/micromark' 单独导入

// ============ Block Transformer（打字机效果） ============
export {
  BlockTransformer,
  createBlockTransformer
} from './transformer'

// Transformer 类型
export type {
  SourceBlock,
  DisplayBlock,
  TransformerPlugin,
  TransformerOptions,
  TransformerState,
  AnimationEffect
} from './transformer/types'

// Transformer 插件
export {
  codeBlockPlugin,
  mermaidPlugin,
  imagePlugin,
  mathPlugin,
  thematicBreakPlugin,
  defaultPlugins,
  allPlugins,
  createPlugin
} from './transformer/plugins'

// Transformer 工具函数（处理 AST 时需要）
export {
  countChars,
  sliceAst,
  cloneNode
} from './transformer/utils'

// Transformer 工具类型
export type {
  TextChunk,
  TextNodeWithChunks
} from './transformer/utils'
