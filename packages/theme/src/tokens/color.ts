/**
 * 颜色 Token 类型定义
 */

/**
 * 基础色系统 - 包含各种颜色的完整色阶
 */
export interface BaseColorPalette {
  /** 10 级色阶 */
  1: string
  2: string
  3: string
  4: string
  5: string
  6: string
  7: string
  8: string
  9: string
  10: string
}

export interface BaseColors {
  /** 蓝色系 */
  blue: BaseColorPalette
  /** 紫色系 */
  purple: BaseColorPalette
  /** 绿色系 */
  green: BaseColorPalette
  /** 红色系 */
  red: BaseColorPalette
  /** 橙色系 */
  orange: BaseColorPalette
  /** 青色系 */
  cyan: BaseColorPalette
}

export interface ColorTokens {
  /** Neutral 中性色系统（10 级灰度） */
  neutral: {
    /** 最浅 - 纯白 */
    1: string
    /** 极浅灰 - 背景色 */
    2: string
    /** 浅灰 - 次级背景 */
    3: string
    /** 浅中灰 - 边框浅色 */
    4: string
    /** 中灰 - 边框默认 */
    5: string
    /** 中深灰 - 禁用文本 */
    6: string
    /** 深灰 - 次要文本 */
    7: string
    /** 深灰 - 主要文本 */
    8: string
    /** 极深灰 - 强调文本 */
    9: string
    /** 最深 - 接近黑 */
    10: string
  }
  /** 品牌主题色 */
  brand: {
    /** 主题色 - 用于链接、按钮等 */
    primary: string
    /** 主题色 hover 状态 */
    primaryHover: string
    /** 主题色 active 状态 */
    primaryActive: string
    /** 主题色浅色背景 */
    primaryLight: string
  }
  /** 文本颜色（基于 neutral） */
  text: {
    /** 主要文本颜色 */
    primary: string
    /** 次要文本颜色 */
    secondary: string
    /** 第三级文本颜色 */
    tertiary: string
    /** 反色文本（用于深色背景） */
    inverse: string
  }
  /** 背景颜色（基于 neutral） */
  background: {
    /** 基础背景色 */
    base: string
    /** 提升的背景色（卡片等） */
    elevated: string
    /** 遮罩背景色 */
    overlay: string
  }
  /** 边框颜色（基于 neutral） */
  border: {
    /** 浅色边框 - 极浅 */
    subtle: string
    /** 默认边框颜色 - 浅灰色 */
    default: string
    /** 深色边框 - 深灰色 */
    strong: string
  }
  /** 代码相关颜色 */
  code: {
    /** 行内代码背景色 */
    inlineBackground: string
    /** 行内代码文本颜色 */
    inlineText: string
    /** 代码块背景色 */
    blockBackground: string
    /** 代码块文本颜色 */
    blockText: string
    /** 代码块头部背景色 */
    headerBackground: string
    // border 使用通用的 border.strong，不单独定义
  }
  /** 状态颜色 */
  status: {
    /** 待处理状态 */
    pending: string
    /** 已完成状态 */
    completed: string
  }
  /** 交互元素颜色 */
  interactive: {
    /** 链接颜色 */
    link: string
    /** 链接 hover 颜色 */
    linkHover: string
    /** 链接访问过的颜色 */
    linkVisited: string
    /** 选中状态（checkbox 等） */
    checked: string
  }
}


