/**
 * @file index.ts - DevTools 入口
 * @description 导出 DevTools API 和类型
 */

// 核心 API
export { IncremarkDevTools, createDevTools, mountDevTools } from './devtools'

// 类型
export type {
  DevToolsState,
  DevToolsOptions,
  AppendRecord,
  RegisterOptions,
  ParserRegistration
} from './types'

// i18n
export type { Locale, I18nMessages } from './i18n/types'
export { createI18n, setLocale, getLocale, t } from './i18n/index.svelte'
