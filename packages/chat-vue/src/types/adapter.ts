/**
 * UI Adapter 类型定义
 * 用于注入自定义 UI 组件库
 */

import type { Component } from 'vue';

/**
 * 按钮意图类型
 * - action: 操作按钮（如消息操作栏的按钮）
 * - primary: 主要操作
 * - secondary: 次要操作
 * - danger: 危险操作
 */
export type ButtonIntent = 'action' | 'primary' | 'secondary' | 'danger';

/**
 * 按钮尺寸
 */
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * ActionButton 统一配置
 * 用于描述按钮的意图，各 adapter 内部转换为具体 props
 */
export interface ActionButtonOptions {
  /** 按钮意图 */
  intent?: ButtonIntent;
  /** 按钮尺寸 */
  size?: ButtonSize;
  /** 是否为正方形（icon-only） */
  square?: boolean;
  /** 是否为圆形 */
  circle?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否加载中 */
  loading?: boolean;
  /** 是否选中/激活状态 */
  active?: boolean;
}

/**
 * UI Adapter 接口
 * 用户可通过 ChatProvider 注入自定义组件
 */
export interface UIAdapter {
  /** 按钮组件 */
  Button?: Component;
  /** Tooltip 组件 */
  Tooltip?: Component;
  /** 图标组件映射 */
  icons?: {
    copy?: Component;
    check?: Component;
    thumbUp?: Component;
    thumbUpFilled?: Component;
    thumbDown?: Component;
    thumbDownFilled?: Component;
    refresh?: Component;
  };
}

/**
 * ChatProvider Props
 */
export interface ChatProviderProps {
  /** UI 适配器 */
  adapter?: UIAdapter;
}
