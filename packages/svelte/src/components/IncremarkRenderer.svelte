<!--
  @file IncremarkRenderer.svelte - 渲染器组件
  @description 用于渲染单个 RootContent 节点
-->

<script lang="ts">
  import type { RootContent, HTML } from 'mdast'
  import IncremarkHeading from './IncremarkHeading.svelte'
  import IncremarkParagraph from './IncremarkParagraph.svelte'
  import IncremarkList from './IncremarkList.svelte'
  import IncremarkTable from './IncremarkTable.svelte'
  import IncremarkBlockquote from './IncremarkBlockquote.svelte'
  import IncremarkThematicBreak from './IncremarkThematicBreak.svelte'
  import IncremarkMath from './IncremarkMath.svelte'
  import IncremarkHtmlElement from './IncremarkHtmlElement.svelte'
  import IncremarkDefault from './IncremarkDefault.svelte'
  import IncremarkCode from './IncremarkCode.svelte'
  import IncremarkContainer, { type ContainerNode } from './IncremarkContainer.svelte'

  /**
   * 组件 Props
   */
  interface Props {
    /** 要渲染的节点 */
    node: RootContent | ContainerNode
    /** 自定义组件映射，key 为节点类型 */
    components?: Record<string, any>
    customContainers?: Record<string, any>
    customCodeBlocks?: Record<string, any>
    codeBlockConfigs?: Record<string, { takeOver?: boolean }>
    blockStatus?: 'pending' | 'stable' | 'completed'
  }

  let {
    node,
    components,
    customContainers,
    customCodeBlocks,
    codeBlockConfigs,
    blockStatus
  }: Props = $props()

  /**
   * 默认组件映射
   */
  const defaultComponentMap: Record<string, any> = {
    heading: IncremarkHeading,
    paragraph: IncremarkParagraph,
    list: IncremarkList,
    table: IncremarkTable,
    blockquote: IncremarkBlockquote,
    thematicBreak: IncremarkThematicBreak,
    math: IncremarkMath,
    inlineMath: IncremarkMath,
    htmlElement: IncremarkHtmlElement,
    containerDirective: IncremarkContainer,
    leafDirective: IncremarkContainer,
    textDirective: IncremarkContainer,
  }

  /**
   * 获取组件
   */
  function getComponent(type: string): any {
    return defaultComponentMap[type] || IncremarkDefault
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
<!-- 代码节点：特殊处理，传递 customCodeBlocks、codeBlockConfigs 和 blockStatus -->
{:else if node.type === 'code'}
  <IncremarkCode
    node={node}
    customCodeBlocks={customCodeBlocks}
    codeBlockConfigs={codeBlockConfigs}
    blockStatus={blockStatus}
    defaultCodeComponent={components?.['code']}
  />
{:else}
  <!-- 其他节点：使用对应组件 -->
  {@const Component = getComponent(node.type)}
  {#if Component}
    <Component node={node} />
  {/if}
{/if}

