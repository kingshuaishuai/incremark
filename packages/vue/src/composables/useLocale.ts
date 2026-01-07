import { inject, computed, type Ref, type ComputedRef, type InjectionKey } from 'vue'
import type { IncremarkLocale } from '@incremark/shared'
import { en } from '../index'

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
  const locale = inject(LOCALE_KEY)

  if (!locale) {
    // 如果没有提供 locale，使用默认的英文
    const defaultLocale = en
    const t = computed(() => (key: string) => {
      const keys = key.split('.')
      let value: any = defaultLocale
      for (const k of keys) {
        value = value?.[k]
      }
      return value || key
    })

    return { t }
  }

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
