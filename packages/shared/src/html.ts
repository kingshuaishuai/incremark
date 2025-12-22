import type { PhrasingContent, HTML } from 'mdast'

/**
 * HTML 标签信息
 */
export interface HtmlTagInfo {
  tagName: string
  isClosing: boolean
  isSelfClosing: boolean
}

/**
 * 提取 HTML 标签名（支持自闭合标签）
 */
export function extractTagName(html: string): HtmlTagInfo | null {
  const match = html.match(/^<\/?([a-zA-Z][a-zA-Z0-9-]*)\s*\/?>?/)
  if (!match) return null
  
  const isClosing = html.startsWith('</')
  const isSelfClosing = html.endsWith('/>') || !!html.match(/^<[^>]+\/>$/)
  return {
    tagName: match[1].toLowerCase(),
    isClosing,
    isSelfClosing
  }
}

/**
 * 类型守卫：检查是否是 HTML 节点
 */
export function isHtmlNode(node: PhrasingContent): node is HTML {
  return node.type === 'html'
}

/**
 * HTML 包装节点：包含开始标签、内容节点、结束标签
 * 这样可以在渲染时一起处理，避免空标签
 */
export interface HtmlWrapperNode {
  type: 'html-wrapper'
  startTag: string
  content: PhrasingContent[]
  endTag: string
  tagName: string
}

/**
 * 类型守卫：检查是否是 HTML 包装节点
 */
export function isHtmlWrapperNode(node: PhrasingContent | HtmlWrapperNode): node is HtmlWrapperNode {
  return (node as HtmlWrapperNode).type === 'html-wrapper'
}

/**
 * 处理 HTML 节点数组，将开始标签、中间内容、结束标签包装在一起
 * 这样渲染时可以一起处理，避免空标签
 */
export function processHtmlNodes(nodes: PhrasingContent[]): (PhrasingContent | HtmlWrapperNode)[] {
  const result: (PhrasingContent | HtmlWrapperNode)[] = []
  let i = 0
  
  while (i < nodes.length) {
    const node = nodes[i]
    
    if (isHtmlNode(node)) {
      const tagInfo = extractTagName(node.value)
      
      if (tagInfo) {
        if (tagInfo.isSelfClosing) {
          // 自闭合标签，直接添加
          result.push(node)
          i++
        } else if (tagInfo.isClosing) {
          // 结束标签，如果前面没有匹配的开始标签，跳过（可能是之前补上的）
          // 否则应该已经被包装处理了，这里不应该单独出现
          i++
          continue
        } else {
          // 开始标签：收集后续内容直到找到对应的结束标签
          const startTag = node.value
          const tagName = tagInfo.tagName
          const contentNodes: PhrasingContent[] = []
          let foundClosing = false
          let j = i + 1
          let depth = 1 // 嵌套深度
          
          // 收集开始标签和结束标签之间的所有节点
          while (j < nodes.length && depth > 0) {
            const nextNode = nodes[j]
            
            if (isHtmlNode(nextNode)) {
              const nextTagInfo = extractTagName(nextNode.value)
              if (nextTagInfo) {
                if (nextTagInfo.isClosing && nextTagInfo.tagName === tagName) {
                  // 找到匹配的结束标签
                  depth--
                  if (depth === 0) {
                    foundClosing = true
                    const endTag = nextNode.value
                    
                    // 创建包装节点
                    const wrapperNode: HtmlWrapperNode = {
                      type: 'html-wrapper',
                      startTag,
                      content: contentNodes,
                      endTag,
                      tagName
                    }
                    
                    result.push(wrapperNode)
                    i = j + 1 // 跳过已处理的所有节点
                    break
                  } else {
                    // 嵌套的结束标签，收集到内容中
                    contentNodes.push(nextNode)
                    j++
                  }
                } else if (!nextTagInfo.isClosing && nextTagInfo.tagName === tagName) {
                  // 嵌套的同名开始标签
                  depth++
                  contentNodes.push(nextNode)
                  j++
                } else {
                  // 其他 HTML 节点，收集到内容中
                  contentNodes.push(nextNode)
                  j++
                }
              } else {
                // 无法解析的 HTML，收集到内容中
                contentNodes.push(nextNode)
                j++
              }
            } else {
              // 非 HTML 节点（文本等），收集到内容中
              contentNodes.push(nextNode)
              j++
            }
          }
          
          if (!foundClosing) {
            // 没有找到结束标签，补上一个
            const endTag = `</${tagName}>`
            
            const wrapperNode: HtmlWrapperNode = {
              type: 'html-wrapper',
              startTag,
              content: contentNodes,
              endTag,
              tagName
            }
            
            result.push(wrapperNode)
            i = j // 跳过已处理的所有节点
          }
        }
      } else {
        // 无法解析的 HTML，直接添加
        result.push(node)
        i++
      }
    } else {
      // 非 HTML 节点，直接添加
      result.push(node)
      i++
    }
  }
  
  return result
}

