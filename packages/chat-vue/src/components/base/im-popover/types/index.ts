import type { Placement } from '@floating-ui/vue';

/** 通用 Teleport 配置 */
export interface TeleportProps {
  /** Teleport 目标，默认 'body' */
  to?: string | HTMLElement | (() => HTMLElement);
  /** 是否禁用 Teleport（SSR 时设为 true） */
  teleportDisabled?: boolean;
}

/** Popover 触发方式 */
export type PopoverTrigger = 'hover' | 'click' | 'focus' | 'manual';

/** Popover 组件 Props */
export interface ImPopoverProps extends TeleportProps {
  /** 触发方式 */
  trigger?: PopoverTrigger;
  /** 位置 */
  placement?: Placement;
  /** 偏移量 */
  offset?: number;
  /** 是否显示箭头 */
  arrow?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 定位策略 */
  strategy?: 'absolute' | 'fixed';
}
