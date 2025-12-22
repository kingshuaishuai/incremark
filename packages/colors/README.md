# @incremark/colors

Incremark 颜色生成工具 - 自动生成色阶和主题色

## 特性

- 🎨 **自动生成色阶** - 基于单个颜色生成 10 级色阶
- 🌈 **品牌色系统** - 自动生成 primary、hover、active、light 等状态色
- 🎯 **零依赖** - 纯 TypeScript 实现，无外部依赖
- 📦 **轻量级** - 体积小，性能好
- 🔧 **灵活易用** - 简单的 API，易于集成

## 算法说明

本包参考了 [Arco Design](https://arco.design/palette/list) 的颜色生成原理，基于 HSV 色彩空间实现：

- **色阶 1-5**：提高明度，降低饱和度（更浅的颜色）
- **色阶 6**：主色（基础颜色）
- **色阶 7-10**：降低明度，提高饱和度（更深的颜色）

## 安装

```bash
pnpm add @incremark/colors
```

## 基础用法

### 生成 10 级色阶

```typescript
import { generatePalette } from '@incremark/colors'

// 基于蓝色生成 10 级色阶
const palette = generatePalette('#3b82f6')
console.log(palette)
// [
//   '#E8F3FF',  // 色阶 1 - 最浅
//   '#C5E2FF',  // 色阶 2
//   '#A3D1FF',  // 色阶 3
//   '#81C0FF',  // 色阶 4
//   '#5FAFFF',  // 色阶 5
//   '#3B82F6',  // 色阶 6 - 主色
//   '#2D6BDE',  // 色阶 7
//   '#1F54C6',  // 色阶 8
//   '#113DAE',  // 色阶 9
//   '#032696'   // 色阶 10 - 最深
// ]
```

### 生成品牌色系统

```typescript
import { generateBrand } from '@incremark/colors'

const brand = generateBrand('#3b82f6')
console.log(brand)
// {
//   primary: '#3B82F6',       // 主色
//   hover: '#2D6BDE',         // hover 状态
//   active: '#1F54C6',        // active/pressed 状态
//   light: '#C5E2FF',         // 浅色背景
//   palette: {                // 完整 10 级色阶
//     1: '#E8F3FF',
//     2: '#C5E2FF',
//     // ...
//     10: '#032696'
//   }
// }
```

### 使用预设颜色

```typescript
import { presets } from '@incremark/colors'

console.log(presets.blue.primary)    // '#3B82F6'
console.log(presets.purple.primary)  // '#A855F7'
console.log(presets.green.primary)   // '#10B981'

// 可用的预设：
// blue, purple, green, orange, red, cyan, pink, indigo, yellow, teal
```

## 高级用法

### 生成指定色阶

```typescript
import { generateColorAt } from '@incremark/colors'

// 生成第 3 级色阶（较浅）
const light = generateColorAt('#3b82f6', 3)

// 生成第 8 级色阶（较深）
const dark = generateColorAt('#3b82f6', 8)
```

### 颜色空间转换

```typescript
import { hexToRgb, rgbToHex, hexToHsv, hsvToHex } from '@incremark/colors'

// HEX 转 RGB
const rgb = hexToRgb('#3b82f6')
// { r: 59, g: 130, b: 246 }

// RGB 转 HEX
const hex = rgbToHex({ r: 59, g: 130, b: 246 })
// '#3B82F6'

// HEX 转 HSV
const hsv = hexToHsv('#3b82f6')
// { h: 217, s: 76, v: 96 }

// HSV 转 HEX
const hex2 = hsvToHex({ h: 217, s: 76, v: 96 })
// '#3B82F6'
```

## 在主题系统中使用

```typescript
import { generateBrand } from '@incremark/colors'

const brandColors = generateBrand('#3b82f6')

export const theme = {
  colors: {
    brand: {
      primary: brandColors.primary,
      hover: brandColors.hover,
      active: brandColors.active,
      light: brandColors.light
    },
    // 或者使用完整色阶
    blue: brandColors.palette
  }
}
```

## API 参考

### `generatePalette(baseColor: string): string[]`

生成完整的 10 级色阶

- **参数**：`baseColor` - 基础颜色（HEX 格式）
- **返回**：10 级色阶数组（索引 0-9 对应色阶 1-10）

### `generateBrand(primaryColor: string): BrandColors`

生成品牌色系统

- **参数**：`primaryColor` - 品牌主色（HEX 格式）
- **返回**：包含 primary、hover、active、light 和完整色阶的对象

### `generateColorAt(baseColor: string, index: number): string`

生成指定色阶

- **参数**：
  - `baseColor` - 基础颜色（HEX 格式）
  - `index` - 色阶索引（1-10，6 为主色）
- **返回**：指定色阶的颜色（HEX 格式）

## 最佳实践

1. **选择合适的基础色**：建议选择饱和度适中的颜色作为基础色（色阶 6）
2. **保持一致性**：在整个项目中使用相同的品牌色生成逻辑
3. **考虑可访问性**：确保生成的颜色对比度符合 WCAG 标准
4. **暗色模式适配**：对于暗色模式，可以选择稍微调亮的基础色

## License

MIT © [Incremark](https://www.incremark.com/)

