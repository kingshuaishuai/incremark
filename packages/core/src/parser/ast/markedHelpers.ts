/**
 * Marked Token 到 MDAST 节点转换助手
 *
 * 将 marked 解析产生的 Token 转换为标准的 mdast 节点
 * 严格遵循 marked 类型定义和 mdast 规范
 *
 * 支持通过 TransformContext 扩展自定义 token 类型的转换
 */

import { Lexer, type Token, type Tokens } from 'marked'
import type {
  RootContent,
  PhrasingContent,
  Heading,
  Paragraph,
  Code,
  Blockquote,
  List,
  ListItem,
  Table,
  TableRow,
  TableCell,
  ThematicBreak,
  HTML,
  Text,
  Link,
  Image,
  Strong,
  Emphasis,
  InlineCode,
  Break,
  Delete,
  FootnoteReference,
  FootnoteDefinition,
  Definition,
  ImageReference,
  LinkReference
} from 'mdast'
// 从 mdast 插件导入扩展类型
import type { Math, InlineMath } from 'mdast-util-math'
import type { ContainerDirective } from 'mdast-util-directive'
import type {
  ContainerToken,
  FootnoteDefToken,
  OptimisticRefToken,
  ExplicitDefinitionToken,
  BlockMathToken,
  InlineMathToken,
  FootnoteDefinitionBlockToken,
  ExtendedToken,
  InlineHtmlToken
} from '../../extensions/marked-extensions'
import { parseHtmlFragment, type HtmlElementNode } from '../../extensions/html-extension'

// ============ 类型定义 ============

/**
 * 扩展的 ListItem，包含 spread 属性
 */
interface ExtendedListItem extends ListItem {
  spread?: boolean
}

/**
 * 块级 Token 转换函数类型
 *
 * 用于自定义扩展的 token 转换
 */
export type BlockTokenTransformer = (
  token: ExtendedToken,
  ctx: TransformContext
) => RootContent | null | undefined

/**
 * 行内 Token 转换函数类型
 *
 * 用于自定义扩展的 token 转换
 */
export type InlineTokenTransformer = (
  token: ExtendedToken,
  ctx: TransformContext
) => PhrasingContent | PhrasingContent[] | null | undefined

// ============ 转换上下文 ============

/**
 * 转换上下文，用于递归转换时传递信息
 *
 * 支持通过 customBlockTransformers 和 customInlineTransformers 扩展自定义类型
 */
export interface TransformContext {
  /**
   * 转换块级 tokens（递归）
   */
  transformTokens: (tokens: Tokens.Generic[] | undefined) => RootContent[]

  /**
   * 转换带位置信息的 tokens
   */
  transformTokensWithPosition: (tokens: Tokens.Generic[] | undefined) => RootContent[]

  /**
   * 转换行内 tokens
   */
  transformInline: (tokens: Token[] | undefined) => PhrasingContent[]

  /**
   * 解析脚注内容为 AST 节点
   */
  parseFootnoteContent: (content: string) => RootContent[]

  /**
   * 自定义块级 token 转换器映射
   *
   * key 为 token.type，value 为转换函数
   * 优先于内置转换器执行
   *
   * @example
   * ```ts
   * customBlockTransformers: {
   *   myCustomBlock: (token, ctx) => ({
   *     type: 'myCustomNode',
   *     data: token.data
   *   })
   * }
   * ```
   */
  customBlockTransformers?: Record<string, BlockTokenTransformer>

  /**
   * 自定义行内 token 转换器映射
   *
   * key 为 token.type，value 为转换函数
   * 优先于内置转换器执行
   */
  customInlineTransformers?: Record<string, InlineTokenTransformer>
}

// ============ 块级转换 ============

/**
 * 转换块级数学公式
 *
 * 生成 mdast-util-math 兼容的 Math 节点
 */
export function transformBlockMath(token: BlockMathToken): Math {
  return {
    type: 'math',
    value: token.text,
    meta: null
  }
}

/**
 * 转换脚注定义块
 */
export function transformFootnoteDefinitionBlock(
  token: FootnoteDefinitionBlockToken,
  ctx: TransformContext
): FootnoteDefinition {
  // 类型断言说明：parseFootnoteContent 返回 RootContent[]
  // 而 FootnoteDefinition['children'] 要求 (BlockContent | DefinitionContent)[]
  // 实际上脚注内容解析后确实是块级内容，类型安全
  const children = ctx.parseFootnoteContent(token.content) as FootnoteDefinition['children']
  return {
    type: 'footnoteDefinition',
    identifier: token.identifier,
    label: token.identifier,
    children
  }
}

/**
 * 转换显式定义
 */
export function transformExplicitDefinition(token: ExplicitDefinitionToken): Definition | null {
  if (!token.identifier || !token.url) return null
  return {
    type: 'definition',
    identifier: token.identifier,
    label: token.identifier,
    url: token.url,
    title: token.title ?? null
  }
}

/**
 * 转换 marked 原生的 def token
 */
export function transformDef(token: Tokens.Def): Definition | FootnoteDefinition {
  // 检查是否是脚注定义 [^id]: content
  if (token.tag.startsWith('^')) {
    const footnoteId = token.tag.slice(1)
    return {
      type: 'footnoteDefinition',
      identifier: footnoteId,
      label: footnoteId,
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: token.href }]
        }
      ]
    }
  }
  return {
    type: 'definition',
    identifier: token.tag,
    label: token.tag,
    url: token.href,
    title: token.title ?? null
  }
}

/**
 * 转换容器指令
 *
 * 生成 mdast-util-directive 兼容的 ContainerDirective 节点
 */
export function transformContainer(
  token: ContainerToken,
  ctx: TransformContext
): ContainerDirective {
  const attributes: Record<string, string> = {}
  const attrRegex = /([a-zA-Z0-9_-]+)=?("([^"]*)"|'([^']*)'|([^ ]*))?/g
  let match
  while ((match = attrRegex.exec(token.attrs)) !== null) {
    attributes[match[1]] = match[3] || match[4] || match[5] || ''
  }
  // 类型断言说明：transformTokensWithPosition 返回 RootContent[]
  // 而 ContainerDirective['children'] 要求 (BlockContent | DefinitionContent)[]
  // 实际上容器内容确实是块级内容，类型安全
  const children = ctx.transformTokensWithPosition(token.tokens) as ContainerDirective['children']
  return {
    type: 'containerDirective',
    name: token.name,
    attributes,
    children
  }
}

/**
 * 转换脚注定义（预处理阶段生成的）
 */
export function transformFootnoteDefToken(
  token: FootnoteDefToken,
  ctx: TransformContext
): FootnoteDefinition {
  return {
    type: 'footnoteDefinition',
    identifier: token.identifier,
    label: token.identifier,
    children: [
      {
        type: 'paragraph',
        children: ctx.transformInline(token.tokens)
      }
    ]
  }
}

/**
 * 转换标题
 */
export function transformHeading(token: Tokens.Heading, ctx: TransformContext): Heading {
  return {
    type: 'heading',
    depth: token.depth as 1 | 2 | 3 | 4 | 5 | 6,
    children: ctx.transformInline(token.tokens)
  }
}

/**
 * 转换段落
 */
export function transformParagraph(token: Tokens.Paragraph, ctx: TransformContext): Paragraph {
  return {
    type: 'paragraph',
    children: ctx.transformInline(token.tokens)
  }
}

/**
 * 转换代码块
 */
export function transformCode(token: Tokens.Code): Code {
  return {
    type: 'code',
    lang: token.lang || null,
    meta: null, // 对齐 micromark 输出
    value: token.text
  }
}

/**
 * 转换引用块
 */
export function transformBlockquote(
  token: Tokens.Blockquote,
  ctx: TransformContext
): Blockquote {
  // 类型断言说明：
  // 1. token.tokens 是 Token[]，需转为 Tokens.Generic[]（marked 内部类型差异）
  // 2. transformTokens 返回 RootContent[]，而 Blockquote['children'] 要求 (BlockContent | DefinitionContent)[]
  // 实际上引用块内容确实是块级内容，类型安全
  const children = ctx.transformTokens(token.tokens as Tokens.Generic[]) as Blockquote['children']
  return {
    type: 'blockquote',
    children
  }
}

/**
 * 转换列表
 */
export function transformList(token: Tokens.List, ctx: TransformContext): List {
  // 类型断言说明：
  // 1. item.tokens 是 Token[]，需转为 Tokens.Generic[]（marked 内部类型差异）
  // 2. transformTokens 返回 RootContent[]，而 ListItem['children'] 要求 (BlockContent | DefinitionContent)[]
  // 实际上列表项内容确实是块级内容，类型安全
  const children: ListItem[] = token.items.map((item) => ({
    type: 'listItem' as const,
    spread: item.loose,
    checked: item.checked ?? null, // 对齐 micromark 输出（GFM 任务列表）
    children: ctx.transformTokens(item.tokens as Tokens.Generic[]) as ListItem['children']
  }))
  return {
    type: 'list',
    ordered: token.ordered,
    start: token.ordered ? (token.start || 1) : null, // 对齐 micromark：有序列表有 start，无序列表为 null
    spread: token.loose,
    children
  }
}

/**
 * 转换表格
 */
export function transformTable(token: Tokens.Table, ctx: TransformContext): Table {
  const headerCells: TableCell[] = token.header.map((cell) => ({
    type: 'tableCell',
    children: ctx.transformInline(cell.tokens)
  }))

  const bodyRows: TableRow[] = token.rows.map((row) => ({
    type: 'tableRow',
    children: row.map((cell) => ({
      type: 'tableCell',
      children: ctx.transformInline(cell.tokens)
    }))
  }))

  return {
    type: 'table',
    align: token.align as ('left' | 'right' | 'center' | null)[] | undefined,
    children: [{ type: 'tableRow', children: headerCells }, ...bodyRows]
  }
}

/**
 * 转换分隔线
 */
export function transformHr(): ThematicBreak {
  return { type: 'thematicBreak' }
}

/**
 * 转换 HTML
 */
export function transformHtml(token: Tokens.HTML): HTML {
  return {
    type: 'html',
    value: token.text
  }
}

/**
 * 转换文本块（顶级）
 */
export function transformTextBlock(token: Tokens.Text, ctx: TransformContext): Paragraph {
  if (token.tokens) {
    return {
      type: 'paragraph',
      children: ctx.transformInline(token.tokens)
    }
  }
  return {
    type: 'paragraph',
    children: [{ type: 'text', value: token.text }]
  }
}

// ============ 行内转换 ============

/**
 * 转换行内数学公式
 *
 * 生成 mdast-util-math 兼容的 InlineMath 节点
 */
export function transformInlineMath(token: InlineMathToken): InlineMath {
  return {
    type: 'inlineMath',
    value: token.text
  }
}

/**
 * 转换乐观引用
 *
 * 对于 linkReference，需要递归解析内层内容（如嵌套的 imageReference）
 * 使用 parseNestedReference 来正确处理 [![alt][img]][link] 这样的嵌套引用
 *
 * 特殊情况：当外层是 shortcut 引用但内层是内联链接时（如 [[text](url)]），
 * 应该拆解为 text '[' + link + text ']'，与 micromark 行为一致
 */
export function transformOptimisticReference(
  token: OptimisticRefToken,
  ctx: TransformContext
): ImageReference | LinkReference | PhrasingContent[] {
  if (token.isImage) {
    return {
      type: 'imageReference',
      identifier: token.identifier,
      label: token.label,
      referenceType: token.referenceType,
      alt: token.text
    }
  }

  // 对于 linkReference，需要解析内层内容
  // 检查内层是否是引用式图片 ![...][...]
  const imageRefMatch = token.text.match(/^!\[((?:\[[^\]]*\]|[^\[\]])*)\]\[([^\]]*)\]$/)
  if (imageRefMatch) {
    // 内层是引用式图片，直接构造 imageReference
    const altText = imageRefMatch[1]
    const imageIdentifier = imageRefMatch[2] || altText
    const imageRefType = imageRefMatch[2] === '' ? 'collapsed' : (imageRefMatch[2] ? 'full' : 'shortcut')

    return {
      type: 'linkReference',
      identifier: token.identifier,
      label: token.label,
      referenceType: token.referenceType,
      children: [{
        type: 'imageReference',
        identifier: imageIdentifier.toLowerCase(),
        label: imageIdentifier,
        referenceType: imageRefType as 'shortcut' | 'collapsed' | 'full',
        alt: altText
      }]
    }
  }

  // 检查内层是否是内联链接 [text](url) 或内联图片 ![alt](url)
  // 对于 shortcut 引用（没有 [ref] 部分），如果内层是完整的内联链接/图片，
  // 说明这不是真正的引用，应该拆解为 '[' + link/image + ']'
  if (token.referenceType === 'shortcut') {
    const inlineLinkMatch = token.text.match(/^\[((?:\[[^\]]*\]|[^\[\]])*)\]\(([^)]*)\)$/)
    const inlineImageMatch = token.text.match(/^!\[((?:\[[^\]]*\]|[^\[\]])*)\]\(([^)]*)\)$/)

    if (inlineLinkMatch || inlineImageMatch) {
      // 内层是内联链接或图片，拆解为 '[' + 解析后的内容 + ']'
      const innerChildren = ctx.transformInline(new Lexer().inlineTokens(token.text))
      return [
        { type: 'text', value: '[' },
        ...innerChildren,
        { type: 'text', value: ']' }
      ]
    }
  }

  // 其他情况：用普通 Lexer 解析（处理粗体、斜体等）
  const labelChildren = ctx.transformInline(new Lexer().inlineTokens(token.text))
  return {
    type: 'linkReference',
    identifier: token.identifier,
    label: token.label,
    referenceType: token.referenceType,
    children: labelChildren.length ? labelChildren : [{ type: 'text', value: token.text }]
  }
}

/**
 * 转换链接
 */
export function transformLink(token: Tokens.Link, ctx: TransformContext): FootnoteReference | Link {
  // 检查是否是脚注引用：text 以 ^ 开头（如 [^1]）
  if (token.text.startsWith('^') && token.text.length > 1) {
    const footnoteId = token.text.slice(1)
    return {
      type: 'footnoteReference',
      identifier: footnoteId,
      label: footnoteId
    }
  }
  return {
    type: 'link',
    url: token.href,
    title: token.title || null, // 对齐 micromark 输出
    children: ctx.transformInline(token.tokens)
  }
}

/**
 * 转换图片
 */
export function transformImage(token: Tokens.Image): Image {
  return {
    type: 'image',
    url: token.href,
    title: token.title || null, // 对齐 micromark 输出
    alt: token.text
  }
}

/**
 * 转换文本（包含脚注引用提取）
 */
export function transformText(token: Tokens.Text | Tokens.Escape): (Text | FootnoteReference)[] {
  const results: (Text | FootnoteReference)[] = []
  const text = token.text
  const footnoteRegex = /\[\^([a-zA-Z0-9_-]+)\]/g
  let lastIndex = 0
  let match

  while ((match = footnoteRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      results.push({
        type: 'text',
        value: text.substring(lastIndex, match.index)
      })
    }
    results.push({
      type: 'footnoteReference',
      identifier: match[1],
      label: match[1]
    })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    results.push({
      type: 'text',
      value: text.substring(lastIndex)
    })
  }

  return results
}

/**
 * 转换加粗
 */
export function transformStrong(token: Tokens.Strong, ctx: TransformContext): Strong {
  return {
    type: 'strong',
    children: ctx.transformInline(token.tokens)
  }
}

/**
 * 转换斜体
 */
export function transformEmphasis(token: Tokens.Em, ctx: TransformContext): Emphasis {
  return {
    type: 'emphasis',
    children: ctx.transformInline(token.tokens)
  }
}

/**
 * 转换行内代码
 */
export function transformCodespan(token: Tokens.Codespan): InlineCode {
  return {
    type: 'inlineCode',
    value: token.text
  }
}

/**
 * 转换换行
 */
export function transformBreak(): Break {
  return { type: 'break' }
}

/**
 * 转换删除线
 */
export function transformDelete(token: Tokens.Del, ctx: TransformContext): Delete {
  return {
    type: 'delete',
    children: ctx.transformInline(token.tokens)
  }
}

/**
 * 转换内联 HTML
 *
 * 将内联 HTML token 转换为 HtmlElementNode 节点
 * 如果解析失败，回退为普通文本节点
 */
export function transformInlineHtml(
  token: InlineHtmlToken
): PhrasingContent | PhrasingContent[] {
  // 使用 html-extension 的解析器
  const parsed = parseHtmlFragment(token.text)

  if (parsed.length > 0) {
    // 成功解析为 HtmlElementNode
    return parsed as unknown as PhrasingContent[]
  }

  // 解析失败，回退为文本节点
  return { type: 'text', value: token.text }
}

// ============ 主转换函数 ============

// ============ 类型守卫 ============

/**
 * 检查 token 是否为指定类型
 * 通过 type 字段判断，避免 as unknown as 的类型断言
 */
function isTokenType<T extends ExtendedToken>(
  token: ExtendedToken,
  type: T['type']
): token is T {
  return token.type === type
}

/**
 * 内置块级转换器映射
 *
 * 注意：由于 TypeScript 的类型系统限制，在回调中需要使用类型断言
 * 这是因为 Record 的 value 类型是统一的 BlockTokenTransformer
 * 而每个具体的转换函数需要特定的 token 类型
 */
const builtinBlockTransformers: Record<string, BlockTokenTransformer> = {
  blockMath: (token) => {
    if (isTokenType<BlockMathToken>(token, 'blockMath')) return transformBlockMath(token)
    return null
  },
  footnoteDefinitionBlock: (token, ctx) => {
    if (isTokenType<FootnoteDefinitionBlockToken>(token, 'footnoteDefinitionBlock'))
      return transformFootnoteDefinitionBlock(token, ctx)
    return null
  },
  explicitDefinition: (token) => {
    if (isTokenType<ExplicitDefinitionToken>(token, 'explicitDefinition'))
      return transformExplicitDefinition(token)
    return null
  },
  def: (token) => {
    if (isTokenType<Tokens.Def>(token, 'def')) return transformDef(token)
    return null
  },
  container: (token, ctx) => {
    if (isTokenType<ContainerToken>(token, 'container')) return transformContainer(token, ctx)
    return null
  },
  footnoteDefinition: (token, ctx) => {
    if (isTokenType<FootnoteDefToken>(token, 'footnoteDefinition'))
      return transformFootnoteDefToken(token, ctx)
    return null
  },
  heading: (token, ctx) => {
    if (isTokenType<Tokens.Heading>(token, 'heading')) return transformHeading(token, ctx)
    return null
  },
  paragraph: (token, ctx) => {
    if (isTokenType<Tokens.Paragraph>(token, 'paragraph')) return transformParagraph(token, ctx)
    return null
  },
  code: (token) => {
    if (isTokenType<Tokens.Code>(token, 'code')) return transformCode(token)
    return null
  },
  blockquote: (token, ctx) => {
    if (isTokenType<Tokens.Blockquote>(token, 'blockquote')) return transformBlockquote(token, ctx)
    return null
  },
  list: (token, ctx) => {
    if (isTokenType<Tokens.List>(token, 'list')) return transformList(token, ctx)
    return null
  },
  table: (token, ctx) => {
    if (isTokenType<Tokens.Table>(token, 'table')) return transformTable(token, ctx)
    return null
  },
  hr: () => transformHr(),
  html: (token) => {
    if (isTokenType<Tokens.HTML>(token, 'html')) return transformHtml(token)
    return null
  },
  space: () => null,
  text: (token, ctx) => {
    if (isTokenType<Tokens.Text>(token, 'text')) return transformTextBlock(token, ctx)
    return null
  }
}

/**
 * 内置行内转换器映射
 */
const builtinInlineTransformers: Record<string, InlineTokenTransformer> = {
  inlineMath: (token) => {
    if (isTokenType<InlineMathToken>(token, 'inlineMath')) return transformInlineMath(token)
    return null
  },
  optimisticReference: (token, ctx) => {
    if (isTokenType<OptimisticRefToken>(token, 'optimisticReference'))
      return transformOptimisticReference(token, ctx)
    return null
  },
  link: (token, ctx) => {
    if (isTokenType<Tokens.Link>(token, 'link')) return transformLink(token, ctx)
    return null
  },
  image: (token) => {
    if (isTokenType<Tokens.Image>(token, 'image')) return transformImage(token)
    return null
  },
  text: (token) => {
    if (isTokenType<Tokens.Text>(token, 'text')) return transformText(token)
    return null
  },
  escape: (token) => {
    if (isTokenType<Tokens.Escape>(token, 'escape')) return transformText(token)
    return null
  },
  strong: (token, ctx) => {
    if (isTokenType<Tokens.Strong>(token, 'strong')) return transformStrong(token, ctx)
    return null
  },
  em: (token, ctx) => {
    if (isTokenType<Tokens.Em>(token, 'em')) return transformEmphasis(token, ctx)
    return null
  },
  codespan: (token) => {
    if (isTokenType<Tokens.Codespan>(token, 'codespan')) return transformCodespan(token)
    return null
  },
  br: () => transformBreak(),
  del: (token, ctx) => {
    if (isTokenType<Tokens.Del>(token, 'del')) return transformDelete(token, ctx)
    return null
  },
  inlineHtml: (token) => {
    if (isTokenType<InlineHtmlToken>(token, 'inlineHtml')) return transformInlineHtml(token)
    return null
  }
}

/**
 * 转换单个块级 Token 为 MDAST 节点
 *
 * 转换优先级：
 * 1. 自定义转换器（customBlockTransformers）
 * 2. 内置转换器
 * 3. 回退处理（带 text 属性的 token 转为段落）
 *
 * @param token 要转换的 token
 * @param ctx 转换上下文
 * @returns MDAST 节点或 null
 */
export function transformBlockToken(token: ExtendedToken, ctx: TransformContext): RootContent | null {
  const tokenType = token.type

  // 1. 优先使用自定义转换器
  if (ctx.customBlockTransformers?.[tokenType]) {
    const result = ctx.customBlockTransformers[tokenType](token, ctx)
    if (result !== undefined) return result
  }

  // 2. 使用内置转换器
  if (builtinBlockTransformers[tokenType]) {
    const result = builtinBlockTransformers[tokenType](token, ctx)
    if (result !== undefined) return result
  }

  // 3. 回退处理：带 text 属性的 token 转为段落
  if ('text' in token && typeof token.text === 'string') {
    const paragraph: Paragraph = {
      type: 'paragraph',
      children: [{ type: 'text', value: token.text }]
    }
    return paragraph
  }

  return null
}

/**
 * 转换单个行内 Token 为 MDAST 节点
 *
 * 转换优先级：
 * 1. 自定义转换器（customInlineTransformers）
 * 2. 内置转换器
 * 3. 回退处理（带 text 属性的 token 转为文本节点）
 *
 * @param token 要转换的 token
 * @param ctx 转换上下文
 * @returns MDAST 节点或 null
 */
export function transformInlineToken(
  token: ExtendedToken,
  ctx: TransformContext
): PhrasingContent | PhrasingContent[] | null {
  const tokenType = token.type

  // 1. 优先使用自定义转换器
  if (ctx.customInlineTransformers?.[tokenType]) {
    const result = ctx.customInlineTransformers[tokenType](token, ctx)
    if (result !== undefined) return result
  }

  // 2. 使用内置转换器
  if (builtinInlineTransformers[tokenType]) {
    const result = builtinInlineTransformers[tokenType](token, ctx)
    if (result !== undefined) return result
  }

  // 3. 回退处理：带 text 属性的 token 转为文本节点
  if ('text' in token && typeof token.text === 'string') {
    const text: Text = { type: 'text', value: token.text }
    return text
  }

  return null
}

/**
 * 获取内置块级转换器（用于扩展或覆盖）
 */
export function getBuiltinBlockTransformers(): Readonly<Record<string, BlockTokenTransformer>> {
  return builtinBlockTransformers
}

/**
 * 获取内置行内转换器（用于扩展或覆盖）
 */
export function getBuiltinInlineTransformers(): Readonly<Record<string, InlineTokenTransformer>> {
  return builtinInlineTransformers
}
