<!--
  @file IncremarkRenderer.svelte - 渲染器组件
  @description 用于渲染单个 RootContent 节点
-->

<script lang="ts">
  import type { RootContent, HTML } from 'mdast'
  import IncremarkHeading from './IncremarkHeading.svelte'
  import IncremarkParagraph from './IncremarkParagraph.svelte'
  import IncremarkCode from './IncremarkCode.svelte'
  import IncremarkList from './IncremarkList.svelte'
  import IncremarkTable from './IncremarkTable.svelte'
  import IncremarkBlockquote from './IncremarkBlockquote.svelte'
  import IncremarkThematicBreak from './IncremarkThematicBreak.svelte'
  import IncremarkMath from './IncremarkMath.svelte'
  import IncremarkHtmlElement from './IncremarkHtmlElement.svelte'
  import IncremarkDefault from './IncremarkDefault.svelte'
  import IncremarkContainer, { type ContainerNode } from './IncremarkContainer.svelte'

  /**
   * 组件 Props
   */
  interface Props {
    /** 要渲染的节点 */
    node: RootContent | ContainerNode
    customContainers?: Record<string, any>
    customCodeBlocks?: Record<string, any>
    blockStatus?: 'pending' | 'stable' | 'completed'
  }

  let { 
    node, 
    customContainers,
    customCodeBlocks,
    blockStatus
  }: Props = $props()

  /**
   * 组件映射
   */
  const componentMap: Record<string, any> = {
    heading: IncremarkHeading,
    paragraph: IncremarkParagraph,
    code: IncremarkCode,
    list: IncremarkList,
    table: IncremarkTable,
    blockquote: IncremarkBlockquote,
    thematicBreak: IncremarkThematicBreak,
    math: IncremarkMath,
    inlineMath: IncremarkMath,
    htmlElement: IncremarkHtmlElement,
  }

  /**
   * 获取组件
   */
  function getComponent(type: string): any {
    return componentMap[type] || IncremarkDefault
  }

  /**
   * 检查是否是 html 节点
   */
  function isHtmlNode(node: RootContent | ContainerNode): node is HTML {
    return node.type === 'html'
  }

  /**
   * 检查是否是容器节点
   */
  function isContainerNode(node: RootContent | ContainerNode): node is ContainerNode {
    return (node as any).type === 'containerDirective' || 
           (node as any).type === 'leafDirective' || 
           (node as any).type === 'textDirective'
  }
</script>

<!-- HTML 节点：渲染为代码块显示源代码 -->
{#if isHtmlNode(node)}
  <pre class="incremark-html-code"><code>{node.value}</code></pre>
<!-- 容器节点：使用容器组件，传递 customContainers -->
{:else if isContainerNode(node)}
  <IncremarkContainer 
    node={node} 
    customContainers={customContainers}
  />
<!-- 代码节点：特殊处理，传递 customCodeBlocks 和 blockStatus -->
{:else if node.type === 'code'}
  {@const Component = getComponent('code')}
  {#if Component}
    <Component 
      node={node} 
      customCodeBlocks={customCodeBlocks}
      blockStatus={blockStatus}
    />
  {/if}
{:else}
  <!-- 其他节点：使用对应组件 -->
  {@const Component = getComponent(node.type)}
  {#if Component}
    <Component node={node} />
  {/if}
{/if}

