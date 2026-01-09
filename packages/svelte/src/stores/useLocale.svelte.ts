import { setContext, getContext } from 'svelte'
import type { IncremarkLocale } from '@incremark/shared'
import { zhCN } from '@incremark/shared'

const LOCALE_KEY = Symbol('incremark-locale')

/**
 * Locale Context 值类型
 * 使用函数返回 locale，以支持响应式更新
 */
export interface LocaleContextValue {
  /** 获取当前 locale 的函数（支持响应式） */
  getLocale: () => IncremarkLocale
}

/**
 * Svelte 国际化 Composable
 */
export interface UseLocaleReturn {
  /** 翻译函数 */
  t: (key: string) => string
}

/**
 * 提供 locale context
 * 必须在组件初始化时同步调用（script 顶层）
 * 
 * @param getLocale - 获取 locale 的函数，支持响应式
 */
export function provideLocale(getLocale: () => IncremarkLocale) {
  const contextValue: LocaleContextValue = { getLocale }
  setContext(LOCALE_KEY, contextValue)
}

/**
 * 使用 locale
 * 在子组件中调用以获取翻译函数
 */
export function useLocale(): UseLocaleReturn {
  const context = getContext<LocaleContextValue | undefined>(LOCALE_KEY)

  // 获取当前 locale（支持响应式更新）
  // 使用 getContext 的默认值，如果没有 provider 则使用中文
  const getLocale = context?.getLocale ?? (() => zhCN)

  const t = (key: string): string => {
    const locale = getLocale()
    const keys = key.split('.')
    let value: unknown = locale
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k]
    }
    return (value as string) || key
  }

  return { t }
}
