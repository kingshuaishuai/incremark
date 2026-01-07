/**
 * 环境检测工具函数
 *
 * 用于 SSR 兼容性检测
 */

/**
 * 检测是否在浏览器环境中
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

/**
 * 检测是否在服务器环境中 (SSR)
 */
export function isServer(): boolean {
  return typeof window === 'undefined'
}

/**
 * 检测 Clipboard API 是否可用
 */
export function isClipboardAvailable(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.clipboard
}
