/**
 * ActionButton 组件类型定义
 */

import type { Component } from 'vue';
import type { ActionButtonOptions } from '../../../../types/adapter';

export interface ActionButtonProps extends ActionButtonOptions {
  /** 无障碍标签 */
  ariaLabel?: string;
}

export type { ActionButtonOptions };
