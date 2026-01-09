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
   *
   * 逻辑：
   * 1. 移除不在传入列表中的旧 blocks（处理容器增量解析等场景）
   * 2. 如果 block ID 不存在，添加到 pending
   * 3. 如果 block ID 已存在且内容变化，更新对应位置的 block
   */
  push(blocks: SourceBlock<T>[]): void {
    const inputIds = new Set(blocks.map(b => b.id))
    const existingIds = this.getAllBlockIds()

    // ============ 第一步：移除不在传入列表中的旧 blocks ============
    // 这主要处理容器增量解析的情况：容器内部的内容先被添加为独立 blocks，
    // 然后整个容器被添加时，内部 blocks 不再单独返回，需要移除它们
    let hasRemovals = false

    // 检查 completedBlocks
    const completedBefore = this.state.completedBlocks.length
    this.state.completedBlocks = this.state.completedBlocks.filter(b => inputIds.has(b.id))
    if (this.state.completedBlocks.length < completedBefore) {
      hasRemovals = true
    }

    // 检查 currentBlock
    if (this.state.currentBlock && !inputIds.has(this.state.currentBlock.id)) {
      this.state.currentBlock = null
      this.state.currentProgress = 0
      this.chunks = []
      this.clearCache()
      hasRemovals = true
    }

    // 检查 pendingBlocks
    const pendingBefore = this.state.pendingBlocks.length
    this.state.pendingBlocks = this.state.pendingBlocks.filter(b => inputIds.has(b.id))
    if (this.state.pendingBlocks.length < pendingBefore) {
      hasRemovals = true
    }

    // 如果有移除，需要重新启动处理（如果 currentBlock 被移除了）
    if (hasRemovals && !this.state.currentBlock && this.state.pendingBlocks.length > 0) {
      this.startIfNeeded()
    }

    // ============ 第二步：找出新增的 blocks ============
    const newBlocks = blocks.filter((b) => !existingIds.has(b.id))

    if (newBlocks.length > 0) {
      this.state.pendingBlocks.push(...newBlocks)
      this.startIfNeeded()
    }

    // ============ 第三步：检查已存在 blocks 的内容更新 ============
    for (const block of blocks) {
      // 跳过新增的 blocks（已经处理过了）
      if (!existingIds.has(block.id)) continue

      // 检查 currentBlock
      if (this.state.currentBlock?.id === block.id) {
        // 检查 currentBlock 是否已经完成
        const total = this.getTotalChars()
        const isComplete = this.state.currentProgress >= total

        if (isComplete) {
          // currentBlock 已经完成，直接移到 completedBlocks
          this.state.completedBlocks.push(block)
          this.state.currentBlock = null
          this.state.currentProgress = 0
          this.chunks = []
          this.clearCache()
          this.processNext()
        } else if (this.state.currentBlock.node !== block.node) {
          // currentBlock 还在处理中，内容变化，使用 handleContentChange 处理
          this.handleContentChange(this.state.currentBlock.node, block.node, true)
          // 更新引用
          this.state.currentBlock = block
        }
        continue
      }

      // 检查 completedBlocks
      const completedIndex = this.state.completedBlocks.findIndex(b => b.id === block.id)
      if (completedIndex !== -1) {
        if (this.state.completedBlocks[completedIndex].node !== block.node) {
          // 内容变化，直接替换
          this.state.completedBlocks[completedIndex] = block
          this.emit()
        }
        continue
      }

      // 检查 pendingBlocks
      const pendingIndex = this.state.pendingBlocks.findIndex(b => b.id === block.id)
      if (pendingIndex !== -1) {
        if (this.state.pendingBlocks[pendingIndex].node !== block.node) {
          // 内容变化，直接替换
          this.state.pendingBlocks[pendingIndex] = block
        }
        continue
      }
    }

    // 如果有移除，触发更新
    if (hasRemovals) {
      this.emit()
    }
  }

  /**
   * 更新指定 block（用于 pending block 内容增加时）
   */
  update(block: SourceBlock<T>): void {
    if (this.state.currentBlock?.id === block.id) {
      // 使用统一的方法处理内容变化
      this.handleContentChange(this.state.currentBlock.node, block.node, false)
      this.state.currentBlock = block
      return
    }

    // 检查是否是已完成的 block
    const completedIndex = this.state.completedBlocks.findIndex(b => b.id === block.id)
    if (completedIndex !== -1) {
      // 更新已完成的 block
      this.state.completedBlocks[completedIndex] = block
      this.emit()
      return
    }

    // 检查是否是 pending blocks
    const pendingIndex = this.state.pendingBlocks.findIndex(b => b.id === block.id)
    if (pendingIndex !== -1) {
      // 更新 pending block
      this.state.pendingBlocks[pendingIndex] = block
      return
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
   *
   * 注意：DisplayBlock 的 status 表示的是**打字机动画状态**，而不是解析器的状态：
   * - 'completed': 打字机动画已完成，内容已完全显示
   * - 'pending': 打字机动画还在进行中，内容还在逐字显示
   */
  getDisplayBlocks(): DisplayBlock<T>[] {
    const result: DisplayBlock<T>[] = []

    // 已完成动画的 blocks（打字机动画已完成）
    for (const block of this.state.completedBlocks) {
      result.push({
        ...block,
        // 打字机动画已完成，状态为 completed
        status: 'completed',
        displayNode: block.node,
        progress: 1,
        isDisplayComplete: true
      })
    }

    // 当前正在显示的 block（打字机动画进行中）
    if (this.state.currentBlock) {
      // 使用缓存的字符数
      const total = this.getTotalChars()

      // 如果进度变化了或缓存无效，更新缓存的 displayNode
      if (this.state.currentProgress !== this.cachedProgress || !this.cachedDisplayNode) {
        this.updateCachedDisplayNode()
      }

      result.push({
        ...this.state.currentBlock,
        // 打字机动画进行中，状态为 pending
        status: 'pending',
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

  /**
   * 处理 block 内容更新时的字符数变化和进度调整
   * 统一 push 和 update 方法中的重复逻辑
   */
  private handleContentChange(
    oldNode: RootContent,
    newNode: RootContent,
    isUpdateFromPush?: boolean
  ): void {
    const oldTotal = this.cachedTotalChars ?? this.countChars(oldNode)
    const newTotal = this.countChars(newNode)

    // 如果字符数减少了（AST 结构变化，如 **xxx 变成 **xxx**）
    // 重新计算进度，保持相对位置，并清除 chunks
    if (newTotal < oldTotal || newTotal < this.state.currentProgress) {
      this.state.currentProgress = Math.min(this.state.currentProgress, newTotal)
      // AST 结构变化，chunks 可能错位，需要清除
      this.chunks = []
    }

    // 内容变化，清除缓存
    this.clearCache()

    // 如果是 push 方法调用的更新，可能需要重新开始动画
    if (isUpdateFromPush) {
      // 如果之前暂停了（因为到达末尾），重新开始
      if (!this.rafId && !this.isPaused) {
        if (this.state.currentProgress < newTotal) {
          this.startIfNeeded()
        }
      }
    } else {
      // 如果是 update 方法调用的更新，内容增加了且之前暂停了，继续
      if (newTotal > oldTotal && !this.rafId && !this.isPaused && this.state.currentProgress >= oldTotal) {
        this.startIfNeeded()
      }
    }
  }

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
   *
   * 优化说明：
   * - 提前终止：当 charIndex >= end 时立即返回，避免不必要的遍历
   * - 局部更新：charIndex 只在需要时更新，减少计算
   * - 早期返回：发现足够的文本后可以提前退出（当前未实现，可作为未来优化）
   *
   * @param node 要提取文本的 AST 节点
   * @param start 起始字符索引（包含）
   * @param end 结束字符索引（不包含）
   * @returns 提取的文本
   */
  private extractText(node: RootContent, start: number, end: number): string {
    // 快速路径：空范围或无效范围
    if (start >= end) {
      return ''
    }

    let result = ''
    let charIndex = 0

    function traverse(n: AstNode): boolean {
      // 提前终止：已达到目标范围
      if (charIndex >= end) return false

      if (n.value && typeof n.value === 'string') {
        const nodeStart = charIndex
        const nodeEnd = charIndex + n.value.length
        const overlapStart = Math.max(start, nodeStart)
        const overlapEnd = Math.min(end, nodeEnd)

        // 只有当节点与目标范围有交集时才处理
        if (overlapStart < overlapEnd) {
          result += n.value.slice(overlapStart - nodeStart, overlapEnd - nodeStart)
        }

        // 更新索引（仅在处理文本节点后）
        charIndex = nodeEnd
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

    // 如果进度增加了，使用追加模式
    if (currentProgress > this.cachedProgress && this.cachedDisplayNode) {
      // 截断并合并：复用已稳定的节点引用，减少框架重渲染
      this.cachedDisplayNode = appendToAst(
        this.cachedDisplayNode,
        block.node,
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
   *
   * 缓存策略：
   * - 首次调用时计算并缓存
   * - 内容更新时通过 clearCache() 清除缓存，下次重新计算
   * - 切换到新 block 时也会清除缓存
   */
  private getTotalChars(): number {
    // 没有当前 block 时返回 0
    if (!this.state.currentBlock) {
      this.cachedTotalChars = null
      return 0
    }

    // 缓存为空时计算
    if (this.cachedTotalChars === null) {
      this.cachedTotalChars = this.countChars(this.state.currentBlock.node)
    }

    return this.cachedTotalChars
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



