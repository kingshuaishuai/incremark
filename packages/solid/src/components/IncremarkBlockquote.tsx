/* @jsxImportSource solid-js */

import type { Blockquote } from 'mdast'
import { Component, For } from 'solid-js'
import { IncremarkRenderer } from './IncremarkRenderer'

export interface IncremarkBlockquoteProps {
  node: Blockquote
}

export const IncremarkBlockquote: Component<IncremarkBlockquoteProps> = (props) => {
  return (
    <blockquote class="incremark-blockquote">
      <For each={props.node.children}>
        {(child) => (
          <IncremarkRenderer node={child} />
        )}
      </For>
    </blockquote>
  )
}
