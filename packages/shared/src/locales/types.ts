/**
 * Incremark 国际化类型定义
 */

export interface IncremarkLocale {
  /** 代码块相关翻译 */
  code: {
    /** 复制代码按钮文本 */
    copy: string
    /** 复制成功后的提示文本 */
    copied: string
  }
  /** Mermaid 图表相关翻译 */
  mermaid: {
    /** 复制代码按钮文本 */
    copy: string
    /** 复制成功后的提示文本 */
    copied: string
    /** 查看源代码按钮文本 */
    viewSource: string
    /** 预览图表按钮文本 */
    preview: string
  }
}
