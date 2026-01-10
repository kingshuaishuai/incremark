/* @jsxImportSource solid-js */

import type { Code } from 'mdast'
import { Component, createMemo, Show } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import type { JSX } from 'solid-js'
import type { CodeBlockConfig } from '../types'
import { IncremarkCodeMermaid } from './IncremarkCodeMermaid'
import { IncremarkCodeDefault, type IncremarkCodeDefaultProps } from './IncremarkCodeDefault'

export interface IncremarkCodeProps {
  node: Code
  /** Shiki 主题，默认 github-dark */
  theme?: string
  /** 默认回退主题（当指定主题加载失败时使用），默认 github-dark */
  fallbackTheme?: string
  /** 是否禁用代码高亮 */
  disableHighlight?: boolean
  /** Mermaid 渲染延迟（毫秒），用于流式输入时防抖 */
  mermaidDelay?: number
  /** 自定义代码块组件映射，key 为代码语言名称 */
  customCodeBlocks?: Record<string, Component<any>>
  /** 代码块配置映射，key 为代码语言名称 */
  codeBlockConfigs?: Record<string, CodeBlockConfig>
  /** 块状态，用于判断是否使用自定义组件 */
  blockStatus?: 'pending' | 'stable' | 'completed'
  /** 默认代码块渲染组件（当不是 mermaid 且没有自定义组件时使用） */
  defaultCodeComponent?: Component<IncremarkCodeDefaultProps>
}

export const IncremarkCode: Component<IncremarkCodeProps> = (props) => {
  const language = () => props.node.lang || 'text'

  // 检查是否有自定义代码块组件
  const CustomCodeBlock = () => props.customCodeBlocks?.[language()]

  // 检查该语言的配置
  const shouldUseCustomCodeBlock = () => {
    const component = props.customCodeBlocks?.[language()]
    if (!component) return false

    // 检查该语言的配置
    const config = props.codeBlockConfigs?.[language()]

    // 如果配置了 takeOver 为 true，则从一开始就使用
    if (config?.takeOver) {
      return true
    }

    // 否则，默认行为：只在 completed 状态使用
    return props.blockStatus === 'completed'
  }

  // 判断是否为 mermaid
  const isMermaid = () => language() === 'mermaid'

  const DefaultCodeComponent = () => props.defaultCodeComponent ?? IncremarkCodeDefault

  // Get custom component props
  const customProps = () => ({
    codeStr: props.node.value,
    lang: language(),
    completed: props.blockStatus === 'completed',
    takeOver: props.codeBlockConfigs?.[language()]?.takeOver
  })

  // Get default component props
  const defaultProps = () => ({
    node: props.node,
    theme: props.theme,
    fallbackTheme: props.fallbackTheme,
    disableHighlight: props.disableHighlight,
    blockStatus: props.blockStatus
  })

  // Get mermaid props
  const mermaidProps = () => ({
    node: props.node,
    mermaidDelay: props.mermaidDelay
  })

  return (
    <>
      {/* 自定义代码块组件 */}
      <Show when={CustomCodeBlock() && shouldUseCustomCodeBlock()}>
        <Dynamic
          component={CustomCodeBlock()!}
          {...customProps()}
        />
      </Show>

      {/* Mermaid 图表 */}
      <Show when={isMermaid() && !shouldUseCustomCodeBlock()}>
        <IncremarkCodeMermaid
          node={props.node}
          mermaidDelay={props.mermaidDelay}
        />
      </Show>

      {/* 默认代码块渲染（支持用户自定义，使用 stream 高亮） */}
      <Show when={!isMermaid() && !shouldUseCustomCodeBlock()}>
        <Dynamic
          component={DefaultCodeComponent()}
          {...defaultProps()}
        />
      </Show>
    </>
  )
}

export default IncremarkCode
