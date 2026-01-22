/**
 * 增量 Markdown 解析器
 *
 * 设计思路：
 * 1. 维护一个文本缓冲区，接收流式输入
 * 2. 识别"稳定边界"（如空行、标题等），将已完成的块标记为 completed
 * 3. 对于正在接收的块，每次重新解析，但只解析该块的内容
 * 4. 复杂嵌套节点（如列表、引用）作为整体处理，直到确认完成
 *
 * 引擎选择：
 * - 默认使用 marked（极速模式），只打包 marked 依赖
 * - 如需使用 micromark，通过 astBuilder 选项注入 MicromarkAstBuilder
 *
 * Tree-shaking 说明：
 * - 默认只打包 marked 引擎
 * - micromark 引擎需要从 '@incremark/core/engines/micromark' 单独导入
 */

import type {
  Root,
  ParsedBlock,
  IncrementalUpdate,
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
import type { IAstBuilder, EngineParserOptions } from './ast/types'
// 只默认导入 MarkedAstBuilder，实现 tree-shaking
import { MarkedAstBuilder } from './ast/MarkedAstBuildter'

/**
 * AST 构建器类型（用于注入）
 */
export type AstBuilderClass = new (options: EngineParserOptions) => IAstBuilder

/**
 * 扩展的解析器选项（支持注入自定义 AstBuilder）
 */
export interface IncremarkParserOptions extends EngineParserOptions {
  /**
   * 自定义 AST 构建器类
   *
   * 用于注入不同的引擎实现，实现 tree-shaking
   *
   * @example
   * ```ts
   * // 使用 micromark 引擎
   * import { MicromarkAstBuilder } from '@incremark/core/engines/micromark'
   * const parser = createIncremarkParser({
   *   astBuilder: MicromarkAstBuilder
   * })
   * ```
   */
  astBuilder?: AstBuilderClass
}

// ============ 解析器类 ============

export class IncremarkParser {
  private lines: string[] = []
  /** 行偏移量前缀和：lineOffsets[i] = 第i行起始位置的偏移量 */
  private lineOffsets: number[] = [0]
  private completedBlocks: ParsedBlock[] = []
  private pendingStartLine = 0
  private context: BlockContext
  private options: IncremarkParserOptions
  /** 边界检测器 */
  private readonly boundaryDetector: BoundaryDetector
  /** AST 构建器 */
  private astBuilder: IAstBuilder
  /** Definition 管理器 */
  private readonly definitionManager: DefinitionManager
  /** Footnote 管理器 */
  private readonly footnoteManager: FootnoteManager
  /** 上次 append 返回的 pending blocks，用于 getAst 复用 */
  private lastPendingBlocks: ParsedBlock[] = []

  constructor(options: IncremarkParserOptions = {}) {
    this.options = {
      gfm: true,
      ...options
    }
    this.context = createInitialContext()

    // 初始化 AST 构建器
    // 默认使用 MarkedAstBuilder（极速模式），支持注入自定义构建器
    const BuilderClass = options.astBuilder || MarkedAstBuilder
    this.astBuilder = new BuilderClass(this.options)

    // 初始化边界检测器
    this.boundaryDetector = new BoundaryDetector({ containers: this.astBuilder.containerConfig })
    // 初始化 Definition 和 Footnote 管理器
    this.definitionManager = new DefinitionManager()
    this.footnoteManager = new FootnoteManager()
  }

  /**
   * 生成 block 的 id（直接使用 offset）
   * @param startOffset - block 的起始偏移量
   */
  private generateBlockId(startOffset: number): string {
    return String(startOffset)
  }

  /**
   * 生成 pending block 的稳定 id（基于 startOffset）
   * pending blocks 在每次 append 时都会重新生成，使用 startOffset 确保 id 稳定
   * @param startOffset - block 的起始偏移量，用作稳定的 id
   */
  private generatePendingBlockId(startOffset: number): string {
    return String(startOffset)
  }

  /**
   * 更新已完成的 blocks 中的 definitions 和 footnote definitions
   */
  private updateDefinitionsFromCompletedBlocks(blocks: ParsedBlock[]): void {
    this.definitionManager.extractFromBlocks(blocks)
    this.footnoteManager.extractDefinitionsFromBlocks(blocks)
  }

  /**
   * 增量更新 lines 和 lineOffsets
   * 优化策略：只 split 新增的 chunk，不拼接旧字符串，避免长行性能劣化
   */
  private updateLines(chunk: string): void {
    const prevLineCount = this.lines.length

    // 1. 初始化情况
    if (prevLineCount === 0) {
      this.lines = chunk.split('\n')
      this.lineOffsets = [0]
      // 计算后续行的 offset
      for (let i = 0; i < this.lines.length - 1; i++) {
        this.lineOffsets.push(this.lineOffsets[i] + this.lines[i].length + 1)
      }
      return
    }

    // 2. 增量更新情况
    // 关键优化：只对 chunk 进行 split，不触碰 oldText
    const chunkLines = chunk.split('\n')
    const lastLineIndex = prevLineCount - 1

    // 步骤 A: 将 chunk 的第一部分追加到当前最后一行
    // 注意：这一步只会改变最后一行的内容长度，不会改变它的【起始偏移量】
    this.lines[lastLineIndex] += chunkLines[0]

    // 步骤 B: 如果 chunk 包含换行，处理新增的行
    for (let i = 1; i < chunkLines.length; i++) {
      // 这里的上一行（prevLine）可能是刚刚被追加过的 lastLine，也可能是 chunk 中间的新行
      // 我们需要根据"上一行"的 offset 和 length 来计算"当前新行"的 offset
      const prevLineIndex = this.lines.length - 1 // 总是取当前数组最后一行作为基准
      const prevLineStart = this.lineOffsets[prevLineIndex]
      const prevLineLength = this.lines[prevLineIndex].length

      // 计算新行的 offset = 上一行起始 + 上一行长度 + 1个换行符
      const newOneOffset = prevLineStart + prevLineLength + 1

      this.lineOffsets.push(newOneOffset)
      this.lines.push(chunkLines[i])
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
    this.updateLines(chunk)

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
      // 使用绝对偏移量，确保 Block 的位置信息正确
      const newBlocks = this.astBuilder.nodesToBlocks(ast.children, stableOffset, stableText, 'completed', (offset) => this.generateBlockId(offset))

      // 检查是否有重叠的旧 blocks 需要移除
      // 这主要处理容器增量解析的情况：容器内部的内容先被添加为独立 blocks，
      // 然后整个容器被添加时，需要移除之前添加的内部 blocks
      const blocksToRemove: ParsedBlock[] = []

      for (const newBlock of newBlocks) {
        for (const existingBlock of this.completedBlocks) {
          // 检查是否有重叠：新 block 的起始位置在旧 block 的范围内
          const isOverlapping = newBlock.startOffset >= existingBlock.startOffset && newBlock.startOffset < existingBlock.endOffset
          // 或者旧 block 的起始位置在新 block 的范围内
          const isOverlappingReverse = existingBlock.startOffset >= newBlock.startOffset && existingBlock.startOffset < newBlock.endOffset

          if (isOverlapping || isOverlappingReverse) {
            // 如果 ID 不同，说明是容器增量解析的情况，需要移除旧的
            if (newBlock.id !== existingBlock.id) {
              blocksToRemove.push(existingBlock)
            }
          }
        }
      }

      // 移除重叠的 blocks
      if (blocksToRemove.length > 0) {
        const idsToRemove = new Set(blocksToRemove.map(b => b.id))
        this.completedBlocks = this.completedBlocks.filter(b => !idsToRemove.has(b.id))
      }

      this.completedBlocks.push(...newBlocks)
      update.completed = newBlocks

      // 标记被移除的 blocks（用于通知上层）
      if (blocksToRemove.length > 0) {
        // 将被移除的 blocks 添加到 update.updated 中，标记它们已被替换
        update.updated = blocksToRemove
      }

      // 更新 definitions 从新完成的 blocks
      this.updateDefinitionsFromCompletedBlocks(newBlocks)

      // 增量收集脚注引用（只扫描新完成的 blocks）
      this.footnoteManager.collectReferencesFromCompletedBlocks(newBlocks)

      // 清理不再需要的上下文缓存
      this.boundaryDetector.clearContextCache(this.pendingStartLine)

      // 直接使用 findStableBoundary 计算好的上下文，避免重复遍历
      this.context = contextAtLine
      this.pendingStartLine = stableBoundary + 1
    }

    if (this.pendingStartLine < this.lines.length) {
      const pendingText = this.lines.slice(this.pendingStartLine).join('\n')

      if (pendingText.trim()) {
        const pendingOffset = this.getLineOffset(this.pendingStartLine)
        const ast = this.astBuilder.parse(pendingText)
        // pending blocks 使用基于 offset 的稳定 id，避免每次 append 时 id 变化
        // 这对于 Vue/React 等框架的 key 稳定性很重要
        update.pending = this.astBuilder.nodesToBlocks(
          ast.children,
          pendingOffset,
          pendingText,
          'pending',
          (offset) => this.generatePendingBlockId(offset)
        )
      }
    }

    // 缓存 pending blocks 供 getAst 使用
    this.lastPendingBlocks = update.pending

    update.ast = {
      type: 'root',
      children: [...this.completedBlocks.map((b) => b.node), ...update.pending.map((b) => b.node)]
    }

    // 使用优化的脚注引用收集（只扫描 pending 部分）
    update.footnoteReferenceOrder = this.footnoteManager.collectReferencesFromPending(update.pending)

    // 填充 definitions 和 footnote 相关数据
    update.definitions = this.getDefinitionMap()
    update.footnoteDefinitions = this.getFootnoteDefinitionMap()

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
        markdown: this.lines.join('\n'),
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
        // 使用绝对偏移量，确保 Block 的位置信息正确
        const finalBlocks = this.astBuilder.nodesToBlocks(
          ast.children,
          remainingOffset,
          remainingText,
          'completed',
          (offset) => this.generateBlockId(offset)
        )

        this.completedBlocks.push(...finalBlocks)
        update.completed = finalBlocks

        // 更新 definitions 从最终完成的 blocks
        this.updateDefinitionsFromCompletedBlocks(finalBlocks)

        // 增量收集脚注引用（只扫描新完成的 blocks）
        this.footnoteManager.collectReferencesFromCompletedBlocks(finalBlocks)

        // 清理不再需要的上下文缓存
        this.boundaryDetector.clearContextCache(this.pendingStartLine)
      }
    }

    // 清空 pending 缓存
    this.lastPendingBlocks = []
    this.pendingStartLine = this.lines.length

    update.ast = {
      type: 'root',
      children: this.completedBlocks.map((b) => b.node)
    }

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

    // 使用优化的脚注引用收集
    this.footnoteManager.collectReferencesFromPending(this.lastPendingBlocks)

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
    return this.lines.join('\n')
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
    this.lines = []
    this.lineOffsets = [0]
    this.completedBlocks = []
    this.pendingStartLine = 0
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

  /**
   * 更新解析器配置（动态更新，不需要重建 parser 实例）
   *
   * 注意：更新配置后会自动调用 reset() 重置状态
   *
   * @param options 部分配置选项
   *
   * @example
   * ```ts
   * // 动态启用 TeX 数学公式语法
   * parser.updateOptions({ math: { tex: true } })
   *
   * // 禁用 GFM
   * parser.updateOptions({ gfm: false })
   *
   * // 切换引擎
   * import { MicromarkAstBuilder } from '@incremark/core/engines/micromark'
   * parser.updateOptions({ astBuilder: MicromarkAstBuilder })
   * ```
   */
  updateOptions(options: Partial<IncremarkParserOptions>): void {
    // 重置状态
    this.reset()

    // 合并选项
    Object.assign(this.options, options)

    if (options.astBuilder) {
      // 显式指定了 astBuilder，切换到指定引擎
      const BuilderClass = options.astBuilder
      if (!(this.astBuilder instanceof BuilderClass)) {
        this.astBuilder = new BuilderClass(this.options)
      } else {
        this.astBuilder.updateOptions(options)
      }
    } else {
      // astBuilder 被显式设置为 undefined，切换回默认引擎 (MarkedAstBuilder)
      if (!(this.astBuilder instanceof MarkedAstBuilder)) {
        this.astBuilder = new MarkedAstBuilder(this.options)
      } else {
        this.astBuilder.updateOptions(options)
      }
    }
  }
}

/**
 * 创建 Incremark 解析器实例
 *
 * @param options 解析器配置
 * @param options.astBuilder 自定义 AST 构建器类（用于切换引擎）
 * @param options.plugins 统一插件列表
 *
 * @example
 * ```ts
 * // 使用默认的 marked 引擎（极速模式）
 * const parser = createIncremarkParser({ gfm: true, math: true })
 *
 * // 使用 micromark 引擎（需要单独导入，支持 tree-shaking）
 * import { MicromarkAstBuilder } from '@incremark/core/engines/micromark'
 * const parser = createIncremarkParser({
 *   astBuilder: MicromarkAstBuilder,
 *   gfm: true
 * })
 * ```
 */
export function createIncremarkParser(options?: IncremarkParserOptions): IncremarkParser {
  return new IncremarkParser(options)
}
