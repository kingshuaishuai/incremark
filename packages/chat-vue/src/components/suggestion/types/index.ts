/**
 * Suggestion 组件类型定义
 */

/**
 * 单个建议项
 */
export interface SuggestionItem {
  /** 唯一标识 */
  id?: string;
  /** 建议文本 */
  label: string;
  /** 描述（可选） */
  description?: string;
  /** 图标（Iconify 图标名） */
  icon?: string;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * Suggestion 组件 Props
 */
export interface SuggestionProps {
  /** 建议项列表 */
  items: SuggestionItem[];
  /** 是否垂直排列 */
  vertical?: boolean;
}
