/**
 * 块类型检测与边界判断
 *
 * Markdown 块级元素的识别规则
 */

import type { BlockContext, ContainerConfig, ContainerMatch } from '../types'

// ============ 预编译正则表达式（性能优化） ============

const RE_FENCE_START = /^(\s*)((`{3,})|(~{3,}))/
const RE_EMPTY_LINE = /^\s*$/
const RE_HEADING = /^#{1,6}\s/
const RE_THEMATIC_BREAK = /^(\*{3,}|-{3,}|_{3,})\s*$/
const RE_UNORDERED_LIST = /^(\s*)([-*+])\s/
const RE_ORDERED_LIST = /^(\s*)(\d{1,9})[.)]\s/
const RE_BLOCKQUOTE = /^\s{0,3}>/
const RE_HTML_BLOCK_1 = /^\s{0,3}<(script|pre|style|textarea|!--|!DOCTYPE|\?|!\[CDATA\[)/i
const RE_HTML_BLOCK_2 = /^\s{0,3}<\/?[a-zA-Z][a-zA-Z0-9-]*(\s|>|$)/
const RE_TABLE_DELIMITER = /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?$/
const RE_ESCAPE_SPECIAL = /[.*+?^${}()|[\]\\]/g
const RE_FOOTNOTE_DEFINITION = /^\[\^([^\]]+)\]:\s/
const RE_FOOTNOTE_CONTINUATION = /^(?:    |\t)/

/** fence 结束模式缓存 */
const fenceEndPatternCache = new Map<string, RegExp>()

/** 容器模式缓存 */
const containerPatternCache = new Map<string, RegExp>()

// ============ 代码块检测 ============

/**
 * 检测行是否是代码块 fence 开始
 */
export function detectFenceStart(line: string): { char: string; length: number } | null {
  const match = line.match(RE_FENCE_START)
  if (match) {
    const fence = match[2]
    const char = fence[0]
    return { char, length: fence.length }
  }
  return null
}

/**
 * 检测行是否是代码块 fence 结束
 */
export function detectFenceEnd(line: string, context: BlockContext): boolean {
  if (!context.inFencedCode || !context.fenceChar || !context.fenceLength) {
    return false
  }

  // 使用缓存的正则表达式
  const cacheKey = `${context.fenceChar}-${context.fenceLength}`
  let pattern = fenceEndPatternCache.get(cacheKey)
  if (!pattern) {
    pattern = new RegExp(`^\\s{0,3}${context.fenceChar}{${context.fenceLength},}\\s*$`)
    fenceEndPatternCache.set(cacheKey, pattern)
  }
  return pattern.test(line)
}

// ============ 行类型检测 ============

/**
 * 检测是否是空行或仅包含空白字符
 */
export function isEmptyLine(line: string): boolean {
  return RE_EMPTY_LINE.test(line)
}

/**
 * 检测是否是标题行
 */
export function isHeading(line: string): boolean {
  return RE_HEADING.test(line)
}

/**
 * 检测是否是 thematic break（水平线）
 */
export function isThematicBreak(line: string): boolean {
  return RE_THEMATIC_BREAK.test(line.trim())
}

/**
 * 检测是否是列表项开始
 *
 * CommonMark 规范：列表项可以是以下形式：
 * - `- text`（无缩进）
 * - `1. text`（有序列表）
 * - `    - text`（缩进4个空格，作为上一个列表项的延续）
 *
 * 注意：`    - text` 这种形式，虽然 `-` 后面没有空格，
 * 但因为前面有4个空格的缩进，所以是列表项的有效形式。
 */
export function isListItemStart(line: string): { ordered: boolean; indent: number } | null {
  // 先检查是否以列表标记开头（-、*、+、数字）
  const hasListMarker = /^(\s*)([-*+]|\d{1,9}[.)])/.test(line)
  
  if (!hasListMarker) {
    return null
  }
  
  // 如果有列表标记，检查是否是列表项的延续（缩进4+个空格）
  const match = line.match(/^(\s*)([-*+]|\d{1,9}[.)])(.*)/)
  if (match) {
    const indent = match[1].length
    const marker = match[2]
    const rest = match[3]
    
    // 如果标记后有内容，检查是否是有效的列表项
    if (rest.trim()) {
      const isOrdered = /^\d{1,9}[.)]/.test(marker)
      return { ordered: isOrdered, indent }
    }
    
    // 标记后只有空格，可能是缩进的列表项
    // 如 "    - text" 或 "        1. text"
    if (/^\s+$/.test(rest)) {
      const isOrdered = /^\d{1,9}[.)]/.test(marker)
      return { ordered: isOrdered, indent }
    }
  }
  
  return null
}

/**
 * 检测是否是引用块开始
 */
export function isBlockquoteStart(line: string): boolean {
  return RE_BLOCKQUOTE.test(line)
}

/**
 * 检测是否是 HTML 块
 */
export function isHtmlBlock(line: string): boolean {
  return RE_HTML_BLOCK_1.test(line) || RE_HTML_BLOCK_2.test(line)
}

/**
 * 检测表格分隔行
 */
export function isTableDelimiter(line: string): boolean {
  return RE_TABLE_DELIMITER.test(line.trim())
}

// ============ 脚注检测 ============

/**
 * 检测是否是脚注定义的起始行
 * 格式: [^id]: content
 * 
 * @example
 * isFootnoteDefinitionStart('[^1]: 脚注内容') // true
 * isFootnoteDefinitionStart('[^note]: 内容') // true
 * isFootnoteDefinitionStart('    缩进内容')   // false
 */
export function isFootnoteDefinitionStart(line: string): boolean {
  return RE_FOOTNOTE_DEFINITION.test(line)
}

/**
 * 检测是否是脚注定义的延续行（缩进行）
 * 至少4个空格或1个tab
 * 
 * @example
 * isFootnoteContinuation('    第二行')  // true
 * isFootnoteContinuation('\t第二行')    // true
 * isFootnoteContinuation('  两个空格')   // false
 */
export function isFootnoteContinuation(line: string): boolean {
  return RE_FOOTNOTE_CONTINUATION.test(line)
}

// ============ 容器检测 ============

/**
 * 检测容器开始或结束
 *
 * 支持格式：
 * - ::: name      开始
 * - ::: name attr 开始（带属性）
 * - :::           结束
 * - :::::: name   开始（更长的标记，用于嵌套）
 */
export function detectContainer(line: string, config?: ContainerConfig): ContainerMatch | null {
  const marker = config?.marker || ':'
  const minLength = config?.minMarkerLength || 3

  // 使用缓存的正则表达式
  const cacheKey = `${marker}-${minLength}`
  let pattern = containerPatternCache.get(cacheKey)
  if (!pattern) {
    const escapedMarker = marker.replace(RE_ESCAPE_SPECIAL, '\\$&')
    // 支持两种格式:
    // 1. ::: name attr   （有空格分隔）
    // 2. :::name{...}    （directive 语法，无空格）
    pattern = new RegExp(
      `^(\\s*)(${escapedMarker}{${minLength},})(?:\\s*(\\w[\\w-]*))?(?:\\{[^}]*\\})?(?:\\s+(.*))?\\s*$`
    )
    containerPatternCache.set(cacheKey, pattern)
  }

  const match = line.match(pattern)
  if (!match) {
    return null
  }

  const markerLength = match[2].length
  const name = match[3] || ''
  const isEnd = !name && !match[4]

  if (!isEnd && config?.allowedNames && config.allowedNames.length > 0) {
    if (!config.allowedNames.includes(name)) {
      return null
    }
  }

  return { name, markerLength, isEnd }
}

/**
 * 检测容器结束
 */
export function detectContainerEnd(
  line: string,
  context: BlockContext,
  config?: ContainerConfig
): boolean {
  if (!context.inContainer || !context.containerMarkerLength) {
    return false
  }

  const result = detectContainer(line, config)
  if (!result) {
    return false
  }

  return result.isEnd && result.markerLength >= context.containerMarkerLength
}

// ============ 边界检测 ============

/**
 * 判断两行之间是否构成块边界
 */
export function isBlockBoundary(
  prevLine: string,
  currentLine: string,
  context: BlockContext
): boolean {
  if (context.inFencedCode) {
    return detectFenceEnd(currentLine, context)
  }

  if (isEmptyLine(prevLine) && !isEmptyLine(currentLine)) {
    return true
  }

  if (isHeading(currentLine) && !isEmptyLine(prevLine)) {
    return true
  }

  if (isThematicBreak(currentLine)) {
    return true
  }

  if (detectFenceStart(currentLine)) {
    return true
  }

  return false
}

// ============ 上下文管理 ============

/**
 * 上下文更新器接口
 */
interface ContextUpdater {
  /**
   * 尝试更新上下文
   * @param line 当前行
   * @param context 当前上下文
   * @returns 更新后的上下文，如果不处理返回 null
   */
  update(line: string, context: BlockContext, config?: ContainerConfig): BlockContext | null
}

/**
 * 代码块上下文更新器
 * 优先级：1（最高）
 */
class CodeContextUpdater implements ContextUpdater {
  update(line: string, context: BlockContext): BlockContext | null {
    const newContext = { ...context }

    if (context.inFencedCode) {
      if (detectFenceEnd(line, context)) {
        newContext.inFencedCode = false
        newContext.fenceChar = undefined
        newContext.fenceLength = undefined
        return newContext
      }
      return null // 在代码块内，不处理其他逻辑
    }

    const fence = detectFenceStart(line)
    if (fence) {
      newContext.inFencedCode = true
      newContext.fenceChar = fence.char
      newContext.fenceLength = fence.length
      return newContext
    }

    return null
  }
}

/**
 * 容器上下文更新器
 * 优先级：2
 */
class ContainerContextUpdater implements ContextUpdater {
  update(line: string, context: BlockContext, config?: ContainerConfig): BlockContext | null {
    if (config === undefined) {
      return null
    }

    const newContext = { ...context }

    if (context.inContainer) {
      // 检查是否是容器结束
      if (detectContainerEnd(line, context, config)) {
        newContext.containerDepth = context.containerDepth - 1
        if (newContext.containerDepth === 0) {
          newContext.inContainer = false
          newContext.containerMarkerLength = undefined
          newContext.containerName = undefined
        }
        return newContext
      }

      // 检查是否是嵌套容器开始
      const nested = detectContainer(line, config)
      if (nested && !nested.isEnd) {
        newContext.containerDepth = context.containerDepth + 1
        return newContext
      }

      // ⚠️ 关键：在容器内，无论是什么内容（空行、列表、段落等），都保持 inContainer = true
      // 只有容器结束标记才能改变容器状态
      // 这里不需要做任何操作，因为 newContext 已经复制了 context，inContainer 已经是 true
      return newContext
    } else {
      // 不在容器内，检查是否是容器开始
      const container = detectContainer(line, config)
      if (container && !container.isEnd) {
        newContext.inContainer = true
        newContext.containerMarkerLength = container.markerLength
        newContext.containerName = container.name
        newContext.containerDepth = 1
        return newContext
      }
    }

    return null
  }
}

/**
 * 脚注上下文更新器
 * 优先级：3
 */
class FootnoteContextUpdater implements ContextUpdater {
  update(line: string, context: BlockContext): BlockContext | null {
    const newContext = { ...context }

    // 脚注定义开始（不在脚注中）
    if (!context.inFootnote && isFootnoteDefinitionStart(line)) {
      const identifier = line.match(RE_FOOTNOTE_DEFINITION)?.[1]
      newContext.inFootnote = true
      newContext.footnoteIdentifier = identifier
      return newContext
    }

    // 在脚注中
    if (context.inFootnote) {
      // 遇到新脚注定义：前一个脚注结束，新脚注开始
      if (isFootnoteDefinitionStart(line)) {
        const identifier = line.match(RE_FOOTNOTE_DEFINITION)?.[1]
        newContext.footnoteIdentifier = identifier
        return newContext
      }

      // 空行：保持脚注状态（支持脚注内部的多段落）
      // 返回当前上下文，阻止责任链继续
      if (isEmptyLine(line)) {
        return { ...context }
      }

      // 列表项处理
      const listItem = isListItemStart(line)
      if (listItem) {
        // 无缩进列表项：脚注结束
        // 缩进列表项：脚注的延续内容（包含嵌套列表）
        if (listItem.indent === 0) {
          newContext.inFootnote = false
          newContext.footnoteIdentifier = undefined
        } else {
          // 缩进列表项：脚注的延续内容，返回当前上下文阻止责任链
          return { ...context }
        }
        return null // 让列表处理器处理无缩进情况
      }

      // 其他块结束脚注
      if (isHeading(line) || detectFenceStart(line) || isBlockquoteStart(line)) {
        newContext.inFootnote = false
        newContext.footnoteIdentifier = undefined
        return newContext
      }

      // 脚注延续：以4+空格开头
      if (isFootnoteContinuation(line)) {
        return { ...context }
      }

      // 其他内容（普通文本、表格等），脚注结束
      newContext.inFootnote = false
      newContext.footnoteIdentifier = undefined
      return newContext
    }

    return null
  }
}

/**
 * 列表上下文更新器
 * 优先级：4
 */
class ListContextUpdater implements ContextUpdater {
  /**
   * 检测是否是列表项的延续内容（缩进内容或空行）
   */
  private isListContinuation(line: string, listIndent: number): boolean {
    // 空行可能是列表内部的段落分隔
    if (isEmptyLine(line)) {
      return true
    }

    // 检查是否有足够的缩进
    const contentIndent = line.match(/^(\s*)/)?.[1].length ?? 0
    return contentIndent > listIndent
  }

  update(line: string, context: BlockContext): BlockContext | null {
    const newContext = { ...context }
    const listItem = isListItemStart(line)

    if (context.inList) {
      // 已经在列表中
      if (context.listMayEnd) {
        // 上一行是空行，需要确认列表是否结束
        if (listItem) {
          // 遇到新的列表项
          // 检查是否是同类型列表的延续
          if (listItem.ordered === context.listOrdered && listItem.indent === context.listIndent) {
            // 同类型同级别列表项，列表继续
            newContext.listMayEnd = false
            return newContext
          }
          // 不同类型或不同级别，列表结束，新列表开始
          newContext.listOrdered = listItem.ordered
          newContext.listIndent = listItem.indent
          newContext.listMayEnd = false
          return newContext
        } else if (this.isListContinuation(line, context.listIndent ?? 0)) {
          // 缩进内容或空行，列表继续
          newContext.listMayEnd = isEmptyLine(line)
          return newContext
        } else {
          // 非列表内容，列表结束
          newContext.inList = false
          newContext.listOrdered = undefined
          newContext.listIndent = undefined
          newContext.listMayEnd = false
          return newContext
        }
      } else {
        // 上一行不是空行
        if (listItem) {
          // 新列表项（可能是同级或嵌套）
          return null
        } else if (isEmptyLine(line)) {
          // 遇到空行，列表可能结束
          newContext.listMayEnd = true
          return newContext
        } else if (this.isListContinuation(line, context.listIndent ?? 0)) {
          // 缩进内容，列表继续
          return null
        } else {
          // 非缩进非列表内容，列表结束
          newContext.inList = false
          newContext.listOrdered = undefined
          newContext.listIndent = undefined
          newContext.listMayEnd = false
          return newContext
        }
      }
    } else {
      // 不在列表中
      if (listItem) {
        // 列表开始
        newContext.inList = true
        newContext.listOrdered = listItem.ordered
        newContext.listIndent = listItem.indent
        newContext.listMayEnd = false
        return newContext
      }
    }

    return null
  }
}

/**
 * 创建初始上下文
 */
export function createInitialContext(): BlockContext {
  return {
    inFencedCode: false,
    listDepth: 0,
    blockquoteDepth: 0,
    inContainer: false,
    containerDepth: 0,
    inList: false,
    inFootnote: false,
    footnoteIdentifier: undefined
  }
}

/**
 * 上下文管理器
 * 使用责任链模式更新上下文
 */
class ContextManager {
  private readonly updaters: ContextUpdater[] = [
    new CodeContextUpdater(),
    new ContainerContextUpdater(),
    new FootnoteContextUpdater(),
    new ListContextUpdater()
  ]

  /**
   * 更新上下文（处理一行后）
   *
   * @param line 当前行
   * @param context 当前上下文
   * @param containerConfig 容器配置
   * @returns 更新后的上下文
   */
  update(line: string, context: BlockContext, containerConfig?: ContainerConfig | boolean): BlockContext {
    // 规范化容器配置
    const config = containerConfig === true ? {} : containerConfig === false ? undefined : containerConfig

    // 依次调用上下文更新器
    for (const updater of this.updaters) {
      const result = updater.update(line, context, config)
      if (result !== null) {
        return result
      }
    }

    // 没有任何更新器处理，返回原上下文
    return { ...context }
  }
}

// 上下文管理器单例
const contextManager = new ContextManager()

/**
 * 更新上下文（处理一行后）
 *
 * @param line 当前行
 * @param context 当前上下文
 * @param containerConfig 容器配置
 * @returns 更新后的上下文
 */
export function updateContext(
  line: string,
  context: BlockContext,
  containerConfig?: ContainerConfig | boolean
): BlockContext {
  return contextManager.update(line, context, containerConfig)
}

