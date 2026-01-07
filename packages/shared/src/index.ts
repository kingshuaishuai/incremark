/**
 * @incremark/shared
 * 
 * Vue 和 React 共享的工具函数和类型定义
 */

// 类型定义
export type { TextNodeWithChunks } from './types'

// HTML 处理
export { extractTagName, isHtmlNode, isHtmlWrapperNode, processHtmlNodes, type HtmlTagInfo, type HtmlWrapperNode } from './html'

// 文本处理
export { hasChunks, getStableText } from './text'

// 环境检测
export { isBrowser, isServer, isClipboardAvailable } from './env'

