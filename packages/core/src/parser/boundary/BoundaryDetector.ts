/**
 * 边界检测器
 *
 * 职责：
 * - 检测 Markdown 文档中的稳定边界
 * - 判断哪些块已经完成，不会再改变
 * - 支持代码块、引用块、列表、脚注、容器等边界检测
 *
 * 此类是直接从 IncremarkParser 中提取的边界检测逻辑，未做任何优化。
 */

import type { BlockContext, ContainerConfig } from '../../types'
import {
  updateContext,
  isEmptyLine,
  isHeading,
  isThematicBreak,
  isBlockquoteStart,
  isListItemStart,
  detectContainer,
  detectContainerEnd,
  isFootnoteDefinitionStart,
  isFootnoteContinuation,
  detectFenceStart,
  isSetextHeadingUnderline
} from '../../detector'

/**
 * 稳定边界结果
 */
export interface StableBoundaryResult {
  /** 稳定边界行号 */
  line: number
  /** 该行对应的上下文 */
  context: BlockContext
}

/**
 * 边界检测器配置
 */
export interface BoundaryDetectorConfig {
  /** 容器配置 */
  containers?: ContainerConfig
}

/**
 * 稳定性检查接口
 */
interface StabilityChecker {
  /**
   * 检查是否为稳定边界
   * @param lineIndex 行索引
   * @param context 当前上下文
   * @param lines 所有行
   * @returns 稳定边界行号，如果不是稳定边界返回 -1
   */
  check(lineIndex: number, context: BlockContext, lines: string[]): number
}

/**
 * 容器内边界检查器
 */
class ContainerBoundaryChecker implements StabilityChecker {
  constructor(private containerConfig: ContainerConfig | undefined) {}

  check(lineIndex: number, context: BlockContext, lines: string[]): number {
    const line = lines[lineIndex]

    if (!context.inContainer) {
      return -1
    }

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
}

/**
 * 列表边界检查器
 */
class ListBoundaryChecker implements StabilityChecker {
  check(lineIndex: number, context: BlockContext, lines: string[]): number {
    if (!context.inList) {
      return -1
    }

    // 列表还没有确认结束（listMayEnd 为 false 或 undefined）
    // 不应该在列表中间创建稳定边界
    if (!context.listMayEnd) {
      return -1
    }

    const line = lines[lineIndex]

    // 如果 listMayEnd 为 true，说明上一行是空行
    // 需要检查当前行是否是列表延续或新列表项
    const listItem = isListItemStart(line)

    // 检查当前行是否有足够的缩进以作为列表内容
    const contentIndent = line.match(/^(\s*)/)?.[1].length ?? 0
    const isListContent = contentIndent > (context.listIndent ?? 0)

    // 只有当当前行不是列表内容且不是空行时，列表才算结束
    if (!listItem && !isListContent && !isEmptyLine(line)) {
      // 当前行不是列表内容且不是空行，列表在上一行的空行处结束
      return lineIndex - 1
    }

    return -1
  }
}

/**
 * 脚注边界检查器
 */
class FootnoteBoundaryChecker implements StabilityChecker {
  check(lineIndex: number, context: BlockContext, lines: string[]): number {
    const line = lines[lineIndex]
    const prevLine = lines[lineIndex - 1]

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
    }

    // 情况 2: 前一行是缩进行，可能是脚注延续
    // 注意：这个逻辑已经在 updateContext() 中通过 inFootnote 标志处理
    // 这里不需要重复判断，统一使用 updateContext() 的结果
    if (!isEmptyLine(prevLine) && isFootnoteContinuation(prevLine)) {
      // 在脚注中的缩进行或空行，保持不稳定
      // 实际的脚注边界判断由 updateContext() 中的 inFootnote 标志控制
      return -1
    }

    // 前一行非空时，新脚注定义开始（排除连续脚注定义）
    if (!isEmptyLine(prevLine) && isFootnoteDefinitionStart(line) && !isFootnoteDefinitionStart(prevLine)) {
      return lineIndex - 1
    }

    return -1
  }
}

/**
 * 新块边界检查器
 */
class NewBlockBoundaryChecker implements StabilityChecker {
  check(lineIndex: number, context: BlockContext, lines: string[]): number {
    const line = lines[lineIndex]
    const prevLine = lines[lineIndex - 1]

    if (isEmptyLine(prevLine)) {
      return -1
    }

    // 检测 Setext 标题下划线
    if (isSetextHeadingUnderline(line, prevLine)) {
      return lineIndex - 1
    }

    // 在列表中时，不检测 fence/heading/thematicBreak 作为边界
    // 因为它们可能是列表项的内容（带缩进的代码块等）
    if (context.inList) {
      return -1
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
    if (isListItemStart(line) && !isListItemStart(prevLine)) {
      return lineIndex - 1
    }

    return -1
  }
}

/**
 * 空行边界检查器
 */
class EmptyLineBoundaryChecker implements StabilityChecker {
  check(lineIndex: number, context: BlockContext, lines: string[]): number {
    const line = lines[lineIndex]
    const prevLine = lines[lineIndex - 1]

    // 空行标志段落结束
    // ⚠️ 修改：如果在列表中，空行不作为稳定边界
    if (isEmptyLine(line) && !isEmptyLine(prevLine) && !context.inList) {
      return lineIndex
    }

    return -1
  }
}

/**
 * 边界检测器
 */
export class BoundaryDetector {
  private readonly containerConfig: ContainerConfig | undefined
  private readonly checkers: StabilityChecker[]
  /** 缓存每一行结束时对应的 Context，避免重复计算 */
  private contextCache: Map<number, BlockContext> = new Map()

  constructor(config: BoundaryDetectorConfig = {}) {
    this.containerConfig = config.containers
    // 初始化稳定性检查器链
    this.checkers = [
      new ContainerBoundaryChecker(this.containerConfig),
      new ListBoundaryChecker(),
      new FootnoteBoundaryChecker(),
      new NewBlockBoundaryChecker(),
      new EmptyLineBoundaryChecker()
    ]
  }

  /**
   * 清空上下文缓存
   * 当 pendingStartLine 推进后调用，释放不再需要的缓存
   */
  clearContextCache(beforeLine: number): void {
    for (const key of this.contextCache.keys()) {
      if (key < beforeLine) {
        this.contextCache.delete(key)
      }
    }
  }

  /**
   * 查找稳定边界
   * 返回稳定边界行号和该行对应的上下文（用于后续更新，避免重复计算）
   *
   * @param lines 所有行
   * @param startLine 起始行
   * @param context 当前上下文
   * @returns 稳定边界结果
   */
  findStableBoundary(
    lines: string[],
    startLine: number,
    context: BlockContext
  ): StableBoundaryResult {
    let stableLine = -1
    let stableContext: BlockContext = context

    // 尝试从缓存获取 startLine - 1 的 context，如果匹配则直接用，否则用传入的 context
    let tempContext = startLine > 0 && this.contextCache.has(startLine - 1)
      ? { ...this.contextCache.get(startLine - 1)! }
      : { ...context }

    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i]
      const wasInFencedCode = tempContext.inFencedCode
      const wasInContainer = tempContext.inContainer
      const wasContainerDepth = tempContext.containerDepth
      const wasInList = tempContext.inList

      // 在 updateContext 之前检查明确的块边界
      // 如果当前行是代码块 fence 开始、新标题开始或分割线，且前一行不在 fenced code 中
      // 则应该标记前一个 block 为完成（即使在最后一行）
      // ⚠️ 关键：如果在列表中，不触发这个逻辑，因为这些可能是列表项的内容
      const prevLine = i > 0 ? lines[i - 1] : ''
      const isSetextUnderline = i > 0 && isSetextHeadingUnderline(line, prevLine)
      const hasExplicitBlockBoundary =
        detectFenceStart(line) ||  // 代码块 fence 开始
        isHeading(line) ||          // 新标题开始
        isThematicBreak(line)       // 分割线

      // 排除 Setext 下划线，因为它应该被视为标题的一部分，而不是独立块边界
      // 排除在列表中的情况，因为这些可能是列表项的内容
      if (!wasInFencedCode && !wasInContainer && !wasInList && hasExplicitBlockBoundary && !isSetextUnderline) {
        // 前一个 block 已完成，可以标记为稳定边界
        stableLine = i - 1
        stableContext = { ...tempContext }
      }

      tempContext = updateContext(line, tempContext, this.containerConfig)

      // 写入缓存：第 i 行结束后的 context
      this.contextCache.set(i, { ...tempContext })

      if (wasInFencedCode && !tempContext.inFencedCode) {
        if (i < lines.length - 1) {
          stableLine = i
          stableContext = { ...tempContext }
        }
        continue
      }

      if (tempContext.inFencedCode) {
        continue
      }

      if (wasInContainer && wasContainerDepth === 1 && !tempContext.inContainer) {
        if (i < lines.length - 1) {
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

      // 使用检查器链检查稳定性
      const stablePoint = this.checkStability(i, tempContext, lines)
      if (stablePoint >= 0) {
        stableLine = stablePoint
        stableContext = { ...tempContext }
      }
    }

    return { line: stableLine, context: stableContext }
  }

  /**
   * 检查指定行是否是稳定边界
   * 使用责任链模式，依次调用各个检查器
   *
   * @param lineIndex 行索引
   * @param context 当前上下文
   * @param lines 所有行
   * @returns 稳定边界行号，如果不是稳定边界返回 -1
   */
  private checkStability(
    lineIndex: number,
    context: BlockContext,
    lines: string[]
  ): number {
    // 第一行永远不稳定
    if (lineIndex === 0) {
      return -1
    }

    const line = lines[lineIndex]
    const prevLine = lines[lineIndex - 1]

    // ⚠️ 脚注特殊处理：在脚注中，空行是段落分隔，不是稳定边界
    // 只有脚注定义开始才算脚注的稳定边界
    if (context.inFootnote) {
      // ⚠️ 关键修复：在脚注中，不应该检测到代码块作为稳定边界
      // 因为脚注内容的缩进（4个空格）可能被误判为代码块 fence
      // 检查前一行是否是脚注定义的开始（脚注单行内容的情况）
      if (isFootnoteDefinitionStart(prevLine) && !isEmptyLine(line)) {
        // ⚠️ 关键：如果当前行是脚注延续（缩进），则不应该作为稳定边界
        // 因为这是脚注内容的一部分，而不是新块
        if (isFootnoteContinuation(line)) {
          return -1
        }
        return lineIndex - 1
      }
      // ⚠️ 另一个关键修复：如果前一行在脚注中（缩进或延续），
      // 且当前行也是缩进或延续，则不应该作为稳定边界
      // 这样可以避免脚注的多行内容被错误分割
      if (isEmptyLine(prevLine) && (isEmptyLine(line) || isFootnoteContinuation(line))) {
        return -1
      }
      // 其他情况（包括空行）都不作为脚注的稳定边界
      return -1
    }

    // 前一行是独立块（标题、分割线），该块已完成
    if (isHeading(prevLine) || isThematicBreak(prevLine)) {
      return lineIndex - 1
    }

    // 前一行是 Setext 标题下划线，该标题已完成
    if (isSetextHeadingUnderline(prevLine, lines[lineIndex - 2])) {
      return lineIndex - 1
    }

    // 最后一行不稳定（可能还有更多内容）
    const isLastLine = lineIndex >= lines.length - 1
    if (isLastLine) {
      return -1
    }

    // 依次调用检查器链，返回第一个匹配的稳定边界
    for (const checker of this.checkers) {
      const stablePoint = checker.check(lineIndex, context, lines)
      if (stablePoint >= 0) {
        return stablePoint
      }
    }

    return -1
  }
}

