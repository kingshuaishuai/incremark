import type { HighlighterGeneric, BundledLanguage, BundledTheme } from 'shiki'

// ============ 类型定义 ============
interface HighlighterInfo {
  highlighter: HighlighterGeneric<BundledLanguage, BundledTheme>
  loadedLanguages: Set<BundledLanguage>
  loadedThemes: Set<BundledTheme>
}

// ============ 单例管理器 ============
class ShikiManager {
  private static instance: ShikiManager | null = null
  private highlighters = new Map<string, HighlighterInfo>()

  private constructor() {}

  static getInstance(): ShikiManager {
    if (!ShikiManager.instance) {
      ShikiManager.instance = new ShikiManager()
    }
    return ShikiManager.instance
  }

  async getHighlighter(theme: BundledTheme): Promise<HighlighterInfo> {
    if (this.highlighters.has(theme)) {
      return this.highlighters.get(theme)!
    }

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

  async loadLanguage(theme: BundledTheme, lang: BundledLanguage): Promise<void> {
    const info = this.highlighters.get(theme)
    if (!info || info.loadedLanguages.has(lang)) return
    try {
      await info.highlighter.loadLanguage(lang)
      info.loadedLanguages.add(lang)
    } catch { /* 静默处理 */ }
  }

  async loadTheme(theme: BundledTheme): Promise<void> {
    const info = this.highlighters.get(theme)
    if (!info || info.loadedThemes.has(theme)) return
    try {
      await info.highlighter.loadTheme(theme)
      info.loadedThemes.add(theme)
    } catch { /* 静默处理 */ }
  }

  async codeToHtml(
    theme: BundledTheme,
    code: string,
    lang: BundledLanguage,
    fallbackTheme: BundledTheme
  ): Promise<string> {
    const info = this.highlighters.get(theme)
    if (!info) throw new Error('Highlighter not found')
    const actualLang = info.loadedLanguages.has(lang) ? lang : 'text'
    return info.highlighter.codeToHtml(code, {
      lang: actualLang,
      theme: theme
    })
  }
}

const shikiManager = ShikiManager.getInstance()

// ============ Svelte 5 Composable ============

/**
 * 使用 Shiki Highlighter
 * @param themeGetter 传入一个返回主题字符串的函数，例如 () => theme
 */
export function useShiki(themeGetter: () => string) {
  // 使用 Svelte 5 的原生响应式状态
  let isHighlighting = $state(false);

  /**
   * 高亮代码
   */
  async function highlight(code: string, lang: string, fallbackTheme: string): Promise<string> {
    // 关键：每次执行时通过 Getter 获取最新的主题
    const currentTheme = themeGetter() as BundledTheme;
    const currentFallback = fallbackTheme as BundledTheme;
    
    isHighlighting = true;

    try {
      const info = await shikiManager.getHighlighter(currentTheme);

      // 按需加载语言
      if (!info.loadedLanguages.has(lang as BundledLanguage) && lang !== 'text') {
        await shikiManager.loadLanguage(currentTheme, lang as BundledLanguage);
      }

      // 按需加载主题
      if (!info.loadedThemes.has(currentTheme)) {
        await shikiManager.loadTheme(currentTheme);
      }

      return await shikiManager.codeToHtml(currentTheme, code, lang as BundledLanguage, currentFallback);
    } finally {
      isHighlighting = false;
    }
  }

  return {
    // 使用 getter 暴露只读状态，保持 UI 响应
    get isHighlighting() { return isHighlighting },
    highlight
  };
}