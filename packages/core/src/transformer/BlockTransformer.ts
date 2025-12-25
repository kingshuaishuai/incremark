import type { RootContent } from 'mdast'
import type { AstNode } from '../types'
import type {
  SourceBlock,
  DisplayBlock,
  TransformerOptions,
  TransformerState,
  TransformerPlugin,
  AnimationEffect
} from './types'
import { countChars as defaultCountChars, sliceAst as defaultSliceAst, appendToAst, type TextChunk, type AccumulatedChunks } from './utils'

/**
 * Block Transformer
 *
 * 用于控制 blocks 的逐步显示（打字机效果）
 * 作为解析器和渲染器之间的中间层
 *
 * 特性：
 * - 使用 requestAnimationFrame 实现流畅动画
 * - 支持随机步长，模拟真实打字效果
 * - 支持 typing 动画效果
 * - 页面不可见时自动暂停，节省资源
 * - 插件系统支持自定义节点处理
 *
 * @example
 * ```typescript
 * const transformer = new BlockTransformer({
 *   charsPerTick: [1, 3],  // 随机 1-3 个字符
 *   tickInterval: 30,
 *   effect: 'typing',
 *   onChange: (displayBlocks) => {
 *     // 更新 UI
 *   }
 * })
 *
 * // 推入新 blocks
 * transformer.push(blocks)
 *
 * // 获取当前显示状态
 * const displayBlocks = transformer.getDisplayBlocks()
 * ```
 */
export class BlockTransformer<T = unknown> {
  private state: TransformerState<T>
  private options: {
    charsPerTick: number | [number, number]
    tickInterval: number
    effect: AnimationEffect
    plugins: TransformerPlugin[]
    onChange: (displayBlocks: DisplayBlock<T>[]) => void
    onAllComplete: (() => void) | null
    pauseOnHidden: boolean
  }
  private rafId: number | null = null
  private lastTickTime = 0
  private isRunning = false
  private isPaused = false
  private chunks: TextChunk[] = []  // 累积的 chunks（用于 fade-in 动画）
  private visibilityHandler: (() => void) | null = null
  
  // ============ 性能优化：缓存机制 ============
  /** 缓存的已截断 displayNode（稳定的部分，避免重复遍历） */
  private cachedDisplayNode: RootContent | null = null
  /** 缓存的字符数（避免重复计算） */
  private cachedTotalChars: number | null = null
  /** 当前缓存的进度（对应 cachedDisplayNode） */
  private cachedProgress: number = 0

  constructor(options: TransformerOptions = {}) {
    this.options = {
      charsPerTick: options.charsPerTick ?? 1,
      tickInterval: options.tickInterval ?? 20,
      effect: options.effect ?? 'none',
      plugins: options.plugins ?? [],
      onChange: options.onChange ?? (() => {}),
      onAllComplete: options.onAllComplete ?? null,
      pauseOnHidden: options.pauseOnHidden ?? true
    }

    this.state = {
      completedBlocks: [],
      currentBlock: null,
      currentProgress: 0,
      pendingBlocks: []
    }

    // 设置页面可见性监听
    if (this.options.pauseOnHidden && typeof document !== 'undefined') {
      this.setupVisibilityHandler()
    }
  }

  /**
   * 推入新的 blocks
   * 会自动过滤已存在的 blocks
   */
  push(blocks: SourceBlock<T>[]): void {
    const existingIds = this.getAllBlockIds()

    // 找出新增的 blocks
    const newBlocks = blocks.filter((b) => !existingIds.has(b.id))

    if (newBlocks.length > 0) {
      this.state.pendingBlocks.push(...newBlocks)
      this.startIfNeeded()
    }

    // 如果当前正在显示的 block 内容更新了（pending block 变化）
    if (this.state.currentBlock) {
      const updated = blocks.find((b) => b.id === this.state.currentBlock!.id)
      if (updated && updated.node !== this.state.currentBlock.node) {
        // 先获取旧的总字符数（在清除缓存之前）
        const oldTotal = this.cachedTotalChars ?? this.countChars(this.state.currentBlock.node)
        const newTotal = this.countChars(updated.node)

        // 如果字符数减少了（AST 结构变化，如 **xxx 变成 **xxx**）
        // 重新计算进度，保持相对位置，并清除 chunks
        if (newTotal < oldTotal || newTotal < this.state.currentProgress) {
          this.state.currentProgress = Math.min(this.state.currentProgress, newTotal)
          // AST 结构变化，chunks 可能错位，需要清除
          this.chunks = []
        }

        // 内容更新，清除缓存
        this.clearCache()

        // 更新引用
        this.state.currentBlock = updated
        // 如果之前暂停了（因为到达末尾），重新开始
        if (!this.rafId && !this.isPaused) {
          if (this.state.currentProgress < newTotal) {
            this.startIfNeeded()
          }
        }
      }
    }
  }

  /**
   * 更新指定 block（用于 pending block 内容增加时）
   */
  update(block: SourceBlock<T>): void {
    if (this.state.currentBlock?.id === block.id) {
      const oldTotal = this.cachedTotalChars ?? this.countChars(this.state.currentBlock.node)
      const newTotal = this.countChars(block.node)

      // 内容变化，需要清除缓存（无论增加还是减少）
      if (newTotal !== oldTotal) {
        this.clearCache()
      }

      // 如果字符数减少了，调整进度并清除 chunks
      if (newTotal < oldTotal || newTotal < this.state.currentProgress) {
        this.state.currentProgress = Math.min(this.state.currentProgress, newTotal)
        this.chunks = []
      }

      this.state.currentBlock = block

      // 如果内容增加了且之前暂停了，继续
      if (newTotal > oldTotal && !this.rafId && !this.isPaused && this.state.currentProgress >= oldTotal) {
        this.startIfNeeded()
      }
    }
  }

  /**
   * 跳过所有动画，直接显示全部内容
   */
  skip(): void {
    this.stop()

    const allBlocks = [
      ...this.state.completedBlocks,
      ...(this.state.currentBlock ? [this.state.currentBlock] : []),
      ...this.state.pendingBlocks
    ]

    this.state = {
      completedBlocks: allBlocks,
      currentBlock: null,
      currentProgress: 0,
      pendingBlocks: []
    }
    this.chunks = []
    this.clearCache()

    this.emit()
    // 跳过动画也视为完成
    this.options.onAllComplete?.()
  }

  /**
   * 重置状态
   */
  reset(): void {
    this.stop()
    this.state = {
      completedBlocks: [],
      currentBlock: null,
      currentProgress: 0,
      pendingBlocks: []
    }
    this.chunks = []
    this.clearCache()
    this.emit()
  }

  /**
   * 暂停动画
   */
  pause(): void {
    this.isPaused = true
    this.cancelRaf()
  }

  /**
   * 恢复动画
   */
  resume(): void {
    if (this.isPaused) {
      this.isPaused = false
      this.startIfNeeded()
    }
  }

  /**
   * 获取用于渲染的 display blocks
   * 优化：使用缓存的 displayNode，避免重复遍历已稳定的节点
   */
  getDisplayBlocks(): DisplayBlock<T>[] {
    const result: DisplayBlock<T>[] = []

    // 已完成的 blocks
    for (const block of this.state.completedBlocks) {
      result.push({
        ...block,
        displayNode: block.node,
        progress: 1,
        isDisplayComplete: true
      })
    }

    // 当前正在显示的 block
    if (this.state.currentBlock) {
      // 使用缓存的字符数
      const total = this.getTotalChars()
      
      // 如果进度变化了或缓存无效，更新缓存的 displayNode
      if (this.state.currentProgress !== this.cachedProgress || !this.cachedDisplayNode) {
        this.updateCachedDisplayNode()
      }

      result.push({
        ...this.state.currentBlock,
        displayNode: this.cachedDisplayNode || { type: 'paragraph', children: [] },
        progress: total > 0 ? this.state.currentProgress / total : 1,
        isDisplayComplete: false
      })
    }

    return result
  }

  /**
   * 是否正在处理中
   */
  isProcessing(): boolean {
    return this.isRunning || this.state.currentBlock !== null || this.state.pendingBlocks.length > 0
  }

  /**
   * 是否已暂停
   */
  isPausedState(): boolean {
    return this.isPaused
  }

  /**
   * 获取内部状态（用于调试）
   */
  getState(): Readonly<TransformerState<T>> {
    return { ...this.state }
  }

  /**
   * 动态更新配置
   */
  setOptions(options: Partial<Pick<TransformerOptions, 'charsPerTick' | 'tickInterval' | 'effect' | 'pauseOnHidden'>>): void {
    if (options.charsPerTick !== undefined) {
      this.options.charsPerTick = options.charsPerTick
    }
    if (options.tickInterval !== undefined) {
      this.options.tickInterval = options.tickInterval
    }
    if (options.effect !== undefined) {
      this.options.effect = options.effect
    }
    if (options.pauseOnHidden !== undefined) {
      this.options.pauseOnHidden = options.pauseOnHidden
      if (options.pauseOnHidden && typeof document !== 'undefined') {
        this.setupVisibilityHandler()
      } else {
        this.removeVisibilityHandler()
      }
    }
  }

  /**
   * 获取当前配置
   */
  getOptions(): { 
    charsPerTick: number | [number, number]
    tickInterval: number
    effect: AnimationEffect
  } {
    return {
      charsPerTick: this.options.charsPerTick,
      tickInterval: this.options.tickInterval,
      effect: this.options.effect
    }
  }

  /**
   * 获取当前动画效果
   */
  getEffect(): AnimationEffect {
    return this.options.effect
  }

  /**
   * 销毁，清理资源
   */
  destroy(): void {
    this.stop()
    this.removeVisibilityHandler()
  }

  // ============ 私有方法 ============

  private getAllBlockIds(): Set<string> {
    return new Set([
      ...this.state.completedBlocks.map((b) => b.id),
      this.state.currentBlock?.id,
      ...this.state.pendingBlocks.map((b) => b.id)
    ].filter((id): id is string => id !== undefined))
  }

  private setupVisibilityHandler(): void {
    if (this.visibilityHandler) return

    this.visibilityHandler = () => {
      if (document.hidden) {
        this.pause()
      } else {
        this.resume()
      }
    }

    document.addEventListener('visibilitychange', this.visibilityHandler)
  }

  private removeVisibilityHandler(): void {
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler)
      this.visibilityHandler = null
    }
  }

  private startIfNeeded(): void {
    if (this.rafId || this.isPaused) return

    if (!this.state.currentBlock && this.state.pendingBlocks.length > 0) {
      this.state.currentBlock = this.state.pendingBlocks.shift()!
      this.state.currentProgress = 0
      this.clearCache() // 新 block，清除缓存
    }

    if (this.state.currentBlock) {
      this.isRunning = true
      this.lastTickTime = 0
      this.scheduleNextFrame()
    }
  }

  private scheduleNextFrame(): void {
    this.rafId = requestAnimationFrame((time) => this.animationFrame(time))
  }

  private animationFrame(time: number): void {
    this.rafId = null

    // 计算是否应该执行 tick
    if (this.lastTickTime === 0) {
      this.lastTickTime = time
    }

    const elapsed = time - this.lastTickTime

    if (elapsed >= this.options.tickInterval) {
      this.lastTickTime = time
      this.tick()
    }

    // 如果还在运行，继续调度
    if (this.isRunning && !this.isPaused) {
      this.scheduleNextFrame()
    }
  }

  private tick(): void {
    const block = this.state.currentBlock
    if (!block) {
      this.processNext()
      return
    }

    // 使用缓存的字符数，避免重复计算
    const total = this.getTotalChars()
    const step = this.getStep()
    const prevProgress = this.state.currentProgress
    
    this.state.currentProgress = Math.min(prevProgress + step, total)

    // 如果是 fade-in 效果，添加新的 chunk
    if (this.options.effect === 'fade-in' && this.state.currentProgress > prevProgress) {
      // 从 block.node 中提取新增的字符
      const newText = this.extractText(block.node, prevProgress, this.state.currentProgress)
      if (newText.length > 0) {
        this.chunks.push({
          text: newText,
          createdAt: Date.now()
        })
      }
    }

    this.emit()

    if (this.state.currentProgress >= total) {
      // 当前 block 完成，清空 chunks 和缓存
      this.notifyComplete(block.node)
      this.state.completedBlocks.push(block)
      this.state.currentBlock = null
      this.state.currentProgress = 0
      this.chunks = []
      this.clearCache()
      this.processNext()
    }
  }

  /**
   * 从 AST 节点中提取指定范围的文本
   */
  private extractText(node: RootContent, start: number, end: number): string {
    let result = ''
    let charIndex = 0

    function traverse(n: AstNode): boolean {
      if (charIndex >= end) return false

      if (n.value && typeof n.value === 'string') {
        const nodeStart = charIndex
        const nodeEnd = charIndex + n.value.length
        charIndex = nodeEnd

        // 计算交集
        const overlapStart = Math.max(start, nodeStart)
        const overlapEnd = Math.min(end, nodeEnd)

        if (overlapStart < overlapEnd) {
          result += n.value.slice(overlapStart - nodeStart, overlapEnd - nodeStart)
        }
        return charIndex < end
      }

      if (n.children && Array.isArray(n.children)) {
        for (const child of n.children) {
          if (!traverse(child)) return false
        }
      }

      return true
    }

    traverse(node as AstNode)
    return result
  }

  private getStep(): number {
    const { charsPerTick } = this.options
    if (typeof charsPerTick === 'number') {
      return charsPerTick
    }
    // 随机步长
    const [min, max] = charsPerTick
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  private processNext(): void {
    if (this.state.pendingBlocks.length > 0) {
      this.state.currentBlock = this.state.pendingBlocks.shift()!
      this.state.currentProgress = 0
      this.chunks = []
      this.clearCache() // 新 block，清除缓存
      this.emit()
      // 继续运行（rAF 已经在调度中）
    } else {
      this.isRunning = false
      this.cancelRaf()
      this.emit()
      // 所有动画完成，触发回调
      this.options.onAllComplete?.()
    }
  }

  private cancelRaf(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  private stop(): void {
    this.cancelRaf()
    this.isRunning = false
    this.isPaused = false
  }

  private emit(): void {
    this.options.onChange(this.getDisplayBlocks())
  }

  // ============ 插件调用 ============

  private countChars(node: RootContent): number {
    // 先找匹配的插件
    for (const plugin of this.options.plugins) {
      if (plugin.match?.(node) && plugin.countChars) {
        const result = plugin.countChars(node)
        if (result !== undefined) return result
      }
    }
    // 默认计算
    return defaultCountChars(node)
  }

  private sliceNode(node: RootContent, chars: number, accumulatedChunks?: AccumulatedChunks): RootContent | null {
    // 先找匹配的插件
    for (const plugin of this.options.plugins) {
      if (plugin.match?.(node) && plugin.sliceNode) {
        const total = this.countChars(node)
        const result = plugin.sliceNode(node, chars, total)
        if (result !== null) return result
      }
    }
    // 默认截断，传入累积的 chunks
    return defaultSliceAst(node, chars, accumulatedChunks)
  }

  private notifyComplete(node: RootContent): void {
    for (const plugin of this.options.plugins) {
      if (plugin.match?.(node) && plugin.onComplete) {
        plugin.onComplete(node)
      }
    }
  }

  // ============ 缓存管理方法 ============

  /**
   * 更新缓存的 displayNode
   * 使用真正的增量追加模式：只处理新增部分，不重复遍历已稳定的节点
   */
  private updateCachedDisplayNode(): void {
    const block = this.state.currentBlock
    if (!block) {
      this.cachedDisplayNode = null
      this.cachedProgress = 0
      return
    }

    const currentProgress = this.state.currentProgress

    // 如果进度减少了（内容更新导致），需要重新截断
    if (currentProgress < this.cachedProgress) {
      this.cachedDisplayNode = this.sliceNode(
        block.node,
        currentProgress,
        this.getAccumulatedChunks()
      )
      this.cachedProgress = currentProgress
      return
    }

    // 如果进度增加了，使用增量追加模式
    if (currentProgress > this.cachedProgress && this.cachedDisplayNode) {
      // 真正的增量追加：只处理新增部分，不重复遍历已稳定的节点
      this.cachedDisplayNode = appendToAst(
        this.cachedDisplayNode,
        block.node,
        this.cachedProgress,
        currentProgress,
        this.getAccumulatedChunks()
      )
      this.cachedProgress = currentProgress
    } else if (!this.cachedDisplayNode) {
      // 首次截断
      this.cachedDisplayNode = this.sliceNode(
        block.node,
        currentProgress,
        this.getAccumulatedChunks()
      )
      this.cachedProgress = currentProgress
    }
  }

  /**
   * 获取总字符数（带缓存）
   */
  private getTotalChars(): number {
    if (this.cachedTotalChars === null && this.state.currentBlock) {
      this.cachedTotalChars = this.countChars(this.state.currentBlock.node)
    }
    return this.cachedTotalChars ?? 0
  }

  /**
   * 清除缓存（当 block 切换或内容更新时）
   */
  private clearCache(): void {
    this.cachedDisplayNode = null
    this.cachedTotalChars = null
    this.cachedProgress = 0
  }

  /**
   * 获取累积的 chunks（用于 fade-in 效果）
   * stableChars 表示在 chunks 之前的稳定字符数
   */
  private getAccumulatedChunks(): AccumulatedChunks | undefined {
    if (this.options.effect === 'fade-in' && this.chunks.length > 0) {
      // 计算 chunks 之前的稳定字符数
      // 当前进度 = stableChars + 所有 chunks 的长度
      const chunksLength = this.chunks.reduce((sum, c) => sum + c.text.length, 0)
      const stableChars = this.state.currentProgress - chunksLength
      return { stableChars: Math.max(0, stableChars), chunks: this.chunks }
    }
    return undefined
  }
}

/**
 * 创建 BlockTransformer 实例的工厂函数
 */
export function createBlockTransformer<T = unknown>(
  options?: TransformerOptions
): BlockTransformer<T> {
  return new BlockTransformer<T>(options)
}



