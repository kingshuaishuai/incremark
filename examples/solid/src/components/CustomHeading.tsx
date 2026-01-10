/* @jsxImportSource solid-js */

import type { Heading, PhrasingContent } from '@incremark/solid'
import { Component } from 'solid-js'
import { IncremarkInline } from '@incremark/solid'

export interface CustomHeadingProps {
  node: Heading
}

export const CustomHeading: Component<CustomHeadingProps> = (props) => {
  const HeadingTag = `h${props.node.depth}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

  return (
    <HeadingTag class="custom-heading">
      ✨ <IncremarkInline nodes={props.node.children as PhrasingContent[]} />
    </HeadingTag>
  )
}
