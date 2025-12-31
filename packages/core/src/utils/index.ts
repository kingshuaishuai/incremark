/**
 * 工具函数
 */

import type { Definition, FootnoteDefinition, RootContent } from "mdast"

/**
 * 生成唯一 ID
 */
let idCounter = 0
export function generateId(prefix = 'block'): string {
  return `${prefix}-${++idCounter}`
}

/**
 * 重置 ID 计数器（用于测试）
 */
export function resetIdCounter(): void {
  idCounter = 0
}

/**
 * 计算行的偏移量
 */
export function calculateLineOffset(lines: string[], lineIndex: number): number {
  let offset = 0
  for (let i = 0; i < lineIndex && i < lines.length; i++) {
    offset += lines[i].length + 1 // +1 for newline
  }
  return offset
}

/**
 * 将文本按行分割
 */
export function splitLines(text: string): string[] {
  return text.split('\n')
}

/**
 * 合并行为文本
 */
export function joinLines(lines: string[], start: number, end: number): string {
  return lines.slice(start, end + 1).join('\n')
}

export function isDefinitionNode(node: RootContent): node is Definition {
  return node.type === 'definition'
}

export function isFootnoteDefinitionNode(node: RootContent): node is FootnoteDefinition {
  return node.type === 'footnoteDefinition'
}

/**
 * AST 节点遍历器
 * 深度优先遍历 AST 节点
 *
 * @param node 起始节点
 * @param visitor 访问者函数，返回 true 可以提前终止遍历
 */
export function traverseAst(
  node: RootContent,
  visitor: (node: RootContent) => boolean | void
): void {
  // 访问当前节点
  const stopEarly = visitor(node)
  if (stopEarly === true) {
    return
  }

  // 递归遍历子节点
  if ('children' in node && Array.isArray(node.children)) {
    for (const child of node.children) {
      traverseAst(child as RootContent, visitor)
    }
  }
}

/**
 * 从 AST 节点中收集指定类型的节点
 *
 * @param node 起始节点
 * @param predicate 匹配谓词
 * @returns 匹配的节点列表
 */
export function collectAstNodes<T extends RootContent>(
  node: RootContent,
  predicate: (node: RootContent) => node is T
): T[] {
  const results: T[] = []

  traverseAst(node, (node) => {
    if (predicate(node)) {
      results.push(node)
    }
  })

  return results
}