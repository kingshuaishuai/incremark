# Theme 包构建说明

## 构建流程

Theme 包采用两阶段构建流程：

### 阶段 1：生成 CSS Variables（Less 格式）

```bash
pnpm run generate:css-vars
```

这个脚本会：
1. 读取 `src/tokens/*.ts` 中的 Token 定义
2. 读取 `src/themes/*.ts` 中的主题值
3. 生成 `src/styles/css-variables.less` 文件，包含：
   - 默认主题的 CSS Variables (`:root` 选择器)
   - 深色主题的 CSS Variables (`[data-theme="dark"]` 选择器)

**重要：** `css-variables.less` 是自动生成的文件，**请勿手动编辑**。此文件已加入 `.gitignore`。

### 阶段 2：构建样式和类型

```bash
pnpm run build
```

这个命令会：
1. 运行 `generate:css-vars`（生成 CSS Variables）
2. 运行 `tsup`（编译 TypeScript）
3. 运行 `build:styles`（编译 Less 到 CSS）

最终输出到 `dist/` 目录：
- `index.js` - TypeScript 编译产物（主题工具、Token 类型）
- `index.d.ts` - TypeScript 类型定义
- `styles.css` - 编译后的完整样式（包含 CSS Variables + 组件样式）
- `styles.css.map` - Source Map（开发模式）

## 开发模式

### 监听模式

```bash
pnpm run dev
```

这会启动 TypeScript 的监听模式。如果需要同时监听样式变化，需要手动重新运行构建。

### 修改样式后的工作流

1. 修改 `src/tokens/*.ts` 或 `src/themes/*.ts`
   - 运行 `pnpm run generate:css-vars` 重新生成 CSS Variables
   - 运行 `pnpm run build:styles` 重新编译样式

2. 修改 `src/styles/**/*.less` 样式文件
   - 运行 `pnpm run build:styles` 重新编译样式

## 环境变量

### `NODE_ENV`

控制构建模式：

```bash
# 开发模式（不压缩，生成 source map）
NODE_ENV=development pnpm run build

# 生产模式（压缩，不生成 source map）
NODE_ENV=production pnpm run build
```

## 文件结构

```
packages/theme/
├── src/
│   ├── tokens/          # Token 类型定义（TypeScript）
│   ├── themes/          # 主题值定义（TypeScript）
│   ├── styles/
│   │   ├── css-variables.less  # [自动生成] CSS Variables
│   │   ├── variables.less      # Less 变量（引用 CSS Variables）
│   │   ├── base.less           # 基础样式
│   │   ├── components/         # 组件样式
│   │   └── index.less          # 样式入口
│   ├── utils/           # 工具函数
│   └── index.ts         # TypeScript 入口
├── scripts/
│   ├── generate-css-variables.ts  # 生成 CSS Variables
│   └── build-styles.ts            # 编译样式
└── dist/                # 构建输出
```

## 常见问题

### Q: 构建失败：`css-variables.less not found`

**原因：** 没有先生成 CSS Variables 文件。

**解决：** 运行 `pnpm run generate:css-vars`

### Q: 修改了 Token 但样式没变化

**原因：** 需要重新生成 CSS Variables 并重新编译样式。

**解决：** 运行 `pnpm run build`

### Q: Less 编译错误：变量未定义

**原因：** `css-variables.less` 可能已过期或损坏。

**解决：** 删除 `src/styles/css-variables.less`，然后运行 `pnpm run generate:css-vars`

## 设计决策

### 为什么采用两阶段构建？

1. **类型安全：** Token 在 TypeScript 中定义，提供完整的类型检查
2. **单一数据源：** 主题值只在一个地方定义（`src/themes/*.ts`）
3. **Less 编译时验证：** CSS Variables 在 Less 编译前就已存在，避免循环依赖
4. **运行时灵活性：** 通过 CSS Variables 支持运行时主题切换

### 为什么 css-variables.less 要加入 .gitignore？

1. **自动生成：** 这是构建产物，不应手动编辑
2. **避免冲突：** 不同开发者构建可能产生格式差异
3. **保持同步：** 始终从 TypeScript 源生成，确保一致性

