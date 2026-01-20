# CSS/Less 样式编写规范

本文档描述了 Incremark Chat UI 的样式编写规范，确保所有样式代码的一致性和可维护性。

## 核心原则

### 1. 变量使用原则

**Less 变量 vs CSS 变量的使用场景**：

- **Less 变量**：用于编译时的样式计算和逻辑，编译后替换为具体值
  - 适用场景：颜色计算、间距、字体大小等编译时确定的值
  - 定义位置：`packages/theme/src/styles/variables.less`

- **CSS 变量**：用于运行时动态主题和用户自定义
  - 适用场景：需要动态切换的主题色、品牌配置等
  - 定义位置：通过 `packages/theme/scripts/generate-css-variables.ts` 自动生成
  - 使用语法：`var(--incremark-*)`

### 2. 命名规范

#### Less 变量命名
```less
// 颜色变量 - 使用 @color- 前缀
@color-brand-primary: #6366f1;
@color-text-primary: #1f2937;

// 间距变量 - 使用 @im-spacing- 前缀
@im-spacing-1: 0.25rem;
@im-spacing-2: 0.5rem;

// 字体变量 - 使用 @im-font- 前缀
@im-font-base: 14px;
@im-font-sm: 12px;
```

#### CSS 变量命名
```css
/* 自动生成的 CSS 变量，使用 --incremark- 前缀 */
--incremark-color-brand-primary: #6366f1;
--incremark-color-text-primary: #1f2937;
```

### 3. 样式编写示例

#### ✅ 正确：使用 Less 变量
```less
.my-component {
  color: @color-brand-primary;
  padding: @im-spacing-2;
  font-size: @im-font-base;
}
```

#### ✅ 正确：使用 CSS 变量（用于动态主题）
```less
.my-component {
  color: var(--incremark-color-brand-primary);
  background: var(--incremark-color-background);
}
```

#### ❌ 错误：硬编码颜色值
```less
.my-component {
  color: #6366f1; /* ❌ 应该使用 @color-brand-primary */
  padding: 8px;  /* ❌ 应该使用 @im-spacing-2 */
}
```

### 4. BEM 命名规范

所有 Chat UI 组件使用 BEM (Block Element Modifier) 命名规范：

```less
// Block
.im-cot { }

// Element
.im-cot__header { }
.im-cot__icon { }
.im-cot__title { }

// Modifier
.im-cot--expanded { }
.im-cot__icon--loading { }
.im-cot__title--blink { }
```

**命名格式**：
- Block: `im-{block-name}`
- Element: `im-{block-name}__{element-name}`
- Modifier: `im-{block-name}[__{element-name}]--{modifier-name}`

**简化原则**：
- Block 名称要简洁，如 `cot` 而不是 `chain-of-thought`
- 使用 `im-` 前缀标识 Incremark 组件

### 5. 状态颜色使用指南

不同状态应使用对应的颜色变量：

```less
// 品牌主色 - 用于 active/loading 状态
color: @color-brand-primary;

// 状态颜色 - 用于特定的状态指示
color: var(--incremark-color-status-pending);    // 进行中
color: var(--incremark-color-status-completed);   // 已完成
color: var(--incremark-color-status-error);       // 错误

// 文本颜色
color: @color-text-primary;    // 主要文本
color: @color-text-secondary;  // 次要文本
color: @im-colors-gray-500;    // 灰色文本

// 语义化颜色
color: var(--incremark-base-colors-red-6);   // 错误/危险
color: var(--incremark-base-colors-green-6); // 成功/完成
```

### 6. 主题相关样式

主题色应该使用 CSS 变量，以支持动态主题切换：

```less
// ✅ 正确 - 使用 CSS 变量支持动态主题
.brand-button {
  background: var(--incremark-color-brand-primary);
  color: var(--incremark-color-text-on-brand);
}

// ❌ 错误 - 硬编码主题色
.brand-button {
  background: #6366f1;
}
```

### 7. 动画定义

使用 `@keyframes` 定义动画，命名格式：`im-{block}-{action}`

```less
@keyframes im-cot-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes im-reasoning-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
```

### 8. Mixins 使用

使用 Less mixins 提高代码复用性：

```less
// 定义
.flex-center() {
  display: flex;
  align-items: center;
}

// 使用
.my-header {
  .flex-center();
}
```

## 检查清单

在提交样式代码前，请确认：

- [ ] 没有硬编码颜色值，全部使用变量
- [ ] Less 变量用于编译时计算，CSS 变量用于运行时主题
- [ ] 遵循 BEM 命名规范
- [ ] 使用 `im-` 前缀标识组件
- [ ] 动画命名使用 `im-{block}-{action}` 格式
- [ ] 状态颜色使用语义化的颜色变量

## 相关文件

- Less 变量定义：`packages/theme/src/styles/variables.less`
- CSS 变量生成：`packages/theme/scripts/generate-css-variables.ts`
- Chat UI 样式：`packages/theme/src/styles/chat/*.less`
