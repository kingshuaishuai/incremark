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
  detectFenceStart
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
 * 边界检测器
 */
export class BoundaryDetector {
  private readonly containerConfig: ContainerConfig | undefined

  constructor(config: BoundaryDetectorConfig = {}) {
    this.containerConfig = config.containers
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
    let tempContext = { ...context }

    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i]
      const wasInFencedCode = tempContext.inFencedCode
      const wasInContainer = tempContext.inContainer
      const wasContainerDepth = tempContext.containerDepth

      tempContext = updateContext(line, tempContext, this.containerConfig)

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

      // 传入上下文信息，让 checkStability 能够判断是否在容器内
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
    }

    // 前一行是独立块（标题、分割线），该块已完成
    if (isHeading(prevLine) || isThematicBreak(prevLine)) {
      return lineIndex - 1
    }

    // 最后一行不稳定（可能还有更多内容）
    if (lineIndex >= lines.length - 1) {
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
    // 注意：这个逻辑已经在 updateContext() 中通过 inFootnote 标志处理
    // 这里不需要重复判断，统一使用 updateContext() 的结果
    if (!isEmptyLine(prevLine) && isFootnoteContinuation(prevLine)) {
      // 在脚注中的缩进行或空行，保持不稳定
      // 实际的脚注边界判断由 updateContext() 中的 inFootnote 标志控制
      return -1
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
}

