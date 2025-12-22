import React from 'react'
import type { PhrasingContent, RootContent } from 'mdast'
import {
  type TextNodeWithChunks,
  hasChunks,
  getStableText,
  isHtmlNode
} from '@incremark/shared'
import { IncremarkHtmlElement, type HtmlElementNode } from './IncremarkHtmlElement'

export interface IncremarkInlineProps {
  nodes: PhrasingContent[]
}

/**
 * 类型守卫：检查是否是 htmlElement 节点
 */
function isHtmlElementNode(node: PhrasingContent): node is PhrasingContent & HtmlElementNode {
  return (node as unknown as HtmlElementNode).type === 'htmlElement'
}

/**
 * IncremarkInline 组件
 * 
 * 渲染行内内容（文本、加粗、斜体、链接等）
 * 
 * 注意：此组件与 Vue 版本保持完全一致的逻辑和结构
 */
export const IncremarkInline: React.FC<IncremarkInlineProps> = ({ nodes }) => {
  if (!nodes || nodes.length === 0) return null

  return (
    <>
      {nodes.map((node: PhrasingContent, i: number) => {
        // 文本节点（支持 chunks 渐入动画）
        if (node.type === 'text') {
          const textNode = node as TextNodeWithChunks
          if (hasChunks(node) && textNode.chunks && textNode.chunks.length > 0) {
            return (
              <React.Fragment key={i}>
                {getStableText(textNode)}
                {textNode.chunks.map((chunk: { createdAt: number; text: string }) => (
                  <span key={chunk.createdAt} className="incremark-fade-in">
                    {chunk.text}
                  </span>
                ))}
              </React.Fragment>
            )
          }
          return <React.Fragment key={i}>{(node as TextNodeWithChunks).value}</React.Fragment>
        }

        // htmlElement 节点（结构化的 HTML 元素）
        if (isHtmlElementNode(node)) {
          return <IncremarkHtmlElement key={i} node={node as unknown as HtmlElementNode} />
        }

        // HTML 节点（原始 HTML，如未启用 htmlTree 选项）
        if (isHtmlNode(node)) {
          // 使用 display: contents 的 span，避免影响布局
          return (
            <span
              key={i}
              style={{ display: 'contents' }}
              dangerouslySetInnerHTML={{ __html: node.value }}
            />
          )
        }

        // 加粗
        if (node.type === 'strong') {
          return (
            <strong key={i}>
              <IncremarkInline nodes={node.children as PhrasingContent[]} />
            </strong>
          )
        }

        // 斜体
        if (node.type === 'emphasis') {
          return (
            <em key={i}>
              <IncremarkInline nodes={node.children as PhrasingContent[]} />
            </em>
          )
        }

        // 行内代码
        if (node.type === 'inlineCode') {
          return (
            <code key={i} className="incremark-inline-code">
              {node.value}
            </code>
          )
        }

        // 链接
        if (node.type === 'link') {
          return (
            <a key={i} href={node.url} target="_blank" rel="noopener noreferrer">
              <IncremarkInline nodes={node.children as PhrasingContent[]} />
            </a>
          )
        }

        // 图片
        if (node.type === 'image') {
          return <img key={i} src={node.url} alt={node.alt || ''} loading="lazy" />
        }

        // 换行
        if (node.type === 'break') {
          return <br key={i} />
        }

        // 删除线
        if (node.type === 'delete') {
          return (
            <del key={i}>
              <IncremarkInline nodes={node.children as PhrasingContent[]} />
            </del>
          )
        }

        // 默认情况
        return <span key={i}>{(node as { value?: string }).value || ''}</span>
      })}
    </>
  )
}

