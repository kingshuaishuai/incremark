import { useState, useMemo } from 'react'

import { useLocale } from './hooks'
import { IncremarkDemo } from './components'

function App() {
  // ============ 国际化 ============
  const { locale, t, sampleMarkdown, toggleLocale } = useLocale()

  // ============ HTML 模式 ============
  const [htmlEnabled, setHtmlEnabled] = useState(true)
  
  // 用于强制重新创建 incremark 实例
  const incremarkKey = useMemo(() => `${htmlEnabled}-${locale}`, [htmlEnabled, locale])

  return (
    <div className="app">
      <header className="header">
        <div className="header-top">
          <h1>{t.title}</h1>
          <button className="lang-toggle" onClick={toggleLocale}>
            {locale === 'zh' ? '🇺🇸 English' : '🇨🇳 中文'}
          </button>
        </div>
        <div className="header-controls">
          <label className="checkbox html-toggle">
            <input 
              type="checkbox" 
              checked={htmlEnabled} 
              onChange={(e) => setHtmlEnabled(e.target.checked)} 
            />
            {t.htmlMode}
          </label>
        </div>
      </header>

      <IncremarkDemo 
        key={incremarkKey}
        htmlEnabled={htmlEnabled} 
        sampleMarkdown={sampleMarkdown} 
          t={t}
        />
    </div>
  )
}

export default App
