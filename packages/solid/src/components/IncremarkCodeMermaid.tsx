/* @jsxImportSource solid-js */

import type { Code } from 'mdast'
import { Component, createEffect, createSignal, onCleanup, onMount, Show } from 'solid-js'
import type { Mermaid } from 'mermaid'
import { GravityMermaid, LucideCode, LucideEye, LucideCopy, LucideCopyCheck } from '@incremark/icons'
import { isClipboardAvailable } from '@incremark/shared'
import { useLocale } from '../composables/useLocale'
import { SvgIcon } from './SvgIcon'

export interface IncremarkCodeMermaidProps {
  node: Code
  /** Mermaid 渲染延迟（毫秒），用于流式输入时防抖 */
  mermaidDelay?: number
}

/**
 * Mermaid 图表渲染组件
 *
 * 支持 Mermaid 图表的流式渲染和防抖更新
 */
export const IncremarkCodeMermaid: Component<IncremarkCodeMermaidProps> = (props) => {
  const [mermaidSvg, setMermaidSvg] = createSignal('')
  const [mermaidError, setMermaidError] = createSignal('')
  const [mermaidLoading, setMermaidLoading] = createSignal(false)
  const [copied, setCopied] = createSignal(false)

  // 视图模式：'preview' | 'source'
  const [mermaidViewMode, setMermaidViewMode] = createSignal<'preview' | 'source'>('preview')

  let mermaidInstance: Mermaid | null = null
  let renderTimer: ReturnType<typeof setTimeout> | null = null
  let copyTimeoutId: ReturnType<typeof setTimeout> | null = null
  let chartId = `mermaid-${Math.random().toString(36).substr(2, 9)}`

  const code = () => props.node.value

  // 使用 i18n
  const t = useLocale()

  function toggleMermaidView() {
    setMermaidViewMode(prev => prev === 'preview' ? 'source' : 'preview')
  }

  // 初始化 Mermaid
  onMount(async () => {
    try {
      // 动态导入 mermaid
      const mermaidModule = await import('mermaid')
      const mermaid = mermaidModule.default

      // 初始化 mermaid
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose',
        suppressErrorRendering: true
      })

      mermaidInstance = mermaid
    } catch (e) {
      console.warn('Failed to initialize Mermaid:', e)
      setMermaidError('Failed to initialize')
    }
  })

  // 带防抖动的渲染
  function scheduleRender() {
    if (!code()) {
      return
    }

    // 清除之前的定时器
    if (renderTimer) {
      clearTimeout(renderTimer)
    }

    setMermaidLoading(true)
    setMermaidError('')

    // 防抖动延迟渲染
    renderTimer = setTimeout(() => {
      doRender()
    }, props.mermaidDelay ?? 500)
  }

  async function doRender() {
    if (!code() || !mermaidInstance) return

    try {
      const { svg } = await mermaidInstance.render(chartId, code())
      setMermaidSvg(svg)
      setMermaidError('')
    } catch (e) {
      // 图表不完整或其他错误，静默处理
      setMermaidError('')
      setMermaidSvg('')
    } finally {
      setMermaidLoading(false)
    }
  }

  // 监听代码变化，重新渲染
  createEffect(() => {
    scheduleRender()
  })

  onCleanup(() => {
    if (renderTimer) {
      clearTimeout(renderTimer)
    }
    if (copyTimeoutId) {
      clearTimeout(copyTimeoutId)
    }
  })

  async function copyCode() {
    if (!isClipboardAvailable()) return

    try {
      await navigator.clipboard.writeText(code())
      setCopied(true)

      // 清理之前的定时器
      if (copyTimeoutId) {
        clearTimeout(copyTimeoutId)
      }

      copyTimeoutId = setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch {
      // 复制失败静默处理
    }
  }

  return (
    <div class="incremark-mermaid">
      <div class="mermaid-header">
        <span class="language">
          <SvgIcon svg={GravityMermaid} sizeClass="language-icon" />
          MERMAID
        </span>
        <div class="mermaid-actions">
          <button
            class="code-btn"
            onClick={toggleMermaidView}
            type="button"
            disabled={!mermaidSvg()}
            aria-label={mermaidViewMode() === 'preview' ? t('mermaid.viewSource') : t('mermaid.preview')}
            title={mermaidViewMode() === 'preview' ? 'View Source' : 'Preview'}
          >
            <SvgIcon svg={mermaidViewMode() === 'preview' ? LucideCode : LucideEye} />
          </button>
          <button
            class="code-btn"
            onClick={copyCode}
            type="button"
            aria-label={copied() ? t('mermaid.copied') : t('mermaid.copy')}
            title={copied() ? 'Copied!' : 'Copy'}
          >
            <SvgIcon svg={copied() ? LucideCopyCheck : LucideCopy} />
          </button>
        </div>
      </div>
      <div class="mermaid-content">
        {/* 加载中 */}
        <Show when={mermaidLoading() && !mermaidSvg()}>
          <div class="mermaid-loading">
            <pre class="mermaid-source-code">{code()}</pre>
          </div>
        </Show>
        {/* 源码模式 */}
        <Show when={mermaidViewMode() === 'source' && !mermaidLoading()}>
          <pre class="mermaid-source-code">{code()}</pre>
        </Show>
        {/* 预览模式 */}
        <Show when={mermaidViewMode() === 'preview' && mermaidSvg() && !mermaidLoading()}>
          <div innerHTML={mermaidSvg()} class="mermaid-svg" />
        </Show>
        {/* 无法渲染时显示源码 */}
        <Show when={!mermaidSvg() && !mermaidLoading() && mermaidViewMode() === 'preview'}>
          <pre class="mermaid-source-code">{code()}</pre>
        </Show>
      </div>
    </div>
  )
}
