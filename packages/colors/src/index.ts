/**
 * 颜色生成工具
 * 
 * 参考 Arco Design 的颜色生成算法，重新实现
 * 基于 HSV 色彩空间生成 10 级色阶
 * 
 * @see https://arco.design/palette/list
 */

/**
 * HSV 颜色模型
 */
export interface HSV {
  h: number  // 色调 0-360
  s: number  // 饱和度 0-100
  v: number  // 明度 0-100
}

/**
 * RGB 颜色模型
 */
export interface RGB {
  r: number  // 红色 0-255
  g: number  // 绿色 0-255
  b: number  // 蓝色 0-255
}

/**
 * HEX 转 RGB
 */
export function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`)
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  }
}

/**
 * RGB 转 HEX
 */
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase()
}

/**
 * RGB 转 HSV
 */
export function rgbToHsv(rgb: RGB): HSV {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const diff = max - min

  let h = 0
  if (diff !== 0) {
    if (max === r) {
      h = 60 * (((g - b) / diff) % 6)
    } else if (max === g) {
      h = 60 * ((b - r) / diff + 2)
    } else {
      h = 60 * ((r - g) / diff + 4)
    }
  }
  if (h < 0) {
    h += 360
  }

  const s = max === 0 ? 0 : (diff / max) * 100
  const v = max * 100

  return { h, s, v }
}

/**
 * HSV 转 RGB
 */
export function hsvToRgb(hsv: HSV): RGB {
  const h = hsv.h
  const s = hsv.s / 100
  const v = hsv.v / 100

  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c

  let r = 0, g = 0, b = 0
  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c
  } else {
    r = c; g = 0; b = x
  }

  return {
    r: (r + m) * 255,
    g: (g + m) * 255,
    b: (b + m) * 255
  }
}

/**
 * HEX 转 HSV
 */
export function hexToHsv(hex: string): HSV {
  return rgbToHsv(hexToRgb(hex))
}

/**
 * HSV 转 HEX
 */
export function hsvToHex(hsv: HSV): string {
  return rgbToHex(hsvToRgb(hsv))
}

/**
 * 生成单个色阶
 * 
 * 基于 Arco Design 的算法原理：
 * - 色阶 1-5: 提高明度，降低饱和度（更浅）
 * - 色阶 6: 主色
 * - 色阶 7-10: 降低明度，提高饱和度（更深）
 * 
 * @param baseColor 基础颜色（hex）
 * @param index 色阶索引（1-10，6 为主色）
 */
export function generateColorAt(baseColor: string, index: number): string {
  if (index < 1 || index > 10) {
    throw new Error('Index must be between 1 and 10')
  }

  // 索引 6 返回原色
  if (index === 6) {
    return baseColor.toUpperCase()
  }

  const hsv = hexToHsv(baseColor)
  
  // 计算偏移量（1-5: 负偏移，7-10: 正偏移）
  const offset = index - 6
  const isLight = offset < 0
  const step = Math.abs(offset)

  let newHsv: HSV

  if (isLight) {
    // 浅色：提高明度，降低饱和度
    newHsv = {
      h: hsv.h,
      s: Math.max(0, hsv.s - step * 15),      // 逐步降低饱和度
      v: Math.min(100, hsv.v + step * 8)      // 逐步提高明度
    }
  } else {
    // 深色：降低明度，提高饱和度
    newHsv = {
      h: hsv.h,
      s: Math.min(100, hsv.s + step * 5),     // 逐步提高饱和度
      v: Math.max(0, hsv.v - step * 12)       // 逐步降低明度
    }
  }

  return hsvToHex(newHsv)
}

/**
 * 生成完整的 10 级色阶
 * 
 * @param baseColor 基础颜色（hex）
 * @returns 10 级色阶数组，索引 0-9 对应色阶 1-10
 */
export function generatePalette(baseColor: string): string[] {
  return Array.from({ length: 10 }, (_, i) => generateColorAt(baseColor, i + 1))
}

/**
 * 交互状态颜色
 */
export interface ColorStates {
  /** 主色（色阶 6） */
  primary: string
  /** hover 状态（色阶 7） */
  hover: string
  /** active/pressed 状态（色阶 8） */
  active: string
  /** 浅色背景（色阶 2） */
  light: string
  /** 更浅的背景（色阶 1） */
  lighter: string
  /** 深色背景（色阶 9） */
  dark: string
}

/**
 * 完整的颜色系统（包含色阶和交互状态）
 */
export interface ColorSystem extends ColorStates {
  /** 完整的 10 级色阶 */
  1: string
  2: string
  3: string
  4: string
  5: string
  6: string
  7: string
  8: string
  9: string
  10: string
}

/**
 * 生成品牌色系统
 *
 * @param primaryColor 品牌主色
 * @returns 品牌色对象（兼容旧版）
 */
export function generateBrand(primaryColor: string) {
  const palette = generatePalette(primaryColor)

  return {
    // 主色（索引 6）
    primary: palette[5],
    // hover 状态（索引 7）
    hover: palette[6],
    // active/pressed 状态（索引 8）
    active: palette[7],
    // 浅色背景（索引 2）
    light: palette[1],
    // 完整色阶
    palette: {
      1: palette[0],
      2: palette[1],
      3: palette[2],
      4: palette[3],
      5: palette[4],
      6: palette[5],
      7: palette[6],
      8: palette[7],
      9: palette[8],
      10: palette[9]
    }
  }
}

/**
 * 生成完整的颜色系统（包含色阶和交互状态）
 *
 * @param primaryColor 主色
 * @returns 完整的颜色系统
 */
export function generateColorSystem(primaryColor: string): ColorSystem {
  const palette = generatePalette(primaryColor)

  return {
    // 色阶
    1: palette[0],
    2: palette[1],
    3: palette[2],
    4: palette[3],
    5: palette[4],
    6: palette[5],
    7: palette[6],
    8: palette[7],
    9: palette[8],
    10: palette[9],
    // 交互状态
    primary: palette[5],
    hover: palette[6],
    active: palette[7],
    light: palette[1],
    lighter: palette[0],
    dark: palette[8]
  }
}

/**
 * 预设品牌色
 */
export const presets = {
  blue: generateBrand('#3b82f6'),
  purple: generateBrand('#a855f7'),
  green: generateBrand('#10b981'),
  orange: generateBrand('#f97316'),
  red: generateBrand('#ef4444'),
  cyan: generateBrand('#06b6d4'),
  pink: generateBrand('#ec4899'),
  indigo: generateBrand('#6366f1'),
  yellow: generateBrand('#eab308'),
  teal: generateBrand('#14b8a6')
}

/**
 * 预设颜色系统（包含交互状态）
 */
export const colorSystems = {
  blue: generateColorSystem('#3b82f6'),
  purple: generateColorSystem('#a855f7'),
  green: generateColorSystem('#10b981'),
  orange: generateColorSystem('#f97316'),
  red: generateColorSystem('#ef4444'),
  cyan: generateColorSystem('#06b6d4'),
  pink: generateColorSystem('#ec4899'),
  indigo: generateColorSystem('#6366f1'),
  yellow: generateColorSystem('#eab308'),
  teal: generateColorSystem('#14b8a6')
}

