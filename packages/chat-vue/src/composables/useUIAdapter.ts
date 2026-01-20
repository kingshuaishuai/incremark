/**
 * useUIAdapter - UI 适配器注入与获取
 */

import { inject, provide, type InjectionKey } from 'vue';
import type { UIAdapter } from '../types/adapter';
import { ImButton } from '../components/base/im-button';
import { ImTooltip } from '../components/base/im-tooltip';

const UI_ADAPTER_KEY: InjectionKey<UIAdapter> = Symbol('ui-adapter');

/**
 * 默认 adapter，使用内置组件
 */
const defaultAdapter: UIAdapter = {
  Button: ImButton,
  Tooltip: ImTooltip,
  icons: {}
};

/**
 * 提供 UI 适配器
 * @param adapter 自定义适配器，会与默认适配器合并
 */
export function provideUIAdapter(adapter?: Partial<UIAdapter>) {
  const merged: UIAdapter = {
    ...defaultAdapter,
    ...adapter,
    icons: {
      ...defaultAdapter.icons,
      ...adapter?.icons
    }
  };
  provide(UI_ADAPTER_KEY, merged);
}

/**
 * 获取 UI 适配器
 * @returns UI 适配器对象
 */
export function useUIAdapter(): UIAdapter {
  return inject(UI_ADAPTER_KEY, defaultAdapter);
}
