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

