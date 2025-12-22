/**
 * 动画 Token 类型定义
 */

export interface AnimationTokens {
  /** 动画持续时间 */
  duration: {
    /** 快速动画 */
    fast: string
    /** 正常动画 */
    normal: string
    /** 慢速动画 */
    slow: string
  }
  /** 缓动函数 */
  easing: {
    /** 缓入缓出 */
    easeInOut: string
    /** 缓出 */
    easeOut: string
  }
}

