/* @jsxImportSource solid-js */

import type { Paragraph } from 'mdast'
import { Component } from 'solid-js'
import { IncremarkInline } from './IncremarkInline'

export interface IncremarkParagraphProps {
  node: Paragraph
}

export const IncremarkParagraph: Component<IncremarkParagraphProps> = (props) => {
  return (
    <p class="incremark-paragraph">
      <IncremarkInline nodes={props.node.children} />
    </p>
  )
}
