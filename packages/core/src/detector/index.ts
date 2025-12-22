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
const RE_FOOTNOTE_DEFINITION = /^\[\^[^\]]+\]:\s/
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
 */
export function isListItemStart(line: string): { ordered: boolean; indent: number } | null {
  // 无序列表: - * +
  const unordered = line.match(RE_UNORDERED_LIST)
  if (unordered) {
    return { ordered: false, indent: unordered[1].length }
  }

  // 有序列表: 1. 2) 等
  const ordered = line.match(RE_ORDERED_LIST)
  if (ordered) {
    return { ordered: true, indent: ordered[1].length }
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
    pattern = new RegExp(
      `^(\\s*)(${escapedMarker}{${minLength},})(?:\\s+(\\w[\\w-]*))?(?:\\s+(.*))?\\s*$`
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
 * 创建初始上下文
 */
export function createInitialContext(): BlockContext {
  return {
    inFencedCode: false,
    listDepth: 0,
    blockquoteDepth: 0,
    inContainer: false,
    containerDepth: 0
  }
}

/**
 * 更新上下文（处理一行后）
 */
export function updateContext(
  line: string,
  context: BlockContext,
  containerConfig?: ContainerConfig | boolean
): BlockContext {
  const newContext = { ...context }

  const containerCfg =
    containerConfig === true ? {} : containerConfig === false ? undefined : containerConfig

  // 代码块优先级最高
  if (context.inFencedCode) {
    if (detectFenceEnd(line, context)) {
      newContext.inFencedCode = false
      newContext.fenceChar = undefined
      newContext.fenceLength = undefined
    }
    return newContext
  }

  const fence = detectFenceStart(line)
  if (fence) {
    newContext.inFencedCode = true
    newContext.fenceChar = fence.char
    newContext.fenceLength = fence.length
    return newContext
  }

  // 容器处理
  if (containerCfg !== undefined) {
    if (context.inContainer) {
      if (detectContainerEnd(line, context, containerCfg)) {
        newContext.containerDepth = context.containerDepth - 1
        if (newContext.containerDepth === 0) {
          newContext.inContainer = false
          newContext.containerMarkerLength = undefined
          newContext.containerName = undefined
        }
        return newContext
      }

      const nested = detectContainer(line, containerCfg)
      if (nested && !nested.isEnd) {
        newContext.containerDepth = context.containerDepth + 1
        return newContext
      }
    } else {
      const container = detectContainer(line, containerCfg)
      if (container && !container.isEnd) {
        newContext.inContainer = true
        newContext.containerMarkerLength = container.markerLength
        newContext.containerName = container.name
        newContext.containerDepth = 1
        return newContext
      }
    }
  }

  return newContext
}

