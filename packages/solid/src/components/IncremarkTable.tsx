/* @jsxImportSource solid-js */

import type { Table, TableCell, PhrasingContent } from 'mdast'
import { Component, For, Show } from 'solid-js'
import { IncremarkInline } from './IncremarkInline'

export interface IncremarkTableProps {
  node: Table
}

export const IncremarkTable: Component<IncremarkTableProps> = (props) => {
  function getCellContent(cell: TableCell): PhrasingContent[] {
    return cell.children as PhrasingContent[]
  }

  const firstRow = () => props.node.children[0]
  const remainingRows = () => props.node.children.slice(1)

  const getAlignClass = (cellIndex: number) => {
    return `incremark-table-align-${props.node.align?.[cellIndex] || 'left'}`
  }

  return (
    <div class="incremark-table-wrapper">
      <table class="incremark-table">
        <Show when={firstRow()}>
          <thead>
            <tr>
              <For each={firstRow()!.children}>
                {(cell, cellIndex) => (
                  <th class={getAlignClass(cellIndex())}>
                    <IncremarkInline nodes={getCellContent(cell)} />
                  </th>
                )}
              </For>
            </tr>
          </thead>
        </Show>
        <tbody>
          <For each={remainingRows()}>
            {(row) => (
              <tr>
                <For each={row.children}>
                  {(cell, cellIndex) => (
                    <td class={getAlignClass(cellIndex())}>
                      <IncremarkInline nodes={getCellContent(cell)} />
                    </td>
                  )}
                </For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  )
}
