/**
 * Welcome 组件类型定义
 */

import type { SuggestionItem } from '../suggestion/types';

/**
 * Welcome 组件 Props
 */
export interface WelcomeProps {
  /** 标题 */
  title?: string;
  /** 副标题/描述 */
  description?: string;
  /** 图标（Iconify 图标名） */
  icon?: string;
  /** 建议项列表 */
  suggestions?: SuggestionItem[];
  /** 底部提示文字 */
  hint?: string;
}
