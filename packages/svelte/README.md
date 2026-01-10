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
pnpm add @incremark/svelte @incremark/theme
```

## 快速开始

```svelte
<script>
  import { IncremarkContent } from '@incremark/svelte'
  import '@incremark/theme/styles.css'

  let content = $state('')
  let isFinished = $state(false)

  async function handleStream(stream) {
    for await (const chunk of stream) {
      content += chunk
    }
    isFinished = true
  }
</script>

<button onclick={handleStream}>开始</button>
<IncremarkContent {content} {isFinished} />
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

