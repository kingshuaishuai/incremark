/**
 * @incremark/shared
 *
 * Vue 和 React 共享的工具函数和类型定义
 */

// 类型定义
export type { TextNodeWithChunks, TextChunk } from './types'

// HTML 处理
export { extractTagName, isHtmlNode, isHtmlWrapperNode, processHtmlNodes, type HtmlTagInfo, type HtmlWrapperNode } from './html'

// 文本处理
export { hasChunks, getStableText } from './text'

// 环境检测
export { isBrowser, isServer, isClipboardAvailable } from './env'

// ID 生成
export { generateParserId } from './id'

// 国际化
export { en, zhCN } from './locales'
export type { IncremarkLocale } from './locales/types'

// 格式化工具
export { formatDuration, formatFileSize } from './format'

// BEM 命名工具
export { createBem, createImBem } from './bem'
