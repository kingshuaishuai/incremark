<!--
  @file Incremark.svelte - 主渲染组件
  @description 主入口组件，管理 blocks 渲染
-->

<script lang="ts">
  import type { Component } from 'svelte'
  import type { Readable } from 'svelte/store'
  import type { RootContent } from '@incremark/core'
  import type { HTML } from 'mdast'
  
  import { getDefinitionsContext } from '../context/definitionsContext'
  import type { UseIncremarkReturn } from '../stores/useIncremark'
  import type { ComponentMap, BlockWithStableId } from './types'
  
  // 导入默认组件
  import IncremarkParagraph from './IncremarkParagraph.svelte'
  import IncremarkHeading from './IncremarkHeading.svelte'
  import IncremarkCode from './IncremarkCode.svelte'
  import IncremarkList from './IncremarkList.svelte'
  import IncremarkTable from './IncremarkTable.svelte'
  import IncremarkBlockquote from './IncremarkBlockquote.svelte'
  import IncremarkThematicBreak from './IncremarkThematicBreak.svelte'
  import IncremarkMath from './IncremarkMath.svelte'
  import IncremarkHtmlElement from './IncremarkHtmlElement.svelte'
  import IncremarkDefault from './IncremarkDefault.svelte'
  import IncremarkFootnotes from './IncremarkFootnotes.svelte'
  import IncremarkRenderer from './IncremarkRenderer.svelte'

  /**
   * 检查是否是 html 节点
   */
  function isHtmlNode(node: RootContent): node is HTML {
    return node.type === 'html'
  }

  /**
   * 组件 Props
   */
  interface Props {
    /** 要渲染的块列表（来自 useIncremark 的 blocks） */
    blocks?: BlockWithStableId[] | Readable<BlockWithStableId[]>
    /** 自定义组件映射，key 为节点类型 */
    components?: ComponentMap
    /** 自定义容器组件映射，key 为容器名称（如 'warning', 'info'） */
    customContainers?: Record<string, Component<any>>
    /** 自定义代码块组件映射，key 为代码语言名称（如 'echart', 'mermaid'） */
    customCodeBlocks?: Record<string, Component<any>>
    /** 待处理块的样式类名 */
    pendingClass?: string
    /** 已完成块的样式类名 */
    completedClass?: string
    /** 是否显示块状态边框 */
    showBlockStatus?: boolean
    /** 可选：useIncremark 返回的对象（用于自动注入数据） */
    incremark?: UseIncremarkReturn
  }

  let {
    blocks = [],
    components = {},
    customContainers = {},
    customCodeBlocks = {},
    pendingClass = 'incremark-pending',
    completedClass = 'incremark-completed',
    showBlockStatus = false,
    incremark
  }: Props = $props()

  // 从 context 获取 footnoteReferenceOrder（如果有的话）
  // 使用 $derived 来确保响应式
  const footnoteReferenceOrder = $derived.by(() => {
    try {
      const context = getDefinitionsContext()
      return context.footnoteReferenceOrder
    } catch {
      // 如果没有 context，返回 null
      return null
    }
  })

  // 计算 isFinalized（当不使用 incremark 时）
  const actualIsFinalized = $derived.by(() => {
    if (incremark) {
      // 如果提供了 incremark，在模板中直接使用 $incremark.isFinalized
      return false
    }
    // 如果手动传入 blocks，自动判断是否所有 block 都是 completed
    const blocksArray = Array.isArray(blocks) ? blocks : []
    return blocksArray.length > 0 && blocksArray.every(b => b.status === 'completed')
  })

  // 默认组件映射
  const defaultComponents: ComponentMap = {
    paragraph: IncremarkParagraph,
    heading: IncremarkHeading,
    code: IncremarkCode,
    list: IncremarkList,
    table: IncremarkTable,
    blockquote: IncremarkBlockquote,
    thematicBreak: IncremarkThematicBreak,
    math: IncremarkMath,
    inlineMath: IncremarkMath,
    htmlElement: IncremarkHtmlElement
  }

  // 合并用户组件和默认组件
  const mergedComponents = $derived({
    ...defaultComponents,
    ...components
  })

  // 处理 blocks（可能是 store 或数组）
  const blocksArray = $derived.by(() => {
    if (incremark) {
      // 如果提供了 incremark，在模板中直接使用 incremark.blocks（store）
      return []
    }
    return Array.isArray(blocks) ? blocks : []
  })

  // 提取 incremark 的 stores（如果存在）
  const incremarkBlocks = $derived.by(() => incremark?.blocks)
  const incremarkIsFinalized = $derived.by(() => incremark?.isFinalized)
</script>

<div class="incremark">
  <!-- 主要内容块 -->
  {#if incremark && incremarkBlocks}
    <!-- 使用 incremark 的 blocks store -->
    {#each ($incremarkBlocks || []) as block (block.stableId)}
      {#if block.node.type !== 'definition' && block.node.type !== 'footnoteDefinition'}
        <div
          class="incremark-block {block.status === 'completed' ? completedClass : pendingClass} {showBlockStatus ? 'incremark-show-status' : ''} {(block as BlockWithStableId).isLastPending ? 'incremark-last-pending' : ''}"
        >
          <!-- 使用 IncremarkRenderer，传递 customContainers 和 customCodeBlocks -->
          <IncremarkRenderer 
            node={block.node} 
            customContainers={customContainers}
            customCodeBlocks={customCodeBlocks}
            blockStatus={block.status}
          />
        </div>
      {/if}
    {/each}
  {:else}
    <!-- 使用传入的 blocks 数组 -->
    {#each blocksArray as block (block.stableId)}
      {#if block.node.type !== 'definition' && block.node.type !== 'footnoteDefinition'}
        <div
          class="incremark-block {block.status === 'completed' ? completedClass : pendingClass} {showBlockStatus ? 'incremark-show-status' : ''} {block.isLastPending ? 'incremark-last-pending' : ''}"
        >
          <!-- 使用 IncremarkRenderer，传递 customContainers 和 customCodeBlocks -->
          <IncremarkRenderer 
            node={block.node} 
            customContainers={customContainers}
            customCodeBlocks={customCodeBlocks}
            blockStatus={block.status}
          />
        </div>
      {/if}
    {/each}
  {/if}

  <!-- 脚注列表（仅在 finalize 后显示） -->
  {#if incremark && incremarkIsFinalized && footnoteReferenceOrder && $incremarkIsFinalized}
    {@const footnoteOrder = $footnoteReferenceOrder ?? []}
    {#if footnoteOrder.length > 0}
      <IncremarkFootnotes />
    {/if}
  {:else if !incremark && actualIsFinalized && footnoteReferenceOrder}
    {@const footnoteOrder = $footnoteReferenceOrder ?? []}
    {#if footnoteOrder.length > 0}
      <IncremarkFootnotes />
    {/if}
  {/if}
</div>

