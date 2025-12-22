import type { PhrasingContent } from 'mdast'
import type { TextNodeWithChunks } from './types'

/**
 * 类型守卫：检查是否是带 chunks 的文本节点
 */
export function hasChunks(node: PhrasingContent): node is TextNodeWithChunks {
  return node.type === 'text' && 'chunks' in node && Array.isArray((node as TextNodeWithChunks).chunks)
}

/**
 * 获取文本节点的稳定部分（不需要动画）
 */
export function getStableText(node: TextNodeWithChunks): string {
  if (!node.chunks || node.chunks.length === 0) {
    return node.value
  }
  return node.value.slice(0, node.stableLength ?? 0)
}

