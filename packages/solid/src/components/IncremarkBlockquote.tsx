/* @jsxImportSource solid-js */

import type { Blockquote } from 'mdast'
import { Component, For } from 'solid-js'
import type { ComponentMap, CodeBlockConfig } from '../types'
import { IncremarkRenderer } from './IncremarkRenderer'

export interface IncremarkBlockquoteProps {
  node: Blockquote
  components?: ComponentMap
  customContainers?: Record<string, Component<any>>
  customCodeBlocks?: Record<string, Component<any>>
  codeBlockConfigs?: Record<string, CodeBlockConfig>
  blockStatus?: 'pending' | 'stable' | 'completed'
}

export const IncremarkBlockquote: Component<IncremarkBlockquoteProps> = (props) => {
  return (
    <blockquote class="incremark-blockquote">
      <For each={props.node.children}>
        {(child) => (
          <IncremarkRenderer
            node={child}
            components={props.components}
            customContainers={props.customContainers}
            customCodeBlocks={props.customCodeBlocks}
            codeBlockConfigs={props.codeBlockConfigs}
            blockStatus={props.blockStatus}
          />
        )}
      </For>
    </blockquote>
  )
}
