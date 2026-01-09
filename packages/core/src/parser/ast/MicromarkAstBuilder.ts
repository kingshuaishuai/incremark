/**
 * Micromark AST 构建器（稳定模式）
 *
 * 基于 micromark + mdast-util-from-markdown
 * 特点：
 * - 更稳定可靠
 * - 支持 div 内嵌 markdown
 * - 丰富的扩展生态
 */

import { fromMarkdown } from 'mdast-util-from-markdown'
import { gfmFromMarkdown } from 'mdast-util-gfm'
import { gfm } from 'micromark-extension-gfm'
import { gfmFootnoteFromMarkdown } from 'mdast-util-gfm-footnote'
import { mathFromMarkdown } from 'mdast-util-math'
import { directive } from 'micromark-extension-directive'
import { directiveFromMarkdown } from 'mdast-util-directive'
import type { Extension as MicromarkExtension } from 'micromark-util-types'
import type { Extension as MdastExtension } from 'mdast-util-from-markdown'
import type { Root, RootContent, HTML, Text, Paragraph, Parent as MdastParent } from 'mdast'

import type { ParsedBlock, BlockStatus, ContainerConfig, MathOptions } from '../../types'
import { math } from '../../extensions/micromark-extension-math'
import { transformHtmlNodes, type HtmlTreeExtensionOptions } from '../../extensions/html-extension'
import { micromarkReferenceExtension } from '../../extensions/micromark-reference-extension'
import { gfmFootnoteIncremental } from '../../extensions/micromark-gfm-footnote-incremental'
import type { IAstBuilder, EngineParserOptions } from './types'
import { extractMicromarkExtensions } from './types'

/**
 * 内联容器节点类型
 * 这些节点的 children 包含内联内容（文本、emphasis、strong 等）
 */
const INLINE_CONTAINER_TYPES = [
  'paragraph',
  'heading',
  'tableCell',
  'delete',
  'emphasis',
  'strong',
  'link',
  'linkReference'
] as const

/**
 * 判断是否为内联容器节点
 */
function isInlineContainer(node: RootContent): boolean {
  return INLINE_CONTAINER_TYPES.includes(node.type as any)
}

/**
 * Micromark AST 构建器
 *
 * 使用 micromark + mdast-util-from-markdown 解析 Markdown
 * 适用于需要稳定性和高级特性的场景
 */
export class MicromarkAstBuilder implements IAstBuilder {
  private readonly options: EngineParserOptions
  readonly containerConfig: ContainerConfig | undefined
  private readonly htmlTreeConfig: HtmlTreeExtensionOptions | undefined
  /** 缓存的扩展实例，避免每次 parse 都重新创建 */
  private readonly cachedExtensions: MicromarkExtension[] = []
  private readonly cachedMdastExtensions: MdastExtension[] = []

  constructor(options: EngineParserOptions = {}) {
    this.options = options
    this.containerConfig = this.computeContainerConfig(options)
    this.htmlTreeConfig = this.computeHtmlTreeConfig(options)
    // 初始化扩展实例
    this.initExtensions()
  }

  /**
   * 初始化并缓存扩展实例
   */
  private initExtensions(): void {
    // 先添加 GFM（包含原始的脚注扩展）
    if (this.options.gfm) {
      this.cachedExtensions.push(gfm())
      this.cachedMdastExtensions.push(...gfmFromMarkdown(), gfmFootnoteFromMarkdown())
    }

    // 如果启用了数学公式支持，添加 math 扩展
    if (this.options.math) {
      // 解析 math 配置
      const mathOptions: MathOptions = typeof this.options.math === 'object'
        ? this.options.math
        : {}

      this.cachedExtensions.push(math({
        singleDollarTextMath: true,
        tex: mathOptions.tex ?? false,
      }))
      this.cachedMdastExtensions.push(mathFromMarkdown())
    }

    // 如果启用了容器支持，自动添加 directive 扩展
    if (this.containerConfig !== undefined) {
      this.cachedExtensions.push(directive())
      this.cachedMdastExtensions.push(directiveFromMarkdown())
    }

    // 处理统一插件
    if (this.options.plugins) {
      const { extensions, mdastExtensions } = extractMicromarkExtensions(this.options.plugins)
      this.cachedExtensions.push(...extensions)
      this.cachedMdastExtensions.push(...mdastExtensions)
    }

    // 如果用户传入了自定义扩展（旧 API），添加它们
    if (this.options.extensions) {
      this.cachedExtensions.push(...this.options.extensions)
    }
    if (this.options.mdastExtensions) {
      this.cachedMdastExtensions.push(...this.options.mdastExtensions)
    }

    // 添加增量脚注扩展，覆盖 GFM 脚注的定义检查
    // ⚠️ 必须在 micromarkReferenceExtension 之前添加
    if (this.options.gfm) {
      this.cachedExtensions.push(gfmFootnoteIncremental())
    }

    // 添加 reference 扩展（支持增量解析），覆盖 commonmark 的 labelEnd
    // ⚠️ 必须最后添加，确保它能拦截 `]` 并正确处理脚注
    this.cachedExtensions.push(micromarkReferenceExtension())
  }

  /**
   * 计算容器配置
   */
  private computeContainerConfig(options: EngineParserOptions): ContainerConfig | undefined {
    const containers = options.containers
    if (!containers) return undefined
    return containers === true ? {} : containers
  }

  /**
   * 计算 HTML 树配置
   */
  private computeHtmlTreeConfig(options: EngineParserOptions): HtmlTreeExtensionOptions | undefined {
    const htmlTree = options.htmlTree
    if (!htmlTree) return undefined
    return htmlTree === true ? {} : htmlTree
  }

  /**
   * 解析文本为 AST
   *
   * @param text Markdown 文本
   * @returns AST
   */
  parse(text: string): Root {
    // 直接使用缓存的扩展实例，避免每次都重新创建
    const ast = fromMarkdown(text, {
      extensions: this.cachedExtensions,
      mdastExtensions: this.cachedMdastExtensions
    })

    // 如果启用了 HTML 树转换，应用转换
    if (this.htmlTreeConfig) {
      return transformHtmlNodes(ast, this.htmlTreeConfig)
    } else {
      // 如果未启用 HTML 树，将 HTML 节点转换为纯文本
      return this.convertHtmlToText(ast)
    }
  }

  /**
   * 将 HTML 节点转换为纯文本（当未启用 HTML 树转换时）
   *
   * @param ast AST
   * @returns 转换后的 AST
   */
  private convertHtmlToText(ast: Root): Root {
    return {
      ...ast,
      children: this.processBlockChildren(ast.children)
    }
  }

  /**
   * 处理块级节点
   */
  private processBlockChildren(children: RootContent[]): RootContent[] {
    return children.map((node) => {
      // 块级 html 节点转换为段落包含纯文本
      if (node.type === 'html') {
        return this.convertBlockHtmlToParagraph(node as HTML)
      }

      // 递归处理有 children 的节点
      if ('children' in node && Array.isArray(node.children)) {
        const parent = node as MdastParent
        const children = isInlineContainer(node)
          ? this.processInlineChildren(parent.children)
          : this.processBlockChildren(parent.children as RootContent[])

        return {
          ...parent,
          children
        } as RootContent
      }

      return node
    })
  }

  /**
   * 处理内联节点
   */
  private processInlineChildren(children: unknown[]): unknown[] {
    return children.map((node) => {
      const n = node as RootContent

      // 内联 html 节点转换为纯文本节点
      if (n.type === 'html') {
        return this.convertInlineHtmlToText(n as HTML)
      }

      // 递归处理有 children 的内联节点
      if ('children' in n && Array.isArray(n.children)) {
        const parent = n as MdastParent
        return {
          ...parent,
          children: this.processInlineChildren(parent.children)
        }
      }

      return n
    })
  }

  /**
   * 将块级 HTML 节点转换为段落
   */
  private convertBlockHtmlToParagraph(htmlNode: HTML): RootContent {
    const textNode: Text = {
      type: 'text',
      value: htmlNode.value
    }

    const paragraphNode: Paragraph = {
      type: 'paragraph',
      children: [textNode],
      position: htmlNode.position
    }

    return paragraphNode as RootContent
  }

  /**
   * 将内联 HTML 节点转换为纯文本节点
   */
  private convertInlineHtmlToText(htmlNode: HTML): Text {
    return {
      type: 'text',
      value: htmlNode.value,
      position: htmlNode.position
    }
  }

  /**
   * 将 AST 节点转换为 ParsedBlock
   *
   * @param nodes AST 节点列表
   * @param startOffset 起始偏移量
   * @param rawText 原始文本
   * @param status 块状态
   * @param generateBlockId 生成块 ID 的函数（接收 startOffset 参数）
   * @returns ParsedBlock 列表
   */
  nodesToBlocks(
    nodes: RootContent[],
    startOffset: number,
    rawText: string,
    status: BlockStatus,
    generateBlockId: (startOffset: number) => string
  ): ParsedBlock[] {
    const blocks: ParsedBlock[] = []

    for (const node of nodes) {
      // micromark 的 position.offset 是相对于传入文本的（从 0 开始）
      const relativeStart = node.position?.start?.offset ?? 0
      const relativeEnd = node.position?.end?.offset ?? 1

      // 使用相对位置截取文本（直接用 relativeStart/End，因为 rawText 也是相对的）
      const nodeText = rawText.substring(relativeStart, relativeEnd)

      // 计算绝对位置（用于光标同步等场景）
      const absoluteStart = startOffset + relativeStart
      const absoluteEnd = startOffset + relativeEnd

      blocks.push({
        id: generateBlockId(absoluteStart),
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
   *
   * 注意：由于 micromark 的扩展是在 constructor 中缓存的，
   * 更新配置需要重新初始化扩展。
   *
   * @param options 部分配置选项
   */
  updateOptions(options: Partial<EngineParserOptions>): void {
    // 合并选项
    Object.assign(this.options, options)

    // 更新容器配置
    if ('containers' in options) {
      ;(this as any).containerConfig = this.computeContainerConfig(this.options)
    }

    // 更新 HTML Tree 配置
    if ('htmlTree' in options) {
      ;(this as any).htmlTreeConfig = this.computeHtmlTreeConfig(this.options)
    }

    // 重新初始化扩展（因为扩展是缓存的）
    this.cachedExtensions.length = 0
    this.cachedMdastExtensions.length = 0
    this.initExtensions()
  }
}
