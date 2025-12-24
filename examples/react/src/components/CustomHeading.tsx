import React from 'react'
import type { Heading, PhrasingContent } from 'mdast'
import { IncremarkInline } from '@incremark/react'

export interface CustomHeadingProps {
  node: Heading
}

export const CustomHeading: React.FC<CustomHeadingProps> = ({ node }) => {
  const Tag = `h${node.depth}` as keyof JSX.IntrinsicElements
  return (
    <Tag className="custom-heading">
      ✨ <IncremarkInline nodes={node.children as PhrasingContent[]} />
    </Tag>
  )
}

