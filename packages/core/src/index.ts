/**
 * @incremark/core
 *
 * 增量式 Markdown 解析器核心库
 * 专为 AI 流式输出场景设计
 */

// 核心解析器
export { IncremarkParser, createIncremarkParser } from './parser'

// 类型导出
export type {
  BlockStatus,
  ParsedBlock,
  IncrementalUpdate,
  ParserOptions,
  ParserState,
  ContainerConfig,
  BlockContext,
  ContainerMatch,
  BlockTypeInfo,
  Root,
  RootContent
} from './types'

// 检测器
export {
  // 代码块
  detectFenceStart,
  detectFenceEnd,
  // 行类型
  isEmptyLine,
  isHeading,
  isThematicBreak,
  isListItemStart,
  isBlockquoteStart,
  isHtmlBlock,
  isTableDelimiter,
  // 容器
  detectContainer,
  detectContainerEnd,
  // 边界
  isBlockBoundary,
  // 上下文
  createInitialContext,
  updateContext
} from './detector'

// 工具函数
export { generateId, resetIdCounter, calculateLineOffset, splitLines, joinLines } from './utils'

// Block Transformer（打字机效果中间层）
export {
  // 核心类
  BlockTransformer,
  createBlockTransformer,
  // 工具函数
  countChars,
  sliceAst,
  cloneNode,
  // 内置插件
  codeBlockPlugin,
  mermaidPlugin,
  imagePlugin,
  mathPlugin,
  thematicBreakPlugin,
  defaultPlugins,
  allPlugins,
  createPlugin
} from './transformer'

// Transformer 类型
export type {
  SourceBlock,
  DisplayBlock,
  TransformerPlugin,
  TransformerOptions,
  TransformerState,
  AnimationEffect,
  TextChunk,
  TextNodeWithChunks
} from './transformer'

/**
 * BlockTransformer 动画样式
 * 
 * 使用方法：
 * ```js
 * import '@incremark/core/transformer/styles.css'
 * ```
 * 
 * 或者复制 packages/core/src/transformer/styles.css 到你的项目中自定义
 */

