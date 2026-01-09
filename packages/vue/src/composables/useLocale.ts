import { inject, computed, ref, type Ref, type ComputedRef, type InjectionKey } from 'vue'
import type { IncremarkLocale } from '@incremark/shared'
import { zhCN } from '@incremark/shared'

/**
 * Locale 注入 key，用于 provide/inject
 */
const LOCALE_KEY: InjectionKey<Ref<IncremarkLocale>> = Symbol('incremark-locale')

/**
 * Vue 国际化 Hook
 */
export interface UseLocaleReturn {
  /** 翻译函数 */
  t: ComputedRef<(key: string) => string>
}

/**
 * 使用 locale
 */
export function useLocale(): UseLocaleReturn {
  // 使用 inject 的默认值，如果没有 provider 则使用中文
  const locale = inject(LOCALE_KEY, ref(zhCN))

  const t = computed(() => (key: string) => {
    const keys = key.split('.')
    let value: any = locale.value
    for (const k of keys) {
      value = value?.[k]
    }
    return value || key
  })

  return { t }
}

/**
 * 提供 locale 的 key（用于 ConfigProvider）
 */
export { LOCALE_KEY }
