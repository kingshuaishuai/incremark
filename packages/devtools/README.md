# @incremark/devtools

Incremark 的开发者工具，框架无关。

## 特性

- 🔍 **实时状态** - 查看解析状态、块列表、AST
- 📊 **时间线** - 记录每次 append 操作
- 🎨 **主题** - 支持 dark/light 主题
- 📦 **框架无关** - 可在 Vue、React 或原生 JS 中使用

## 安装

```bash
pnpm add @incremark/devtools
```

## 使用

### 与 Vue 配合

```ts
import { useIncremark, useDevTools } from '@incremark/vue'

const incremark = useIncremark()
useDevTools(incremark)
```

### 与 React 配合

```tsx
import { useIncremark, useDevTools } from '@incremark/react'

function App() {
  const incremark = useIncremark()
  useDevTools(incremark)
}
```

### 独立使用

```ts
import { createIncremarkParser } from '@incremark/core'
import { mountDevTools } from '@incremark/devtools'

const parser = createIncremarkParser()
parser.setOnChange(mountDevTools())
```

## API

### mountDevTools(options?, target?)

创建并挂载 DevTools，返回 onChange 回调。

```ts
const callback = mountDevTools({
  open: false,
  position: 'bottom-right',
  theme: 'dark'
})

parser.setOnChange(callback)
```

### IncremarkDevTools

DevTools 类，提供更细粒度控制。

```ts
const devtools = new IncremarkDevTools(options)
devtools.mount()
devtools.update(parserState)
devtools.unmount()
```

## 配置选项

```ts
interface DevToolsOptions {
  open?: boolean           // 初始是否打开
  position?: Position      // 位置
  theme?: 'dark' | 'light' // 主题
}

type Position = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
```

## 功能面板

| 面板 | 功能 |
|------|------|
| Overview | 显示字符数、块数量等统计 |
| Blocks | 查看所有解析出的块 |
| AST | JSON 格式的完整 AST |
| Timeline | append 操作历史 |

## License

MIT

