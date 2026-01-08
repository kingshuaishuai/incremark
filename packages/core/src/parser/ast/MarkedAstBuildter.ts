/**
 * Marked AST 构建器（极速模式）
 *
 * 基于 marked 解析器
 * 特点：
 * - 速度更快
 * - 适合流式渲染场景
 *
 */

import { lexer, Lexer, type Tokens, type Token, type MarkedExtension } from 'marked'
import type {
  Root,
  RootContent,
  PhrasingContent
} from 'mdast'
import type { ParsedBlock, BlockStatus, ContainerConfig } from '../../types'
import { transformHtmlNodes, type HtmlTreeExtensionOptions } from '../../extensions/html-extension'
import type { IAstBuilder, EngineParserOptions } from './types'
import { extractMarkedExtensions } from './types'

// 导入扩展
import {
  createExplicitDefinitionExtension,
  createOptimisticReferenceExtension,
  createBlockMathExtension,
  createInlineMathExtension,
  createFootnoteDefinitionExtension,
  createInlineHtmlExtension,
  type ContainerToken,
  type FootnoteDefToken
} from '../../extensions/marked-extensions'

// 导入转换助手
import {
  transformBlockToken,
  transformInlineToken,
  type TransformContext
} from './markedHelpers'

// ============ 类型定义 ============
type LinkDefinitions = Record<string, { href: string; title?: string }>

/**
 * Marked AST 构建器
 *
 * 使用 marked 解析 Markdown，速度更快
 * 适用于流式渲染和高性能场景
 */
export class MarkedAstBuilder implements IAstBuilder {
  readonly containerConfig: ContainerConfig | undefined
  readonly htmlTreeOptions: HtmlTreeExtensionOptions | undefined
  private globalLinks: LinkDefinitions = {}
  /** 用户传入的 marked 扩展 */
  private readonly userExtensions: MarkedExtension[] = []
  /** 转换上下文（用于递归转换） */
  private readonly transformContext: TransformContext

  constructor(private options: EngineParserOptions = {}) {
    this.containerConfig = typeof options.containers === 'object'
      ? options.containers
      : (options.containers === true ? {} : undefined)

    this.htmlTreeOptions = typeof options.htmlTree === 'object'
      ? options.htmlTree
      : (options.htmlTree === true ? {} : undefined)

    // 收集用户扩展
    if (options.plugins) {
      this.userExtensions.push(...extractMarkedExtensions(options.plugins))
    }
    if (options.markedExtensions) {
      this.userExtensions.push(...options.markedExtensions)
    }

    // 初始化转换上下文
    this.transformContext = {
      transformTokens: this.transformTokens.bind(this),
      transformTokensWithPosition: this.transformTokensWithPosition.bind(this),
      transformInline: this.transformInline.bind(this),
      parseFootnoteContent: this.parseFootnoteContent.bind(this)
    }
  }

  parse(text: string): Root {
    // 1. 文本清洗：这是解决 URL 截断的第一道防线
    const normalizedText = text.replace(/[\u00A0\u200b\u202f]/g, ' ')

    // 2. 构造 Extensions
    const optimisticRefExt = createOptimisticReferenceExtension()
    const explicitDefExt = createExplicitDefinitionExtension()
    const footnoteDefExt = createFootnoteDefinitionExtension()

    // 收集用户扩展中的 block/inline tokenizers
    const userBlockExts: any[] = []
    const userBlockStartExts: any[] = []
    const userInlineExts: any[] = []
    const userInlineStartExts: any[] = []

    for (const ext of this.userExtensions) {
      if ((ext as any).level === 'block') {
        if ((ext as any).tokenizer) userBlockExts.push((ext as any).tokenizer)
        if ((ext as any).start) userBlockStartExts.push((ext as any).start)
      } else if ((ext as any).level === 'inline') {
        if ((ext as any).tokenizer) userInlineExts.push((ext as any).tokenizer)
        if ((ext as any).start) userInlineStartExts.push((ext as any).start)
      }
    }

    // 脚注定义扩展需要在 explicitDefinitionExtension 之前，确保 [^id]: 优先被脚注扩展处理
    const blockExts: any[] = [
      footnoteDefExt.tokenizer,
      explicitDefExt.tokenizer,
      ...userBlockExts
    ]
    const blockStartExts: any[] = [
      footnoteDefExt.start,
      explicitDefExt.start,
      ...userBlockStartExts
    ]
    const inlineExts: any[] = [optimisticRefExt.tokenizer, ...userInlineExts]
    const inlineStartExts: any[] = [optimisticRefExt.start, ...userInlineStartExts]

    // Math 扩展（仅当 options.math 启用时）
    if (this.options.math) {
      // 解析 math 配置
      const mathOptions = typeof this.options.math === 'object'
        ? this.options.math
        : {}

      const blockMathExt = createBlockMathExtension(mathOptions)
      const inlineMathExt = createInlineMathExtension(mathOptions)
      blockExts.unshift(blockMathExt.tokenizer)
      blockStartExts.unshift(blockMathExt.start)
      inlineExts.unshift(inlineMathExt.tokenizer)
      inlineStartExts.unshift(inlineMathExt.start)
    }

    // 内联 HTML 扩展（仅当 options.htmlTree 启用时）
    // 这使得内联 HTML 能够被识别为完整的 token，与 Micromark 行为一致
    if (this.htmlTreeOptions) {
      const inlineHtmlExt = createInlineHtmlExtension()
      inlineExts.unshift(inlineHtmlExt.tokenizer)
      inlineStartExts.unshift(inlineHtmlExt.start)
    }

    const lexerOptions: any = {
      gfm: true,
      breaks: false, // 关闭软换行转 break，与 Micromark 保持一致
      ...this.options,
      extensions: {
        inline: inlineExts,
        startInline: inlineStartExts,
        block: blockExts,
        startBlock: blockStartExts
      }
    }

    const lexerInstance = new Lexer(lexerOptions)

    // 3. 注入历史 Links
    if (lexerInstance.tokens && (lexerInstance.tokens as any).links) {
      Object.assign((lexerInstance.tokens as any).links, this.globalLinks)
    }

    // 4. 执行解析
    let tokens = lexerInstance.lex(normalizedText) as Token[]

    // 5. 保存 Links
    if (lexerInstance.tokens && (lexerInstance.tokens as any).links) {
      Object.assign(this.globalLinks, (lexerInstance.tokens as any).links)
    }

    // 6. 预处理
    tokens = this.preprocessTokens(tokens)

    // 7. 转换 AST
    let children = this.transformTokensWithPosition(tokens)

    // 8. HTML 后处理
    if (this.htmlTreeOptions) {
      children = this.processHtmlNodes(children)
    }

    return {
      type: 'root',
      children
    }
  }

  /**
   * 预处理 tokens
   *
   * 处理容器指令和遗留的脚注定义（从 paragraph 中提取）
   */
  private preprocessTokens(tokens: Token[]): Token[] {
    const result: Token[] = []
    let i = 0

    while (i < tokens.length) {
      const token = tokens[i]

      if (token.type === 'paragraph') {
        const text = (token as Tokens.Paragraph).text

        // 处理遗留的脚注定义（从 paragraph 中提取）
        const footnoteMatch = text.match(/^\[\^([a-zA-Z0-9_-]+)\]:\s+([\s\S]*)$/)
        if (footnoteMatch) {
          const defToken: FootnoteDefToken = {
            type: 'footnoteDefinition',
            identifier: footnoteMatch[1],
            text: footnoteMatch[2],
            tokens: new Lexer().inlineTokens(footnoteMatch[2]),
            raw: token.raw
          }
          result.push(defToken as unknown as Token)
          i++
          continue
        }

        // 处理容器指令
        const containerStartMatch = text.match(/^:::(\s*)([a-zA-Z0-9_-]+)(.*?)(\n|$)/)
        if (containerStartMatch) {
          const name = containerStartMatch[2]
          const attrs = containerStartMatch[3].trim()
          let rawAccumulator = ''
          let j = i
          let depth = 0
          let foundEnd = false
          let contentRaw = ''

          while (j < tokens.length) {
            const currentToken = tokens[j]
            rawAccumulator += currentToken.raw
            const lines = rawAccumulator.split('\n')
            depth = 0
            let startLineIndex = -1
            let endLineIndex = -1

            for (let k = 0; k < lines.length; k++) {
              const line = lines[k]
              if (line.match(/^:::(\s*)([a-zA-Z0-9_-]+)/)) {
                if (depth === 0 && startLineIndex === -1) startLineIndex = k
                depth++
              } else if (line.trim() === ':::') {
                depth--
                if (depth === 0) {
                  endLineIndex = k
                  foundEnd = true
                  break
                }
              }
            }

            if (foundEnd) {
              const contentLines = lines.slice(startLineIndex + 1, endLineIndex)
              contentRaw = contentLines.join('\n')
              const remainingLines = lines.slice(endLineIndex + 1)
              const remainingText = remainingLines.join('\n')

              const containerToken: ContainerToken = {
                type: 'container',
                name,
                attrs,
                tokens: this.preprocessTokens(lexer(contentRaw)),
                raw: rawAccumulator
              }
              result.push(containerToken as unknown as Token)

              if (remainingText.trim()) {
                const remainingTokens = this.preprocessTokens(lexer(remainingText))
                result.push(...remainingTokens)
              }

              i = j + 1
              break
            }
            j++
          }

          if (foundEnd) continue
        }
      }

      result.push(token)
      i++
    }

    return result
  }

  /**
   * 转换 tokens 为 MDAST 节点（带位置信息）
   */
  private transformTokensWithPosition(tokens: Tokens.Generic[] | undefined): RootContent[] {
    if (!tokens) return []

    const results: RootContent[] = []
    let currentOffset = 0

    for (const token of tokens) {
      const rawLength = token.raw?.length ?? 0
      const node = transformBlockToken(token as Token, this.transformContext)

      if (node) {
        node.position = {
          start: { line: 0, column: 0, offset: currentOffset },
          end: { line: 0, column: 0, offset: currentOffset + rawLength }
        }
        results.push(node)
      }

      currentOffset += rawLength
    }

    return results
  }

  /**
   * 转换 tokens 为 MDAST 节点（不带位置信息）
   */
  private transformTokens(tokens: Tokens.Generic[] | undefined): RootContent[] {
    if (!tokens) return []
    return tokens
      .map((t) => transformBlockToken(t as Token, this.transformContext))
      .filter(Boolean) as RootContent[]
  }

  /**
   * 转换行内 tokens
   */
  private transformInline(tokens: Token[] | undefined): PhrasingContent[] {
    if (!tokens) return []

    const results: PhrasingContent[] = []

    for (const token of tokens) {
      const result = transformInlineToken(token, this.transformContext)
      if (result) {
        if (Array.isArray(result)) {
          results.push(...result)
        } else {
          results.push(result)
        }
      }
    }

    return results
  }

  /**
   * 解析脚注内容为 AST 节点
   */
  private parseFootnoteContent(content: string): RootContent[] {
    if (!content.trim()) {
      return []
    }

    // 移除脚注延续行的前导缩进（4 空格或 1 tab）
    const normalizedContent = content
      .split('\n')
      .map((line, index) => {
        // 第一行不需要移除缩进
        if (index === 0) return line
        // 后续行移除 4 空格或 1 tab 的缩进
        if (line.startsWith('    ')) return line.slice(4)
        if (line.startsWith('\t')) return line.slice(1)
        return line
      })
      .join('\n')

    // 使用简单的 Lexer 解析内容
    const contentLexer = new Lexer({ gfm: true, breaks: true })
    const tokens = contentLexer.lex(normalizedContent)

    return this.transformTokens(tokens)
  }

  /**
   * 处理 HTML 节点
   *
   * 使用 html-extension 的 transformHtmlNodes 来处理：
   * - 合并被空行分割的 HTML 节点
   * - 将 HTML 解析为 HtmlElementNode 树结构
   */
  private processHtmlNodes(nodes: RootContent[]): RootContent[] {
    // 构造一个临时的 Root 节点，使用 transformHtmlNodes 处理
    const tempRoot: Root = {
      type: 'root',
      children: nodes as Root['children']
    }

    const transformed = transformHtmlNodes(tempRoot, this.htmlTreeOptions)
    return transformed.children as RootContent[]
  }

  /**
   * 将 AST 节点转换为 ParsedBlock
   */
  nodesToBlocks(
    nodes: RootContent[],
    startOffset: number,
    rawText: string,
    status: BlockStatus,
    generateBlockId: () => string
  ): ParsedBlock[] {
    const blocks: ParsedBlock[] = []

    for (const node of nodes) {
      const relativeStart = node.position?.start?.offset ?? 0
      const relativeEnd = node.position?.end?.offset ?? rawText.length
      const nodeText = rawText.substring(relativeStart, relativeEnd)
      const absoluteStart = startOffset + relativeStart
      const absoluteEnd = startOffset + relativeEnd

      blocks.push({
        id: generateBlockId(),
        status,
        node,
        startOffset: absoluteStart,
        endOffset: absoluteEnd,
        rawText: nodeText
      })
    }

    return blocks
  }

  /**
   * 更新配置选项
   * @param options 部分配置选项
   */
  updateOptions(options: Partial<EngineParserOptions>): void {
    // 合并选项
    Object.assign(this.options, options)

    // 更新容器配置
    if ('containers' in options) {
      ;(this as any).containerConfig = typeof options.containers === 'object'
        ? options.containers
        : (options.containers === true ? {} : undefined)
    }

    // 更新 HTML Tree 配置
    if ('htmlTree' in options) {
      ;(this as any).htmlTreeOptions = typeof options.htmlTree === 'object'
        ? options.htmlTree
        : (options.htmlTree === true ? {} : undefined)
    }

    // 更新用户扩展（如果有）
    if (options.plugins || options.markedExtensions) {
      this.userExtensions.length = 0
      if (options.plugins) {
        this.userExtensions.push(...extractMarkedExtensions(options.plugins))
      }
      if (options.markedExtensions) {
        this.userExtensions.push(...options.markedExtensions)
      }
    }
  }
}

/**
 * AstBuilder 别名（向后兼容）
 */
export const AstBuilder = MarkedAstBuilder
