import React from 'react'
import type { Table, TableCell, PhrasingContent } from 'mdast'
import { IncremarkInline } from './IncremarkInline'

export interface IncremarkTableProps {
  node: Table
}

function getCellContent(cell: TableCell): PhrasingContent[] {
  return cell.children as PhrasingContent[]
}

export const IncremarkTable: React.FC<IncremarkTableProps> = ({ node }) => {
  return (
    <div className="incremark-table-wrapper">
      <table className="incremark-table">
        <thead>
          {node.children?.[0] && (
            <tr>
              {node.children[0].children.map((cell, cellIndex) => (
                <th 
                  key={cellIndex}
                  style={{ textAlign: node.align?.[cellIndex] || 'left' }}
                >
                  <IncremarkInline nodes={getCellContent(cell)} />
                </th>
              ))}
            </tr>
          )}
        </thead>
        <tbody>
          {node.children?.slice(1).map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.children.map((cell, cellIndex) => (
                <td 
                  key={cellIndex}
                  style={{ textAlign: node.align?.[cellIndex] || 'left' }}
                >
                  <IncremarkInline nodes={getCellContent(cell)} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

