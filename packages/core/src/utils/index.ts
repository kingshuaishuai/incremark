/**
 * 工具函数
 */

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

