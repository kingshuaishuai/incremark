---
alwaysApply: true
---

## 项目介绍

incremark 是一个 markdown 增量解析工具，主要为了解决 AIChat 应用接收 chunk 后重复拼接 markdown 字符串解析造成的性能问题，同时为不同的 UI 框架提供了相应的开箱即用方案。

当前项目主要分为以下几个子包:

- `@incremark/core`: 框架无关，主要进行 markdown 的增量解析，主要思路是边界检测，解析完成的部分不参与重复解析，不稳定的部分重复解析，最终将 O(n²) 的整体解析复杂度降为 O(n)。
- `@incremark/theme`: 不同 UI 框架公用的主题系统，主要为不同框架提供一致的 css 样式，达到高度统一的样式效果。
- `@incremark/vue`,`@incremark/react`,`@incremark/svele` 不同框架的 UI 适配层，其中 vue 应当作为首先适配选项，react、svelte 组件文件组织方式，dom 结构等应该对齐 vue 实现，后期可能增加 solid 等框架的支持。
- `@incremark/docs`: 使用 vitepress 搭建的文档应用，每次更新新功能需要及时修改文档，且文档需要支持中英文。
- 其他的子包主要作为辅助工具提供。

## 后期规划

- 提供更多 AI 场景
- 基于当前的 UI 组件实现 chat ui，如：chat-core chat-vue chat-react chat-svelte

## 项目要求

### 代码统一规范

1. 所有的测试文件应当放置于相应的子包中
2. 核心包需要保证较高的测试覆盖率，每次修改代码后，不合格的测试用例应当移除，缺失的用例应该及时补充
3. 未使用的引入或变量定义需要及时清除
4. 项目采用 pnpm 管理，如需运行命令有限 pnpm 而非 npm
5. 项目采用 ts 编写，无论是 core 还是 UI 层，都需要保证 ts 类型正确，any 或者 as any 需要尽量避免
6. 各个 UI 子包需要使用其最佳设计模式进行代码编写，其中 vue 需要使用 vue 3.5 推荐的写法，svelte 需要使用 svelte5 的最新写法，react 目前使用的是 react 18，需要注意 api 的正确使用。
7. core 的底线是遵循 commonmark，如果修改代码时发现不符合的地方，需要及时优化


### 单元测试文件规范

1. 单元测试需要写在相应子包的 `__tests__` 目录下，并可以根据功能整理到对应的目录中
2. 单测文件必须以 `.test.ts` 结尾

# 基础色系统集成报告

## 更新内容

添加了完整的基础色系统（baseColors），将所有使用到的颜色（如紫色、绿色）统一纳入基础色系统管理，使颜色使用更加规范和可维护。

## 设计理念

### 颜色分层

```
DesignTokens
├── baseColors (基础色系统)     ← 新增
│   ├── blue (蓝色 10 级色阶)
│   ├── purple (紫色 10 级色阶)
│   ├── green (绿色 10 级色阶)
│   ├── red (红色 10 级色阶)
│   ├── orange (橙色 10 级色阶)
│   └── cyan (青色 10 级色阶)
│
└── color (语义化颜色)
    ├── neutral (中性色)
    ├── brand (品牌色)
    ├── text (文本色)
    ├── background (背景色)
    ├── border (边框色)
    ├── code (代码颜色)
    ├── status (状态色) ← 使用 baseColors
    └── interactive (交互色) ← 使用 baseColors
```

## Token 定义更新

### 新增类型定义

```typescript
// 基础色系统 - 完整的 10 级色阶
export interface BaseColorPalette {
  1: string   // 最浅
  2: string
  3: string
  4: string
  5: string
  6: string   // 主色
  7: string
  8: string
  9: string
  10: string  // 最深
}

export interface BaseColors {
  blue: BaseColorPalette
  purple: BaseColorPalette
  green: BaseColorPalette
  red: BaseColorPalette
  orange: BaseColorPalette
  cyan: BaseColorPalette
}
```

### DesignTokens 更新

```typescript
export interface DesignTokens {
  baseColors: BaseColors  // ← 新增
  color: ColorTokens
  typography: TypographyTokens
  // ... 其他系统
}
```

## 基础色生成

使用 `@incremark/colors` 自动生成完整的 10 级色阶：

```typescript
// 基础色系统（使用自动生成）
const baseBlue = generateBrand('#3b82f6')
const basePurple = generateBrand('#a855f7')
const baseGreen = generateBrand('#10b981')
const baseRed = generateBrand('#ef4444')
const baseOrange = generateBrand('#f97316')
const baseCyan = generateBrand('#06b6d4')
```

## 语义化颜色使用基础色

### 亮色主题

```typescript
color: {
  status: {
    pending: basePurple.palette[6],    // 紫色主色
    completed: baseGreen.palette[6]    // 绿色主色
  },
  interactive: {
    link: brandColors.primary,
    linkHover: brandColors.hover,
    linkVisited: basePurple.palette[7], // 紫色深色
    checked: baseGreen.palette[6]       // 绿色主色
  }
}
```

### 暗色主题

```typescript
// 为暗色模式生成稍亮的颜色
const darkBasePurple = generateBrand('#c084fc')
const darkBaseGreen = generateBrand('#34d399')

color: {
  status: {
    pending: darkBasePurple.palette[6],
    completed: darkBaseGreen.palette[6]
  },
  interactive: {
    linkVisited: darkBasePurple.palette[4],
    checked: darkBaseGreen.palette[6]
  }
}
```

## 生成的 CSS 变量

### 基础色系统（部分示例）

```css
:root {
  /* 蓝色系 */
  --incremark-base-colors-blue-1: #E6F3FF;
  --incremark-base-colors-blue-2: #CFDFFB;
  --incremark-base-colors-blue-6: #3B82F6;  /* 主色 */
  --incremark-base-colors-blue-10: #05327C;
  
  /* 紫色系 */
  --incremark-base-colors-purple-1: #FFFFFF;
  --incremark-base-colors-purple-2: #F8F1FF;
  --incremark-base-colors-purple-6: #A855F7;  /* 主色 */
  --incremark-base-colors-purple-7: #8E40D8;
  --incremark-base-colors-purple-10: #49127D;
  
  /* 绿色系 */
  --incremark-base-colors-green-6: #10B981;  /* 主色 */
}
```

### 语义化颜色使用基础色

```css
:root {
  --incremark-color-status-pending: #A855F7;     /* purple-6 */
  --incremark-color-status-completed: #10B981;   /* green-6 */
}

.incremark-dark {
  --incremark-color-status-pending: #C084FC;     /* 暗色紫色 */
  --incremark-color-status-completed: #34D399;   /* 暗色绿色 */
}
```

## 优势

### 1. 统一的色彩管理
- 所有颜色都有明确来源
- 不再有"魔法颜色"（硬编码的 #a855f7）
- 每个颜色都有完整的 10 级色阶

### 2. 更好的可维护性
```typescript
// 之前
status: {
  pending: '#a855f7'  // 硬编码，不知道来源
}

// 现在
status: {
  pending: basePurple.palette[6]  // 来自基础色系统
}
```

### 3. 灵活的扩展性
```typescript
// 轻松添加新颜色
const basePink = generateBrand('#ec4899')

baseColors: {
  pink: basePink.palette
}
```

### 4. 主题一致性
- 亮色/暗色主题共享基础色定义
- 语义化颜色从基础色中选择合适的色阶

## 文件更新

### Token 定义
- ✅ `packages/theme/src/tokens/color.ts` - 添加 BaseColors 类型
- ✅ `packages/theme/src/tokens/index.ts` - 导出 BaseColors，更新 DesignTokens

### 主题配置
- ✅ `packages/theme/src/themes/default.ts` - 生成并配置基础色系统
- ✅ `packages/theme/src/themes/dark.ts` - 继承基础色，使用暗色变体

## 构建结果

```bash
ESM dist/index.js     11.48 KB  (之前 8.82 KB)
Styles: 28.06 KB  (之前 22.93 KB)
```

**文件增大原因**：
- 新增 6 种基础色 × 10 级色阶 = 60 个 CSS 变量
- 提供了完整的色彩系统供后续使用

## 使用示例

### 在自定义主题中使用

```typescript
import { defaultTheme } from '@incremark/theme'

// 使用基础色创建自定义主题
const myTheme = {
  ...defaultTheme,
  color: {
    ...defaultTheme.color,
    status: {
      // 使用基础色系统中的红色作为错误状态
      error: defaultTheme.baseColors.red[6],
      // 使用橙色作为警告状态
      warning: defaultTheme.baseColors.orange[6]
    }
  }
}
```

### 访问基础色

```typescript
// 访问紫色系的不同色阶
const purple = theme.baseColors.purple
console.log(purple[1])   // 最浅紫色
console.log(purple[6])   // 紫色主色
console.log(purple[10])  // 最深紫色
```

## 总结

✅ 建立了完整的基础色系统（6 种颜色 × 10 级色阶）  
✅ 所有语义化颜色都基于基础色系统  
✅ 自动生成，无硬编码  
✅ 支持亮色/暗色主题  
✅ 易于扩展和维护  

现在颜色系统更加规范、完整、易于管理！🎨

# BlockTransformer 代码流程分析与重构建议

## 一、当前实现概览

### 1.1 核心职责
`BlockTransformer` 作为解析器（Parser）和渲染器（Renderer）之间的中间层，负责：
- 控制 blocks 的逐步显示（打字机效果）
- 使用 `requestAnimationFrame` 实现流畅动画
- 支持随机步长和动画效果

### 1.2 当前架构
```
Parser (IncremarkParser)
  ↓ append() 返回 IncrementalUpdate
  ↓ { completed: [...], pending: [...] }
Transformer (BlockTransformer)
  ↓ push(blocks) / update(block)
  ↓ 使用 requestAnimationFrame 逐步显示
  ↓ getDisplayBlocks() 返回 DisplayBlock[]
Renderer
```

## 二、设计理念对比

### 2.1 你的设计理念（期望）

1. **Pipe Reader 模式**
   - Transformer 像管道读取器，每次读取新内容**追加**到已有内容
   - 不需要每次遍历全部 AST
   - 深度优先读取，保证顺序

2. **Chunks 挂在 Text 节点上**
   - 每次读取的新内容追加到对应 text 节点的 `chunks` 数组中
   - 每个 text 节点维护自己的 chunks
   - 用于后续实现 fade 动画

3. **读取与解析的异步关系**
   - Transformer 读取可能快于或慢于 Parser
   - 快的时候需要等待 Parser 更新
   - Parser 可能有不稳定的节点，需要及时更新

4. **简单直接**
   - 每次读取新内容时，追加到 text 节点的 chunks 中
   - 不需要复杂的缓存和增量更新逻辑

### 2.2 当前实现（实际）

1. **Slice 模式（错误）**
   - 使用 `sliceAst()` 每次从头截断 AST
   - 使用 `appendToAst()` 尝试增量追加，但实现复杂
   - 每次都要遍历 AST（即使有缓存优化）

2. **Chunks 挂在 Transformer 上（错误）**
   ```typescript
   private chunks: TextChunk[] = []  // ❌ 挂在 transformer 上
   ```
   - 应该挂在 text 节点上，而不是 transformer 上

3. **过度复杂的缓存机制**
   - `cachedDisplayNode`: 缓存的已截断 displayNode
   - `cachedTotalChars`: 缓存的字符数
   - `cachedProgress`: 当前缓存的进度
   - `updateCachedDisplayNode()`: 复杂的增量更新逻辑

4. **复杂的 AST 合并逻辑**
   - `mergeAstNodes()`: 尝试合并两个 AST 节点
   - `appendToAst()`: 增量追加实现
   - 这些逻辑都是为了优化性能，但增加了复杂度

## 三、代码流程分析

### 3.1 主要流程

#### 流程 1: push(blocks) - 推入新 blocks
```
push(blocks)
  ↓ 过滤已存在的 blocks
  ↓ 添加到 pendingBlocks
  ↓ startIfNeeded() 启动动画
```

**问题**：
- ✅ 逻辑基本正确
- ⚠️ 处理当前 block 内容更新时，有复杂的缓存清理逻辑

#### 流程 2: tick() - 每次动画帧的处理
```
tick()
  ↓ 计算步长 (getStep())
  ↓ 更新 currentProgress
  ↓ 如果是 fade-in 效果，添加 chunk 到 transformer.chunks ❌
  ↓ emit() 触发 onChange
  ↓ 如果完成，移动到 completedBlocks
```

**问题**：
- ❌ chunks 添加到 `transformer.chunks`，而不是 text 节点的 chunks
- ❌ 使用 `sliceAst()` 从头截断，而不是追加模式

#### 流程 3: getDisplayBlocks() - 获取显示用的 blocks
```
getDisplayBlocks()
  ↓ 遍历 completedBlocks（完整显示）
  ↓ 处理 currentBlock
    ↓ 使用缓存的字符数
    ↓ 如果进度变化，更新缓存的 displayNode
    ↓ 使用 cachedDisplayNode 或重新 sliceAst()
```

**问题**：
- ❌ 依赖复杂的缓存机制
- ❌ 每次都要判断是否需要重新 slice
- ❌ 如果使用 slice，每次都要遍历 AST

#### 流程 4: updateCachedDisplayNode() - 更新缓存的 displayNode
```
updateCachedDisplayNode()
  ↓ 如果进度减少，重新 slice
  ↓ 如果进度增加，使用 appendToAst() 增量追加
  ↓ 更新 cachedProgress
```

**问题**：
- ❌ 逻辑过于复杂
- ❌ 需要维护缓存状态
- ❌ 如果按照你的设计，这个函数应该不存在

### 3.2 关键问题点

#### 问题 1: Chunks 位置错误
**当前**：
```typescript
private chunks: TextChunk[] = []  // transformer 级别

// 在 tick() 中
if (this.options.effect === 'fade-in' && this.state.currentProgress > prevProgress) {
  const newText = this.extractText(block.node, prevProgress, this.state.currentProgress)
  if (newText.length > 0) {
    this.chunks.push({  // ❌ 添加到 transformer
      text: newText,
      createdAt: Date.now()
    })
  }
}
```

**应该**：
```typescript
// chunks 应该挂在 text 节点上
interface TextNodeWithChunks extends Text {
  chunks?: TextChunk[]  // ✅ 每个 text 节点有自己的 chunks
}

// 在读取新内容时，追加到对应 text 节点的 chunks
```

#### 问题 2: Slice 模式 vs Pipe Reader 模式
**当前**：
```typescript
// 每次从头 slice
this.cachedDisplayNode = this.sliceNode(
  block.node,
  currentProgress,  // 从 0 到 currentProgress
  this.getAccumulatedChunks()
)
```

**应该**：
```typescript
// Pipe Reader 模式：只读取新增部分，追加到已有内容
const newChars = currentProgress - prevProgress
const newText = readNewChars(block.node, prevProgress, newChars)
// 追加到对应 text 节点的 chunks
appendToTextNodeChunks(textNode, newText)
```

#### 问题 3: 每次遍历全部 AST
**当前**：
- `sliceAst()` 需要遍历整个 AST（即使有 skipChars 优化）
- `appendToAst()` 也需要遍历新增部分对应的 AST 子树

**应该**：
- 维护一个"读取位置"指针，指向当前读取到的 AST 节点位置
- 每次只读取新增的字符，直接追加到对应的 text 节点
- 不需要重新遍历已读取的部分

#### 问题 4: 过度复杂的缓存机制
**当前**：
- `cachedDisplayNode`: 缓存的已截断节点
- `cachedTotalChars`: 缓存的字符数
- `cachedProgress`: 缓存的进度
- `updateCachedDisplayNode()`: 复杂的更新逻辑

**应该**：
- 如果使用 Pipe Reader 模式，不需要缓存 displayNode
- 只需要维护当前读取位置和每个 text 节点的 chunks
- 显示时直接使用原始 AST + chunks 信息

## 四、代码必要性分析

### 4.1 必须保留的功能

1. **核心状态管理**
   - `state`: completedBlocks, currentBlock, currentProgress, pendingBlocks
   - ✅ 必须保留

2. **动画控制**
   - `requestAnimationFrame` 调度
   - `tick()` 处理逻辑
   - ✅ 必须保留，但需要简化

3. **Block 管理**
   - `push()`: 推入新 blocks
   - `update()`: 更新当前 block（用于 pending block 内容增加）
   - `skip()`: 跳过动画
   - `reset()`: 重置状态
   - ✅ 必须保留

4. **配置管理**
   - `setOptions()`: 动态更新配置
   - `getOptions()`: 获取配置
   - ✅ 必须保留

5. **生命周期管理**
   - `pause()` / `resume()`: 暂停/恢复
   - `destroy()`: 清理资源
   - ✅ 必须保留

### 4.2 可以简化的功能

1. **缓存机制** ⚠️
   - `cachedDisplayNode`, `cachedTotalChars`, `cachedProgress`
   - `updateCachedDisplayNode()`, `getTotalChars()`, `clearCache()`
   - **建议**：如果改为 Pipe Reader 模式，这些都可以删除

2. **复杂的 AST 操作** ⚠️
   - `sliceAst()`: 如果改为追加模式，不需要 slice
   - `appendToAst()`: 如果改为 Pipe Reader 模式，不需要复杂的合并
   - `mergeAstNodes()`: 同上
   - **建议**：改为简单的文本追加到 chunks

3. **extractText()** ⚠️
   - 用于从 AST 中提取指定范围的文本
   - **建议**：如果改为 Pipe Reader 模式，这个函数可以简化或删除

4. **插件系统** ✅
   - `countChars()`, `sliceNode()`, `notifyComplete()`
   - **建议**：保留，但可能需要调整接口

### 4.3 需要重构的功能

1. **Chunks 管理** ❌
   - 当前：挂在 transformer 上
   - 应该：挂在 text 节点上
   - **重构**：完全重写 chunks 相关逻辑

2. **显示节点生成** ❌
   - 当前：使用 sliceAst() 截断
   - 应该：使用 Pipe Reader 模式，直接读取追加
   - **重构**：完全重写显示节点生成逻辑

3. **进度计算** ⚠️
   - 当前：每次计算总字符数，然后 slice
   - 应该：维护读取位置，只读取新增部分
   - **重构**：改为增量读取模式

## 五、重构建议

### 5.1 核心设计变更

#### 变更 1: Chunks 挂在 Text 节点上
```typescript
// 类型定义
interface TextNodeWithChunks extends Text {
  chunks?: TextChunk[]  // 每个 text 节点维护自己的 chunks
  stableLength?: number  // 稳定部分的长度（不需要动画）
}

// 读取新内容时
function appendToTextNode(textNode: TextNodeWithChunks, newText: string) {
  if (!textNode.chunks) {
    textNode.chunks = []
  }
  textNode.chunks.push({
    text: newText,
    createdAt: Date.now()
  })
}
```

#### 变更 2: Pipe Reader 模式
```typescript
// 维护读取位置
interface ReadPosition {
  node: RootContent
  textNodeIndex: number  // 当前读取到第几个 text 节点
  charIndex: number      // 在当前 text 节点中的字符位置
}

// 每次只读取新增部分
function readNewChars(
  node: RootContent,
  position: ReadPosition,
  maxChars: number
): { text: string, newPosition: ReadPosition } {
  // 深度优先遍历，从 position 开始，读取 maxChars 个字符
  // 直接追加到对应 text 节点的 chunks
  // 返回新的读取位置
}
```

#### 变更 3: 简化显示节点生成
```typescript
// 不需要 slice，直接使用原始 AST + chunks 信息
function getDisplayBlocks(): DisplayBlock[] {
  // completedBlocks: 直接使用原始 node
  // currentBlock: 使用原始 node，但 text 节点有 chunks 信息
  // 渲染器根据 chunks 信息实现 fade 动画
}
```

### 5.2 代码结构简化

#### 简化前（当前）
```
BlockTransformer (628 行)
  ├── 状态管理 (state)
  ├── 缓存机制 (cachedDisplayNode, cachedTotalChars, cachedProgress)
  ├── 动画控制 (requestAnimationFrame, tick)
  ├── AST 操作 (sliceAst, appendToAst, mergeAstNodes)
  ├── Chunks 管理 (transformer.chunks)
  └── 插件系统
```

#### 简化后（建议）
```
BlockTransformer (~300 行)
  ├── 状态管理 (state)
  ├── 读取位置管理 (ReadPosition)
  ├── 动画控制 (requestAnimationFrame, tick)
  ├── Pipe Reader (readNewChars, appendToTextNodeChunks)
  └── 插件系统
```

### 5.3 具体重构步骤

1. **第一步：修改 Chunks 存储位置**
   - 将 `transformer.chunks` 改为每个 text 节点的 `chunks`
   - 修改 `tick()` 中的 chunks 添加逻辑

2. **第二步：实现 Pipe Reader**
   - 添加 `ReadPosition` 类型
   - 实现 `readNewChars()` 函数
   - 实现 `appendToTextNodeChunks()` 函数

3. **第三步：简化显示节点生成**
   - 删除 `sliceAst()` 相关调用
   - 删除 `appendToAst()` 相关调用
   - 删除缓存机制
   - `getDisplayBlocks()` 直接返回原始 AST + chunks

4. **第四步：清理无用代码**
   - 删除 `extractText()`
   - 删除 `updateCachedDisplayNode()`
   - 删除 `getTotalChars()`（或简化）
   - 删除 `clearCache()`
   - 删除 `mergeAstNodes()`

5. **第五步：测试和优化**
   - 确保功能正常
   - 性能测试
   - 边界情况测试

## 六、风险评估

### 6.1 重构风险

1. **功能风险** ⚠️
   - 重构后可能影响现有功能
   - **建议**：充分测试，特别是边界情况

2. **性能风险** ⚠️
   - Pipe Reader 模式可能比 slice 模式更高效（不需要遍历全部 AST）
   - 但也可能引入新的性能问题
   - **建议**：性能测试对比

3. **兼容性风险** ⚠️
   - 如果其他代码依赖当前的实现细节
   - **建议**：检查所有使用 BlockTransformer 的地方

### 6.2 不重构的风险

1. **代码复杂度持续增长** ❌
   - 当前代码已经过长（628 行）
   - 难以理解和维护
   - 容易引入 bug

2. **偏离设计理念** ❌
   - 当前实现不符合你的设计理念
   - 可能导致后续功能难以实现

3. **性能问题** ⚠️
   - 每次 slice 都要遍历 AST
   - 缓存机制虽然优化了，但增加了复杂度

## 七、建议

### 7.1 强烈建议重构

**理由**：
1. ✅ 当前实现偏离了你的设计理念
2. ✅ 代码过长，难以掌控
3. ✅ 过度复杂的缓存和 AST 操作逻辑
4. ✅ Chunks 位置错误，不符合设计

**预期收益**：
1. ✅ 代码量减少约 50%（从 628 行减少到 ~300 行）
2. ✅ 逻辑更清晰，符合 Pipe Reader 设计
3. ✅ 性能可能更好（不需要每次遍历全部 AST）
4. ✅ 更容易理解和维护

### 7.2 重构优先级

1. **P0: Chunks 位置修正**
   - 将 chunks 从 transformer 移到 text 节点
   - 影响：核心功能，必须修改

2. **P1: Pipe Reader 实现**
   - 实现增量读取模式
   - 影响：核心逻辑，必须修改

3. **P2: 简化显示节点生成**
   - 删除 slice 相关逻辑
   - 影响：简化代码，建议修改

4. **P3: 清理无用代码**
   - 删除缓存机制和复杂的 AST 操作
   - 影响：代码清理，建议修改

### 7.3 重构策略

**方案 A: 渐进式重构（推荐）**
1. 先实现 Pipe Reader 模式，保留旧代码
2. 逐步迁移功能
3. 测试通过后删除旧代码
4. **优点**：风险低，可以逐步验证
5. **缺点**：需要维护两套代码一段时间

**方案 B: 完全重写**
1. 基于你的设计理念完全重写
2. 保持接口不变
3. 充分测试后替换
4. **优点**：代码更清晰，没有历史包袱
5. **缺点**：风险较高，需要充分测试

**建议**：采用方案 A，渐进式重构，降低风险。

## 八、总结

### 8.1 当前问题总结

1. ❌ **Chunks 位置错误**：挂在 transformer 上，应该挂在 text 节点上
2. ❌ **Slice 模式错误**：应该使用 Pipe Reader 模式，每次追加而不是 slice
3. ❌ **过度复杂**：缓存机制、AST 合并逻辑过于复杂
4. ❌ **每次遍历 AST**：不符合你的设计，应该只处理新增部分

### 8.2 重构目标

1. ✅ Chunks 挂在 text 节点上
2. ✅ Pipe Reader 模式，增量读取
3. ✅ 代码量减少 50%
4. ✅ 逻辑清晰，易于维护

### 8.3 下一步行动

1. **确认重构方案**：是否采用 Pipe Reader 模式
2. **设计新接口**：ReadPosition、readNewChars 等
3. **实现核心逻辑**：先实现 Pipe Reader，再迁移其他功能
4. **充分测试**：确保功能正常，性能不降

---

**报告生成时间**: 2024-12-19
**分析文件**: `packages/core/src/transformer/BlockTransformer.ts` (628 行)
**相关文件**: 
- `packages/core/src/transformer/utils.ts` (365 行)
- `packages/core/src/transformer/types.ts` (115 行)

# 代码背景色分离更新

## 更新内容

将 inline code（行内代码）和 block code（代码块）的背景色分离，使用不同的颜色以区分两种代码展示形式。

## Token 定义更新

### 之前
```typescript
code: {
  background: string  // 统一的代码背景色
  headerBackground: string
  text: string
}
```

### 现在
```typescript
code: {
  inlineBackground: string  // 行内代码背景色（新增）
  blockBackground: string   // 代码块背景色（重命名）
  headerBackground: string
  text: string
}
```

## 颜色配置

### 亮色主题（default.ts）

```typescript
code: {
  inlineBackground: neutralSeries[3],   // #f1f3f8 - 浅色背景（行内代码）
  blockBackground: neutralSeries[9],    // #011431 - 深色背景（代码块）
  headerBackground: neutralSeries[10],  // #01122d - 更深背景（代码块头部）
  text: neutralSeries[8]                // #34435a - 基础文本颜色
}
```

### 暗色主题（dark.ts）

```typescript
code: {
  inlineBackground: darkNeutralSeries[3],   // #34435a - 适中暗色（行内代码）
  blockBackground: darkNeutralSeries[1],    // #01122d - 深色背景（代码块）
  headerBackground: darkNeutralSeries[2],   // #011431 - 代码块头部
  text: darkNeutralSeries[8]                // #f1f3f8 - 基础文本颜色
}
```

## 视觉对比

### 亮色主题

| 元素 | 背景色 | 视觉效果 |
|------|--------|---------|
| **行内代码** `code` | #f1f3f8 (neutral-3) | 浅灰色，融入文本 |
| **代码块** | #011431 (neutral-9) | 深色，类似终端 |
| **代码块头部** | #01122d (neutral-10) | 更深，区分头部 |

### 暗色主题

| 元素 | 背景色 | 视觉效果 |
|------|--------|---------|
| **行内代码** `code` | #34435a (neutral-3 dark) | 适中暗色 |
| **代码块** | #01122d (neutral-1 dark) | 深色背景 |
| **代码块头部** | #011431 (neutral-2 dark) | 稍浅，区分头部 |

## 更新的文件

### Token 定义
- ✅ `packages/theme/src/tokens/color.ts` - 更新接口定义

### 主题配置
- ✅ `packages/theme/src/themes/default.ts` - 配置亮色主题颜色
- ✅ `packages/theme/src/themes/dark.ts` - 配置暗色主题颜色

### Less 变量
- ✅ `packages/theme/src/styles/variables.less` - 添加新变量

### 组件样式
- ✅ `packages/theme/src/styles/components/inline-code.less` - 使用 `@color-code-inline-background`
- ✅ `packages/theme/src/styles/components/code-block.less` - 使用 `@color-code-block-background`
- ✅ `packages/theme/src/styles/components/mermaid.less` - 使用 `@color-code-block-background`
- ✅ `packages/theme/src/styles/components/default.less` - 使用 `@color-code-block-background`

## 生成的 CSS

### 亮色主题
```css
:root {
  --incremark-color-code-inline-background: #f1f3f8;  /* 浅灰 */
  --incremark-color-code-block-background: #011431;   /* 深色 */
  --incremark-color-code-header-background: #01122d;  /* 更深 */
  --incremark-color-code-text: #34435a;
}
```

### 暗色主题
```css
.incremark-dark {
  --incremark-color-code-inline-background: #34435a;  /* 适中暗 */
  --incremark-color-code-block-background: #01122d;   /* 深色 */
  --incremark-color-code-header-background: #011431;  /* 头部 */
  --incremark-color-code-text: #f1f3f8;
}
```

## 设计理念

### 行内代码 (Inline Code)
- **特点**：嵌入在文本中
- **背景**：浅色（neutral-3），低对比度
- **目的**：轻量标识，不打断阅读流程

### 代码块 (Block Code)
- **特点**：独立展示区域
- **背景**：深色（neutral-9/1），类似终端
- **目的**：聚焦代码内容，提供专业感

## 构建结果

✅ 构建成功：22.80 KB  
✅ CSS 变量正确生成  
✅ 亮色/暗色主题都已更新  
✅ 所有代码相关组件样式已同步  

现在行内代码和代码块有了明确的视觉区分！🎉

