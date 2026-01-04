import { Component } from "vue"
import { UseIncremarkOptions } from "./composables"

// 组件映射类型
export type ComponentMap = Partial<Record<string, Component>>

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
  customContainers?: Record<string, Component>
  /** 自定义代码块组件映射，key 为代码语言名称（如 'echart', 'mermaid'） */
  customCodeBlocks?: Record<string, Component>
  /** 代码块配置映射，key 为代码语言名称 */
  codeBlockConfigs?: Record<string, CodeBlockConfig>
  isFinished?: boolean
  incremarkOptions?: UseIncremarkOptions
  pendingClass?: string
  showBlockStatus?: boolean
}