import React from 'react'
import type { List, ListItem, PhrasingContent, BlockContent } from 'mdast'
import { IncremarkInline } from './IncremarkInline'

export interface IncremarkListProps {
  node: List
}

/**
 * 获取列表项的内联内容（来自第一个 paragraph）
 */
function getItemInlineContent(item: ListItem): PhrasingContent[] {
  const firstChild = item.children[0]
  if (firstChild?.type === 'paragraph') {
    return firstChild.children as PhrasingContent[]
  }
  return []
}

/**
 * 获取列表项的块级子节点（嵌套列表、代码块等）
 * 排除第一个 paragraph，因为它已经被 getItemInlineContent 处理
 */
function getItemBlockChildren(item: ListItem): BlockContent[] {
  return item.children.filter((child, index) => {
    // 第一个 paragraph 已经被处理为内联内容
    if (index === 0 && child.type === 'paragraph') {
      return false
    }
    return true
  }) as BlockContent[]
}

export const IncremarkList: React.FC<IncremarkListProps> = ({ node }) => {
  const Tag = node.ordered ? 'ol' : 'ul'
  const isTaskList = node.children?.some(item => item.checked !== null && item.checked !== undefined)

  return (
    <Tag className={`incremark-list ${isTaskList ? 'task-list' : ''}`}>
      {node.children?.map((item, index) => {
        const isTaskItem = item.checked !== null && item.checked !== undefined
        const inlineContent = getItemInlineContent(item)
        const blockChildren = getItemBlockChildren(item)

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
                  <IncremarkInline nodes={inlineContent} />
                </span>
              </label>
            </li>
          )
        }

        return (
          <li key={index} className="incremark-list-item">
            <IncremarkInline nodes={inlineContent} />
            {/* 递归渲染嵌套列表和其他块级内容 */}
            {blockChildren.map((child, childIndex) => {
              if (child.type === 'list') {
                return <IncremarkList key={childIndex} node={child as List} />
              }
              // 其他块级内容可以在这里扩展
              return null
            })}
          </li>
        )
      })}
    </Tag>
  )
}

