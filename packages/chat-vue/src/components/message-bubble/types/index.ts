export interface MessageBubbleProps {
  /**
   * 气泡位置
   * - start: 左对齐（通常用于 assistant）
   * - end: 右对齐（通常用于 user）
   */
  placement?: 'start' | 'end'

  /**
   * 样式变体
   * - filled: 填充背景
   * - outlined: 边框样式
   * - borderless: 无边框
   */
  variant?: 'filled' | 'outlined' | 'borderless'

  /**
   * 形状
   * - default: 默认圆角
   * - round: 更大圆角
   */
  shape?: 'default' | 'round'

  /**
   * 宽度模式
   * - auto: 宽度自适应内容
   * - block: 占满剩余宽度
   *
   * @default 'block'
   */
  width?: 'auto' | 'block'

  /**
   * 加载状态
   */
  loading?: boolean

  /**
   * 流式传输状态
   */
  streaming?: boolean
}
