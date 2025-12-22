import React from 'react'
import type { List, ListItem, PhrasingContent } from 'mdast'
import { IncremarkInline } from './IncremarkInline'

export interface IncremarkListProps {
  node: List
}

function getItemContent(item: ListItem): PhrasingContent[] {
  const firstChild = item.children[0]
  if (firstChild?.type === 'paragraph') {
    return firstChild.children as PhrasingContent[]
  }
  return []
}

export const IncremarkList: React.FC<IncremarkListProps> = ({ node }) => {
  const Tag = node.ordered ? 'ol' : 'ul'
  const isTaskList = node.children?.some(item => item.checked !== null && item.checked !== undefined)
  
  return (
    <Tag className={`incremark-list ${isTaskList ? 'task-list' : ''}`}>
      {node.children?.map((item, index) => {
        const isTaskItem = item.checked !== null && item.checked !== undefined
        const content = getItemContent(item)
        
        if (isTaskItem) {
          return (
            <li key={index} className="incremark-list-item task-item">
              <label className="task-label">
                <input 
                  type="checkbox" 
                  checked={item.checked || false} 
                  disabled 
                  className="checkbox"
                />
                <span className="task-content">
                  <IncremarkInline nodes={content} />
                </span>
              </label>
            </li>
          )
        }
        
        return (
          <li key={index} className="incremark-list-item">
            <IncremarkInline nodes={content} />
          </li>
        )
      })}
    </Tag>
  )
}

