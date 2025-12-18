import type { RootContent } from 'mdast'

/**
 * 源 Block 类型（来自解析器）
 */
export interface SourceBlock<T = unknown> {
  /** 唯一标识 */
  id: string
  /** AST 节点 */
  node: RootContent
  /** 块状态 */
  status: 'pending' | 'stable' | 'completed'
  /** 用户自定义元数据 */
  meta?: T
}

/**
 * 显示用的 Block（转换后）
 */
export interface DisplayBlock<T = unknown> extends SourceBlock<T> {
  /** 用于显示的 AST 节点（可能是截断的） */
  displayNode: RootContent
  /** 显示进度 0-1 */
  progress: number
  /** 是否已完成显示 */
  isDisplayComplete: boolean
}

/**
 * 动画效果类型
 * - 'none': 无动画效果
 * - 'fade-in': 新增字符渐入效果
 * - 'typing': 打字机光标效果
 */
export type AnimationEffect = 'none' | 'fade-in' | 'typing'

/**
 * Transformer 插件
 */
export interface TransformerPlugin {
  /** 插件名称 */
  name: string

  /**
   * 判断是否处理此节点
   * 返回 true 表示这个插件要处理此节点
   */
  match?: (node: RootContent) => boolean

  /**
   * 自定义字符数计算
   * 返回 undefined 则使用默认逻辑
   * 返回 0 表示立即显示（不参与逐字符效果）
   */
  countChars?: (node: RootContent) => number | undefined

  /**
   * 自定义截断逻辑
   * @param node 原始节点
   * @param displayedChars 当前应显示的字符数
   * @param totalChars 该节点的总字符数
   * @returns 截断后的节点，null 表示不显示
   */
  sliceNode?: (
    node: RootContent,
    displayedChars: number,
    totalChars: number
  ) => RootContent | null

  /**
   * 节点显示完成时的回调
   */
  onComplete?: (node: RootContent) => void
}

/**
 * Transformer 配置选项
 */
export interface TransformerOptions {
  /**
   * 每 tick 增加的字符数
   * - number: 固定步长（默认 1）
   * - [min, max]: 随机步长区间（更自然的打字效果）
   */
  charsPerTick?: number | [number, number]
  /** tick 间隔 (ms)，默认 20 */
  tickInterval?: number
  /** 动画效果，默认 'none' */
  effect?: AnimationEffect
  /** 插件列表 */
  plugins?: TransformerPlugin[]
  /** 状态变化回调 */
  onChange?: (displayBlocks: DisplayBlock[]) => void
  /**
   * 是否在页面不可见时自动暂停
   * 默认 true，节省资源
   */
  pauseOnHidden?: boolean
}

/**
 * Transformer 内部状态
 */
export interface TransformerState<T = unknown> {
  /** 已完成显示的 blocks */
  completedBlocks: SourceBlock<T>[]
  /** 当前正在显示的 block */
  currentBlock: SourceBlock<T> | null
  /** 当前 block 已显示的字符数 */
  currentProgress: number
  /** 等待显示的 blocks */
  pendingBlocks: SourceBlock<T>[]
}

