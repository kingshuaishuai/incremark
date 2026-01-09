<script lang="ts">
  import type { Code } from 'mdast'
  import type { Component } from 'svelte'
  import IncremarkCodeMermaid from './IncremarkCodeMermaid.svelte'
  import IncremarkCodeDefault from './IncremarkCodeDefault.svelte'

  /**
   * 组件 Props
   */
  interface Props {
    /** 代码节点 */
    node: Code
    /** Shiki 主题，默认 github-dark */
    theme?: string
    /** 默认回退主题（当指定主题加载失败时使用），默认 github-dark */
    fallbackTheme?: string
    /** 是否禁用代码高亮 */
    disableHighlight?: boolean
    /** Mermaid 渲染延迟（毫秒），用于流式输入时防抖 */
    mermaidDelay?: number
    /** 自定义代码块组件映射，key 为代码语言名称 */
    customCodeBlocks?: Record<string, any>
    /** 代码块配置映射，key 为代码语言名称 */
    codeBlockConfigs?: Record<string, { takeOver?: boolean }>
    /** 块状态，用于判断是否使用自定义组件 */
    blockStatus?: 'pending' | 'stable' | 'completed'
    /** 默认代码块渲染组件（当不是 mermaid 且没有自定义组件时使用） */
    defaultCodeComponent?: Component<any>
  }

  let {
    node,
    theme = 'github-dark',
    fallbackTheme = 'github-dark',
    disableHighlight = false,
    mermaidDelay = 500,
    customCodeBlocks,
    codeBlockConfigs,
    blockStatus = 'pending',
    defaultCodeComponent
  }: Props = $props()

  /**
   * 计算属性
   */
  const language = $derived(node.lang || 'text')
  const code = $derived(node.value)
  const isMermaid = $derived(language === 'mermaid')

  // 检查是否有自定义代码块组件
  const CustomCodeBlock = $derived.by(() => {
    const component = customCodeBlocks?.[language]
    if (!component) return null

    const config = codeBlockConfigs?.[language]

    if (config?.takeOver) return component
    if (blockStatus !== 'completed') return null

    return component
  })

  // 默认代码块组件
  const DefaultCodeBlock = $derived(defaultCodeComponent || IncremarkCodeDefault)
</script>

{#if CustomCodeBlock}
  {@const Component = CustomCodeBlock}
  <Component 
    codeStr={code} 
    lang={language} 
    completed={blockStatus === 'completed'} 
    takeOver={codeBlockConfigs?.[language]?.takeOver} 
  />
{:else if isMermaid}
  <IncremarkCodeMermaid 
    {node} 
    {mermaidDelay} 
  />
{:else}
  {@const Component = DefaultCodeBlock}
  <!-- 默认代码块渲染（支持用户自定义，使用 stream 高亮）-->
  <Component
    {node}
    {theme}
    {fallbackTheme}
    {disableHighlight}
    {blockStatus}
  />
{/if}
