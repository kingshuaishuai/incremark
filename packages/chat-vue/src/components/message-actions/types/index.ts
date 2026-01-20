/**
 * MessageActions 组件类型定义
 */

import type { Component } from 'vue';

/**
 * 反馈值类型
 */
export type FeedbackValue = 'like' | 'dislike' | 'default';

/**
 * 操作项类型
 */
export type ActionItemType = 'copy' | 'feedback' | 'custom';

/**
 * 操作项配置
 */
export interface ActionItem {
  /** 唯一标识 */
  key: string;
  /** 操作类型 */
  type?: ActionItemType;
  /** 图标组件 */
  icon?: Component;
  /** Tooltip 文本 */
  tooltip?: string;
  /** 显示文本（用于 dropdown） */
  label?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 点击处理函数 */
  handler?: () => void;
  /** copy 类型专用：要复制的文本 */
  copyText?: string;
}

/**
 * 更多操作项（用于 dropdown）
 */
export interface MoreActionItem {
  /** 唯一标识 */
  key: string;
  /** 显示文本 */
  label: string;
  /** 图标组件 */
  icon?: Component;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否为分割线 */
  divider?: boolean;
}

/**
 * MessageActions 容器 Props
 */
export interface MessageActionsProps {
  /** 变体样式 */
  variant?: 'borderless' | 'filled' | 'outlined';
  /** 操作项配置（配置方式） */
  actions?: ActionItem[];
  /** 最大可见数量，超出部分折叠到"更多" */
  maxVisible?: number;
  /** 反馈值（配置方式使用） */
  feedbackValue?: FeedbackValue;
}

/**
 * MessageAction 通用按钮 Props
 */
export interface MessageActionProps {
  /** 图标组件 */
  icon?: Component;
  /** Tooltip 文本 */
  tooltip?: string;
  /** 无障碍标签 */
  label?: string;
  /** 加载状态 */
  loading?: boolean;
  /** 禁用状态 */
  disabled?: boolean;
}

/**
 * MessageActionCopy Props
 */
export interface MessageActionCopyProps {
  /** 要复制的文本 */
  text: string;
  /** 复制成功后的 tooltip */
  copiedTooltip?: string;
  /** 默认 tooltip */
  tooltip?: string;
}

/**
 * MessageActionFeedback Props
 */
export interface MessageActionFeedbackProps {
  /** 当前反馈值 */
  value?: FeedbackValue;
  /** 点赞 tooltip */
  likeTooltip?: string;
  /** 点踩 tooltip */
  dislikeTooltip?: string;
}

/**
 * MessageActionMore Props
 */
export interface MessageActionMoreProps {
  /** 操作项列表 */
  items: MoreActionItem[];
  /** Tooltip 文本 */
  tooltip?: string;
}
