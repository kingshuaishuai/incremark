/**
 * @file Component Types - 组件类型定义
 * @description 定义组件相关的类型
 */

import type { ParsedBlock } from '@incremark/core'

/**
 * 组件映射类型
 * 使用 any 以支持不同类型的组件
 */
export type ComponentMap = Partial<Record<string, any>>

/**
 * 可渲染的块类型（带 isLastPending 字段用于打字机光标）
 */
export type RenderableBlock = ParsedBlock & { isLastPending?: boolean }

