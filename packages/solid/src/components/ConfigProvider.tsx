/* @jsxImportSource solid-js */

import { type Component, type JSX, createContext, useContext, createSignal, createMemo, type Accessor } from 'solid-js'
import type { IncremarkLocale } from '@incremark/shared'
import { zhCN } from '@incremark/shared'

export const LocaleContext = createContext<{
  locale: Accessor<IncremarkLocale>
}>()

export interface ConfigProviderProps {
  /** locale 对象 */
  locale?: IncremarkLocale
  children?: JSX.Element
}

export const ConfigProvider: Component<ConfigProviderProps> = (props) => {
  const [locale, setLocale] = createSignal<IncremarkLocale>(props.locale || zhCN)

  // 监听 props.locale 变化
  createMemo(() => {
    setLocale(props.locale || zhCN)
  })

  return (
    <LocaleContext.Provider value={{ locale }}>
      {props.children}
    </LocaleContext.Provider>
  )
}

/**
 * 翻译函数类型
 */
export type TranslatorFn = (key: string) => string

export function useLocale(): TranslatorFn {
  const context = useContext(LocaleContext)
  const locale = context?.locale || (() => zhCN)

  // 返回翻译函数，跟 Vue 的 API 对齐
  return (key: string) => {
    const keys = key.split('.')
    let value: any = locale()
    for (const k of keys) {
      value = value?.[k]
    }
    return value || key
  }
}
