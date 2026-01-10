/**
 * Shiki Highlighter 单例管理器
 *
 * 避免重复创建 Shiki 实例，所有组件共享同一个 highlighter
 */

import { type Accessor, createSignal } from 'solid-js'
import type { HighlighterGeneric, BundledLanguage, BundledTheme } from 'shiki'

// ============ 类型定义 ============

interface HighlighterInfo {
  highlighter: HighlighterGeneric<BundledLanguage, BundledTheme>
  loadedLanguages: Set<BundledLanguage>
  loadedThemes: Set<BundledTheme>
}

// ============ 单例管理器 ============

/** Shiki highlighter 单例管理器 */
class ShikiManager {
  private static instance: ShikiManager | null = null

  /** 存储 highlighter 实例，key 为主题名称 */
  private highlighters = new Map<string, HighlighterInfo>()

  private constructor() {}

  static getInstance(): ShikiManager {
    if (!ShikiManager.instance) {
      ShikiManager.instance = new ShikiManager()
    }
    return ShikiManager.instance
  }

  /**
   * 获取或创建 highlighter
   * @param theme 主题名称
   * @returns highlighter 实例
   */
  async getHighlighter(theme: BundledTheme): Promise<HighlighterInfo> {
    // 如果已存在对应主题的 highlighter，直接返回
    if (this.highlighters.has(theme)) {
      return this.highlighters.get(theme)!
    }

    // 创建新的 highlighter
    const { createHighlighter } = await import('shiki')
    const highlighter = await createHighlighter({
      themes: [theme],
      langs: []
    })

    const info: HighlighterInfo = {
      highlighter,
      loadedLanguages: new Set<BundledLanguage>(),
      loadedThemes: new Set<BundledTheme>([theme])
    }

    this.highlighters.set(theme, info)
    return info
  }

  /**
   * 加载语言（按需）
   * @param theme 主题名称
   * @param lang 语言名称
   */
  async loadLanguage(theme: BundledTheme, lang: BundledLanguage): Promise<void> {
    const info = this.highlighters.get(theme)
    if (!info || info.loadedLanguages.has(lang)) return

    try {
      await info.highlighter.loadLanguage(lang)
      info.loadedLanguages.add(lang)
    } catch {
      // 语言不支持，静默处理
    }
  }

  /**
   * 加载主题（按需）
   * @param theme 主题名称
   */
  async loadTheme(theme: BundledTheme): Promise<void> {
    const info = this.highlighters.get(theme)
    if (!info || info.loadedThemes.has(theme)) return

    try {
      await info.highlighter.loadTheme(theme)
      info.loadedThemes.add(theme)
    } catch {
      // 主题不支持，静默处理
    }
  }

  /**
   * 高亮代码
   * @param theme 主题名称
   * @param code 代码内容
   * @param lang 语言名称
   * @param fallbackTheme 回退主题
   * @returns 高亮后的 HTML
   */
  async codeToHtml(
    theme: BundledTheme,
    code: string,
    lang: BundledLanguage,
    fallbackTheme: BundledTheme
  ): Promise<string> {
    const info = this.highlighters.get(theme)
    if (!info) throw new Error('Highlighter not found')

    const actualLang = info.loadedLanguages.has(lang) ? lang : 'text'
    const actualTheme = info.loadedThemes.has(theme) ? theme : fallbackTheme

    return info.highlighter.codeToHtml(code, {
      lang: actualLang,
      theme: actualTheme
    })
  }

  /**
   * 清理所有 highlighter（应用退出或需要重置时调用）
   */
  disposeAll() {
    for (const [, info] of this.highlighters) {
      if (info.highlighter?.dispose) {
        info.highlighter.dispose()
      }
    }
    this.highlighters.clear()
  }
}

// ============ 延迟初始化单例 ============

let shikiManagerInstance: ShikiManager | null = null

/**
 * 获取 ShikiManager 单例（延迟初始化）
 * 避免模块加载时立即创建实例，支持 SSR
 */
function getShikiManager(): ShikiManager {
  if (!shikiManagerInstance) {
    shikiManagerInstance = ShikiManager.getInstance()
  }
  return shikiManagerInstance
}

export { getShikiManager, ShikiManager }

// ============ Solid 组合式函数 ============

export interface UseShikiReturn {
  highlighterInfo: Accessor<HighlighterInfo | null>
  isHighlighting: Accessor<boolean>
  isReady: Accessor<boolean>
  initHighlighter: () => Promise<void>
  highlight: (code: string, lang: string, fallbackTheme: string) => Promise<string>
}

/**
 * 使用 Shiki Highlighter（组合式函数）
 *
 * @param theme 主题名称
 * @returns Shiki 相关的响应式状态和方法
 */
export function useShiki(theme: string): UseShikiReturn {
  const [highlighterInfo, setHighlighterInfo] = createSignal<HighlighterInfo | null>(null)
  const [isHighlighting, setIsHighlighting] = createSignal(false)
  const [isReady, setIsReady] = createSignal(false)

  /**
   * 初始化 highlighter（预加载）
   */
  async function initHighlighter(): Promise<void> {
    if (isReady()) return

    try {
      const info = await getShikiManager().getHighlighter(theme as BundledTheme)
      setHighlighterInfo(info)
      setIsReady(true)
    } catch (e) {
      console.warn('Failed to initialize Shiki highlighter:', e)
      throw e
    }
  }

  /**
   * 获取 highlighter
   */
  async function getHighlighter(): Promise<HighlighterInfo> {
    if (!highlighterInfo()) {
      const info = await getShikiManager().getHighlighter(theme as BundledTheme)
      setHighlighterInfo(info)
      setIsReady(true)
      return info
    }
    return highlighterInfo()!
  }

  /**
   * 高亮代码
   */
  async function highlight(code: string, lang: string, fallbackTheme: string): Promise<string> {
    setIsHighlighting(true)

    try {
      const info = await getHighlighter()
      const manager = getShikiManager()

      // 按需加载语言
      if (!info.loadedLanguages.has(lang as BundledLanguage) && lang !== 'text') {
        await manager.loadLanguage(theme as BundledTheme, lang as BundledLanguage)
      }

      // 按需加载主题
      if (!info.loadedThemes.has(theme as BundledTheme)) {
        await manager.loadTheme(theme as BundledTheme)
      }

      return await manager.codeToHtml(
        theme as BundledTheme,
        code,
        lang as BundledLanguage,
        fallbackTheme as BundledTheme
      )
    } catch (e) {
      throw e
    } finally {
      setIsHighlighting(false)
    }
  }

  return {
    highlighterInfo,
    isHighlighting,
    isReady,
    initHighlighter,
    highlight
  }
}
