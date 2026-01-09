/**
 * @file Cursor Utils - 光标工具函数
 *
 * @description
 * 用于在 AST 节点末尾添加光标的工具函数。
 *
 * @author Incremark Team
 * @license MIT
 */

import type { RootContent } from '@incremark/core'

/**
 * 在节点末尾添加光标
 *
 * @param node - 要添加光标的节点
 * @param cursor - 光标字符
 * @returns 添加了光标的新节点
 */
export function addCursorToNode(node: RootContent, cursor: string): RootContent {
  // 代码块不应该添加光标（会破坏代码高亮）
  if (node.type === 'code') {
    return node
  }

  const cloned = JSON.parse(JSON.stringify(node))

  function addToLast(n: { children?: unknown[]; type?: string; value?: string }): boolean {
    // 跳过代码块
    if (n.type === 'code') {
      return false
    }

    if (n.children && n.children.length > 0) {
      for (let i = n.children.length - 1; i >= 0; i--) {
        if (addToLast(n.children[i] as { children?: unknown[]; type?: string; value?: string })) {
          return true
        }
      }
      n.children.push({ type: 'text', value: cursor })
      return true
    }
    if (n.type === 'text' && typeof n.value === 'string') {
      n.value += cursor
      return true
    }
    if (typeof n.value === 'string') {
      n.value += cursor
      return true
    }
    return false
  }

  addToLast(cloned)
  return cloned
}
