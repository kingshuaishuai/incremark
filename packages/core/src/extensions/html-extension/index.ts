import type { Parent, RootContent, Root, PhrasingContent, HTML } from 'mdast'
import type { Extension as MdastExtension } from 'mdast-util-from-markdown'

declare module 'mdast' {
  interface RootContentMap {
    htmlElement: HtmlElementNode
  }
  interface PhrasingContentMap {
    htmlElement: HtmlElementNode
  }
}

// ============ 类型定义 ============

/**
 * 自定义 HTML 元素节点类型
 */
export interface HtmlElementNode extends Parent {
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

/**
 * HTML 属性信息
 */
export interface HtmlAttrInfo {
  name: string
  value: string
}

/**
 * 解析后的 HTML 标签信息
 */
export interface ParsedHtmlTag {
  tagName: string
  attrs: Record<string, string>
  isClosing: boolean
  isSelfClosing: boolean
  rawHtml: string
}

/**
 * HTML 树扩展配置
 */
export interface HtmlTreeExtensionOptions {
  /**
   * 标签黑名单 - 这些标签会被过滤掉（XSS 防护）
   * 默认包含危险标签：script, style, iframe, object, embed, form, input, button, textarea, select
   */
  tagBlacklist?: string[]
  
  /**
   * 属性黑名单 - 这些属性会被过滤掉（XSS 防护）
   * 默认包含所有 on* 事件属性和 javascript: 协议
   */
  attrBlacklist?: string[]
  
  /**
   * 协议黑名单 - URL 属性中禁止的协议
   * 默认包含 javascript:, vbscript:, data: (允许 data:image/)
   */
  protocolBlacklist?: string[]
  
  /**
   * 是否保留原始 HTML 在 data 中
   * 默认为 true
   */
  preserveRawHtml?: boolean
  
  /**
   * 自定义标签处理器
   * 可以对特定标签进行自定义处理
   */
  tagHandlers?: Record<string, (node: HtmlElementNode) => HtmlElementNode | null>
}

// ============ 默认配置 ============

/**
 * 危险标签黑名单（XSS 防护）
 */
export const DEFAULT_TAG_BLACKLIST = [
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'form',
  'input',
  'button',
  'textarea',
  'select',
  'meta',
  'link',
  'base',
  'frame',
  'frameset',
  'applet',
  'noscript',
  'template'
]

/**
 * 危险属性黑名单（XSS 防护）
 * 包含所有 on* 事件属性
 */
export const DEFAULT_ATTR_BLACKLIST = [
  // 事件属性通过正则匹配
  'formaction',
  'xlink:href',
  'xmlns',
  'srcdoc'
]

/**
 * 危险协议黑名单
 */
export const DEFAULT_PROTOCOL_BLACKLIST = [
  'javascript:',
  'vbscript:',
  'data:' // 注意：data:image/ 会被特殊处理允许
]

/**
 * URL 类属性列表（需要检查协议）
 */
const URL_ATTRS = ['href', 'src', 'action', 'formaction', 'poster', 'background']

// ============ HTML 解析工具 ============

/**
 * HTML 内容类型
 */
export type HtmlContentType = 'opening' | 'closing' | 'self-closing' | 'fragment' | 'unknown'

/**
 * 自闭合标签列表
 */
const VOID_ELEMENTS = ['br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr']

/**
 * 判断 HTML 内容的类型
 * - opening: 单个开标签，如 <span class="foo">
 * - closing: 单个闭标签，如 </span>
 * - self-closing: 自闭合标签，如 <br /> 或 <img src="...">
 * - fragment: 完整的 HTML 片段，包含多个标签
 * - unknown: 无法识别
 */
export function detectHtmlContentType(html: string): HtmlContentType {
  const trimmed = html.trim()
  
  // 空内容
  if (!trimmed) return 'unknown'
  
  // 不是以 < 开头
  if (!trimmed.startsWith('<')) return 'unknown'
  
  // 检查是否是单个闭标签: </tagName>
  const closingMatch = trimmed.match(/^<\/([a-zA-Z][a-zA-Z0-9-]*)\s*>$/)
  if (closingMatch) {
    return 'closing'
  }
  
  // 检查是否是单个开标签或自闭合标签
  // 单个标签不应该包含其他 < 字符（除了在属性值中）
  // 使用更精确的匹配：从开头到第一个 > 之间不应该有未转义的 <
  const singleTagMatch = trimmed.match(/^<([a-zA-Z][a-zA-Z0-9-]*)(\s[^]*?)?(\/?)>$/)
  if (singleTagMatch) {
    const [fullMatch, tagName, attrsString, selfClosingSlash] = singleTagMatch
    
    // 检查属性字符串中是否有未闭合的 < 
    // 如果有，说明这可能是一个片段而不是单个标签
    if (attrsString) {
      // 统计属性字符串中的 < 数量（不在引号内的）
      let inQuote = ''
      let hasUnquotedBracket = false
      for (let i = 0; i < attrsString.length; i++) {
        const char = attrsString[i]
        if (inQuote) {
          if (char === inQuote) inQuote = ''
        } else {
          if (char === '"' || char === "'") inQuote = char
          else if (char === '<') {
            hasUnquotedBracket = true
            break
          }
        }
      }
      if (hasUnquotedBracket) {
        return 'fragment'
      }
    }
    
    // 判断是否是自闭合
    const isSelfClosing = selfClosingSlash === '/' || VOID_ELEMENTS.includes(tagName.toLowerCase())
    return isSelfClosing ? 'self-closing' : 'opening'
  }
  
  // 检查是否包含多个标签（片段）
  // 统计 < 的数量
  let bracketCount = 0
  for (const char of trimmed) {
    if (char === '<') bracketCount++
  }
  if (bracketCount > 1) {
    return 'fragment'
  }
  
  return 'unknown'
}

/**
 * 解析单个 HTML 标签（开标签、闭标签或自闭合标签）
 * 只处理单个标签，不处理完整的 HTML 片段
 */
export function parseHtmlTag(html: string): ParsedHtmlTag | null {
  const trimmed = html.trim()
  const contentType = detectHtmlContentType(trimmed)
  
  // 只处理单个标签
  if (contentType !== 'opening' && contentType !== 'closing' && contentType !== 'self-closing') {
    return null
  }
  
  // 闭标签
  if (contentType === 'closing') {
    const match = trimmed.match(/^<\/([a-zA-Z][a-zA-Z0-9-]*)\s*>$/)
    if (!match) return null
    return {
      tagName: match[1].toLowerCase(),
      attrs: {},
      isClosing: true,
      isSelfClosing: false,
      rawHtml: html
    }
  }
  
  // 开标签或自闭合标签
  const match = trimmed.match(/^<([a-zA-Z][a-zA-Z0-9-]*)(\s[^]*?)?(\/?)>$/)
  if (!match) return null
  
  const [, tagName, attrsString, selfClosingSlash] = match
  const isSelfClosing = selfClosingSlash === '/' || VOID_ELEMENTS.includes(tagName.toLowerCase())
  
  // 解析属性
  const attrs: Record<string, string> = {}
  if (attrsString) {
    // 匹配属性：name="value", name='value', name=value, name
    const attrRegex = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g
    let attrMatch
    while ((attrMatch = attrRegex.exec(attrsString)) !== null) {
      const [, name, doubleQuoted, singleQuoted, unquoted] = attrMatch
      const value = doubleQuoted ?? singleQuoted ?? unquoted ?? ''
      attrs[name.toLowerCase()] = decodeHtmlEntities(value)
    }
  }
  
  return {
    tagName: tagName.toLowerCase(),
    attrs,
    isClosing: false,
    isSelfClosing,
    rawHtml: html
  }
}

/**
 * 解码 HTML 实体
 */
function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' '
  }
  
  return text.replace(/&(?:#(\d+)|#x([a-fA-F0-9]+)|([a-zA-Z]+));/g, (match, dec, hex, name) => {
    if (dec) return String.fromCharCode(parseInt(dec, 10))
    if (hex) return String.fromCharCode(parseInt(hex, 16))
    return entities[`&${name};`] || match
  })
}

/**
 * 内部函数：直接解析单个 HTML 标签（不进行类型检测）
 * 用于 parseHtmlFragment 中已经通过正则分离出的标签
 */
function parseTagDirect(tag: string): ParsedHtmlTag | null {
  const trimmed = tag.trim()
  
  // 闭标签
  const closingMatch = trimmed.match(/^<\/([a-zA-Z][a-zA-Z0-9-]*)\s*>$/)
  if (closingMatch) {
    return {
      tagName: closingMatch[1].toLowerCase(),
      attrs: {},
      isClosing: true,
      isSelfClosing: false,
      rawHtml: tag
    }
  }
  
  // 开标签或自闭合标签（允许多行属性）
  const openMatch = trimmed.match(/^<([a-zA-Z][a-zA-Z0-9-]*)([\s\S]*?)(\/?)>$/)
  if (!openMatch) return null
  
  const [, tagName, attrsString, selfClosingSlash] = openMatch
  const isSelfClosing = selfClosingSlash === '/' || VOID_ELEMENTS.includes(tagName.toLowerCase())
  
  // 解析属性
  const attrs: Record<string, string> = {}
  if (attrsString) {
    // 匹配属性：name="value", name='value', name=value, name
    const attrRegex = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g
    let attrMatch
    while ((attrMatch = attrRegex.exec(attrsString)) !== null) {
      const [, name, doubleQuoted, singleQuoted, unquoted] = attrMatch
      const value = doubleQuoted ?? singleQuoted ?? unquoted ?? ''
      attrs[name.toLowerCase()] = decodeHtmlEntities(value)
    }
  }
  
  return {
    tagName: tagName.toLowerCase(),
    attrs,
    isClosing: false,
    isSelfClosing,
    rawHtml: tag
  }
}

/**
 * 解析完整的 HTML 片段为 AST
 */
export function parseHtmlFragment(html: string, options: HtmlTreeExtensionOptions = {}): HtmlElementNode[] {
  const result: HtmlElementNode[] = []
  const stack: HtmlElementNode[] = []
  
  // 使用正则逐个提取标签和文本
  const tokenRegex = /(<\/?[a-zA-Z][^>]*>)|([^<]+)/g
  let match
  
  while ((match = tokenRegex.exec(html)) !== null) {
    const [, tag, text] = match
    
    if (tag) {
      // 使用 parseTagDirect 直接解析，避免类型检测误判
      const parsed = parseTagDirect(tag)
      if (!parsed) continue
      
      // 检查标签黑名单
      if (isTagBlacklisted(parsed.tagName, options)) {
        continue
      }
      
      if (parsed.isClosing) {
        // 结束标签：向上查找匹配的开始标签
        let found = false
        for (let i = stack.length - 1; i >= 0; i--) {
          if (stack[i].tagName === parsed.tagName) {
            // 找到匹配，弹出并关闭
            const node = stack.pop()!
            if (stack.length > 0) {
              stack[stack.length - 1].children.push(node)
            } else {
              result.push(node)
            }
            found = true
            break
          }
        }
        // 未找到匹配的开始标签，忽略该结束标签
        if (!found) continue
      } else {
        // 开始标签或自闭合标签
        const sanitizedAttrs = sanitizeAttrs(parsed.attrs, options)
        
        const node: HtmlElementNode = {
          type: 'htmlElement',
          tagName: parsed.tagName,
          attrs: sanitizedAttrs,
          children: [],
          data: options.preserveRawHtml !== false ? {
            rawHtml: tag,
            parsed: true
          } : undefined
        }
        
        if (parsed.isSelfClosing) {
          // 自闭合标签直接添加
          if (stack.length > 0) {
            stack[stack.length - 1].children.push(node)
          } else {
            result.push(node)
          }
        } else {
          // 开始标签，入栈
          stack.push(node)
        }
      }
    } else if (text && text.trim()) {
      // 文本节点
      const textNode: RootContent = {
        type: 'text',
        value: text
      } as RootContent
      
      if (stack.length > 0) {
        stack[stack.length - 1].children.push(textNode)
      }
      // 顶层纯文本不处理（应该已经被 markdown 解析器处理）
    }
  }
  
  // 处理未闭合的标签（从栈中弹出）
  while (stack.length > 0) {
    const node = stack.pop()!
    if (stack.length > 0) {
      stack[stack.length - 1].children.push(node)
    } else {
      result.push(node)
    }
  }
  
  return result
}

// ============ XSS 防护 ============

/**
 * 检查标签是否在黑名单中
 */
function isTagBlacklisted(tagName: string, options: HtmlTreeExtensionOptions): boolean {
  const blacklist = options.tagBlacklist ?? DEFAULT_TAG_BLACKLIST
  return blacklist.includes(tagName.toLowerCase())
}

/**
 * 检查属性是否在黑名单中
 */
function isAttrBlacklisted(attrName: string, options: HtmlTreeExtensionOptions): boolean {
  const name = attrName.toLowerCase()
  const blacklist = options.attrBlacklist ?? DEFAULT_ATTR_BLACKLIST
  
  // 检查 on* 事件属性
  if (name.startsWith('on')) return true
  
  return blacklist.includes(name)
}

/**
 * 检查 URL 是否包含危险协议
 */
function isProtocolDangerous(url: string, options: HtmlTreeExtensionOptions): boolean {
  const protocolBlacklist = options.protocolBlacklist ?? DEFAULT_PROTOCOL_BLACKLIST
  const normalizedUrl = url.trim().toLowerCase()
  
  for (const protocol of protocolBlacklist) {
    if (normalizedUrl.startsWith(protocol)) {
      // 特殊处理：允许 data:image/
      if (protocol === 'data:' && normalizedUrl.startsWith('data:image/')) {
        return false
      }
      return true
    }
  }
  
  return false
}

/**
 * 清理属性，移除危险属性
 */
function sanitizeAttrs(
  attrs: Record<string, string>,
  options: HtmlTreeExtensionOptions
): Record<string, string> {
  const result: Record<string, string> = {}
  
  for (const [name, value] of Object.entries(attrs)) {
    // 检查属性黑名单
    if (isAttrBlacklisted(name, options)) continue
    
    // 检查 URL 属性的协议
    if (URL_ATTRS.includes(name.toLowerCase())) {
      if (isProtocolDangerous(value, options)) continue
    }
    
    result[name] = value
  }
  
  return result
}

// ============ AST 转换器 ============

/**
 * 检查是否是 HTML 节点
 */
function isHtmlNode(node: RootContent): node is HTML {
  return node.type === 'html'
}

/**
 * 检查节点是否有子节点
 */
function hasChildren(node: RootContent | Root): node is Parent & RootContent {
  return 'children' in node && Array.isArray((node as Parent).children)
}

/**
 * 预处理：合并被空行分割的 HTML 节点
 *
 * CommonMark 规范中，HTML 块会在空行处被截断，导致：
 * - `<div>\ncontent` 和 `</div>` 被分成独立的 HTML 节点
 *
 * 此函数通过追踪未闭合的标签，将分散的 HTML 节点合并回完整的片段
 */
function mergeFragmentedHtmlNodes(nodes: RootContent[]): RootContent[] {
  const result: RootContent[] = []
  let i = 0


  while (i < nodes.length) {
    const node = nodes[i]

    if (!isHtmlNode(node)) {
      result.push(node)
      i++
      continue
    }

    // 检测当前 HTML 节点中是否有未闭合的标签
    const unclosedTags = findUnclosedTags(node.value)

    if (unclosedTags.length === 0) {
      // 没有未闭合标签，直接添加
      result.push(node)
      i++
      continue
    }

    // 有未闭合标签，尝试向后查找闭合标签
    const mergedParts: string[] = [node.value]
    let j = i + 1
    let currentUnclosed = [...unclosedTags]

    while (j < nodes.length && currentUnclosed.length > 0) {
      const nextNode = nodes[j]

      if (isHtmlNode(nextNode)) {
        // 检查这个节点是否包含我们需要的闭合标签
        const closingInfo = checkClosingTags(nextNode.value, currentUnclosed)

        if (closingInfo.hasRelevantClosing) {
          mergedParts.push(nextNode.value)
          currentUnclosed = closingInfo.remainingUnclosed

          if (currentUnclosed.length === 0) {
            // 所有标签都已闭合，停止合并
            j++
            break
          }
        } else {
          // 这个 HTML 节点不包含我们需要的闭合标签
          // 但可能是中间内容，也需要包含
          mergedParts.push(nextNode.value)
        }
      } else {
        // 非 HTML 节点（可能是 paragraph 等），停止合并
        // 因为这意味着内容结构已经改变
        break
      }

      j++
    }

    if (mergedParts.length > 1) {
      // 成功合并了多个节点
      const mergedValue = mergedParts.join('\n')
      const mergedNode: HTML = {
        type: 'html',
        value: mergedValue
      }
      result.push(mergedNode)
      i = j
    } else {
      // 无法合并，保留原节点
      result.push(node)
      i++
    }
  }

  return result
}

/**
 * 查找 HTML 内容中未闭合的标签
 */
function findUnclosedTags(html: string): string[] {
  const tagStack: string[] = []

  // 匹配所有标签
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9-]*)[^>]*\/?>/g
  let match

  while ((match = tagRegex.exec(html)) !== null) {
    const fullTag = match[0]
    const tagName = match[1].toLowerCase()

    // 跳过自闭合标签
    if (VOID_ELEMENTS.includes(tagName) || fullTag.endsWith('/>')) {
      continue
    }

    if (fullTag.startsWith('</')) {
      // 闭合标签
      const lastIndex = tagStack.lastIndexOf(tagName)
      if (lastIndex !== -1) {
        tagStack.splice(lastIndex, 1)
      }
    } else {
      // 开标签
      tagStack.push(tagName)
    }
  }

  return tagStack
}

/**
 * 检查 HTML 内容中是否包含指定标签的闭合标签
 */
function checkClosingTags(
  html: string,
  unclosedTags: string[]
): { hasRelevantClosing: boolean; remainingUnclosed: string[] } {
  const remaining = [...unclosedTags]
  let hasRelevant = false

  // 匹配闭合标签
  const closeTagRegex = /<\/([a-zA-Z][a-zA-Z0-9-]*)\s*>/g
  let match

  while ((match = closeTagRegex.exec(html)) !== null) {
    const tagName = match[1].toLowerCase()
    const index = remaining.lastIndexOf(tagName)
    if (index !== -1) {
      remaining.splice(index, 1)
      hasRelevant = true
    }
  }

  return {
    hasRelevantClosing: hasRelevant,
    remainingUnclosed: remaining
  }
}

/**
 * 处理 HTML 节点数组，将开始标签、内容、结束标签合并为结构化节点
 */
function processHtmlNodesInArray(
  nodes: RootContent[],
  options: HtmlTreeExtensionOptions
): RootContent[] {
  // 预处理：合并被空行分割的 HTML 节点
  const mergedNodes = mergeFragmentedHtmlNodes(nodes)

  const result: RootContent[] = []
  let i = 0
  
  while (i < mergedNodes.length) {
    const node = mergedNodes[i]
    
    if (isHtmlNode(node)) {
      // 首先检测 HTML 内容类型
      const contentType = detectHtmlContentType(node.value)
      
      if (contentType === 'fragment') {
        // 完整的 HTML 片段，解析为 HTML 树
        const fragmentNodes = parseHtmlFragment(node.value, options)
        if (fragmentNodes.length > 0) {
          result.push(...fragmentNodes)
        } else {
          // 无法解析，保留原节点
          result.push(node)
        }
        i++
      } else if (contentType === 'self-closing') {
        // 自闭合标签
        const parsed = parseHtmlTag(node.value)
        if (parsed && !isTagBlacklisted(parsed.tagName, options)) {
          const elementNode: HtmlElementNode = {
            type: 'htmlElement',
            tagName: parsed.tagName,
            attrs: sanitizeAttrs(parsed.attrs, options),
            children: [],
            data: options.preserveRawHtml !== false ? {
              rawHtml: node.value,
              parsed: true,
              originalType: 'html'
            } : undefined
          }
          result.push(elementNode)
        }
        i++
      } else if (contentType === 'closing') {
        // 孤立的结束标签，跳过（通常已被开标签处理）
        i++
      } else if (contentType === 'opening') {
        // 开始标签：收集子节点直到找到对应的结束标签
        const parsed = parseHtmlTag(node.value)
        if (!parsed || isTagBlacklisted(parsed.tagName, options)) {
          i++
          continue
        }
        
        const tagName = parsed.tagName
        const contentNodes: RootContent[] = []
        let depth = 1
        let j = i + 1
        let foundClosing = false
        
        while (j < mergedNodes.length && depth > 0) {
          const nextNode = mergedNodes[j]
          
          if (isHtmlNode(nextNode)) {
            const nextType = detectHtmlContentType(nextNode.value)
            
            if (nextType === 'closing') {
              const nextParsed = parseHtmlTag(nextNode.value)
              if (nextParsed && nextParsed.tagName === tagName) {
                depth--
                if (depth === 0) {
                  foundClosing = true
                  break
                }
              }
            } else if (nextType === 'opening') {
              const nextParsed = parseHtmlTag(nextNode.value)
              if (nextParsed && nextParsed.tagName === tagName) {
                depth++
              }
            }
            // fragment 和 self-closing 不影响深度
          }
          
          contentNodes.push(nextNode)
          j++
        }
        
        // 创建结构化节点
        const elementNode: HtmlElementNode = {
          type: 'htmlElement',
          tagName: parsed.tagName,
          attrs: sanitizeAttrs(parsed.attrs, options),
          children: processHtmlNodesInArray(contentNodes, options),
          data: options.preserveRawHtml !== false ? {
            rawHtml: node.value,
            parsed: true,
            originalType: 'html'
          } : undefined
        }
        
        result.push(elementNode)
        i = foundClosing ? j + 1 : j
      } else {
        // unknown 类型，保留原节点
        result.push(node)
        i++
      }
    } else {
      // 非 HTML 节点，递归处理子节点
      if (hasChildren(node)) {
        const processed = processHtmlNodesInArray(
          (node as Parent).children as RootContent[],
          options
        )
        result.push({
          ...node,
          children: processed
        } as RootContent)
      } else {
        result.push(node)
      }
      i++
    }
  }
  
  return result
}

/**
 * 转换整个 AST，处理所有 HTML 节点
 */
export function transformHtmlNodes(ast: Root, options: HtmlTreeExtensionOptions = {}): Root {
  return {
    ...ast,
    children: processHtmlNodesInArray(ast.children, options) as Root['children']
  }
}

/**
 * 创建 HTML 树转换器
 * 这是一个 unified 兼容的转换器
 */
export function createHtmlTreeTransformer(options: HtmlTreeExtensionOptions = {}) {
  return function transformer(tree: Root): Root {
    return transformHtmlNodes(tree, options)
  }
}

// ============ mdast 扩展（用于 fromMarkdown） ============

/**
 * mdast-util-from-markdown 扩展
 * 注意：此扩展主要用于类型声明，实际转换在后处理阶段完成
 */
export const htmlTreeExtension: MdastExtension = {
  enter: {},
  exit: {}
}

// ============ 便捷工具函数 ============

/**
 * 判断节点是否是 HtmlElementNode
 */
export function isHtmlElementNode(node: RootContent): node is HtmlElementNode {
  return node.type === 'htmlElement'
}

/**
 * 遍历所有 HTML 元素节点
 */
export function walkHtmlElements(
  node: RootContent | Root,
  callback: (node: HtmlElementNode, parent: Parent | Root | null) => void,
  parent: Parent | Root | null = null
): void {
  if (isHtmlElementNode(node as RootContent)) {
    callback(node as HtmlElementNode, parent)
  }
  
  if (hasChildren(node as RootContent) || node.type === 'root') {
    const children = (node as Parent | Root).children
    for (const child of children) {
      walkHtmlElements(child, callback, node as Parent | Root)
    }
  }
}

/**
 * 查找特定标签的所有节点
 */
export function findHtmlElementsByTag(
  root: Root,
  tagName: string
): HtmlElementNode[] {
  const result: HtmlElementNode[] = []
  
  walkHtmlElements(root, (node) => {
    if (node.tagName === tagName.toLowerCase()) {
      result.push(node)
    }
  })
  
  return result
}

/**
 * 将 HtmlElementNode 转回 HTML 字符串
 */
export function htmlElementToString(node: HtmlElementNode): string {
  const { tagName, attrs, children } = node
  
  // 构建属性字符串
  const attrsStr = Object.entries(attrs)
    .map(([name, value]) => {
      if (value === '') return name
      return `${name}="${escapeHtml(value)}"`
    })
    .join(' ')
  
  const openTag = attrsStr ? `<${tagName} ${attrsStr}>` : `<${tagName}>`
  
  // 自闭合标签
  if (children.length === 0 && isSelfClosingTag(tagName)) {
    return attrsStr ? `<${tagName} ${attrsStr} />` : `<${tagName} />`
  }
  
  // 递归处理子节点
  const childrenStr = children.map(child => {
    if (child.type === 'text') {
      return (child as { value: string }).value
    }
    if (isHtmlElementNode(child)) {
      return htmlElementToString(child)
    }
    // 其他节点类型保持原样（实际使用中可能需要扩展）
    return ''
  }).join('')
  
  return `${openTag}${childrenStr}</${tagName}>`
}

/**
 * 检查是否是自闭合标签
 */
function isSelfClosingTag(tagName: string): boolean {
  return ['br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'].includes(tagName.toLowerCase())
}

/**
 * HTML 转义
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// ============ 导出 ============

export {
  DEFAULT_TAG_BLACKLIST as HTML_TAG_BLACKLIST,
  DEFAULT_ATTR_BLACKLIST as HTML_ATTR_BLACKLIST,
  DEFAULT_PROTOCOL_BLACKLIST as HTML_PROTOCOL_BLACKLIST
}
