# @incremark/svelte

Incremark 的 Svelte 5 集成库。

🇨🇳 中文 | **[🇺🇸 English](./README.en.md)**

## 特性

- 📦 **开箱即用** - 提供 `useIncremark` store 和 `<Incremark>` 组件
- ⌨️ **打字机效果** - 内置 `useBlockTransformer` 实现逐字符显示
- 🎨 **可定制** - 支持自定义渲染组件
- ⚡ **高性能** - 使用 Svelte 5 Runes 优化性能
- 🔧 **DevTools** - 内置开发者工具

## 安装

```bash
pnpm add @incremark/core @incremark/svelte
```

## 快速开始

**1. 引入样式**

```ts
import '@incremark/svelte/style.css'
```

**2. 在组件中使用**

```svelte
<script>
  import { useIncremark, Incremark } from '@incremark/svelte'
  import '@incremark/svelte/style.css'

  const { blocks, append, finalize, reset } = useIncremark({ gfm: true })

  async function handleStream(stream) {
    reset()
    for await (const chunk of stream) {
      append(chunk)
    }
    finalize()
  }
</script>

<button on:click={handleStream}>开始</button>
<Incremark {blocks} />
```

## API

### useIncremark(options)

核心 store。

**返回值：**

| 属性 | 类型 | 说明 |
|------|------|------|
| `markdown` | `Writable<string>` | 完整 Markdown |
| `blocks` | `Readable<Block[]>` | 所有块 |
| `completedBlocks` | `Writable<Block[]>` | 已完成块 |
| `pendingBlocks` | `Writable<Block[]>` | 待处理块 |
| `isLoading` | `Writable<boolean>` | 是否正在加载 |
| `append` | `Function` | 追加内容 |
| `finalize` | `Function` | 完成解析 |
| `reset` | `Function` | 重置状态 |
| `render` | `Function` | 一次性渲染（reset + append + finalize） |

### useBlockTransformer(sourceBlocks, options)

打字机效果 store。作为解析器和渲染器之间的中间层，控制内容的逐步显示。

## 自定义组件

```svelte
<script>
  import { useIncremark, Incremark } from '@incremark/svelte'
  import MyCode from './MyCode.svelte'

  const { blocks } = useIncremark()
</script>

<Incremark {blocks} components={{ code: MyCode }} />
```

## 许可证

MIT

