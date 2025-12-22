import React, { useEffect, useRef, type ReactNode } from 'react'
import type { DesignTokens } from '@incremark/theme'
import { applyTheme } from '@incremark/theme'

export interface ThemeProviderProps {
  /** 主题配置，可以是：
   * - 字符串：'default' | 'dark'
   * - 完整主题对象：DesignTokens
   * - 部分主题对象：Partial<DesignTokens>（会合并到默认主题）
   */
  theme: 'default' | 'dark' | DesignTokens | Partial<DesignTokens>
  /** 子组件 */
  children: ReactNode
  /** 自定义类名 */
  className?: string
}

/**
 * ThemeProvider 组件
 * 
 * 提供主题上下文，支持全局/局部主题和部分变量替换
 * 
 * @example
 * ```tsx
 * // 使用预设主题
 * <ThemeProvider theme="dark">
 *   <Incremark blocks={blocks} />
 * </ThemeProvider>
 * 
 * // 部分替换
 * <ThemeProvider theme={{ color: { text: { primary: '#custom' } } }}>
 *   <Incremark blocks={blocks} />
 * </ThemeProvider>
 * ```
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  theme,
  children,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      // 应用主题到容器元素
      applyTheme(containerRef.current, theme)
    }
  }, [theme])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

