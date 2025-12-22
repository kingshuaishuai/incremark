/**
 * 深色主题值定义
 */

import type { DesignTokens } from '../tokens'
import { defaultTheme } from './default'
import { generateBrand } from '@incremark/colors'

// 生成暗色模式的品牌色（稍微调亮）
const darkBrandColors = generateBrand('#60a5fa')

// 暗色模式基础色系统（稍微调亮）
const darkBasePurple = generateBrand('#c084fc')
const darkBaseGreen = generateBrand('#34d399')

// 暗色模式中性色系列（反转后的颜色，增强 1-2 对比度）
const darkNeutralSeries = {
  1: '#0a1628',
  2: '#162033',
  3: '#273548',
  4: '#546070',
  5: '#8891a0',
  6: '#cdd1da',
  7: '#e2e5ec',
  8: '#f1f3f8',
  9: '#f8f9fc',
  10: '#ffffff'
} as const

export const darkTheme: DesignTokens = {
  ...defaultTheme,
  // 继承亮色主题的基础色系统（baseColors 保持一致）
  baseColors: defaultTheme.baseColors,
  color: {
    // ============ Neutral 中性色系统（暗色模式反转） ============
    neutral: {
      1: darkNeutralSeries[1],
      2: darkNeutralSeries[2],
      3: darkNeutralSeries[3],
      4: darkNeutralSeries[4],
      5: darkNeutralSeries[5],
      6: darkNeutralSeries[6],
      7: darkNeutralSeries[7],
      8: darkNeutralSeries[8],
      9: darkNeutralSeries[9],
      10: darkNeutralSeries[10]
    },
    // ============ 品牌主题色（暗色模式自动生成）============
    brand: {
      primary: darkBrandColors.primary,
      primaryHover: darkBrandColors.hover,
      primaryActive: darkBrandColors.active,
      primaryLight: darkBrandColors.light
    },
    // ============ 语义化颜色 ============
    text: {
      primary: darkNeutralSeries[8],    // neutral-8 (dark)
      secondary: darkNeutralSeries[7],  // neutral-7 (dark)
      tertiary: darkNeutralSeries[6],   // neutral-6 (dark)
      inverse: darkNeutralSeries[1]     // neutral-1 (dark)
    },
    background: {
      base: darkNeutralSeries[1],           // neutral-1 (dark)
      elevated: darkNeutralSeries[2],       // neutral-2 (dark)
      overlay: 'rgba(0, 0, 0, 0.75)'
    },
    border: {
      subtle: darkNeutralSeries[3],         // neutral-3 (dark) - 极浅边框
      default: darkNeutralSeries[4],        // neutral-4 (dark) - 浅灰色边框
      strong: darkNeutralSeries[7]          // neutral-7 (dark) - 深灰色边框
    },
    code: {
      inlineBackground: darkNeutralSeries[3],   // neutral-3 (dark) - 行内代码适中暗色背景
      inlineText: darkNeutralSeries[8],         // neutral-8 (dark) - 行内代码浅色文本
      blockBackground: darkNeutralSeries[3],    // neutral-2 (dark) - 代码块深色背景
      blockText: darkNeutralSeries[9],          // neutral-9 (dark) - 代码块极浅文本
      headerBackground: darkNeutralSeries[2]    // neutral-2 (dark) - 代码块头部背景
      // border 使用通用的 border.strong，不单独定义
    },
    status: {
      pending: darkBasePurple.palette[6],    // 使用暗色紫色系主色
      completed: darkBaseGreen.palette[6]    // 使用暗色绿色系主色
    },
    // ============ 交互元素颜色 ============
    interactive: {
      link: darkBrandColors.primary,         // 使用暗色品牌主色
      linkHover: darkBrandColors.hover,      // 使用 hover 变体
      linkVisited: darkBasePurple.palette[4], // 使用暗色紫色系浅色
      checked: darkBaseGreen.palette[6]       // 使用暗色绿色系主色
    }
  },
  // 其他 Token 继承自 defaultTheme
  typography: defaultTheme.typography,
  spacing: defaultTheme.spacing,
  border: defaultTheme.border,
  shadow: defaultTheme.shadow,
  animation: defaultTheme.animation
}


