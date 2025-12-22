import React from 'react'
import type { RootContent } from 'mdast'

export interface IncremarkDefaultProps {
  node: RootContent
}

export const IncremarkDefault: React.FC<IncremarkDefaultProps> = ({ node }) => {
  return (
    <div className="incremark-default">
      <span className="type-badge">{node.type}</span>
      <pre>{JSON.stringify(node, null, 2)}</pre>
    </div>
  )
}

