/**
 * 默认主题值定义
 */

import type { DesignTokens } from '../tokens'
import { generateColorSystem } from '@incremark/colors'

// 生成完整的颜色系统（包含交互状态）
const colorBlue = generateColorSystem('#3b82f6')
const colorPurple = generateColorSystem('#a855f7')
const colorGreen = generateColorSystem('#10b981')
const colorRed = generateColorSystem('#ef4444')
const colorOrange = generateColorSystem('#f97316')
const colorCyan = generateColorSystem('#06b6d4')
const colorIndigo = generateColorSystem('#5776ff')

// 中性色系列（调整后的颜色，增强对比度）
const neutralSeries = {
  1: '#ffffff',
  2: '#fafbfc',   // 极浅背景
  3: '#f3f4f6',   // hover 背景（加深）
  4: '#e5e7eb',   // active/selected 背景（加深）
  5: '#d1d5db',   // 边框色（加深）
  6: '#9ca3af',   // 次要文字
  7: '#6b7280',   // 主要文字
  8: '#374151',   // 深色文字
  9: '#1f2937',   // 代码块背景
  10: '#111827'   // 最深色
} as const;

export const defaultTheme: DesignTokens = {
  // ============ 基础色系统 ============
  baseColors: {
    blue: colorBlue,
    purple: colorPurple,
    green: colorGreen,
    red: colorRed,
    orange: colorOrange,
    cyan: colorCyan,
    indigo: colorIndigo
  },
  color: {
    // ============ Neutral 中性色系统 ============
    neutral: {
      1: neutralSeries[1],
      2: neutralSeries[2],
      3: neutralSeries[3],
      4: neutralSeries[4],
      5: neutralSeries[5],
      6: neutralSeries[6],
      7: neutralSeries[7],
      8: neutralSeries[8],
      9: neutralSeries[9],
      10: neutralSeries[10]
    },
    // ============ 品牌主题色（引用 indigo）============
    brand: {
      primary: colorIndigo.primary,      // indigo[6]
      primaryHover: colorIndigo.hover,   // indigo[7]
      primaryActive: colorIndigo.active, // indigo[8]
      primaryLight: colorIndigo.light    // indigo[2]
    },
    // ============ 语义化颜色（基于 neutral） ============
    text: {
      primary: neutralSeries[8],    // neutral-8
      secondary: neutralSeries[7],  // neutral-7
      tertiary: neutralSeries[6],   // neutral-6
      inverse: neutralSeries[1]     // neutral-1
    },
    background: {
      base: neutralSeries[1],           // neutral-1
      elevated: neutralSeries[2],       // neutral-2
      overlay: 'rgba(1, 20, 49, 0.6)'   // neutral-9 with alpha
    },
    border: {
      default: neutralSeries[4],        // neutral-4 - 浅灰色边框
      subtle: neutralSeries[3],         // neutral-3 - 极浅边框
      strong: neutralSeries[7]          // neutral-7 - 深灰色边框
    },
    code: {
      inlineBackground: neutralSeries[3],   // neutral-3 - 行内代码浅色背景
      inlineText: neutralSeries[8],         // neutral-8 - 行内代码深色文本
      blockBackground: neutralSeries[9],    // neutral-9 - 代码块深色背景
      blockText: neutralSeries[2],          // neutral-2 - 代码块浅色文本
      headerBackground: neutralSeries[10]   // neutral-10 - 代码块头部更深背景
      // border 使用通用的 border.strong，不单独定义
    },
    status: {
      pending: colorPurple.primary,    // 使用紫色系主色
      completed: colorGreen.primary    // 使用绿色系主色
    },
    // ============ 交互元素颜色 ============
    interactive: {
      link: colorIndigo.primary,         // 使用 indigo 主色
      linkHover: colorIndigo.hover,      // 使用 indigo hover
      linkVisited: colorPurple.dark,     // 使用紫色系深色表示访问过
      checked: colorGreen.primary        // 使用绿色系主色表示选中
    }
  },
  typography: {
    fontFamily: {
      base: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      mono: "'Fira Code', 'SF Mono', 'Monaco', 'Consolas', monospace"
    },
    fontSize: {
      xs: '12px',
      sm: '13px',
      base: '14px',
      md: '16px',
      lg: '18px',
      heading: {
        h1: '2em',
        h2: '1.5em',
        h3: '1.25em',
        h4: '1em',
        h5: '0.875em',
        h6: '0.85em'
      }
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px'
  },
  border: {
    radius: {
      sm: '4px',
      md: '8px',
      lg: '12px'
    }
  },
  shadow: {
    // 基础阴影（使用深蓝色基底，更有质感）
    sm: '0 2px 4px rgba(0, 19, 48, 0.06)',
    md: '0 2px 12px rgba(0, 19, 48, 0.08)',
    lg: '0 2px 16px rgba(0, 19, 48, 0.12)',
    center: '0 0 8px rgba(0, 19, 48, 0.08)',
    // 方向性阴影 - 一级（轻量）
    level1: {
      down: '0 2px 4px rgba(0, 19, 48, 0.06)',
      up: '0 -2px 4px rgba(0, 19, 48, 0.06)',
      left: '-2px 0 8px rgba(0, 19, 48, 0.06)',
      right: '2px 0 8px rgba(0, 19, 48, 0.06)'
    },
    // 方向性阴影 - 二级（中等）
    level2: {
      down: '0 2px 12px rgba(0, 19, 48, 0.08)',
      up: '0 -2px 12px rgba(0, 19, 48, 0.08)',
      left: '-2px 0 12px rgba(0, 19, 48, 0.08)',
      right: '2px 0 12px rgba(0, 19, 48, 0.08)'
    },
    // 方向性阴影 - 三级（强调）
    level3: {
      down: '0 2px 16px rgba(0, 19, 48, 0.12)',
      up: '0 -2px 16px rgba(0, 19, 48, 0.12)',
      left: '-2px 0 16px rgba(0, 19, 48, 0.12)',
      right: '2px 0 16px rgba(0, 19, 48, 0.12)'
    },
    // 品牌色卡片阴影
    brandCard: '0 2px 12px rgba(1, 69, 197, 0.12)'
  },
  animation: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms'
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)'
    }
  }
}
