/**
 * @file index.ts - i18n 工具函数
 */

import type { Locale, I18nMessages } from './types'
import { zhCN, enUS } from './locales'

export type { I18nMessages }

const locales: Record<Locale, I18nMessages> = {
  'zh-CN': zhCN,
  'en-US': enUS
}

let currentLocale: Locale = 'en-US'

// 用于存储 i18n 实例的回调函数
const localeChangeCallbacks: Array<() => void> = []

/**
 * 设置当前语言
 */
export function setLocale(locale: Locale): void {
  if (locale in locales && currentLocale !== locale) {
    currentLocale = locale
    // 通知所有 i18n 实例更新
    localeChangeCallbacks.forEach(cb => cb())
  }
}

/**
 * 获取当前语言
 */
export function getLocale(): Locale {
  return currentLocale
}

/**
 * 获取翻译消息
 */
export function t(key: keyof I18nMessages): string {
  return locales[currentLocale][key] || key
}

/**
 * 创建响应式的 i18n store
 */
export function createI18n(initialLocale: Locale = 'en-US') {
  currentLocale = initialLocale

  // 内部版本号，用于触发响应式更新
  let version = $state(0)

  // 注册回调函数，当 setLocale 被调用时触发
  const callback = () => {
    version++
  }
  localeChangeCallbacks.push(callback)

  const i18nObj = {
    get locale() {
      // 访问 locale 时读取 version，建立依赖关系
      void version
      return currentLocale
    },
    setLocale(locale: Locale) {
      setLocale(locale)
      // setLocale 会触发所有回调，包括 version++
    },
    t(key: keyof I18nMessages): string {
      // 访问 t 时读取 version，建立依赖关系
      void version
      return locales[currentLocale][key] || key
    },
    // 获取版本号
    get version() { return version }
  }

  return i18nObj
}
