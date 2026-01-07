<!--
  @file Incremark.svelte - 主渲染组件
  @description 主入口组件，管理 blocks 渲染
-->

<script lang="ts">
  import type { Component } from 'svelte'
  import type { Readable } from 'svelte/store'
  import type { RootContent, ParsedBlock } from '@incremark/core'
  import type { HTML } from 'mdast'

  import { getDefinitionsContext } from '../context/definitionsContext'
  import type { UseIncremarkReturn } from '../stores/useIncremark'
  import type { ComponentMap, RenderableBlock } from './types'

  // 导入组件
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
    blocks?: RenderableBlock[] | Readable<RenderableBlock[]>
    /** 内容是否完全显示完成（用于控制脚注等需要在内容完全显示后才出现的元素）
     * 如果传入了 incremark，则会自动使用 incremark.isDisplayComplete，此 prop 被忽略 */
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
    /** 可选：useIncremark 返回的对象（用于自动注入数据） */
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

  const context = getDefinitionsContext();
  const footnoteReferenceOrder = $derived(context?.footnoteReferenceOrder ?? []);

  // 当使用 incremark 时，从 incremark 对象中提取 blocks 和 isDisplayComplete
  const incremarkBlocks = $derived(
    incremark ? (incremark as any).blocks : []
  );
  const incremarkIsDisplayComplete = $derived(
    incremark ? (incremark as any).isDisplayComplete : false
  );
</script>

<div class="incremark">
  <!-- 主要内容块 -->
  {#if incremark}
    <!-- 使用 incremark 的 blocks store -->
    {#each $incremarkBlocks as block (block.id)}
      {#if (block as ParsedBlock).node.type !== 'definition' && (block as ParsedBlock).node.type !== 'footnoteDefinition'}
        <div
          class="incremark-block {(block as ParsedBlock).status === 'completed' ? completedClass : pendingClass} {showBlockStatus ? 'incremark-show-status' : ''} {(block as RenderableBlock).isLastPending ? 'incremark-last-pending' : ''}"
        >
          <!-- 使用 IncremarkRenderer，传递 customContainers 和 customCodeBlocks -->
          <IncremarkRenderer
            node={(block as ParsedBlock).node}
            {components}
            customContainers={customContainers}
            customCodeBlocks={customCodeBlocks}
            codeBlockConfigs={codeBlockConfigs}
            blockStatus={(block as ParsedBlock).status}
          />
        </div>
      {/if}
    {/each}
  {:else}
    <!-- 使用传入的 blocks 数组 -->
    {#each (Array.isArray(blocks) ? blocks : []) as block (block.id)}
      {#if (block as ParsedBlock).node.type !== 'definition' && (block as ParsedBlock).node.type !== 'footnoteDefinition'}
        <div
          class="incremark-block {(block as ParsedBlock).status === 'completed' ? completedClass : pendingClass} {showBlockStatus ? 'incremark-show-status' : ''} {(block as RenderableBlock).isLastPending ? 'incremark-last-pending' : ''}"
        >
          <!-- 使用 IncremarkRenderer，传递 customContainers 和 customCodeBlocks -->
          <IncremarkRenderer
            node={(block as ParsedBlock).node}
            {components}
            customContainers={customContainers}
            customCodeBlocks={customCodeBlocks}
            codeBlockConfigs={codeBlockConfigs}
            blockStatus={(block as ParsedBlock).status}
          />
        </div>
      {/if}
    {/each}
  {/if}

  <!-- 脚注列表（仅在内容完全显示后显示） -->
  {#if incremark && $incremarkIsDisplayComplete && $footnoteReferenceOrder}
    {@const footnoteOrder = $footnoteReferenceOrder ?? []}
    {#if footnoteOrder.length > 0}
      <IncremarkFootnotes />
    {/if}
  {:else if !incremark && isDisplayComplete && $footnoteReferenceOrder}
    {@const footnoteOrder = $footnoteReferenceOrder ?? []}
    {#if footnoteOrder.length > 0}
      <IncremarkFootnotes />
    {/if}
  {/if}
</div>

