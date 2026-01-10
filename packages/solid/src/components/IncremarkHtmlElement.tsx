/* @jsxImportSource solid-js */

import type { RootContent, PhrasingContent } from 'mdast'
import { Component, For, Show } from 'solid-js'
import type { JSX } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { IncremarkInline } from './IncremarkInline'
import { IncremarkRenderer } from './IncremarkRenderer'

/**
 * HtmlElementNode 类型定义（与 @incremark/core 中的定义一致）
 */
export interface HtmlElementNode {
  type: 'htmlElement'
  tagName: string
  attrs: Record<string, string>
  children: RootContent[]
  data?: {
    rawHtml?: string
    parsed?: boolean
    originalType?: string
  }
}

export interface IncremarkHtmlElementProps {
  node: HtmlElementNode
}

/**
 * 行内元素列表
 */
const INLINE_ELEMENTS = [
  'a', 'abbr', 'acronym', 'b', 'bdo', 'big', 'br', 'button', 'cite',
  'code', 'dfn', 'em', 'i', 'img', 'input', 'kbd', 'label', 'map',
  'object', 'output', 'q', 'samp', 'script', 'select', 'small',
  'span', 'strong', 'sub', 'sup', 'textarea', 'time', 'tt', 'var'
]

/**
 * 自闭合元素列表
 */
const VOID_ELEMENTS = [
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
]

/**
 * 判断是否是行内元素
 */
function isInlineElement(tagName: string): boolean {
  return INLINE_ELEMENTS.includes(tagName.toLowerCase())
}

/**
 * 判断是否是自闭合元素
 */
function isVoidElement(tagName: string): boolean {
  return VOID_ELEMENTS.includes(tagName.toLowerCase())
}

/**
 * 判断子节点是否都是行内内容
 */
function hasOnlyInlineChildren(children: RootContent[]): boolean {
  if (!children || children.length === 0) return true

  return children.every(child => {
    const type = child.type
    const inlineTypes = ['text', 'strong', 'emphasis', 'inlineCode', 'link', 'image', 'break', 'html', 'htmlElement']
    if (inlineTypes.includes(type)) {
      if (type === 'htmlElement') {
        return isInlineElement((child as unknown as HtmlElementNode).tagName)
      }
      return true
    }
    return false
  })
}

/**
 * 渲染子节点
 */
function renderChildren(children: RootContent[]): JSX.Element {
  if (!children || children.length === 0) return null as unknown as JSX.Element

  // 如果子节点都是行内内容，使用 IncremarkInline
  if (hasOnlyInlineChildren(children)) {
    return <IncremarkInline nodes={children as PhrasingContent[]} />
  }

  // 否则递归渲染每个子节点
  return (
    <For each={children}>
      {(child, idx) => {
        // htmlElement 类型
        if (child.type === 'htmlElement') {
          return <IncremarkHtmlElement node={child as unknown as HtmlElementNode} />
        }

        // 文本节点
        if (child.type === 'text') {
          return <>{(child as { value: string }).value}</>
        }

        // 常见行内类型
        if (['strong', 'emphasis', 'inlineCode', 'link', 'image', 'break'].includes(child.type)) {
          return <IncremarkInline nodes={[child as PhrasingContent]} />
        }

        // 段落
        if (child.type === 'paragraph') {
          return (
            <p>
              <IncremarkInline nodes={(child as { children: PhrasingContent[] }).children} />
            </p>
          )
        }

        // 其他类型使用 IncremarkRenderer
        return <IncremarkRenderer node={child} />
      }}
    </For>
  )
}

/**
 * IncremarkHtmlElement 组件
 *
 * 渲染结构化的 HTML 元素节点，使用 Dynamic 组件支持动态标签名
 */
export const IncremarkHtmlElement: Component<IncremarkHtmlElementProps> = (props) => {
  const tagName = () => props.node.tagName
  const attrs = () => props.node.attrs || {}
  const children = () => props.node.children || []

  // 自闭合元素没有子节点
  const isVoid = () => isVoidElement(tagName())

  return (
    <Dynamic
      component={tagName() as keyof JSX.IntrinsicElements}
      {...attrs()}
      class={`incremark-html-element incremark-${tagName()}`}
    >
      <Show when={!isVoid()}>
        {renderChildren(children())}
      </Show>
    </Dynamic>
  )
}
