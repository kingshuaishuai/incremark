/**
 * 增量 Markdown 解析器
 *
 * 设计思路：
 * 1. 维护一个文本缓冲区，接收流式输入
 * 2. 识别"稳定边界"（如空行、标题等），将已完成的块标记为 completed
 * 3. 对于正在接收的块，每次重新解析，但只解析该块的内容
 * 4. 复杂嵌套节点（如列表、引用）作为整体处理，直到确认完成
 */

import { fromMarkdown } from 'mdast-util-from-markdown'
import { gfmFromMarkdown } from 'mdast-util-gfm'
import { gfm } from 'micromark-extension-gfm'
import { gfmFootnoteFromMarkdown } from 'mdast-util-gfm-footnote'
import type { Extension as MicromarkExtension } from 'micromark-util-types'
import type { Extension as MdastExtension } from 'mdast-util-from-markdown'

import type {
  Root,
  RootContent,
  ParsedBlock,
  IncrementalUpdate,
  ParserOptions,
  BlockStatus,
  BlockContext,
  ContainerConfig,
  ParserState
} from '../types'

import { transformHtmlNodes, type HtmlTreeExtensionOptions } from '../extensions/html-extension'
import { micromarkReferenceExtension } from '../extensions/micromark-reference-extension'
import { gfmFootnoteIncremental } from '../extensions/micromark-gfm-footnote-incremental'
import { directive } from 'micromark-extension-directive'
import { directiveFromMarkdown } from 'mdast-util-directive'
import type { HTML, Paragraph, Text, Parent as MdastParent, Definition, FootnoteDefinition } from 'mdast'
import type { DefinitionMap, FootnoteDefinitionMap } from '../types'

import {
  createInitialContext,
  updateContext,
  isEmptyLine,
  detectFenceStart,
  isHeading,
  isThematicBreak,
  isBlockquoteStart,
  isListItemStart,
  detectContainer,
  detectContainerEnd,
  isFootnoteDefinitionStart,
  isFootnoteContinuation
} from '../detector'
import { isDefinitionNode, isFootnoteDefinitionNode } from '../utils'

// ============ 解析器类 ============

export class IncremarkParser {
  private buffer = ''
  private lines: string[] = []
  /** 行偏移量前缀和：lineOffsets[i] = 第i行起始位置的偏移量 */
  private lineOffsets: number[] = [0]
  private completedBlocks: ParsedBlock[] = []
  private pendingStartLine = 0
  private blockIdCounter = 0
  private context: BlockContext
  private options: ParserOptions
  /** 缓存的容器配置，避免重复计算 */
  private readonly containerConfig: ContainerConfig | undefined
  /** 缓存的 HTML 树配置，避免重复计算 */
  private readonly htmlTreeConfig: HtmlTreeExtensionOptions | undefined
  /** 上次 append 返回的 pending blocks，用于 getAst 复用 */
  private lastPendingBlocks: ParsedBlock[] = []
  /** Definition 映射表（用于引用式图片和链接） */
  private definitionMap: DefinitionMap = {}
  /** Footnote Definition 映射表 */
  private footnoteDefinitionMap: FootnoteDefinitionMap = {}
  /** Footnote Reference 出现顺序（按引用在文档中的顺序） */
  private footnoteReferenceOrder: string[] = []

  constructor(options: ParserOptions = {}) {
    this.options = {
      gfm: true,
      ...options
    }
    this.context = createInitialContext()
    // 初始化容器配置（构造时计算一次）
    this.containerConfig = this.computeContainerConfig()
    // 初始化 HTML 树配置
    this.htmlTreeConfig = this.computeHtmlTreeConfig()
  }

  private generateBlockId(): string {
    return `block-${++this.blockIdCounter}`
  }

  private computeContainerConfig(): ContainerConfig | undefined {
    const containers = this.options.containers
    if (!containers) return undefined
    return containers === true ? {} : containers
  }

  private computeHtmlTreeConfig(): HtmlTreeExtensionOptions | undefined {
    const htmlTree = this.options.htmlTree
    if (!htmlTree) return undefined
    return htmlTree === true ? {} : htmlTree
  }

  /**
   * 将 HTML 节点转换为纯文本
   * 递归处理 AST 中所有 html 类型的节点
   * - 块级 HTML 节点 → 转换为 paragraph 包含 text
   * - 内联 HTML 节点（在段落内部）→ 转换为 text 节点
   */
  private convertHtmlToText(ast: Root): Root {
    // 处理内联节点（段落内部的 children）
    const processInlineChildren = (children: unknown[]): unknown[] => {
      return children.map(node => {
        const n = node as RootContent
        // 内联 html 节点转换为纯文本节点
        if (n.type === 'html') {
          const htmlNode = n as HTML
          const textNode: Text = {
            type: 'text',
            value: htmlNode.value,
            position: htmlNode.position
          }
          return textNode
        }
        
        // 递归处理有 children 的内联节点（如 strong, emphasis 等）
        if ('children' in n && Array.isArray(n.children)) {
          const parent = n as MdastParent
          return {
            ...parent,
            children: processInlineChildren(parent.children)
          }
        }
        
        return n
      })
    }

    // 处理块级节点
    const processBlockChildren = (children: RootContent[]): RootContent[] => {
      return children.map(node => {
        // 块级 html 节点转换为段落包含纯文本
        if (node.type === 'html') {
          const htmlNode = node as HTML
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
        
        // 递归处理有 children 的块级节点
        if ('children' in node && Array.isArray(node.children)) {
          const parent = node as MdastParent
          // 对于段落等内联容器，使用 processInlineChildren
          if (node.type === 'paragraph' || node.type === 'heading' || 
              node.type === 'tableCell' || node.type === 'delete' ||
              node.type === 'emphasis' || node.type === 'strong' ||
              node.type === 'link' || node.type === 'linkReference') {
            return {
              ...parent,
              children: processInlineChildren(parent.children)
            } as RootContent
          }
          // 对于其他块级容器，递归处理
          return {
            ...parent,
            children: processBlockChildren(parent.children as RootContent[])
          } as RootContent
        }
        
        return node
      })
    }
    
    return {
      ...ast,
      children: processBlockChildren(ast.children)
    }
  }

  private parse(text: string): Root {
    const extensions: MicromarkExtension[] = []
    const mdastExtensions: MdastExtension[] = []

    // 先添加 GFM（包含原始的脚注扩展）
    if (this.options.gfm) {
      extensions.push(gfm())
      mdastExtensions.push(...gfmFromMarkdown(), gfmFootnoteFromMarkdown())
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

  private updateDefinationsFromComplatedBlocks(blocks: ParsedBlock[]): void{
    for (const block of blocks) {
      this.definitionMap = {
        ...this.definitionMap,
        ...this.findDefinition(block)
      }

      this.footnoteDefinitionMap = {
        ...this.footnoteDefinitionMap,
        ...this.findFootnoteDefinition(block)
      }
    }
  }

  private findDefinition(block: ParsedBlock): DefinitionMap {
    const definitions: Definition[] = [];

    function findDefination(node: RootContent) {
      if (isDefinitionNode(node)) {
        definitions.push(node as Definition);
      }
      
      if ('children' in node && Array.isArray(node.children)) {
        for (const child of node.children) {
          findDefination(child as RootContent);
        }
      }
    }

    findDefination(block.node);
  
    return definitions.reduce<DefinitionMap>((acc, node) => {
      acc[node.identifier] = node;
      return acc;
    }, {});

  }

  private findFootnoteDefinition(block: ParsedBlock): FootnoteDefinitionMap {
    const footnoteDefinitions: FootnoteDefinition[] = [];

    function findFootnoteDefinition(node: RootContent) {
      if (isFootnoteDefinitionNode(node)) {
        footnoteDefinitions.push(node as FootnoteDefinition);
      }
    }

    findFootnoteDefinition(block.node);

    return footnoteDefinitions.reduce<FootnoteDefinitionMap>((acc, node) => {
      acc[node.identifier] = node;
      return acc;
    }, {});
  }

  /**
   * 收集 AST 中的脚注引用（按出现顺序）
   * 用于确定脚注的显示顺序
   */
  private collectFootnoteReferences(nodes: RootContent[]): void {
    const visitNode = (node: any): void => {
      if (!node) return

      // 检查是否是脚注引用
      if (node.type === 'footnoteReference') {
        const identifier = node.identifier
        // 去重：只记录第一次出现的位置
        if (!this.footnoteReferenceOrder.includes(identifier)) {
          this.footnoteReferenceOrder.push(identifier)
        }
      }

      // 递归遍历子节点
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach(visitNode)
      }
    }

    nodes.forEach(visitNode)
  }

  /**
   * 增量更新 lines 和 lineOffsets
   * 只处理新增的内容，避免全量 split
   */
  private updateLines(): void {
    const prevLineCount = this.lines.length

    if (prevLineCount === 0) {
      // 首次输入，直接 split
      this.lines = this.buffer.split('\n')
      this.lineOffsets = [0]
      for (let i = 0; i < this.lines.length; i++) {
        this.lineOffsets.push(this.lineOffsets[i] + this.lines[i].length + 1)
      }
      return
    }

    // 找到最后一个不完整的行（可能被新 chunk 续上）
    const lastLineStart = this.lineOffsets[prevLineCount - 1]
    const textFromLastLine = this.buffer.slice(lastLineStart)

    // 重新 split 最后一行及之后的内容
    const newLines = textFromLastLine.split('\n')

    // 替换最后一行并追加新行
    this.lines.length = prevLineCount - 1
    this.lineOffsets.length = prevLineCount

    for (let i = 0; i < newLines.length; i++) {
      this.lines.push(newLines[i])
      const prevOffset = this.lineOffsets[this.lineOffsets.length - 1]
      this.lineOffsets.push(prevOffset + newLines[i].length + 1)
    }
  }

  /**
   * O(1) 获取行偏移量
   */
  private getLineOffset(lineIndex: number): number {
    return this.lineOffsets[lineIndex] ?? 0
  }

  /**
   * 查找稳定边界
   * 返回稳定边界行号和该行对应的上下文（用于后续更新，避免重复计算）
   */
  private findStableBoundary(): { line: number; contextAtLine: BlockContext } {
    let stableLine = -1
    let stableContext: BlockContext = this.context
    let tempContext = { ...this.context }

    for (let i = this.pendingStartLine; i < this.lines.length; i++) {
      const line = this.lines[i]
      const wasInFencedCode = tempContext.inFencedCode
      const wasInContainer = tempContext.inContainer
      const wasContainerDepth = tempContext.containerDepth

      tempContext = updateContext(line, tempContext, this.containerConfig)

      if (wasInFencedCode && !tempContext.inFencedCode) {
        if (i < this.lines.length - 1) {
          stableLine = i
          stableContext = { ...tempContext }
        }
        continue
      }

      if (tempContext.inFencedCode) {
        continue
      }

      if (wasInContainer && wasContainerDepth === 1 && !tempContext.inContainer) {
        if (i < this.lines.length - 1) {
          stableLine = i
          stableContext = { ...tempContext }
        }
        continue
      }

      // ⚠️ 关键：如果当前在容器内，跳过所有稳定性检查
      // 容器内的所有内容（包括空行、列表等）都应该被视为容器的一部分
      // 只有容器结束标记才能作为稳定边界
      if (tempContext.inContainer) {
        continue
      }

      // 传入上下文信息，让 checkStability 能够判断是否在容器内
      const stablePoint = this.checkStability(i, tempContext)
      if (stablePoint >= 0) {
        stableLine = stablePoint
        stableContext = { ...tempContext }
      }
    }

    return { line: stableLine, contextAtLine: stableContext }
  }

  private checkStability(lineIndex: number, context: BlockContext): number {
    // 第一行永远不稳定
    if (lineIndex === 0) {
      return -1
    }

    const line = this.lines[lineIndex]
    const prevLine = this.lines[lineIndex - 1]

    // ⚠️ 关键修改：如果当前上下文在容器内，且当前行不是容器结束，则不判断为稳定边界
    // 这样可以确保容器内的所有内容（包括空行、列表等）都被视为容器的一部分
    if (context.inContainer) {
      // 检查当前行是否是容器结束
      if (this.containerConfig !== undefined) {
        const containerEnd = detectContainerEnd(line, context, this.containerConfig)
        if (containerEnd) {
          // 容器结束，返回前一行作为稳定边界
          return lineIndex - 1
        }
      }
      // 容器内且不是容器结束，不判断为稳定边界
      return -1
    }

    // ⚠️ 如果当前在列表中，需要特殊处理
    // 列表内的空行不应该作为稳定边界，因为列表项之间可以有空行
    if (context.inList) {
      // 列表还没有确认结束（listMayEnd 为 false 或 undefined）
      // 不应该在列表中间创建稳定边界
      if (!context.listMayEnd) {
        return -1
      }
      // 如果 listMayEnd 为 true，说明上一行是空行
      // 但当前行需要确认是否是列表延续
      // 这个判断交给后续逻辑处理
    }

    // 前一行是独立块（标题、分割线），该块已完成
    if (isHeading(prevLine) || isThematicBreak(prevLine)) {
      return lineIndex - 1
    }

    // 最后一行不稳定（可能还有更多内容）
    if (lineIndex >= this.lines.length - 1) {
      return -1
    }

    // ============ 脚注定义的特殊处理 ============

    // 情况 1: 前一行是脚注定义开始
    if (isFootnoteDefinitionStart(prevLine)) {
      // 当前行是空行或缩进行，脚注可能继续（不稳定）
      if (isEmptyLine(line) || isFootnoteContinuation(line)) {
        return -1
      }
      // 当前行是新脚注定义，前一个脚注完成
      if (isFootnoteDefinitionStart(line)) {
        return lineIndex - 1
      }
      // 当前行是非缩进的新块，前一个脚注完成
      // 这种情况会在后续的判断中处理
    }

    // 情况 2: 前一行是缩进行，可能是脚注延续
    if (!isEmptyLine(prevLine) && isFootnoteContinuation(prevLine)) {
      // 向上查找最近的脚注定义
      const footnoteStartLine = this.findFootnoteStart(lineIndex - 1)
      if (footnoteStartLine >= 0) {
        // 确认属于脚注定义
        // 当前行仍然是缩进或空行，脚注继续（不稳定）
        if (isEmptyLine(line) || isFootnoteContinuation(line)) {
          return -1
        }
        // 当前行是新脚注定义，前一个脚注完成
        if (isFootnoteDefinitionStart(line)) {
          return lineIndex - 1
        }
        // 当前行是非缩进的新块，前一个脚注完成
        return lineIndex - 1
      }
    }

    // 前一行非空时，如果当前行是新块开始，则前一块已完成
    if (!isEmptyLine(prevLine)) {
      // 新脚注定义开始（排除连续脚注定义）
      if (isFootnoteDefinitionStart(line) && !isFootnoteDefinitionStart(prevLine)) {
        return lineIndex - 1
      }

      // 新标题开始
      if (isHeading(line)) {
        return lineIndex - 1
      }

      // 新代码块开始
      if (detectFenceStart(line)) {
        return lineIndex - 1
      }

      // 新引用块开始（排除连续引用）
      if (isBlockquoteStart(line) && !isBlockquoteStart(prevLine)) {
        return lineIndex - 1
      }

      // 新列表开始（排除连续列表项）
      // ⚠️ 修改：只有在不在列表中时才触发这个逻辑
      if (!context.inList && isListItemStart(line) && !isListItemStart(prevLine)) {
        return lineIndex - 1
      }

      // 新容器开始
      if (this.containerConfig !== undefined) {
        const container = detectContainer(line, this.containerConfig)
        if (container && !container.isEnd) {
          const prevContainer = detectContainer(prevLine, this.containerConfig)
          if (!prevContainer || prevContainer.isEnd) {
            return lineIndex - 1
          }
        }
      }
    }

    // 空行标志段落结束
    // ⚠️ 修改：如果在列表中，空行不作为稳定边界
    if (isEmptyLine(line) && !isEmptyLine(prevLine) && !context.inList) {
      return lineIndex
    }

    return -1
  }

  /**
   * 从指定行向上查找脚注定义的起始行
   * 
   * @param fromLine 开始查找的行索引
   * @returns 脚注起始行索引，如果不属于脚注返回 -1
   * 
   * @example
   * // 假设 lines 为:
   * // 0: "[^1]: 第一行"
   * // 1: "    第二行"
   * // 2: "    第三行"
   * findFootnoteStart(2) // 返回 0
   * findFootnoteStart(1) // 返回 0
   */
  private findFootnoteStart(fromLine: number): number {
    // 限制向上查找的最大行数，避免性能问题
    const maxLookback = 20
    const startLine = Math.max(0, fromLine - maxLookback)
    
    for (let i = fromLine; i >= startLine; i--) {
      const line = this.lines[i]
      
      // 遇到脚注定义起始行
      if (isFootnoteDefinitionStart(line)) {
        return i
      }
      
      // 遇到空行，继续向上查找（可能是脚注内部的段落分隔）
      if (isEmptyLine(line)) {
        continue
      }
      
      // 遇到非缩进的普通行，说明不属于脚注
      if (!isFootnoteContinuation(line)) {
        return -1
      }
    }
    
    return -1
  }

  private nodesToBlocks(
    nodes: RootContent[],
    startOffset: number,
    rawText: string,
    status: BlockStatus
  ): ParsedBlock[] {
    const blocks: ParsedBlock[] = []
    let currentOffset = startOffset

    for (const node of nodes) {
      const nodeStart = node.position?.start?.offset ?? currentOffset
      const nodeEnd = node.position?.end?.offset ?? currentOffset + 1
      const nodeText = rawText.substring(nodeStart - startOffset, nodeEnd - startOffset)

      blocks.push({
        id: this.generateBlockId(),
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

  /**
   * 追加新的 chunk 并返回增量更新
   */
  append(chunk: string): IncrementalUpdate {
    this.buffer += chunk
    this.updateLines()

    const { line: stableBoundary, contextAtLine } = this.findStableBoundary()

    const update: IncrementalUpdate = {
      completed: [],
      updated: [],
      pending: [],
      ast: { type: 'root', children: [] },
      definitions: {},
      footnoteDefinitions: {},
      footnoteReferenceOrder: []
    }

    if (stableBoundary >= this.pendingStartLine && stableBoundary >= 0) {
      const stableText = this.lines.slice(this.pendingStartLine, stableBoundary + 1).join('\n')
      const stableOffset = this.getLineOffset(this.pendingStartLine)

      const ast = this.parse(stableText)
      const newBlocks = this.nodesToBlocks(ast.children, stableOffset, stableText, 'completed')

      this.completedBlocks.push(...newBlocks)
      update.completed = newBlocks

      // 更新 definitions 从新完成的 blocks
      this.updateDefinationsFromComplatedBlocks(newBlocks)

      // 直接使用 findStableBoundary 计算好的上下文，避免重复遍历
      this.context = contextAtLine
      this.pendingStartLine = stableBoundary + 1
    }

    if (this.pendingStartLine < this.lines.length) {
      const pendingText = this.lines.slice(this.pendingStartLine).join('\n')

      if (pendingText.trim()) {
        const pendingOffset = this.getLineOffset(this.pendingStartLine)
        const ast = this.parse(pendingText)

        update.pending = this.nodesToBlocks(ast.children, pendingOffset, pendingText, 'pending')
      }
    }

    // 缓存 pending blocks 供 getAst 使用
    this.lastPendingBlocks = update.pending

    update.ast = {
      type: 'root',
      children: [...this.completedBlocks.map((b) => b.node), ...update.pending.map((b) => b.node)]
    }

    // 收集脚注引用顺序
    this.collectFootnoteReferences(update.ast.children)

    // 填充 definitions 和 footnote 相关数据
    update.definitions = this.getDefinitionMap()
    update.footnoteDefinitions = this.getFootnoteDefinitionMap()
    update.footnoteReferenceOrder = this.getFootnoteReferenceOrder()

    // 触发状态变化回调
    this.emitChange(update.pending)

    return update
  }

  /**
   * 触发状态变化回调
   */
  private emitChange(pendingBlocks: ParsedBlock[] = []): void {
    if (this.options.onChange) {
      const state: ParserState = {
        completedBlocks: this.completedBlocks,
        pendingBlocks,
        markdown: this.buffer,
        ast: {
          type: 'root',
          children: [
            ...this.completedBlocks.map((b) => b.node),
            ...pendingBlocks.map((b) => b.node)
          ]
        },
        definitions: { ...this.definitionMap },
        footnoteDefinitions: { ...this.footnoteDefinitionMap }
      }
      this.options.onChange(state)
    }
  }

  /**
   * 标记解析完成，处理剩余内容
   * 也可用于强制中断时（如用户点击停止），将 pending 内容标记为 completed
   */
  finalize(): IncrementalUpdate {
    const update: IncrementalUpdate = {
      completed: [],
      updated: [],
      pending: [],
      ast: { type: 'root', children: [] },
      definitions: {},
      footnoteDefinitions: {},
      footnoteReferenceOrder: []
    }

    if (this.pendingStartLine < this.lines.length) {
      const remainingText = this.lines.slice(this.pendingStartLine).join('\n')

      if (remainingText.trim()) {
        const remainingOffset = this.getLineOffset(this.pendingStartLine)
        const ast = this.parse(remainingText)

        const finalBlocks = this.nodesToBlocks(
          ast.children,
          remainingOffset,
          remainingText,
          'completed'
        )

        this.completedBlocks.push(...finalBlocks)
        update.completed = finalBlocks

        // 更新 definitions 从最终完成的 blocks
        this.updateDefinationsFromComplatedBlocks(finalBlocks)
      }
    }

    // 清空 pending 缓存
    this.lastPendingBlocks = []
    this.pendingStartLine = this.lines.length

    update.ast = {
      type: 'root',
      children: this.completedBlocks.map((b) => b.node)
    }

    // 收集脚注引用顺序
    this.collectFootnoteReferences(update.ast.children)

    // 填充 definitions 和 footnote 相关数据
    update.definitions = this.getDefinitionMap()
    update.footnoteDefinitions = this.getFootnoteDefinitionMap()
    update.footnoteReferenceOrder = this.getFootnoteReferenceOrder()

    // 触发状态变化回调
    this.emitChange([])

    return update
  }

  /**
   * 强制中断解析，将所有待处理内容标记为完成
   * 语义上等同于 finalize()，但名称更清晰
   */
  abort(): IncrementalUpdate {
    return this.finalize()
  }

  /**
   * 获取当前完整的 AST
   * 复用上次 append 的 pending 结果，避免重复解析
   */
  getAst(): Root {
    const children = [
      ...this.completedBlocks.map((b) => b.node),
      ...this.lastPendingBlocks.map((b) => b.node)
    ]

    // 收集脚注引用顺序
    this.collectFootnoteReferences(children)

    return {
      type: 'root',
      children
    }
  }

  /**
   * 获取所有已完成的块
   */
  getCompletedBlocks(): ParsedBlock[] {
    return [...this.completedBlocks]
  }

  /**
   * 获取当前缓冲区内容
   */
  getBuffer(): string {
    return this.buffer
  }

  /**
   * 获取 Definition 映射表（用于引用式图片和链接）
   */
  getDefinitionMap(): DefinitionMap {
    return { ...this.definitionMap }
  }

  /**
   * 获取 Footnote Definition 映射表
   */
  getFootnoteDefinitionMap(): FootnoteDefinitionMap {
    return { ...this.footnoteDefinitionMap }
  }

  /**
   * 获取脚注引用的出现顺序
   */
  getFootnoteReferenceOrder(): string[] {
    return [...this.footnoteReferenceOrder]
  }

  /**
   * 设置状态变化回调（用于 DevTools 等）
   */
  setOnChange(callback: ((state: import('../types').ParserState) => void) | undefined): void {
    const originalOnChange = this.options.onChange;
    this.options.onChange = (state: ParserState) => {
      originalOnChange?.(state);
      callback?.(state);
    }
  }

  /**
   * 重置解析器状态
   */
  reset(): void {
    this.buffer = ''
    this.lines = []
    this.lineOffsets = [0]
    this.completedBlocks = []
    this.pendingStartLine = 0
    this.blockIdCounter = 0
    this.context = createInitialContext()
    this.lastPendingBlocks = []
    // 清空 definition 映射
    this.definitionMap = {}
    this.footnoteDefinitionMap = {}
    this.footnoteReferenceOrder = []

    // 触发状态变化回调
    this.emitChange([])
  }

  /**
   * 一次性渲染完整 Markdown（reset + append + finalize）
   * @param content 完整的 Markdown 内容
   * @returns 解析结果
   */
  render(content: string): IncrementalUpdate {
    this.reset()
    this.append(content)
    return this.finalize()
  }
}

/**
 * 创建 Incremark 解析器实例
 */
export function createIncremarkParser(options?: ParserOptions): IncremarkParser {
  return new IncremarkParser(options)
}
