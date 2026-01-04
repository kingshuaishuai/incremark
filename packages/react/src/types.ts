import type { ComponentType } from 'react'
import type { UseIncremarkOptions } from './hooks/useIncremark'

// 组件映射类型
export type ComponentMap = Partial<Record<string, ComponentType<{ node: any }>>>

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
  customContainers?: Record<string, ComponentType<{ name: string; options?: Record<string, any>; children?: React.ReactNode }>>
  /** 自定义代码块组件映射，key 为代码语言名称（如 'echart', 'mermaid'） */
  customCodeBlocks?: Record<string, ComponentType<{ codeStr: string; lang?: string; completed?: boolean; takeOver?: boolean }>>
  /** 代码块配置映射，key 为代码语言名称 */
  codeBlockConfigs?: Record<string, CodeBlockConfig>
  isFinished?: boolean
  incremarkOptions?: UseIncremarkOptions
  pendingClass?: string
  showBlockStatus?: boolean
}
