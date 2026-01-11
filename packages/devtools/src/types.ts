import type { IncremarkParser, ParsedBlock, Root } from '@incremark/core'
import type { Locale } from './i18n/types'

export type TabType = 'overview' | 'blocks' | 'ast' | 'timeline'

export interface DevToolsState {
  /** 所有块 */
  blocks: ParsedBlock[]
  /** 已完成的块 */
  completedBlocks: ParsedBlock[]
  /** 待处理的块 */
  pendingBlocks: ParsedBlock[]
  /** Markdown 字符串 */
  markdown: string
  /** AST */
  ast: Root
  /** 是否加载中 */
  isLoading: boolean
}

export interface AppendRecord {
  timestamp: number
  chunk: string
  completedCount: number
  pendingCount: number
}

export interface DevToolsOptions {
  /** 初始是否打开 */
  open?: boolean
  /**
   * @deprecated 位置现在由 floating-ui 自动计算，trigger 按钮可拖拽
   */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  /** 主题 */
  theme?: 'dark' | 'light'
  /** 语言 */
  locale?: Locale
}

/**
 * Parser 注册选项
 */
export interface RegisterOptions {
  /** 唯一标识符 */
  id: string
  /** 显示标签，默认使用 id */
  label?: string
}

/**
 * Parser 注册记录
 */
export interface ParserRegistration {
  /** 唯一标识符 */
  id: string
  /** 显示标签 */
  label: string
  /** Parser 实例 */
  parser: IncremarkParser
  /** 当前状态 */
  state: DevToolsState | null
  /** Append 历史记录 */
  appendHistory: AppendRecord[]
}

