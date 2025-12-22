/**
 * Token 系统主入口
 * 
 * 定义完整的设计 Token 类型
 */

import type { ColorTokens, BaseColors } from './color'
import type { TypographyTokens } from './typography'
import type { SpacingTokens } from './spacing'
import type { BorderTokens } from './border'
import type { ShadowTokens } from './shadow'
import type { AnimationTokens } from './animation'

/**
 * 完整的设计 Token 类型
 */
export interface DesignTokens {
  /** 基础色系统 - 各种颜色的完整色阶 */
  baseColors: BaseColors
  /** 颜色系统 */
  color: ColorTokens
  /** 字体系统 */
  typography: TypographyTokens
  /** 间距系统 */
  spacing: SpacingTokens
  /** 边框系统 */
  border: BorderTokens
  /** 阴影系统 */
  shadow: ShadowTokens
  /** 动画系统 */
  animation: AnimationTokens
}

// 导出所有 Token 类型
export type {
  BaseColors,
  ColorTokens,
  TypographyTokens,
  SpacingTokens,
  BorderTokens,
  ShadowTokens,
  AnimationTokens
}

