import type { Root, RootContent } from 'mdast'
import type { Extension as MicromarkExtension } from 'micromark-util-types'
import type { Extension as MdastExtension } from 'mdast-util-from-markdown'
import type { HtmlTreeExtensionOptions } from '../extensions/html-extension'

/**
 * 解析块的状态
 */
export type BlockStatus =
  | 'pending'    // 正在接收中，可能不完整
  | 'stable'     // 可能完整，但下一个 chunk 可能会改变它
  | 'completed'  // 确认完成，不会再改变

/**
 * AST 节点的通用接口（用于遍历）
 * 统一定义，避免各模块重复声明
 */
export interface AstNode {
  type: string
  value?: string
  children?: AstNode[]
  [key: string]: unknown
}

/**
 * 解析出的块
 */
export interface ParsedBlock {
  /** 块的唯一 ID */
  id: string
  /** 块状态 */
  status: BlockStatus
  /** AST 节点 */
  node: RootContent
  /** 原始文本起始位置（相对于完整文档） */
  startOffset: number
  /** 原始文本结束位置 */
  endOffset: number
  /** 原始文本内容 */
  rawText: string
}

/**
 * 增量更新事件
 */
export interface IncrementalUpdate {
  /** 新完成的块 */
  completed: ParsedBlock[]
  /** 更新的块（内容变化） */
  updated: ParsedBlock[]
  /** 当前正在解析中的块（可能不完整） */
  pending: ParsedBlock[]
  /** 完整的 AST（包含所有已解析的内容） */
  ast: Root
}

/**
 * 容器语法配置
 */
export interface ContainerConfig {
  /** 容器标记字符，默认 ':' */
  marker?: string
  /** 最小标记长度，默认 3 */
  minMarkerLength?: number
  /** 允许的容器名称（如 ['warning', 'info', 'youtube']），undefined 表示允许所有 */
  allowedNames?: string[]
}

/**
 * 解析器状态变化事件
 */
export interface ParserState {
  /** 已完成的块 */
  completedBlocks: ParsedBlock[]
  /** 待处理的块 */
  pendingBlocks: ParsedBlock[]
  /** 完整的 Markdown 内容 */
  markdown: string
  /** 完整的 AST */
  ast: Root
}

/**
 * 解析器配置
 */
export interface ParserOptions {
  /** 启用 GFM 扩展（表格、任务列表等） */
  gfm?: boolean
  /**
   * 启用 ::: 容器语法支持（用于边界检测）
   * - false: 禁用（默认）
   * - true: 使用默认配置启用
   * - ContainerConfig: 使用自定义配置启用
   */
  containers?: boolean | ContainerConfig
  /**
   * 启用 HTML 树转换
   * - false/undefined: 禁用（默认），HTML 节点保持原始 type: 'html' 格式
   * - true: 使用默认配置启用，将 HTML 节点转换为结构化的 htmlElement 节点
   * - HtmlTreeExtensionOptions: 使用自定义配置启用（可配置黑名单等）
   */
  htmlTree?: boolean | HtmlTreeExtensionOptions
  /** 自定义块边界检测函数 */
  blockBoundaryDetector?: (content: string, position: number) => boolean
  /** 自定义 micromark 扩展（如 directive） */
  extensions?: MicromarkExtension[]
  /** 自定义 mdast 扩展（如 directiveFromMarkdown） */
  mdastExtensions?: MdastExtension[]
  /** 状态变化回调 */
  onChange?: (state: ParserState) => void
}

/**
 * 块上下文
 */
export interface BlockContext {
  /** 当前是否在代码块中 */
  inFencedCode: boolean
  /** 代码块的 fence 字符（` 或 ~） */
  fenceChar?: string
  /** 代码块的 fence 长度 */
  fenceLength?: number
  /** 当前列表嵌套深度 */
  listDepth: number
  /** 当前引用嵌套深度 */
  blockquoteDepth: number
  /** 当前是否在容器块中 */
  inContainer: boolean
  /** 容器的标记长度 */
  containerMarkerLength?: number
  /** 容器名称 */
  containerName?: string
  /** 容器嵌套深度（支持嵌套容器） */
  containerDepth: number
}

/**
 * 容器检测结果
 */
export interface ContainerMatch {
  /** 容器名称 */
  name: string
  /** 标记长度（冒号数量） */
  markerLength: number
  /** 是否是结束标记 */
  isEnd: boolean
}

/**
 * 块类型检测结果
 */
export interface BlockTypeInfo {
  type: string
  /** 是否是容器节点（可以包含其他块） */
  isContainer: boolean
  /** 是否需要显式关闭（如代码块） */
  requiresClosing: boolean
  /** 关闭模式 */
  closingPattern?: RegExp
}

export type { Root, RootContent }

