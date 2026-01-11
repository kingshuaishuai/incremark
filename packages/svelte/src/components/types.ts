/**
 * @file Component Types - 组件类型定义
 * @description 定义组件相关的类型
 */

import type { Component } from 'svelte'
import type { ParsedBlock } from '@incremark/core'
import type { UseIncremarkOptions } from '../stores/useIncremark.svelte.ts'
import type { IncremarkDevTools } from '@incremark/devtools'

/**
 * 组件映射类型
 * 使用 any 以支持不同类型的组件
 */
export type ComponentMap = Partial<Record<string, any>>

/**
 * 可渲染的块类型（带 isLastPending 字段用于打字机光标）
 */
export type RenderableBlock = ParsedBlock & { isLastPending?: boolean }

/**
 * 代码块配置
 */
export interface CodeBlockConfig {
  /** 是否从一开始就接管渲染，而不是等到 completed 状态 */
  takeOver?: boolean
}

/**
 * IncremarkContent 组件 Props
 */
export interface IncremarkContentProps {
  stream?: () => AsyncGenerator<string>
  content?: string
  components?: ComponentMap
  /** 自定义容器组件映射，key 为容器名称（如 'warning', 'info'） */
  customContainers?: Record<string, Component<any>>
  /** 自定义代码块组件映射，key 为代码语言名称（如 'echart', 'mermaid'） */
  customCodeBlocks?: Record<string, Component<any>>
  /** 代码块配置映射，key 为代码语言名称 */
  codeBlockConfigs?: Record<string, CodeBlockConfig>
  isFinished?: boolean
  incremarkOptions?: UseIncremarkOptions
  pendingClass?: string
  showBlockStatus?: boolean
  /** DevTools 实例，传入后组件会自动注册 parser */
  devtools?: IncremarkDevTools
  /** DevTools 中显示的 parser ID，默认自动生成 */
  devtoolsId?: string
  /** DevTools 中显示的 parser 标签，默认使用 ID */
  devtoolsLabel?: string
}

