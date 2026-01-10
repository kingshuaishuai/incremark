/* @jsxImportSource solid-js */

import type { Component, JSX } from 'solid-js'
import type { ParsedBlock } from '@incremark/core'
import { For, Show, mergeProps } from 'solid-js'
import { useDefinationsContext } from '../composables/useDefinationsContext'
import type { UseIncremarkReturn } from '../composables/useIncremark'
import type { ComponentMap, CodeBlockConfig } from '../types'
import IncremarkRenderer from './IncremarkRenderer'
import { IncremarkFootnotes } from './IncremarkFootnotes'

export interface IncremarkProps {
  /** 要渲染的块列表（来自 useIncremark 的 blocks） */
  blocks?: ParsedBlock[] | (() => ParsedBlock[])
  /** 内容是否完全显示完成（用于控制脚注等需要在内容完全显示后才出现的元素）
   * 如果传入了 incremark，则会自动使用 incremark.isDisplayComplete，此 prop 被忽略 */
  isDisplayComplete?: boolean | (() => boolean)
  /** 自定义组件映射，key 为节点类型 */
  components?: ComponentMap
  /** 自定义容器组件映射，key 为容器名称（如 'warning', 'info'） */
  customContainers?: Record<string, Component<any>>
  /** 自定义代码块组件映射，key 为代码语言名称（如 'echart', 'mermaid'） */
  customCodeBlocks?: Record<string, Component<any>>
  /** 代码块配置映射，key 为代码语言名称 */
  codeBlockConfigs?: Record<string, CodeBlockConfig>
  /** 待处理块的样式类名 */
  pendingClass?: string
  /** 已完成块的样式类名 */
  completedClass?: string
  /** 是否显示块状态边框 */
  showBlockStatus?: boolean
  /** 可选：useIncremark 返回的对象（用于自动注入数据） */
  incremark?: UseIncremarkReturn
}

/**
 * Incremark 主组件（内部渲染逻辑）
 */
function IncremarkInner(props: IncremarkProps) {
  const mergedProps = mergeProps({
    isDisplayComplete: false,
    pendingClass: 'incremark-pending',
    completedClass: 'incremark-completed',
    showBlockStatus: false
  }, props)

  const components = () => mergedProps.components || {}
  const customContainers = () => mergedProps.customContainers || {}
  const customCodeBlocks = () => mergedProps.customCodeBlocks || {}
  const codeBlockConfigs = () => mergedProps.codeBlockConfigs || {}

  const {
    footnoteReferenceOrder
  } = useDefinationsContext()

  // 计算实际使用的 blocks 和 isDisplayComplete
  const actualBlocks = () => {
    if (mergedProps.incremark) {
      // blocks 现在是 store 数组，不是函数
      return mergedProps.incremark.blocks
    }
    return typeof mergedProps.blocks === 'function' ? mergedProps.blocks() : mergedProps.blocks
  }

  const actualIsDisplayComplete = () => {
    // 优先使用 incremark 提供的 isDisplayComplete（已考虑打字机等状态）
    if (mergedProps.incremark) {
      return mergedProps.incremark.isDisplayComplete()
    }
    // 否则使用用户传入的 isDisplayComplete
    return typeof mergedProps.isDisplayComplete === 'function' ? mergedProps.isDisplayComplete() : mergedProps.isDisplayComplete
  }

  return (
    <div class="incremark">
      {/* 主要内容块 */}
      <For each={actualBlocks()}>
        {(block) => (
          <Show
            when={block.node.type !== 'definition' && block.node.type !== 'footnoteDefinition'}
          >
            <div
              class={
                `incremark-block ${
                  block.status === 'completed' ? mergedProps.completedClass : mergedProps.pendingClass
                }${
                  mergedProps.showBlockStatus ? ' incremark-show-status' : ''
                }${
                  (block as any).isLastPending ? ' incremark-last-pending' : ''
                }`
              }
            >
              <IncremarkRenderer
                node={block.node}
                customContainers={customContainers()}
                customCodeBlocks={customCodeBlocks()}
                codeBlockConfigs={codeBlockConfigs()}
                components={components()}
                blockStatus={block.status}
              />
            </div>
          </Show>
        )}
      </For>

      {/* 脚注列表（仅在内容完全显示后显示） */}
      <Show when={actualIsDisplayComplete() && footnoteReferenceOrder().length > 0}>
        <IncremarkFootnotes />
      </Show>
    </div>
  )
}

/**
 * Incremark 主组件
 *
 * 渲染增量解析的 Markdown 块列表
 */
export const Incremark: Component<IncremarkProps> = (props) => {
  return <IncremarkInner {...props} />
}

export default Incremark
