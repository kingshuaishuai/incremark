/* @jsxImportSource solid-js */

import type { Heading } from 'mdast'
import { Component } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { IncremarkInline } from './IncremarkInline'

export interface IncremarkHeadingProps {
  node: Heading
}

export const IncremarkHeading: Component<IncremarkHeadingProps> = (props) => {
  const tag = () => `h${props.node.depth}`

  return (
    <Dynamic component={tag()} class={`incremark-heading h${props.node.depth}`}>
      <IncremarkInline nodes={props.node.children} />
    </Dynamic>
  )
}
