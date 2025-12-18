/**
 * Block Transformer
 *
 * 用于控制 blocks 的逐步显示（打字机效果）
 * 作为解析器和渲染器之间的中间层
 */

// 核心类
export { BlockTransformer, createBlockTransformer } from './BlockTransformer'

// 类型
export type {
  SourceBlock,
  DisplayBlock,
  TransformerPlugin,
  TransformerOptions,
  TransformerState,
  AnimationEffect
} from './types'

// 工具函数
export { countChars, sliceAst, cloneNode } from './utils'
export type { TextChunk, TextNodeWithChunks, AccumulatedChunks } from './utils'

// 内置插件
export {
  codeBlockPlugin,
  mermaidPlugin,
  imagePlugin,
  mathPlugin,
  thematicBreakPlugin,
  defaultPlugins,
  allPlugins,
  createPlugin
} from './plugins'

