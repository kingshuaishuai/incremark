<!--
  @file Incremark.svelte - 主渲染组件
  @description 主入口组件，管理 blocks 渲染
-->

<script lang="ts">
  import type { Component } from 'svelte'
  import type { RootContent, ParsedBlock } from '@incremark/core'

  import { getDefinitionsContext } from '../context/definitionsContext'
  import type { UseIncremarkReturn } from '../stores/useIncremark'
  import type { ComponentMap, RenderableBlock } from './types'

  // 导入组件
  import IncremarkFootnotes from './IncremarkFootnotes.svelte'
  import IncremarkRenderer from './IncremarkRenderer.svelte'

  /**
   * 组件 Props
   */
  interface Props {
    /** 要渲染的块列表数组 */
    blocks?: RenderableBlock[]
    /** 内容是否完全显示完成 */
    isDisplayComplete?: boolean
    /** 自定义组件映射，key 为节点类型 */
    components?: ComponentMap
    /** 自定义容器组件映射，key 为容器名称（如 'warning', 'info'） */
    customContainers?: Record<string, Component<any>>
    /** 自定义代码块组件映射，key 为代码语言名称（如 'echart', 'mermaid'） */
    customCodeBlocks?: Record<string, Component<any>>
    /** 代码块配置映射，key 为代码语言名称 */
    codeBlockConfigs?: Record<string, { takeOver?: boolean }>
    /** 待处理块的样式类名 */
    pendingClass?: string
    /** 已完成块的样式类名 */
    completedClass?: string
    /** 是否显示块状态边框 */
    showBlockStatus?: boolean
    /** 可选：useIncremark 返回的对象（用于自动注入数据，优先级高于 blocks/isDisplayComplete） */
    incremark?: UseIncremarkReturn
  }

  let {
    blocks = [],
    isDisplayComplete = false,
    components = {},
    customContainers = {},
    customCodeBlocks = {},
    codeBlockConfigs = {},
    pendingClass = 'incremark-pending',
    completedClass = 'incremark-completed',
    showBlockStatus = false,
    incremark
  }: Props = $props()

  const context = getDefinitionsContext()
  // 解构 store 以便使用 $ 语法订阅
  const { footnoteReferenceOrder } = context

  // 如果传入了 incremark，则从中获取 stores 并在顶层订阅
  // 否则使用直接传入的 props 值
  const blocksFromIncremark = incremark?.blocks
  const displayCompleteFromIncremark = incremark?.isDisplayComplete

  // 计算最终要渲染的 blocks
  // 如果使用 incremark，订阅其 blocks store；否则使用直接传入的 blocks 数组
  const renderBlocks = $derived<RenderableBlock[]>(
    blocksFromIncremark ? $blocksFromIncremark : (blocks ?? [])
  )

  // 计算是否显示完成
  const displayComplete = $derived(
    displayCompleteFromIncremark ? $displayCompleteFromIncremark : isDisplayComplete
  )
</script>

<div class="incremark">
  <!-- 主要内容块 -->
  {#each renderBlocks as block (block.id)}
    {#if block.node.type !== 'definition' && block.node.type !== 'footnoteDefinition'}
      <div
        class="incremark-block {block.status === 'completed' ? completedClass : pendingClass} {showBlockStatus ? 'incremark-show-status' : ''} {block.isLastPending ? 'incremark-last-pending' : ''}"
      >
        <IncremarkRenderer
          node={block.node}
          {components}
          customContainers={customContainers}
          customCodeBlocks={customCodeBlocks}
          codeBlockConfigs={codeBlockConfigs}
          blockStatus={block.status}
        />
      </div>
    {/if}
  {/each}

  <!-- 脚注列表（仅在内容完全显示后显示） -->
  {#if displayComplete && $footnoteReferenceOrder.length > 0}
    <IncremarkFootnotes />
  {/if}
</div>
