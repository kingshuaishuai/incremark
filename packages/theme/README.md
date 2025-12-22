# @incremark/theme

Incremark 主题样式包 - 统一的主题系统

## 安装

```bash
pnpm add @incremark/theme
```

## 使用

### 基础使用

在 React 或 Vue 应用中导入样式：

```tsx
// React
import '@incremark/react/styles.css'
// 或直接导入主题包
import '@incremark/theme/styles.css'
```

```vue
<!-- Vue -->
<style>
@import '@incremark/vue/style.css';
/* 或直接导入主题包 */
@import '@incremark/theme/styles.css';
</style>
```

### 主题配置

```tsx
import { applyTheme, defaultTheme, darkTheme, type DesignTokens } from '@incremark/theme'

// 使用预设主题
const container = document.querySelector('.incremark')
if (container) {
  applyTheme(container as HTMLElement, 'dark')
  // 或使用主题对象
  applyTheme(container as HTMLElement, darkTheme)
}

// 自定义主题（部分替换）
const customTheme: Partial<DesignTokens> = {
  color: {
    text: {
      primary: '#2c3e50'
    },
    code: {
      background: '#1e1e1e'
    }
  }
}

applyTheme(container as HTMLElement, customTheme)
```

### CSS 变量

主题包支持通过 CSS 变量进行定制：

```css
/* 默认主题变量在 :root 中定义 */
.incremark {
  --incremark-typography-font-family-base: 'Your Font', sans-serif;
  --incremark-color-text-primary: #333;
  --incremark-color-status-pending: #a855f7;
  --incremark-color-code-background: #24292e;
  --incremark-color-code-header-background: #1f2428;
  --incremark-border-radius-lg: 12px;
}

/* 深色主题 */
[data-theme="dark"] .incremark,
.theme-dark .incremark {
  --incremark-color-text-primary: #e6edf3;
  --incremark-color-background-base: #0d1117;
  --incremark-color-code-background: #0d1117;
}
```

## API

### 类型定义

#### `DesignTokens`

完整的设计 Token 接口，包含所有主题变量：

```typescript
interface DesignTokens {
  color: ColorTokens
  typography: TypographyTokens
  spacing: SpacingTokens
  border: BorderTokens
  shadow: ShadowTokens
  animation: AnimationTokens
}
```

详细类型定义请参考 `src/tokens/` 目录。

### 预设主题

```typescript
import { defaultTheme, darkTheme } from '@incremark/theme'

// defaultTheme - 默认浅色主题
// darkTheme - 深色主题
```

### 工具函数

#### `applyTheme(element, theme)`

将主题应用到 DOM 元素。

**参数：**
- `element: HTMLElement` - 目标元素
- `theme: 'default' | 'dark' | DesignTokens | Partial<DesignTokens>` - 主题配置

**示例：**
```typescript
// 使用预设主题名
applyTheme(element, 'dark')

// 使用主题对象
applyTheme(element, darkTheme)

// 部分替换
applyTheme(element, {
  color: { text: { primary: '#custom' } }
})
```

#### `generateCSSVars(tokens, options)`

从 Token 生成 CSS Variables 字符串。

**参数：**
- `tokens: DesignTokens` - 设计 Token 对象
- `options.prefix?: string` - CSS 变量前缀（默认 'incremark'）
- `options.selector?: string` - CSS 选择器（默认 ':root'）

**返回：** `string` - CSS Variables 字符串

#### `mergeTheme(base, override)`

深度合并两个主题对象。

**参数：**
- `base: DesignTokens` - 基础主题
- `override: Partial<DesignTokens>` - 要覆盖的部分

**返回：** `DesignTokens` - 合并后的完整主题

## 样式类名

主题包提供了统一的 CSS 类名系统：

- `.incremark` - 主容器
- `.incremark-block` - 块容器
- `.incremark-heading` - 标题
- `.incremark-paragraph` - 段落
- `.incremark-code` - 代码块
- `.incremark-inline-code` - 行内代码
- `.incremark-list` - 列表
- `.incremark-table` - 表格
- `.incremark-blockquote` - 引用块
- `.incremark-hr` - 分隔线
- `.incremark-math-inline` - 行内数学公式
- `.incremark-math-block` - 块级数学公式
- `.incremark-mermaid` - Mermaid 图表

## 迁移指南

### 从旧版本迁移

如果你之前使用的是 `@incremark/react/styles.css` 或 Vue 组件的 scoped 样式，现在只需要：

1. 确保安装了 `@incremark/theme` 包
2. 导入主题样式：`import '@incremark/theme/styles.css'`
3. 所有样式类名保持不变，向后兼容

