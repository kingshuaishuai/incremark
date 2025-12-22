import React from 'react'
import type { ParsedBlock } from '@incremark/core'
import { IncremarkRenderer } from './IncremarkRenderer'
import { IncremarkFootnotes } from './IncremarkFootnotes'

interface BlockWithStableId extends ParsedBlock {
  stableId: string
  isLastPending?: boolean // 是否是最后一个 pending 块
}

export interface IncremarkProps {
  /** 要渲染的块列表 */
  blocks: BlockWithStableId[]
  /** 自定义组件映射 */
  components?: Partial<Record<string, React.ComponentType<{ node: any }>>>
  /** 是否显示块状态（待处理块边框） */
  showBlockStatus?: boolean
  /** 自定义类名 */
  className?: string
  /** 是否已完成（用于决定是否显示脚注） */
  isFinalized?: boolean
  /** 脚注引用的出现顺序（用于渲染脚注列表） */
  footnoteReferenceOrder?: string[]
}

/**
 * Incremark 主渲染组件
 *
 * @example
 * ```tsx
 * import { useIncremark, Incremark } from '@incremark/react'
 *
 * function App() {
 *   const { blocks } = useIncremark()
 *   return <Incremark blocks={blocks} />
 * }
 * ```
 */
export const Incremark: React.FC<IncremarkProps> = ({
  blocks,
  components,
  showBlockStatus = true,
  className = '',
  isFinalized = false,
  footnoteReferenceOrder = []
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
            <IncremarkRenderer node={block.node} components={components} />
          </div>
        )
      })}

      {/* 脚注列表（仅在 finalize 后显示） */}
      {isFinalized && footnoteReferenceOrder.length > 0 && (
        <IncremarkFootnotes footnoteReferenceOrder={footnoteReferenceOrder} />
      )}
    </div>
  )
}

