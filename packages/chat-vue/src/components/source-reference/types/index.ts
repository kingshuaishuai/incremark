/**
 * SourceReference 组件类型定义
 */

import type { SourcePart } from '@incremark/chat-core';

/**
 * SourceReference 组件 Props
 */
export interface SourceReferenceProps {
  /** 来源 Part 数据 */
  part: SourcePart;
  /** 是否在新窗口打开链接 */
  openInNewTab?: boolean;
}
