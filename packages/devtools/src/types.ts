import type { ParsedBlock, Root } from '@incremark/core'

export interface DevToolsState {
  /** 所有块 */
  blocks: Array<ParsedBlock & { stableId: string }>
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
  /** 位置 */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  /** 主题 */
  theme?: 'dark' | 'light'
}

