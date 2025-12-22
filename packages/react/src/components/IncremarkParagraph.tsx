import React from 'react'
import type { Paragraph, PhrasingContent } from 'mdast'
import { IncremarkInline } from './IncremarkInline'

export interface IncremarkParagraphProps {
  node: Paragraph
}

/**
 * Paragraph 组件
 * 
 * 渲染 Markdown 段落
 */
export const IncremarkParagraph: React.FC<IncremarkParagraphProps> = ({ node }) => {
  return (
    <p className="incremark-paragraph">
      <IncremarkInline nodes={node.children as PhrasingContent[]} />
    </p>
  )
}

