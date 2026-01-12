<!--
  @file ThemeProvider.svelte - 主题提供者组件
  @description 应用主题到容器元素
-->

<script lang="ts">
  import type { DesignTokens } from '@incremark/theme'
  import { applyTheme } from '@incremark/theme'
  import { isBrowser } from '@incremark/shared'
  import { provideTheme } from './hooks/useThemeContext'

  /**
   * 组件 Props
   */
  interface Props {
    /**
     * 主题配置，可以是：
     * - 字符串：'default' | 'dark'
     * - 完整主题对象：DesignTokens
     * - 部分主题对象：Partial<DesignTokens>（会合并到默认主题）
     */
    theme: 'default' | 'dark' | DesignTokens | Partial<DesignTokens>
    /** 额外的 CSS 类名 */
    class?: string
    /** 子组件 */
    children?: import('svelte').Snippet
  }

  let {
    theme,
    class: className = '',
    children
  }: Props = $props()

  // 容器引用
  let containerRef: HTMLElement | null = null

  // 创建主题的 readable store 以便传递给子组件
  import { readable } from 'svelte/store'
  const themeValue = readable(theme, (set) => {
    // 当 theme prop 变化时更新
    set(theme)
  })

  // 提供主题上下文
  provideTheme(themeValue)

  // 监听主题变化
  // 在 Svelte 5 中，$effect 会自动追踪在 effect 内部访问的响应式值
  // 直接访问 theme prop 和 containerRef，确保都被追踪
  $effect(() => {
    // SSR 环境检查
    if (!isBrowser()) return

    if (containerRef) {
      applyTheme(containerRef, theme)
    }
  })
</script>

<div bind:this={containerRef} class="incremark-theme-provider {className}">
  {#if children}
    {@render children()}
  {/if}
</div>

