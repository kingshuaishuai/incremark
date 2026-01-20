/**
 * @incremark/theme
 * 
 * Incremark 主题样式包
 * 提供统一的主题系统，供 React 和 Vue 组件使用
 */

// Token 类型
export type {
  DesignTokens,
  ColorTokens,
  TypographyTokens,
  SpacingTokens,
  BorderTokens,
  ShadowTokens,
  AnimationTokens
} from './tokens'

// 主题值
export { defaultTheme, darkTheme, createTheme, createDarkTheme } from './themes'
export type { DesignTokens as ThemeTokens } from './tokens'

// 工具函数
export { generateCSSVars } from './utils/generate-css-vars'
export { mergeTheme } from './utils/merge-theme'
export { applyTheme } from './utils/apply-theme'

// 类型导出
export type { GenerateCSSVarsOptions } from './utils/generate-css-vars'
