import React from 'react'
import type { Code } from 'mdast'
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
  customCodeBlocks?: Record<string, React.ComponentType<{ codeStr: string; lang?: string; completed?: boolean; takeOver?: boolean }>>
  /** 块状态，用于判断是否使用自定义组件 */
  blockStatus?: 'pending' | 'stable' | 'completed'
  /** 代码块配置映射，key 为代码语言名称 */
  codeBlockConfigs?: Record<string, { takeOver?: boolean }>
  /** 默认代码块渲染组件（当不是 mermaid 且没有自定义组件时使用） */
  defaultCodeComponent?: React.ComponentType<IncremarkCodeDefaultProps>
}

export const IncremarkCode: React.FC<IncremarkCodeProps> = ({
  node,
  theme = 'github-dark',
  fallbackTheme = 'github-dark',
  disableHighlight = false,
  mermaidDelay = 500,
  customCodeBlocks,
  blockStatus = 'completed',
  codeBlockConfigs,
  defaultCodeComponent: DefaultCodeComponent = IncremarkCodeDefault
}) => {
  const language = node.lang || 'text'
  const code = node.value
  const isMermaid = language === 'mermaid'

  // 检查是否有自定义代码块组件
  const CustomCodeBlock = React.useMemo(() => {
    const component = customCodeBlocks?.[language]
    if (!component) return null

    // 检查该语言的配置
    const config = codeBlockConfigs?.[language]

    // 如果配置了 takeOver 为 true，则从一开始就使用
    if (config?.takeOver) {
      return component
    }

    // 否则，默认行为：只在 completed 状态使用
    if (blockStatus !== 'completed') {
      return null
    }

    return component
  }, [customCodeBlocks, language, blockStatus, codeBlockConfigs])

  // 自定义代码块组件
  if (CustomCodeBlock) {
    const config = codeBlockConfigs?.[language]
    return (
      <CustomCodeBlock
        codeStr={code}
        lang={language}
        completed={blockStatus === 'completed'}
        takeOver={config?.takeOver}
      />
    )
  }

  // Mermaid 图表
  if (isMermaid) {
    return (
      <IncremarkCodeMermaid
        node={node}
        mermaidDelay={mermaidDelay}
      />
    )
  }

  // 默认代码块渲染
  return (
    <DefaultCodeComponent
      node={node}
      theme={theme}
      fallbackTheme={fallbackTheme}
      disableHighlight={disableHighlight}
    />
  )
}
