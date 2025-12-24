import React from 'react'
import type { ParsedBlock } from '@incremark/core'
import { IncremarkRenderer } from './IncremarkRenderer'
import { IncremarkFootnotes } from './IncremarkFootnotes'
import type { UseIncremarkReturn } from '../hooks/useIncremark'
import { IncremarkContainerProvider } from './IncremarkContainerProvider'

interface BlockWithStableId extends ParsedBlock {
  stableId: string
  isLastPending?: boolean // 是否是最后一个 pending 块
}

export interface IncremarkProps {
  /** 要渲染的块列表 */
  blocks?: BlockWithStableId[]
  /** 自定义组件映射 */
  components?: Partial<Record<string, React.ComponentType<{ node: any }>>>
  /** 自定义容器组件映射，key 为容器名称（如 'warning', 'info'） */
  customContainers?: Record<string, React.ComponentType<{ name: string; options?: Record<string, any>; children?: React.ReactNode }>>
  /** 自定义代码块组件映射，key 为代码语言名称（如 'echart', 'mermaid'） */
  customCodeBlocks?: Record<string, React.ComponentType<{ codeStr: string; lang?: string }>>
  /** 是否显示块状态（待处理块边框） */
  showBlockStatus?: boolean
  /** 自定义类名 */
  className?: string
  /** 可选：useIncremark 返回的对象（用于自动提供 context） */
  incremark?: UseIncremarkReturn
}

/**
 * Incremark 主渲染组件
 *
 * @example
 * ```tsx
 * import { useIncremark, Incremark } from '@incremark/react'
 *
 * // 推荐用法: 传入 incremark 对象（自动提供 context）
 * function App() {
 *   const incremark = useIncremark()
 *   return <Incremark incremark={incremark} />
 * }
 * ```
 */
export const Incremark: React.FC<IncremarkProps> = (props) => {
  const {
    blocks: propsBlocks,
    components,
    customContainers,
    customCodeBlocks,
    showBlockStatus = true,
    className = '',
    incremark
  } = props

  // 如果传入了 incremark 对象，自动提供 context
  if (incremark) {
    const { blocks, isFinalized, _definitionsContextValue } = incremark
    return (
      <IncremarkContainerProvider definitions={_definitionsContextValue}>
        <IncremarkInternal
          blocks={blocks}
          components={components}
          customContainers={customContainers}
          customCodeBlocks={customCodeBlocks}
          showBlockStatus={showBlockStatus}
          className={className}
          isFinalized={isFinalized}
        />
      </IncremarkContainerProvider>
    )
  }

  // 否则使用传入的 props，自动判断 isFinalized
  const blocks = propsBlocks || []
  const isFinalized = blocks.length > 0 && blocks.every(b => b.status === 'completed')

  return (
    <IncremarkInternal
      blocks={blocks}
      components={components}
      customContainers={customContainers}
      customCodeBlocks={customCodeBlocks}
      showBlockStatus={showBlockStatus}
      className={className}
      isFinalized={isFinalized}
    />
  )
}

/**
 * 内部渲染组件（不对外暴露）
 */
interface IncremarkInternalProps {
  blocks: BlockWithStableId[]
  components?: Partial<Record<string, React.ComponentType<{ node: any }>>>
  customContainers?: Record<string, React.ComponentType<{ name: string; options?: Record<string, any>; children?: React.ReactNode }>>
  customCodeBlocks?: Record<string, React.ComponentType<{ codeStr: string; lang?: string }>>
  showBlockStatus: boolean
  className: string
  isFinalized: boolean
}

const IncremarkInternal: React.FC<IncremarkInternalProps> = ({
  blocks,
  components,
  customContainers,
  customCodeBlocks,
  showBlockStatus,
  className,
  isFinalized
}) => {
  return (
    <div className={`incremark ${className}`}>
      {/* 主要内容块 */}
      {blocks.map((block) => {
        // 过滤掉 definition 和 footnoteDefinition 节点（它们会在其他地方渲染）
        if (block.node.type === 'definition' || block.node.type === 'footnoteDefinition') {
          return null
        }

        const isPending = block.status === 'pending'
        const classes = [
          'incremark-block',
          isPending ? 'incremark-pending' : 'incremark-completed',
          showBlockStatus && 'incremark-show-status',
          block.isLastPending && 'incremark-last-pending'
        ].filter(Boolean).join(' ')

        return (
          <div key={block.stableId} className={classes}>
            <IncremarkRenderer 
              node={block.node} 
              components={components}
              customContainers={customContainers}
              customCodeBlocks={customCodeBlocks}
              blockStatus={block.status}
            />
          </div>
        )
      })}

      {/* 脚注列表（仅在 finalize 后显示） */}
      {isFinalized && (
        <IncremarkFootnotes />
      )}
    </div>
  )
}

