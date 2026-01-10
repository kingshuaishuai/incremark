/* @jsxImportSource solid-js */

import type { ThematicBreak } from 'mdast'
import { Component } from 'solid-js'

export interface IncremarkThematicBreakProps {
  node: ThematicBreak
}

export const IncremarkThematicBreak: Component<IncremarkThematicBreakProps> = () => {
  return <hr class="incremark-thematic-break" />
}
