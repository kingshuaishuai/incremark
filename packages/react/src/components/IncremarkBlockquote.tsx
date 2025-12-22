import React from 'react'
import type { Blockquote } from 'mdast'
import { IncremarkParagraph } from './IncremarkParagraph'

export interface IncremarkBlockquoteProps {
  node: Blockquote
}

export const IncremarkBlockquote: React.FC<IncremarkBlockquoteProps> = ({ node }) => {
  return (
    <blockquote className="incremark-blockquote">
      {node.children.map((child, index) => {
        if (child.type === 'paragraph') {
          return <IncremarkParagraph key={index} node={child} />
        }
        return <div key={index} className="unknown-child">{child.type}</div>
      })}
    </blockquote>
  )
}

