# DevTools

Incremark 内置开发者工具，帮助调试和优化。

## 启用

::: code-group

```ts [Vue]
import { useIncremark, useDevTools } from '@incremark/vue'

const incremark = useIncremark()
useDevTools(incremark)
```

```tsx [React]
import { useIncremark, useDevTools } from '@incremark/react'

function App() {
  const incremark = useIncremark()
  useDevTools(incremark)
  // ...
}
```

```ts [原生]
import { createIncremarkParser } from '@incremark/core'
import { mountDevTools } from '@incremark/devtools'

const parser = createIncremarkParser({
  onChange: mountDevTools()
})
```

:::

## 功能面板

### Overview（概览）

显示当前解析状态：

- 📝 总字符数
- ✅ 已完成块数量
- ⏳ 待处理块数量
- 🔄 加载状态

### Blocks（块列表）

查看所有解析出的块：

- 块类型和 ID
- 状态标识（已完成/待处理）
- 点击查看详细 AST

### AST（语法树）

JSON 格式展示完整 AST：

- 可折叠的树形结构
- 高亮当前块

### Timeline（时间线）

记录每次 append 操作：

- 时间戳
- chunk 内容
- 块变化统计

## 配置选项

```ts
useDevTools(incremark, {
  open: false,           // 初始是否打开
  position: 'bottom-right',  // 位置
  theme: 'dark'          // 主题
})
```

### position

- `bottom-right`（默认）
- `bottom-left`
- `top-right`
- `top-left`

### theme

- `dark`（默认）
- `light`

## 控制方法

```ts
const devtools = useDevTools(incremark)

devtools.open()    // 打开面板
devtools.close()   // 关闭面板
devtools.toggle()  // 切换状态
```

## 生产环境

DevTools 可以在生产环境使用，但建议通过环境变量控制：

```ts
if (import.meta.env.DEV) {
  useDevTools(incremark)
}
```

