/**
 * Marked 扩展类型定义
 *
 * 这些类型用于自定义的 marked 扩展 tokens
 */

/**
 * 容器指令 Token
 * 用于解析 ::: name ... ::: 格式的容器
 */
export interface ContainerToken {
  type: 'container'
  raw: string
  name: string
  attrs: string
  tokens: import('marked').Token[]
}

/**
 * 脚注定义 Token（预处理阶段生成）
 */
export interface FootnoteDefToken {
  type: 'footnoteDefinition'
  raw: string
  identifier: string
  text: string
  tokens: import('marked').Token[]
}

/**
 * 乐观引用 Token
 * 用于处理未定义的引用链接/图片
 */
export interface OptimisticRefToken {
  type: 'optimisticReference'
  raw: string
  isImage: boolean
  text: string
  identifier: string
  label: string
  referenceType: 'shortcut' | 'collapsed' | 'full'
}

/**
 * 显式定义 Token
 * 用于解析 [id]: url "title" 格式的定义
 */
export interface ExplicitDefinitionToken {
  type: 'explicitDefinition'
  raw: string
  identifier: string
  url: string
  title?: string
}

/**
 * 块级数学公式 Token
 * 用于解析 $$...$$ 和 \[...\] 格式
 */
export interface BlockMathToken {
  type: 'blockMath'
  raw: string
  text: string
}

/**
 * 行内数学公式 Token
 * 用于解析 $...$ 和 \(...\) 格式
 */
export interface InlineMathToken {
  type: 'inlineMath'
  raw: string
  text: string
}

/**
 * 脚注定义块 Token
 * 用于解析 [^id]: content 格式
 */
export interface FootnoteDefinitionBlockToken {
  type: 'footnoteDefinitionBlock'
  raw: string
  identifier: string
  content: string
}

/**
 * 内联 HTML Token
 * 用于解析 <tag>content</tag> 格式
 */
export interface InlineHtmlToken {
  type: 'inlineHtml'
  raw: string
  text: string
}

/**
 * 自定义扩展 Token 联合类型
 * 包含所有自定义的 marked 扩展 tokens
 */
export type CustomMarkedToken =
  | ContainerToken
  | FootnoteDefToken
  | OptimisticRefToken
  | ExplicitDefinitionToken
  | BlockMathToken
  | InlineMathToken
  | FootnoteDefinitionBlockToken
  | InlineHtmlToken

/**
 * 扩展的 Token 类型
 * 包含 marked 原生 tokens 和自定义扩展 tokens
 */
export type ExtendedToken = import('marked').Token | CustomMarkedToken

