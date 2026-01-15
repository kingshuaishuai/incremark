import React from 'react'
import type { List, ListItem, RootContent } from 'mdast'
import type { ReactNode } from 'react'
import { IncremarkInline } from './IncremarkInline'
import { IncremarkRenderer } from './IncremarkRenderer'

export interface IncremarkListProps {
  node: List
  components?: Partial<Record<string, React.ComponentType<{ node: any }>>>
  customContainers?: Record<string, React.ComponentType<{ name: string; options?: Record<string, any>; children?: ReactNode }>>
  customCodeBlocks?: Record<string, React.ComponentType<{ codeStr: string; lang?: string; completed?: boolean; takeOver?: boolean }>>
  codeBlockConfigs?: Record<string, { takeOver?: boolean }>
  blockStatus?: 'pending' | 'stable' | 'completed'
}

/**
 * 获取列表项的内联内容（来自第一个 paragraph）
 */
function getItemInlineContent(item: ListItem) {
  const firstChild = item.children[0]
  if (firstChild?.type === 'paragraph') {
    return firstChild.children
  }
  return []
}

/**
 * 获取列表项的块级子节点（嵌套列表、代码块等）
 * 排除第一个 paragraph，因为它已经被 getItemInlineContent 处理
 */
function getItemBlockChildren(item: ListItem): RootContent[] {
  return item.children.filter((child, index) => {
    // 第一个 paragraph 已经被处理为内联内容
    if (index === 0 && child.type === 'paragraph') {
      return false
    }
    return true
  })
}

export const IncremarkList: React.FC<IncremarkListProps> = ({
  node,
  components,
  customContainers,
  customCodeBlocks,
  codeBlockConfigs,
  blockStatus
}) => {
  const Tag = node.ordered ? 'ol' : 'ul'
  const isTaskList = node.children?.some(item => item.checked !== null && item.checked !== undefined)

  return (
    <Tag className={`incremark-list ${isTaskList ? 'task-list' : ''}`} start={node.start || undefined}>
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
            {/* 递归渲染所有块级内容（嵌套列表、heading、blockquote、code、table 等） */}
            {blockChildren.map((child, childIndex) => (
              <React.Fragment key={childIndex}>
                <IncremarkRenderer
                  node={child}
                  components={components}
                  customContainers={customContainers}
                  customCodeBlocks={customCodeBlocks}
                  codeBlockConfigs={codeBlockConfigs}
                  blockStatus={blockStatus}
                />
              </React.Fragment>
            ))}
          </li>
        )
      })}
    </Tag>
  )
}


