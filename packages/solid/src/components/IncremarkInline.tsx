/* @jsxImportSource solid-js */

import type { PhrasingContent, RootContent, ImageReference, LinkReference } from 'mdast'
import { type TextChunk, type TextNodeWithChunks, hasChunks, getStableText, isHtmlNode } from '@incremark/shared'
import { Component, For, Index, Show } from 'solid-js'
import { IncremarkMath } from './IncremarkMath'
import { IncremarkHtmlElement } from './IncremarkHtmlElement'
import { useDefinationsContext } from '../composables/useDefinationsContext'

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
  children: RootContent[]
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

export interface IncremarkInlineProps {
  nodes: PhrasingContent[]
}

export const IncremarkInline: Component<IncremarkInlineProps> = (props) => {
  const { definations, footnoteDefinitions } = useDefinationsContext()

  /**
   * 获取节点的 chunks（类型安全）
   */
  function getChunks(node: PhrasingContent): TextChunk[] | undefined {
    if (hasChunks(node)) {
      return (node as TextNodeWithChunks).chunks
    }
    return undefined
  }

  /**
   * 类型守卫：检查是否是 inlineMath 节点
   */
  function isInlineMath(node: PhrasingContent): node is PhrasingContent & MathNode {
    return (node as unknown as MathNode).type === 'inlineMath'
  }

  return (
    <>
      <For each={props.nodes}>
        {(node, idx) => (
          <>
            {/* 文本（支持 chunks 渐入动画） */}
            <Show when={node.type === 'text'}>
              {/* 稳定文本（已经显示过的部分，无动画） */}
              {getStableText(node as TextNodeWithChunks)}
              {/* 新增的 chunk 部分（带渐入动画） */}
              {/* 使用 Index 而不是 For，因为 Index 按索引跟踪元素，不会因为对象引用变化而重新创建 DOM 元素 */}
              {/* 这样 CSS 动画只在元素首次创建时播放，后续更新不会重新触发动画 */}
              <Index each={getChunks(node) || []}>
                {(chunk, idx) => (
                  <span
                    class="incremark-fade-in"
                    data-chunk-key={chunk().createdAt}
                  >
                    {chunk().text}
                  </span>
                )}
              </Index>
            </Show>

            {/* 行内公式 */}
            <Show when={isInlineMath(node)}>
              <IncremarkMath node={node as unknown as MathNode} />
            </Show>

            {/* htmlElement 节点（结构化的 HTML 元素） */}
            <Show when={isHtmlElementNode(node)}>
              <IncremarkHtmlElement node={node as unknown as HtmlElementNode} />
            </Show>

            {/* HTML 节点（原始 HTML，如未启用 htmlTree 选项） */}
            <Show when={isHtmlNode(node)}>
              <span class="incremark-inline-html" innerHTML={(node as any).value} />
            </Show>

            {/* 加粗 */}
            <Show when={node.type === 'strong'}>
              <strong>
                <IncremarkInline nodes={((node as any).children as PhrasingContent[])} />
              </strong>
            </Show>

            {/* 斜体 */}
            <Show when={node.type === 'emphasis'}>
              <em>
                <IncremarkInline nodes={((node as any).children as PhrasingContent[])} />
              </em>
            </Show>

            {/* 行内代码 */}
            <Show when={node.type === 'inlineCode'}>
              <code class="incremark-inline-code">{(node as any).value}</code>
            </Show>

            {/* 链接 */}
            <Show when={node.type === 'link'}>
              <a
                class="incremark-link"
                href={(node as any).url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IncremarkInline nodes={((node as any).children as PhrasingContent[])} />
              </a>
            </Show>

            {/* 图片 */}
            <Show when={node.type === 'image'}>
              <img
                class="incremark-image"
                src={(node as any).url}
                alt={(node as any).alt || ''}
                title={(node as any).title || undefined}
                loading="lazy"
              />
            </Show>

            {/* 引用式图片（imageReference） */}
            <Show when={isImageReference(node)}>
              <Show
                when={definations()[(node as ImageReference).identifier]}
                fallback={
                  <span class="incremark-image-ref-missing">
                    ![{(node as ImageReference).alt}][{(node as ImageReference).identifier || (node as ImageReference).label}]
                  </span>
                }
              >
                <img
                  class="incremark-image incremark-reference-image"
                  src={definations()[(node as ImageReference).identifier].url}
                  alt={(node as ImageReference).alt || ''}
                  title={definations()[(node as ImageReference).identifier].title || undefined}
                  loading="lazy"
                />
              </Show>
            </Show>

            {/* 引用式链接（linkReference） */}
            <Show when={isLinkReference(node)}>
              <Show
                when={definations()[(node as LinkReference).identifier]}
                fallback={
                  <span class="incremark-link-ref-missing">
                    [{((node as LinkReference).children as any[]).map((c: any) => c.value).join('')}][{(node as LinkReference).identifier || (node as LinkReference).label}]
                  </span>
                }
              >
                <a
                  class="incremark-link incremark-reference-link"
                  href={definations()[(node as LinkReference).identifier].url}
                  title={definations()[(node as LinkReference).identifier].title || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IncremarkInline nodes={((node as LinkReference).children as PhrasingContent[])} />
                </a>
              </Show>
            </Show>

            {/* 脚注引用（footnoteReference） */}
            <Show when={node.type === 'footnoteReference'}>
              <sup class="incremark-footnote-ref">
                <a href={`#fn-${(node as any).identifier}`} id={`fnref-${(node as any).identifier}`}>
                  [{(node as any).identifier}]
                </a>
              </sup>
            </Show>

            {/* 换行 */}
            <Show when={node.type === 'break'}>
              <br />
            </Show>

            {/* 删除线 */}
            <Show when={node.type === 'delete'}>
              <del>
                <IncremarkInline nodes={((node as any).children as PhrasingContent[])} />
              </del>
            </Show>
          </>
        )}
      </For>
    </>
  )
}
