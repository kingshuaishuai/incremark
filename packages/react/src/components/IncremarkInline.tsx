import React from 'react'
import type { PhrasingContent, ImageReference, LinkReference } from 'mdast'
import {
  type TextNodeWithChunks,
  hasChunks,
  getStableText,
  isHtmlNode
} from '@incremark/shared'
import { IncremarkHtmlElement, type HtmlElementNode } from './IncremarkHtmlElement'
import { useDefinitions } from '../contexts/DefinitionsContext'

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
 * IncremarkInline 组件
 * 
 * 渲染行内内容（文本、加粗、斜体、链接、图片等）
 * 
 * 支持特性：
 * - 文本节点（含 chunks 动画）
 * - 加粗、斜体、删除线
 * - 行内代码
 * - 链接（link）和引用式链接（linkReference）
 * - 图片（image）和引用式图片（imageReference）
 * - HTML 元素
 * 
 * 注意：此组件与 Vue 版本保持完全一致的逻辑和结构
 */
export const IncremarkInline: React.FC<IncremarkInlineProps> = ({ nodes }) => {
  if (!nodes || nodes.length === 0) return null

  // 获取 definitions context
  const { definitions, footnoteDefinitions } = useDefinitions()

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
          const imageNode = node as { url: string; alt?: string; title?: string | null }
          return (
            <img 
              key={i} 
              src={imageNode.url} 
              alt={imageNode.alt || ''} 
              title={imageNode.title || undefined}
              loading="lazy" 
            />
          )
        }

        // 引用式图片（imageReference）
        if (isImageReference(node)) {
          const definition = definitions[node.identifier]
          
          // 如果找到定义，渲染为图片
          if (definition) {
            return (
              <img 
                key={i} 
                src={definition.url} 
                alt={node.alt || ''} 
                title={definition.title || undefined}
                loading="lazy" 
              />
            )
          }
          
          // 如果没有找到定义，渲染为原始文本（降级处理）
          return (
            <span key={i} className="incremark-image-ref-missing">
              ![{node.alt}][{node.identifier || node.label}]
            </span>
          )
        }

        // 引用式链接（linkReference）
        if (isLinkReference(node)) {
          const definition = definitions[node.identifier]
          
          // 如果找到定义，渲染为链接
          if (definition) {
            return (
              <a 
                key={i} 
                href={definition.url} 
                title={definition.title || undefined}
                target="_blank" 
                rel="noopener noreferrer"
              >
                <IncremarkInline nodes={node.children as PhrasingContent[]} />
              </a>
            )
          }
          
          // 如果没有找到定义，渲染为原始文本（降级处理）
          return (
            <span key={i} className="incremark-link-ref-missing">
              [{node.children.map(c => (c as any).value).join('')}][{node.identifier || node.label}]
            </span>
          )
        }

        // 脚注引用（footnoteReference）
        if (node.type === 'footnoteReference') {
          const footnoteRef = node as any
          const hasDefinition = footnoteDefinitions[footnoteRef.identifier]
          
          return (
            <sup key={i} className="incremark-footnote-ref">
              <a href={`#fn-${footnoteRef.identifier}`} id={`fnref-${footnoteRef.identifier}`}>
                {hasDefinition ? `[${footnoteRef.identifier}]` : `[^${footnoteRef.identifier}]`}
              </a>
            </sup>
          )
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

