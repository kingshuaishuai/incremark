<!--
  @file IncremarkContainer.svelte - 容器组件
  @description 用于渲染自定义容器节点
-->

<script lang="ts">
  import type { RootContent } from 'mdast'
  import IncremarkRenderer from './IncremarkRenderer.svelte'

  /**
   * 容器节点类型定义
   * 根据 directive 解析后的结构
   */
  export interface ContainerNode {
    type: 'containerDirective' | 'leafDirective' | 'textDirective'
    name: string
    attributes?: Record<string, string>
    children?: RootContent[]
  }

  /**
   * 组件 Props
   */
  interface Props {
    node: ContainerNode
    customContainers?: Record<string, any>
  }

  let { node, customContainers = {} }: Props = $props()

  /**
   * 解析 attributes 字符串为对象
   * directive 的 attributes 可能是字符串格式，需要解析
   */
  function parseOptions(attributes?: Record<string, string>): Record<string, any> {
    if (!attributes) return {}
    
    const options: Record<string, any> = {}
    for (const [key, value] of Object.entries(attributes)) {
      // 尝试解析 JSON 值
      try {
        options[key] = JSON.parse(value)
      } catch {
        // 如果不是 JSON，直接使用字符串值
        options[key] = value
      }
    }
    return options
  }

  const containerName = $derived(node.name)
  const options = $derived(parseOptions(node.attributes))
  const CustomContainer = $derived(customContainers?.[containerName])

  // 如果没有自定义容器组件，使用默认渲染
  const hasCustomContainer = $derived(!!CustomContainer)
</script>

{#if hasCustomContainer && CustomContainer}
  <!-- 如果有自定义容器组件，使用自定义组件 -->
  <CustomContainer
    name={containerName}
    options={options}
  >
    {#if node.children && node.children.length > 0}
      {#each node.children as child, index (index)}
        <IncremarkRenderer node={child} />
      {/each}
    {/if}
  </CustomContainer>
{:else}
  <!-- 如果没有自定义容器组件，使用默认渲染 -->
  <div class="incremark-container incremark-container-{containerName}">
    {#if node.children && node.children.length > 0}
      <div class="incremark-container-content">
        {#each node.children as child, index (index)}
          <IncremarkRenderer node={child} />
        {/each}
      </div>
    {/if}
  </div>
{/if}

