/* @jsxImportSource solid-js */

import type { RootContent } from 'mdast'
import { Component } from 'solid-js'

export interface IncremarkDefaultProps {
  node: RootContent
}

/**
 * 默认渲染组件
 * 用于未知类型的节点，显示调试信息
 */
export const IncremarkDefault: Component<IncremarkDefaultProps> = (props) => {
  return (
    <pre class="incremark-debug">
      <code>{JSON.stringify(props.node, null, 2)}</code>
    </pre>
  )
}
