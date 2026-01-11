import { Component, JSX } from 'solid-js'
import { UseIncremarkOptions } from './composables'
import type { IncremarkDevTools } from '@incremark/devtools'

// 组件映射类型 - 使用 Component<any> 以支持任意 props 的组件
export type ComponentMap = Partial<Record<string, Component<any>>>

// 任意组件类型，用于 customContainers 和 customCodeBlocks
export type AnyComponent = Component<any> | ((props: any) => JSX.Element)

/**
 * 代码块配置
 */
export interface CodeBlockConfig {
  /** 是否从一开始就接管渲染，而不是等到 completed 状态 */
  takeOver?: boolean
}

export interface IncremarkContentProps {
  stream?: () => AsyncGenerator<string>
  content?: string
  components?: ComponentMap
  /** 自定义容器组件映射，key 为容器名称（如 'warning', 'info'） */
  customContainers?: Record<string, AnyComponent>
  /** 自定义代码块组件映射，key 为代码语言名称（如 'echart', 'mermaid'） */
  customCodeBlocks?: Record<string, AnyComponent>
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
