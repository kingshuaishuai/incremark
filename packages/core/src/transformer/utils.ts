import type { RootContent } from 'mdast'

/**
 * 文本块片段（用于渐入动画）
 */
export interface TextChunk {
  /** 文本内容 */
  text: string
  /** 创建时间戳 */
  createdAt: number
}

/**
 * 扩展的文本节点（支持 chunks）
 */
export interface TextNodeWithChunks {
  type: string
  value: string
  /** 稳定部分的长度（不需要动画） */
  stableLength?: number
  /** 临时的文本片段，用于渐入动画 */
  chunks?: TextChunk[]
  [key: string]: any
}

/**
 * 计算 AST 节点的总字符数
 */
export function countChars(node: RootContent): number {
  let count = 0

  function traverse(n: any): void {
    // 文本类节点
    if (n.value && typeof n.value === 'string') {
      count += n.value.length
      return
    }

    // 容器节点，递归处理子节点
    if (n.children && Array.isArray(n.children)) {
      for (const child of n.children) {
        traverse(child)
      }
    }
  }

  traverse(node)
  return count
}

/**
 * 累积的 chunks 信息
 */
export interface AccumulatedChunks {
  /** 已经稳定显示的字符数（不需要动画） */
  stableChars: number
  /** 累积的 chunk 列表 */
  chunks: TextChunk[]
}

/**
 * 截断 AST 节点，只保留前 maxChars 个字符
 * 支持 chunks（用于渐入动画）
 * 
 * @param node 原始节点
 * @param maxChars 最大字符数
 * @param accumulatedChunks 累积的 chunks 信息（用于渐入动画）
 * @returns 截断后的节点，如果 maxChars <= 0 返回 null
 */
export function sliceAst(
  node: RootContent, 
  maxChars: number,
  accumulatedChunks?: AccumulatedChunks
): RootContent | null {
  if (maxChars <= 0) return null

  let remaining = maxChars
  let charIndex = 0
  
  // 计算 chunks 在文本中的范围
  let chunkRanges: { start: number, end: number, chunk: TextChunk }[] = []
  if (accumulatedChunks && accumulatedChunks.chunks.length > 0) {
    let chunkStart = accumulatedChunks.stableChars
    for (const chunk of accumulatedChunks.chunks) {
      chunkRanges.push({
        start: chunkStart,
        end: chunkStart + chunk.text.length,
        chunk
      })
      chunkStart += chunk.text.length
    }
  }

  function process(n: any): any {
    if (remaining <= 0) return null

    // 文本类节点：截断 value，可能添加 chunks
    if (n.value && typeof n.value === 'string') {
      const take = Math.min(n.value.length, remaining)
      remaining -= take
      if (take === 0) return null

      const slicedValue = n.value.slice(0, take)
      const nodeStart = charIndex
      const nodeEnd = charIndex + take
      charIndex += take
      
      const result: TextNodeWithChunks = { ...n, value: slicedValue }
      
      // 检查是否有 chunks 落在这个节点范围内
      if (chunkRanges.length > 0 && accumulatedChunks) {
        const nodeChunks: TextChunk[] = []
        let firstChunkLocalStart = take  // 第一个 chunk 在节点中的起始位置
        
        for (const range of chunkRanges) {
          // 计算 chunk 与当前节点的交集
          const overlapStart = Math.max(range.start, nodeStart)
          const overlapEnd = Math.min(range.end, nodeEnd)
          
          if (overlapStart < overlapEnd) {
            // 有交集，提取对应的文本
            const localStart = overlapStart - nodeStart
            const localEnd = overlapEnd - nodeStart
            const chunkText = slicedValue.slice(localStart, localEnd)
            
            if (chunkText.length > 0) {
              // 记录第一个 chunk 的起始位置
              if (nodeChunks.length === 0) {
                firstChunkLocalStart = localStart
              }
              nodeChunks.push({
                text: chunkText,
                createdAt: range.chunk.createdAt
              })
            }
          }
        }
        
        if (nodeChunks.length > 0) {
          result.stableLength = firstChunkLocalStart
          result.chunks = nodeChunks
        }
      }
      
      return result
    }

    // 容器节点：递归处理 children
    if (n.children && Array.isArray(n.children)) {
      const newChildren: any[] = []
      for (const child of n.children) {
        if (remaining <= 0) break
        const processed = process(child)
        if (processed) {
          newChildren.push(processed)
        }
      }
      if (newChildren.length === 0) {
        return null
      }
      return { ...n, children: newChildren }
    }

    // 其他节点（如 thematicBreak, image）
    remaining -= 1
    charIndex += 1
    return { ...n }
  }

  return process(node)
}

/**
 * 深拷贝 AST 节点
 */
export function cloneNode<T extends RootContent>(node: T): T {
  return JSON.parse(JSON.stringify(node))
}
