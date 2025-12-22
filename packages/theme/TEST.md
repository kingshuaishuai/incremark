# 测试指南

## 快速测试

### 1. 测试 Token 生成 CSS Variables

```typescript
import { generateCSSVars, defaultTheme } from '@incremark/theme'

const cssVars = generateCSSVars(defaultTheme)
console.log(cssVars)
// 应该输出包含所有 CSS Variables 的字符串
```

### 2. 测试主题合并

```typescript
import { mergeTheme, defaultTheme } from '@incremark/theme'

const custom = mergeTheme(defaultTheme, {
  color: { text: { primary: '#custom' } }
})
// custom.color.text.primary 应该是 '#custom'
// 其他值应该保持默认
```

### 3. 测试 ThemeProvider（React）

```tsx
import { ThemeProvider, Incremark } from '@incremark/react'
import '@incremark/theme/styles/index.less'

// 默认主题
<Incremark blocks={blocks} />

// 暗色主题
<ThemeProvider theme="dark">
  <Incremark blocks={blocks} />
</ThemeProvider>

// 局部主题
<div>
  <Incremark blocks={blocks} /> {/* 默认 */}
  <ThemeProvider theme="dark">
    <Incremark blocks={blocks} /> {/* 暗色 */}
  </ThemeProvider>
</div>

// 部分替换
<ThemeProvider theme={{ color: { text: { primary: '#custom' } } }}>
  <Incremark blocks={blocks} />
</ThemeProvider>
```

### 4. 测试 ThemeProvider（Vue）

```vue
<script setup>
import { ThemeProvider, Incremark } from '@incremark/vue'
import '@incremark/theme/styles/index.less'
</script>

<template>
  <!-- 默认主题 -->
  <Incremark :blocks="blocks" />
  
  <!-- 暗色主题 -->
  <ThemeProvider theme="dark">
    <Incremark :blocks="blocks" />
  </ThemeProvider>
  
  <!-- 部分替换 -->
  <ThemeProvider :theme="{ color: { text: { primary: '#custom' } } }">
    <Incremark :blocks="blocks" />
  </ThemeProvider>
</template>
```

## 构建测试

```bash
# 在 packages/theme 目录
pnpm build

# 检查 dist/styles.css 是否生成
# 应该包含：
# 1. :root { ... } (默认主题 CSS Variables)
# 2. [data-theme="dark"], .theme-dark { ... } (深色主题 CSS Variables)
# 3. 编译后的样式
```

## 开发环境测试

在 `examples/react` 或 `examples/vue` 中：

```bash
# 启动开发服务器
pnpm example:react
# 或
pnpm example:vue

# 在代码中导入样式
import '@incremark/theme/styles/index.less'

# Vite 会自动编译 Less，支持热更新
```

## 检查清单

- [ ] CSS Variables 正确生成
- [ ] 默认主题变量值正确
- [ ] 深色主题变量值正确
- [ ] ThemeProvider 能应用主题
- [ ] 局部主题正常工作
- [ ] 部分替换正常工作
- [ ] Less 编译成功
- [ ] 样式正确应用

