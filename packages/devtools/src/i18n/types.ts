/**
 * @file types.ts - i18n 类型定义
 */

export type Locale = 'zh-CN' | 'en-US'

export interface I18nMessages {
  // 面板标题
  panelTitle: string
  // Tabs
  tabOverview: string
  tabBlocks: string
  tabAst: string
  tabTimeline: string
  // 按钮
  btnClose: string
  btnCopy: string
  btnClear: string
  // 状态
  statusStreaming: string
  statusComplete: string
  waitingForData: string
  // 概览页
  totalBlocks: string
  completed: string
  pending: string
  characters: string
  nodeTypes: string
  status: string
  // Blocks 页
  blockDetails: string
  blockId: string
  blockType: string
  blockStatus: string
  rawText: string
  astNode: string
  selectBlockHint: string
  // Timeline 页
  totalAppends: string
  // 工具提示
  toolTriggerTitle: string
}
