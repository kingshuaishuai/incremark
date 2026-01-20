import type { Placement } from '@floating-ui/vue';

/** Tooltip 组件 Props */
export interface ImTooltipProps {
  /** 提示内容 */
  content?: string;
  /** 位置 */
  placement?: Placement;
  /** Teleport 目标，默认 'body' */
  to?: string | HTMLElement | (() => HTMLElement);
  /** 是否禁用 Teleport（SSR 时设为 true） */
  teleportDisabled?: boolean;
}
