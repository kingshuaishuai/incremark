import type { Placement } from '@floating-ui/vue';
import type { TeleportProps } from '../../im-popover';
import type { Component } from 'vue';

/** 下拉菜单项 */
export interface DropdownItem {
  /** 唯一标识 */
  key: string;
  /** 显示文本 */
  label: string;
  /** 图标（可选）- Vue 组件 */
  icon?: Component;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否为分割线 */
  divider?: boolean;
}

/** Dropdown 组件 Props */
export interface ImDropdownProps extends TeleportProps {
  /** 菜单项列表 */
  items: DropdownItem[];
  /** 位置 */
  placement?: Placement;
  /** 偏移量 */
  offset?: number;
  /** 是否禁用 */
  disabled?: boolean;
}
