/* @jsxImportSource solid-js */

import type { List, ListItem, RootContent } from 'mdast'
import { Component, For, Show, Index } from 'solid-js'
import type { ComponentMap, CodeBlockConfig } from '../types'
import { IncremarkInline } from './IncremarkInline'
import { IncremarkRenderer } from './IncremarkRenderer'

export interface IncremarkListProps {
  node: List
  components?: ComponentMap
  customContainers?: Record<string, Component<any>>
  customCodeBlocks?: Record<string, Component<any>>
  codeBlockConfigs?: Record<string, CodeBlockConfig>
  blockStatus?: 'pending' | 'stable' | 'completed'
}

export const IncremarkList: Component<IncremarkListProps> = (props) => {
  const ordered = () => props.node.ordered
  const start = () => props.node.start || undefined

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

  /**
   * 检查列表项是否有块级子节点（嵌套列表等）
   */
  function hasBlockChildren(item: ListItem): boolean {
    return getItemBlockChildren(item).length > 0
  }

  const hasTaskList = () => props.node.children.some(item => item.checked !== null && item.checked !== undefined)

  return (
    <Show
      when={ordered()}
      fallback={
        <ul
          class={`incremark-list${hasTaskList() ? ' task-list' : ''}`}
        >
          <Index each={props.node.children}>
            {(item, index) => {
              const itemData = item()
              const isTaskItem = itemData.checked !== null && itemData.checked !== undefined

              return (
                <li
                  class={`incremark-list-item${isTaskItem ? ' task-item' : ''}`}
                >
                  <Show when={isTaskItem}>
                    <label class="task-label">
                      <input
                        type="checkbox"
                        checked={itemData.checked ?? false}
                        disabled
                        class="checkbox"
                      />
                      <span class="task-content">
                        <IncremarkInline nodes={getItemInlineContent(itemData)} />
                      </span>
                    </label>
                  </Show>
                  <Show when={!isTaskItem}>
                    <IncremarkInline nodes={getItemInlineContent(itemData)} />
                    {/* 递归渲染所有块级内容（嵌套列表、heading、blockquote、code、table 等） */}
                    <Show when={hasBlockChildren(itemData)}>
                      <Index each={getItemBlockChildren(itemData)}>
                        {(child) => (
                          <IncremarkRenderer
                            node={child()}
                            components={props.components}
                            customContainers={props.customContainers}
                            customCodeBlocks={props.customCodeBlocks}
                            codeBlockConfigs={props.codeBlockConfigs}
                            blockStatus={props.blockStatus}
                          />
                        )}
                      </Index>
                    </Show>
                  </Show>
                </li>
              )
            }}
          </Index>
        </ul>
      }
    >
      <ol
        class={`incremark-list${hasTaskList() ? ' task-list' : ''}`}
        start={start()}
      >
        <Index each={props.node.children}>
          {(item, index) => {
            const itemData = item()
            const isTaskItem = itemData.checked !== null && itemData.checked !== undefined

            return (
              <li
                class={`incremark-list-item${isTaskItem ? ' task-item' : ''}`}
              >
                <Show when={isTaskItem}>
                  <label class="task-label">
                    <input
                      type="checkbox"
                      checked={itemData.checked ?? false}
                      disabled
                      class="checkbox"
                    />
                    <span class="task-content">
                      <IncremarkInline nodes={getItemInlineContent(itemData)} />
                    </span>
                  </label>
                </Show>
                <Show when={!isTaskItem}>
                  <IncremarkInline nodes={getItemInlineContent(itemData)} />
                  {/* 递归渲染所有块级内容（嵌套列表、heading、blockquote、code、table 等） */}
                  <Show when={hasBlockChildren(itemData)}>
                    <Index each={getItemBlockChildren(itemData)}>
                      {(child) => (
                        <IncremarkRenderer node={child()} />
                      )}
                    </Index>
                  </Show>
                </Show>
              </li>
            )
          }}
        </Index>
      </ol>
    </Show>
  )
}
