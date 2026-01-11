/* @jsxImportSource solid-js */

import { createSignal, createEffect, Index, onMount, onCleanup } from 'solid-js'
import 'katex/dist/katex.min.css'

import { useLocale } from './hooks'
import { IncremarkDemo } from './components'
import { zhCN, en } from '@incremark/solid'
import { createDevTools, setLocale as setDevToolsLocale } from '@incremark/devtools'

// 在模块级别创建 devtools 实例，确保它在组件渲染前就存在
const devtools = createDevTools({
  locale: 'zh-CN'
})

export default function App() {
  const { locale, t, sampleMarkdown, toggleLocale } = useLocale()

  // ============ DevTools ============
  onMount(() => {
    devtools.mount()
  })

  onCleanup(() => {
    devtools.unmount()
  })

  // 同步 DevTools 语言
  createEffect(() => {
    setDevToolsLocale(locale() === 'zh' ? 'zh-CN' : 'en-US')
  })

  // ============ HTML 模式 ============
  const [htmlEnabled, setHtmlEnabled] = createSignal(true)
  // 用于强制重新创建 incremark 实例
  const [incremarkKey, setIncremarkKey] = createSignal(0)

  // 记录上次的 locale 值，用于检测变化
  let lastLocale = locale()

  // 监听语言变化，触发 key 更新
  createEffect(() => {
    const currentLocale = locale()
    // 只在 locale 真正变化时更新 key（跳过初始化）
    if (currentLocale !== lastLocale) {
      lastLocale = currentLocale
      setIncremarkKey(prev => prev + 1)
    }
  })

  // 记录上次的 htmlEnabled 值
  let lastHtmlEnabled = htmlEnabled()

  // 监听 HTML 模式变化
  createEffect(() => {
    const currentHtmlEnabled = htmlEnabled()
    // 只在 htmlEnabled 真正变化时更新 key（跳过初始化）
    if (currentHtmlEnabled !== lastHtmlEnabled) {
      lastHtmlEnabled = currentHtmlEnabled
      setIncremarkKey(prev => prev + 1)
    }
  })

  return (
    <div class="app">
      <header>
        <div class="header-top">
          <h1>{t().title}</h1>
          <button class="lang-toggle" onClick={toggleLocale}>
            {locale() === 'zh' ? '🇺🇸 English' : '🇨🇳 中文'}
          </button>
        </div>
        <div class="header-controls">
          <label class="checkbox html-toggle">
            <input
              type="checkbox"
              checked={htmlEnabled()}
              onChange={(e) => {
                setHtmlEnabled(e.currentTarget.checked)
              }}
            />
            {t().htmlMode}
          </label>
        </div>
      </header>

      <Index each={[incremarkKey()]}>
        {() => (
          <IncremarkDemo
            htmlEnabled={htmlEnabled()}
            sampleMarkdown={sampleMarkdown()}
            t={t()}
            locale={locale() === 'zh' ? zhCN : en}
            devtools={devtools}
          />
        )}
      </Index>
    </div>
  )
}
