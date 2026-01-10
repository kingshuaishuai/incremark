/**
 * @file Animated Chunks Tracker
 *
 * @description
 * 跟踪已播放过动画的 chunk，避免重复播放动画导致闪烁
 *
 * @author Incremark Team
 * @license MIT
 */

/**
 * 已播放过动画的 chunk 的 createdAt 时间戳集合
 * 使用全局 Set 来跟踪，这样即使组件重新渲染，也能知道哪些 chunk 已经播放过动画
 */
const animatedChunks = new Set<number>()

/**
 * 判断 chunk 是否应该播放动画
 * 只有首次出现的 chunk 才播放动画，之后重新渲染时不再播放
 */
export function shouldAnimateChunk(createdAt: number): boolean {
  if (animatedChunks.has(createdAt)) {
    return false
  }
  // 标记为已播放动画
  animatedChunks.add(createdAt)
  return true
}

/**
 * 清空已动画的 chunk 记录
 * 在 reset 时调用，让新的内容可以重新播放动画
 */
export function clearAnimatedChunks(): void {
  animatedChunks.clear()
}
