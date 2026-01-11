/**
 * @file id.ts - ID 生成工具
 * @description 提供各种 ID 生成函数
 */

/**
 * 生成唯一的 parser ID
 * @param prefix - ID 前缀，默认为 'parser'
 * @returns 唯一的 parser ID
 */
export function generateParserId(prefix = 'parser'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}
