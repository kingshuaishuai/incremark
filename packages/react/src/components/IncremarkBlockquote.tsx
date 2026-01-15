import React from 'react'
import type { Blockquote } from 'mdast'
import type { ReactNode } from 'react'
import { IncremarkRenderer } from './IncremarkRenderer'

export interface IncremarkBlockquoteProps {
  node: Blockquote
  components?: Partial<Record<string, React.ComponentType<{ node: any }>>>
  customContainers?: Record<string, React.ComponentType<{ name: string; options?: Record<string, any>; children?: ReactNode }>>
  customCodeBlocks?: Record<string, React.ComponentType<{ codeStr: string; lang?: string; completed?: boolean; takeOver?: boolean }>>
  codeBlockConfigs?: Record<string, { takeOver?: boolean }>
  blockStatus?: 'pending' | 'stable' | 'completed'
}

export const IncremarkBlockquote: React.FC<IncremarkBlockquoteProps> = ({
  node,
  components,
  customContainers,
  customCodeBlocks,
  codeBlockConfigs,
  blockStatus
}) => {
  return (
    <blockquote className="incremark-blockquote">
      {node.children.map((child, index) => (
        <React.Fragment key={index}>
          <IncremarkRenderer
            node={child}
            components={components}
            customContainers={customContainers}
            customCodeBlocks={customCodeBlocks}
            codeBlockConfigs={codeBlockConfigs}
            blockStatus={blockStatus}
          />
        </React.Fragment>
      ))}
    </blockquote>
  )
}

