import React from 'react'
import type { Heading, PhrasingContent } from 'mdast'
import { IncremarkInline } from './IncremarkInline'

export interface IncremarkHeadingProps {
  node: Heading
}

/**
 * Heading 组件
 * 
 * 渲染 Markdown 标题（h1-h6）
 */
export const IncremarkHeading: React.FC<IncremarkHeadingProps> = ({ node }) => {
  const Tag = `h${node.depth}` as keyof JSX.IntrinsicElements
  
  return (
    <Tag className={`incremark-heading h${node.depth}`}>
      <IncremarkInline nodes={node.children as PhrasingContent[]} />
    </Tag>
  )
}

