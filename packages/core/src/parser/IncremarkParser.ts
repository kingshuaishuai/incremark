/**
 * 增量 Markdown 解析器
 *
 * 设计思路：
 * 1. 维护一个文本缓冲区，接收流式输入
 * 2. 识别"稳定边界"（如空行、标题等），将已完成的块标记为 completed
 * 3. 对于正在接收的块，每次重新解析，但只解析该块的内容
 * 4. 复杂嵌套节点（如列表、引用）作为整体处理，直到确认完成
 */

import type {
  Root,
  RootContent,
  ParsedBlock,
  IncrementalUpdate,
  ParserOptions,
  BlockContext,
  ParserState,
  DefinitionMap,
  FootnoteDefinitionMap
} from '../types'

import {
  createInitialContext,
} from '../detector'
import { BoundaryDetector } from './boundary'
import { DefinitionManager } from './manager'
import { FootnoteManager } from './manager'
import { AstBuilder } from './ast'

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
  /** 边界检测器 */
  private readonly boundaryDetector: BoundaryDetector
  /** AST 构建器 */
  private readonly astBuilder: AstBuilder
  /** Definition 管理器 */
  private readonly definitionManager: DefinitionManager
  /** Footnote 管理器 */
  private readonly footnoteManager: FootnoteManager
  /** 上次 append 返回的 pending blocks，用于 getAst 复用 */
  private lastPendingBlocks: ParsedBlock[] = []

  constructor(options: ParserOptions = {}) {
    this.options = {
      gfm: true,
      ...options
    }
    this.context = createInitialContext()
    // 初始化 AST 构建器
    this.astBuilder = new AstBuilder(this.options)
    // 初始化边界检测器
    this.boundaryDetector = new BoundaryDetector({ containers: this.astBuilder.containerConfig })
    // 初始化 Definition 和 Footnote 管理器
    this.definitionManager = new DefinitionManager()
    this.footnoteManager = new FootnoteManager()
  }

  private generateBlockId(): string {
    return `block-${++this.blockIdCounter}`
  }

  /**
   * 更新已完成的 blocks 中的 definitions 和 footnote definitions
   */
  private updateDefinitionsFromCompletedBlocks(blocks: ParsedBlock[]): void {
    this.definitionManager.extractFromBlocks(blocks)
    this.footnoteManager.extractDefinitionsFromBlocks(blocks)
  }

  /**
   * 收集 AST 中的脚注引用（按出现顺序）
   * 用于确定脚注的显示顺序
   */
  private collectFootnoteReferences(nodes: RootContent[]): void {
    this.footnoteManager.collectReferences(nodes)
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
    const result = this.boundaryDetector.findStableBoundary(
      this.lines,
      this.pendingStartLine,
      this.context
    )
    return { line: result.line, contextAtLine: result.context }
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

      const ast = this.astBuilder.parse(stableText)
      const newBlocks = this.astBuilder.nodesToBlocks(ast.children, stableOffset, stableText, 'completed', () => this.generateBlockId())

      this.completedBlocks.push(...newBlocks)
      update.completed = newBlocks

      // 更新 definitions 从新完成的 blocks
      this.updateDefinitionsFromCompletedBlocks(newBlocks)

      // 直接使用 findStableBoundary 计算好的上下文，避免重复遍历
      this.context = contextAtLine
      this.pendingStartLine = stableBoundary + 1
    }

    if (this.pendingStartLine < this.lines.length) {
      const pendingText = this.lines.slice(this.pendingStartLine).join('\n')

      if (pendingText.trim()) {
        const pendingOffset = this.getLineOffset(this.pendingStartLine)
        const ast = this.astBuilder.parse(pendingText)

        update.pending = this.astBuilder.nodesToBlocks(ast.children, pendingOffset, pendingText, 'pending', () => this.generateBlockId())
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
        definitions: { ...this.getDefinitionMap() },
        footnoteDefinitions: { ...this.getFootnoteDefinitionMap() }
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
      definitions: this.getDefinitionMap(),
      footnoteDefinitions: this.getFootnoteDefinitionMap(),
      footnoteReferenceOrder: this.getFootnoteReferenceOrder()
    }

    if (this.pendingStartLine < this.lines.length) {
      const remainingText = this.lines.slice(this.pendingStartLine).join('\n')

      if (remainingText.trim()) {
        const remainingOffset = this.getLineOffset(this.pendingStartLine)
        const ast = this.astBuilder.parse(remainingText)

        const finalBlocks = this.astBuilder.nodesToBlocks(
          ast.children,
          remainingOffset,
          remainingText,
          'completed',
          () => this.generateBlockId()
        )

        this.completedBlocks.push(...finalBlocks)
        update.completed = finalBlocks

        // 更新 definitions 从最终完成的 blocks
        this.updateDefinitionsFromCompletedBlocks(finalBlocks)
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
   * @deprecated 请使用 finalize() 代替，功能完全相同
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
    return this.definitionManager.getAll()
  }

  /**
   * 获取 Footnote Definition 映射表
   */
  getFootnoteDefinitionMap(): FootnoteDefinitionMap {
    return this.footnoteManager.getDefinitions()
  }

  /**
   * 获取脚注引用的出现顺序
   */
  getFootnoteReferenceOrder(): string[] {
    return this.footnoteManager.getReferenceOrder()
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
    // 清空 definition 和 footnote 映射
    this.definitionManager.clear()
    this.footnoteManager.clear()

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
