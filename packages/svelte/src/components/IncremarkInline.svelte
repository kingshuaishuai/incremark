<!--
  @file IncremarkInline.svelte - 行内元素组件
  @description 渲染行内 Markdown 元素（文本、链接、加粗、斜体等）
-->

<script lang="ts">
  import type { PhrasingContent, ImageReference, LinkReference } from 'mdast'
  import type { TextChunk } from '@incremark/core'
  import {
    type TextNodeWithChunks,
    hasChunks,
    getStableText,
    isHtmlNode
  } from '@incremark/shared'
  import { getDefinitionsContext } from '../context/definitionsContext'
  import IncremarkMath from './IncremarkMath.svelte'
  import IncremarkHtmlElement from './IncremarkHtmlElement.svelte'
  import IncremarkInline from './IncremarkInline.svelte'

  /**
   * 组件 Props
   */
  interface Props {
    /** 行内节点列表 */
    nodes: PhrasingContent[]
  }

  let { nodes }: Props = $props()

  // Math 节点类型
  interface MathNode {
    type: 'math' | 'inlineMath'
    value: string
  }

  // HtmlElement 节点类型
  interface HtmlElementNode {
    type: 'htmlElement'
    tagName: string
    attrs: Record<string, string>
    children: PhrasingContent[]
  }

  /**
   * 类型守卫：检查是否是 htmlElement 节点
   */
  function isHtmlElementNode(node: PhrasingContent): node is PhrasingContent & HtmlElementNode {
    return (node as unknown as HtmlElementNode).type === 'htmlElement'
  }

  /**
   * 类型守卫：检查是否是 imageReference 节点
   */
  function isImageReference(node: PhrasingContent): node is ImageReference {
    return node.type === 'imageReference'
  }

  /**
   * 类型守卫：检查是否是 linkReference 节点
   */
  function isLinkReference(node: PhrasingContent): node is LinkReference {
    return node.type === 'linkReference'
  }

  /**
   * 类型守卫：检查是否是 inlineMath 节点
   */
  function isInlineMath(node: PhrasingContent): node is PhrasingContent & MathNode {
    return (node as unknown as MathNode).type === 'inlineMath'
  }

  // 获取 definitions context
  const context = getDefinitionsContext()
  // 解构 store 以便使用 $ 语法订阅
  const { definations } = context


  /**
   * 获取节点的 chunks（类型安全）
   */
  function getChunks(node: PhrasingContent): TextChunk[] | undefined {
    if (hasChunks(node)) {
      return (node as TextNodeWithChunks).chunks
    }
    return undefined
  }
</script>

{#each nodes as node, idx (idx)}
  <!-- 文本（支持 chunks 渐入动画） -->
  {#if node.type === 'text'}
    <!-- 稳定文本（已经显示过的部分，无动画） -->
    {getStableText(node as TextNodeWithChunks)}
    <!-- 新增的 chunk 部分（带渐入动画） -->
    {#each getChunks(node) || [] as chunk (chunk.createdAt)}
      <span class="incremark-fade-in">{chunk.text}</span>
    {/each}
  {/if}

  <!-- 行内公式 -->
  {#if isInlineMath(node)}
    <IncremarkMath node={node as unknown as MathNode} />
  {/if}

  <!-- htmlElement 节点（结构化的 HTML 元素） -->
  {#if isHtmlElementNode(node)}
    <IncremarkHtmlElement node={node as unknown as HtmlElementNode} />
  {/if}

  <!-- HTML 节点（原始 HTML，如未启用 htmlTree 选项） -->
  {#if isHtmlNode(node)}
    {@html (node as any).value}
  {/if}

  <!-- 加粗 -->
  {#if node.type === 'strong'}
    <strong>
      <IncremarkInline nodes={node.children as PhrasingContent[]} />
    </strong>
  {/if}

  <!-- 斜体 -->
  {#if node.type === 'emphasis'}
    <em>
      <IncremarkInline nodes={node.children as PhrasingContent[]} />
    </em>
  {/if}

  <!-- 行内代码 -->
  {#if node.type === 'inlineCode'}
    <code class="incremark-inline-code">{(node as any).value}</code>
  {/if}

  <!-- 链接 -->
  {#if node.type === 'link'}
    <a
      class="incremark-link"
      href={node.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <IncremarkInline nodes={node.children as PhrasingContent[]} />
    </a>
  {/if}

  <!-- 图片 -->
  {#if node.type === 'image'}
    <img
      class="incremark-image"
      src={node.url}
      alt={node.alt || ''}
      title={(node as any).title || undefined}
      loading="lazy"
    />
  {/if}

  <!-- 引用式图片（imageReference） -->
  {#if isImageReference(node)}
    {#if $definations && $definations[node.identifier]}
      <img
        class="incremark-image incremark-reference-image"
        src={$definations[node.identifier].url}
        alt={node.alt || ''}
        title={$definations[node.identifier].title || undefined}
        loading="lazy"
      />
    {:else}
      <!-- 如果没有找到定义，渲染为原始文本（降级处理） -->
      <span class="incremark-image-ref-missing">
        ![{node.alt}][{node.identifier || node.label}]
      </span>
    {/if}
  {/if}

  <!-- 引用式链接（linkReference） -->
  {#if isLinkReference(node)}
    {#if $definations && $definations[node.identifier]}
      <a
        class="incremark-link incremark-reference-link"
        href={$definations[node.identifier].url}
        title={$definations[node.identifier].title || undefined}
        target="_blank"
        rel="noopener noreferrer"
      >
        <IncremarkInline nodes={node.children as PhrasingContent[]} />
      </a>
    {:else}
      <!-- 如果没有找到定义，渲染为原始文本（降级处理） -->
      <span class="incremark-link-ref-missing">
        [{node.children.map((c: any) => c.value).join('')}][{node.identifier || node.label}]
      </span>
    {/if}
  {/if}

  <!-- 脚注引用（footnoteReference） -->
  {#if node.type === 'footnoteReference'}
    <sup class="incremark-footnote-ref">
      <a href="#fn-{(node as any).identifier}" id="fnref-{(node as any).identifier}">
        [{(node as any).identifier}]
      </a>
    </sup>
  {/if}

  <!-- 换行 -->
  {#if node.type === 'break'}
    <br />
  {/if}

  <!-- 删除线 -->
  {#if node.type === 'delete'}
    <del>
      <IncremarkInline nodes={node.children as PhrasingContent[]} />
    </del>
  {/if}
{/each}

