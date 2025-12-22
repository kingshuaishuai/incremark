import type { Text } from 'mdast'

export interface TextChunk {
  /** 文本内容 */
  text: string
  /** 创建时间戳 */
  createdAt: number
}

/**
 * 扩展的文本节点（支持 chunks）
 */
export interface TextNodeWithChunks extends Text {
  stableLength?: number
  chunks?: TextChunk[]
}

