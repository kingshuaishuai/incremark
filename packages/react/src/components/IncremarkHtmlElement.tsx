import React from 'react'
import type { RootContent, PhrasingContent } from 'mdast'
import { IncremarkInline } from './IncremarkInline'

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
 * 过滤属性，移除事件属性
 */
function filterAttrs(attrs: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(attrs)) {
    // 跳过事件属性
    if (key.toLowerCase().startsWith('on')) continue
    result[key] = value
  }
  return result
}

/**
 * 将 CSS 字符串转换为 React 样式对象
 * 例如："color: red; font-weight: bold;" -> { color: "red", fontWeight: "bold" }
 * 
 * 注意：此函数对不标准的 CSS 字符串有容错处理，不会抛出异常
 */
function parseStyleString(styleStr: string): React.CSSProperties {
  const result: Record<string, string> = {}
  
  // 空值直接返回空对象
  if (!styleStr || typeof styleStr !== 'string') return result

  try {
    // 分割样式规则
    const rules = styleStr.split(';')
    
    for (const rule of rules) {
      const trimmed = rule.trim()
      // 跳过空规则
      if (!trimmed) continue
      
      // 找到第一个冒号分割属性名和值
      const colonIndex = trimmed.indexOf(':')
      // 跳过没有冒号的无效规则
      if (colonIndex === -1) continue
      
      const property = trimmed.slice(0, colonIndex).trim()
      const value = trimmed.slice(colonIndex + 1).trim()
      
      // 跳过空属性名或空值
      if (!property || !value) continue
      
      // 跳过明显无效的属性名（只允许字母、数字、连字符）
      if (!/^[a-zA-Z-][a-zA-Z0-9-]*$/.test(property)) continue
      
      // 将 kebab-case 转换为 camelCase
      const camelProperty = property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
      result[camelProperty] = value
    }
  } catch {
    // 解析失败时返回空对象，避免渲染崩溃
    console.warn('[IncremarkHtmlElement] Failed to parse style string:', styleStr)
    return {}
  }
  
  return result
}

/**
 * 将属性转换为 React props 格式
 * React 使用 camelCase 属性名，并且某些属性需要重命名
 */
function toReactProps(attrs: Record<string, string>): Record<string, any> {
  const filtered = filterAttrs(attrs)
  const result: Record<string, any> = {}

  for (const [key, value] of Object.entries(filtered)) {
    // 特殊属性映射
    if (key === 'class') {
      result.className = value
    } else if (key === 'for') {
      result.htmlFor = value
    } else if (key === 'style') {
      // 将 CSS 字符串转换为 React 样式对象
      result.style = parseStyleString(value)
    } else {
      // 保持原始属性名（React 会自动处理大多数属性）
      result[key] = value
    }
  }

  return result
}

/**
 * 渲染子节点
 */
function renderChildren(children: RootContent[]): React.ReactNode {
  if (!children || children.length === 0) return null

  // 如果子节点都是行内内容，使用 IncremarkInline
  if (hasOnlyInlineChildren(children)) {
    return <IncremarkInline nodes={children as PhrasingContent[]} />
  }

  // 否则递归渲染每个子节点
  return children.map((child, idx) => {
    // htmlElement 类型
    if (child.type === 'htmlElement') {
      return <IncremarkHtmlElement key={idx} node={child as unknown as HtmlElementNode} />
    }

    // 文本节点
    if (child.type === 'text') {
      return <React.Fragment key={idx}>{(child as { value: string }).value}</React.Fragment>
    }

    // 常见行内类型
    if (['strong', 'emphasis', 'inlineCode', 'link', 'image', 'break'].includes(child.type)) {
      return <IncremarkInline key={idx} nodes={[child as PhrasingContent]} />
    }

    // 段落
    if (child.type === 'paragraph') {
      return (
        <p key={idx}>
          <IncremarkInline nodes={(child as { children: PhrasingContent[] }).children} />
        </p>
      )
    }

    // 其他未知类型
    return (
      <div key={idx} className="incremark-unknown-child">
        {child.type}
      </div>
    )
  })
}

/**
 * IncremarkHtmlElement 组件
 *
 * 渲染结构化的 HTML 元素节点
 */
export const IncremarkHtmlElement: React.FC<IncremarkHtmlElementProps> = ({ node }) => {
  const { tagName, attrs, children } = node
  const Tag = tagName as any
  const reactProps = toReactProps(attrs)

  // 自闭合元素没有子节点
  if (isVoidElement(tagName)) {
    return <Tag {...reactProps} className={`incremark-html-element incremark-${tagName} ${reactProps.className || ''}`} />
  }

  return (
    <Tag {...reactProps} className={`incremark-html-element incremark-${tagName} ${reactProps.className || ''}`}>
      {renderChildren(children)}
    </Tag>
  )
}

