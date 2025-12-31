/**
 * AST 构建器
 *
 * 职责：
 * - 解析 Markdown 文本为 AST
 * - 将 AST 节点转换为 ParsedBlock
 * - 转换 HTML 节点为纯文本（当未启用 HTML 树转换时）
 */

import { fromMarkdown } from 'mdast-util-from-markdown'
import { gfmFromMarkdown } from 'mdast-util-gfm'
import { gfm } from 'micromark-extension-gfm'
import { gfmFootnoteFromMarkdown } from 'mdast-util-gfm-footnote'
import { math } from 'micromark-extension-math'
import { mathFromMarkdown } from 'mdast-util-math'
import { directive } from 'micromark-extension-directive'
import { directiveFromMarkdown } from 'mdast-util-directive'
import type { Extension as MicromarkExtension } from 'micromark-util-types'
import type { Extension as MdastExtension } from 'mdast-util-from-markdown'
import type { Root, RootContent, HTML, Text, Paragraph, Parent as MdastParent } from 'mdast'

import type { ParsedBlock, BlockStatus, ParserOptions, ContainerConfig } from '../../types'
import { transformHtmlNodes, type HtmlTreeExtensionOptions } from '../../extensions/html-extension'
import { micromarkReferenceExtension } from '../../extensions/micromark-reference-extension'
import { gfmFootnoteIncremental } from '../../extensions/micromark-gfm-footnote-incremental'

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
 * AST 构建器
 */
export class AstBuilder {
  private readonly options: ParserOptions
  readonly containerConfig: ContainerConfig | undefined
  private readonly htmlTreeConfig: HtmlTreeExtensionOptions | undefined

  constructor(options: ParserOptions = {}) {
    this.options = options
    this.containerConfig = this.computeContainerConfig(options)
    this.htmlTreeConfig = this.computeHtmlTreeConfig(options)
  }

  /**
   * 计算容器配置
   */
  private computeContainerConfig(options: ParserOptions): ContainerConfig | undefined {
    const containers = options.containers
    if (!containers) return undefined
    return containers === true ? {} : containers
  }

  /**
   * 计算 HTML 树配置
   */
  private computeHtmlTreeConfig(options: ParserOptions): HtmlTreeExtensionOptions | undefined {
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
    const extensions: MicromarkExtension[] = []
    const mdastExtensions: MdastExtension[] = []

    // 先添加 GFM（包含原始的脚注扩展）
    if (this.options.gfm) {
      extensions.push(gfm())
      mdastExtensions.push(...gfmFromMarkdown(), gfmFootnoteFromMarkdown())
    }

    // 如果启用了数学公式支持，添加 math 扩展
    if (this.options.math) {
      extensions.push(math())
      mdastExtensions.push(mathFromMarkdown())
    }

    // 如果启用了容器支持，自动添加 directive 扩展
    if (this.containerConfig !== undefined) {
      extensions.push(directive())
      mdastExtensions.push(directiveFromMarkdown())
    }

    // 如果用户传入了自定义扩展，添加它们
    if (this.options.extensions) {
      extensions.push(...this.options.extensions)
    }
    if (this.options.mdastExtensions) {
      mdastExtensions.push(...this.options.mdastExtensions)
    }

    // 添加增量脚注扩展，覆盖 GFM 脚注的定义检查
    // ⚠️ 必须在 micromarkReferenceExtension 之前添加
    // 因为 micromarkReferenceExtension 会拦截 `]`，并将 `[^1]` 交给脚注扩展处理
    if (this.options.gfm) {
      extensions.push(gfmFootnoteIncremental())
    }

    // 添加 reference 扩展（支持增量解析），覆盖 commonmark 的 labelEnd
    // ⚠️ 必须最后添加，确保它能拦截 `]` 并正确处理脚注
    extensions.push(micromarkReferenceExtension())

    // 生成 AST
    let ast = fromMarkdown(text, { extensions, mdastExtensions })

    // 如果启用了 HTML 树转换，应用转换
    if (this.htmlTreeConfig) {
      ast = transformHtmlNodes(ast, this.htmlTreeConfig)
    } else {
      // 如果未启用 HTML 树，将 HTML 节点转换为纯文本
      ast = this.convertHtmlToText(ast)
    }

    return ast
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
   * @param generateBlockId 生成块 ID 的函数
   * @returns ParsedBlock 列表
   */
  nodesToBlocks(
    nodes: RootContent[],
    startOffset: number,
    rawText: string,
    status: BlockStatus,
    generateBlockId: () => string
  ): ParsedBlock[] {
    const blocks: ParsedBlock[] = []
    let currentOffset = startOffset

    for (const node of nodes) {
      const nodeStart = node.position?.start?.offset ?? currentOffset
      const nodeEnd = node.position?.end?.offset ?? currentOffset + 1
      const nodeText = rawText.substring(nodeStart - startOffset, nodeEnd - startOffset)

      blocks.push({
        id: generateBlockId(),
        status,
        node,
        startOffset: nodeStart,
        endOffset: nodeEnd,
        rawText: nodeText
      })

      currentOffset = nodeEnd
    }

    return blocks
  }
}

