/**
 * 默认主题值定义
 */

import type { DesignTokens } from '../tokens'
import { generateBrand } from '@incremark/colors'

// 生成品牌色（蓝色系）
const brandColors = generateBrand('#3b82f6')

// 中性色系列（微调后的颜色，与公司颜色有细微差异）
const neutralSeries = {
  1: '#ffffff',
  2: '#f8f9fc',   // 稍微偏蓝一点
  3: '#f1f3f8',   // 稍微偏蓝
  4: '#e2e5ec',   // 稍微调整
  5: '#cdd1da',   // 稍微调整
  6: '#9ca4b1',   // 稍微调整
  7: '#677284',   // 稍微调整
  8: '#34435a',   // 稍微偏蓝
  9: '#011431',   // 稍微调整
  10: '#01122d'   // 稍微调整
} as const;

// 基础色系统（使用自动生成）
const baseBlue = generateBrand('#3b82f6')
const basePurple = generateBrand('#a855f7')
const baseGreen = generateBrand('#10b981')
const baseRed = generateBrand('#ef4444')
const baseOrange = generateBrand('#f97316')
const baseCyan = generateBrand('#06b6d4')

export const defaultTheme: DesignTokens = {
  // ============ 基础色系统 ============
  baseColors: {
    blue: {
      1: baseBlue.palette[1],
      2: baseBlue.palette[2],
      3: baseBlue.palette[3],
      4: baseBlue.palette[4],
      5: baseBlue.palette[5],
      6: baseBlue.palette[6],   // 主色
      7: baseBlue.palette[7],
      8: baseBlue.palette[8],
      9: baseBlue.palette[9],
      10: baseBlue.palette[10]
    },
    purple: {
      1: basePurple.palette[1],
      2: basePurple.palette[2],
      3: basePurple.palette[3],
      4: basePurple.palette[4],
      5: basePurple.palette[5],
      6: basePurple.palette[6],   // 主色
      7: basePurple.palette[7],
      8: basePurple.palette[8],
      9: basePurple.palette[9],
      10: basePurple.palette[10]
    },
    green: {
      1: baseGreen.palette[1],
      2: baseGreen.palette[2],
      3: baseGreen.palette[3],
      4: baseGreen.palette[4],
      5: baseGreen.palette[5],
      6: baseGreen.palette[6],   // 主色
      7: baseGreen.palette[7],
      8: baseGreen.palette[8],
      9: baseGreen.palette[9],
      10: baseGreen.palette[10]
    },
    red: {
      1: baseRed.palette[1],
      2: baseRed.palette[2],
      3: baseRed.palette[3],
      4: baseRed.palette[4],
      5: baseRed.palette[5],
      6: baseRed.palette[6],   // 主色
      7: baseRed.palette[7],
      8: baseRed.palette[8],
      9: baseRed.palette[9],
      10: baseRed.palette[10]
    },
    orange: {
      1: baseOrange.palette[1],
      2: baseOrange.palette[2],
      3: baseOrange.palette[3],
      4: baseOrange.palette[4],
      5: baseOrange.palette[5],
      6: baseOrange.palette[6],   // 主色
      7: baseOrange.palette[7],
      8: baseOrange.palette[8],
      9: baseOrange.palette[9],
      10: baseOrange.palette[10]
    },
    cyan: {
      1: baseCyan.palette[1],
      2: baseCyan.palette[2],
      3: baseCyan.palette[3],
      4: baseCyan.palette[4],
      5: baseCyan.palette[5],
      6: baseCyan.palette[6],   // 主色
      7: baseCyan.palette[7],
      8: baseCyan.palette[8],
      9: baseCyan.palette[9],
      10: baseCyan.palette[10]
    }
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
    // ============ 品牌主题色（自动生成）============
    brand: {
      primary: brandColors.primary,
      primaryHover: brandColors.hover,
      primaryActive: brandColors.active,
      primaryLight: brandColors.light
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
      pending: basePurple.palette[6],    // 使用紫色系主色
      completed: baseGreen.palette[6]    // 使用绿色系主色
    },
    // ============ 交互元素颜色 ============
    interactive: {
      link: brandColors.primary,          // 使用品牌主色
      linkHover: brandColors.hover,       // 使用 hover 变体
      linkVisited: basePurple.palette[7], // 使用紫色系深色表示访问过
      checked: baseGreen.palette[6]       // 使用绿色系主色表示选中
    }
  },
  typography: {
    fontFamily: {
      base: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      mono: "'Fira Code', 'SF Mono', 'Monaco', 'Consolas', monospace"
    },
    fontSize: {
      xs: '11px',
      sm: '12px',
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
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)'
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

