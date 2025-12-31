/**
 * @incremark/core
 *
 * 增量式 Markdown 解析器核心库
 *
 * 提供流式解析 Markdown 文本的能力
 * 专为 AI 流式输出场景设计
 */

// ============ 核心解析器 ============
export { IncremarkParser, createIncremarkParser } from './parser'

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
