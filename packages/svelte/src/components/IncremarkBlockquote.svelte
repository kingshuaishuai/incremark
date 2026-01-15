<!--
  @file IncremarkBlockquote.svelte - 引用组件
  @description 渲染 Markdown 引用块，支持所有块级内容
-->

<script lang="ts">
  import type { Blockquote } from 'mdast'
  import IncremarkRenderer from './IncremarkRenderer.svelte'

  /**
   * 组件 Props
   */
  interface Props {
    /** 引用节点 */
    node: Blockquote
    /** 自定义组件映射 */
    components?: Record<string, any>
    customContainers?: Record<string, any>
    customCodeBlocks?: Record<string, any>
    codeBlockConfigs?: Record<string, { takeOver?: boolean }>
    blockStatus?: 'pending' | 'stable' | 'completed'
  }

  let { node, components, customContainers, customCodeBlocks, codeBlockConfigs, blockStatus }: Props = $props()
</script>

<blockquote class="incremark-blockquote">
  {#each node.children as child, index (index)}
    <IncremarkRenderer
      node={child}
      {components}
      {customContainers}
      {customCodeBlocks}
      {codeBlockConfigs}
      {blockStatus}
    />
  {/each}
</blockquote>

