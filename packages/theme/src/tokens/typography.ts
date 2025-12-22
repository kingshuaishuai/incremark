/**
 * 字体 Token 类型定义
 * 
 * 注意：具体值待讨论确定后再填充
 */

export interface TypographyTokens {
  /** 字体族 */
  fontFamily: {
    /** 基础字体族 */
    base: string
    /** 等宽字体族 */
    mono: string
  }
  /** 字体大小 */
  fontSize: {
    /** 极小字体 */
    xs: string
    /** 小字体 */
    sm: string
    /** 基础字体大小 */
    base: string
    /** 中等字体 */
    md: string
    /** 大字体 */
    lg: string
    /** 标题字体大小 */
    heading: {
      h1: string
      h2: string
      h3: string
      h4: string
      h5: string
      h6: string
    }
  }
  /** 字重 */
  fontWeight: {
    /** 正常字重 */
    normal: number
    /** 中等字重 */
    medium: number
    /** 半粗字重 */
    semibold: number
    /** 粗体字重 */
    bold: number
  }
  /** 行高 */
  lineHeight: {
    /** 紧密行高 */
    tight: number
    /** 正常行高 */
    normal: number
    /** 宽松行高 */
    relaxed: number
  }
}

