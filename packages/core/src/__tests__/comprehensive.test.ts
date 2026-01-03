/**
 * 全面的 Markdown 语法测试
 * 覆盖所有常见的 Markdown 语法，确保增量解析器正确处理
 */

import { describe, it, expect } from 'vitest'
import { IncremarkParser } from '../parser/IncremarkParser'

// 包含所有 Markdown 语法的完整文档
const COMPREHENSIVE_MARKDOWN = `# 一级标题

## 二级标题

### 三级标题

#### 四级标题

##### 五级标题

###### 六级标题

这是一个普通段落，包含**粗体**、*斜体*、***粗斜体***、~~删除线~~和\`行内代码\`。

这是第二个段落，包含[链接](https://example.com)和![图片](https://example.com/image.png "图片标题")。

---

分割线上方的段落。

***

另一种分割线。

___

第三种分割线。

> 这是一个引用块
> 包含多行内容
>
> 引用中的第二段

> 嵌套引用
>> 第二层引用
>>> 第三层引用

- 无序列表项 1
- 无序列表项 2
  - 嵌套列表项 2.1
  - 嵌套列表项 2.2
    - 更深的嵌套
- 无序列表项 3

* 另一种无序列表
* 使用星号

+ 还有一种无序列表
+ 使用加号

1. 有序列表项 1
2. 有序列表项 2
   1. 嵌套有序列表 2.1
   2. 嵌套有序列表 2.2
3. 有序列表项 3

- [x] 已完成的任务
- [ ] 未完成的任务
- [x] 另一个已完成的任务

\`\`\`javascript
// JavaScript 代码块
function hello(name) {
  console.log(\`Hello, \${name}!\`);
}
hello('World');
\`\`\`

\`\`\`python
# Python 代码块
def hello(name):
    print(f"Hello, {name}!")

hello("World")
\`\`\`

\`\`\`
无语言标识的代码块
just plain text
\`\`\`

~~~
使用波浪线的代码块
也是有效的
~~~

    缩进代码块
    四个空格开头
    这也是代码

| 表头 1 | 表头 2 | 表头 3 |
|--------|:------:|-------:|
| 左对齐 | 居中 | 右对齐 |
| 单元格 | 单元格 | 单元格 |
| 更多内容 | **粗体** | *斜体* |

| 简单表格 | 第二列 |
| --- | --- |
| A | B |
| C | D |

这是一个包含脚注的段落[^1]。

[^1]: 这是脚注的内容。

术语
: 定义列表的定义内容

另一个术语
: 另一个定义

段落中的换行  
使用两个空格后换行。

HTML 实体：&copy; &amp; &lt; &gt; &quot;

自动链接：<https://example.com>

邮箱链接：<email@example.com>

转义字符：\\* \\# \\[ \\] \\( \\) \\! \\\` \\- \\_

行内 HTML：<span style="color: red;">红色文字</span>

<div>
块级 HTML 元素
</div>

段落后的结尾。
`

describe('全面的 Markdown 语法测试', () => {
  it('一次性解析完整文档', () => {
    const parser = new IncremarkParser()
    parser.append(COMPREHENSIVE_MARKDOWN)
    const result = parser.finalize()

    // 验证 AST 存在
    expect(result.ast).toBeDefined()
    expect(result.ast.children.length).toBeGreaterThan(0)

    // 统计节点类型
    const nodeTypes = new Set<string>()
    function collectTypes(node: any) {
      nodeTypes.add(node.type)
      if (node.children) {
        node.children.forEach(collectTypes)
      }
    }
    result.ast.children.forEach(collectTypes)

    // 验证关键节点类型都被解析
    expect(nodeTypes.has('heading')).toBe(true)
    expect(nodeTypes.has('paragraph')).toBe(true)
    expect(nodeTypes.has('blockquote')).toBe(true)
    expect(nodeTypes.has('list')).toBe(true)
    expect(nodeTypes.has('code')).toBe(true)
    expect(nodeTypes.has('table')).toBe(true)
    expect(nodeTypes.has('thematicBreak')).toBe(true)

    console.log('解析出的节点类型:', [...nodeTypes].sort())
    console.log('顶级节点数量:', result.ast.children.length)
  })

  it('逐行解析完整文档', () => {
    const parser = new IncremarkParser()
    const lines = COMPREHENSIVE_MARKDOWN.split('\n')

    let totalCompleted = 0
    for (let i = 0; i < lines.length; i++) {
      const chunk = lines[i] + (i < lines.length - 1 ? '\n' : '')
      const update = parser.append(chunk)

      totalCompleted += update.completed.length

      // 验证每次 append 都返回有效 AST
      expect(update.ast).toBeDefined()
      expect(update.ast.type).toBe('root')
    }

    const result = parser.finalize()
    totalCompleted += result.completed.length

    console.log('逐行解析 - 总完成块数:', totalCompleted)
    console.log('逐行解析 - 最终节点数:', result.ast.children.length)
  })

  it('随机分块解析完整文档', () => {
    const parser = new IncremarkParser()

    // 使用随机长度的分块（5-50 字符）
    let remaining = COMPREHENSIVE_MARKDOWN
    let chunkCount = 0

    while (remaining.length > 0) {
      const chunkSize = Math.min(
        Math.floor(Math.random() * 45) + 5,
        remaining.length
      )
      const chunk = remaining.slice(0, chunkSize)
      remaining = remaining.slice(chunkSize)

      const update = parser.append(chunk)
      chunkCount++

      // 验证 AST 始终有效
      expect(update.ast).toBeDefined()
      expect(update.ast.type).toBe('root')
    }

    const result = parser.finalize()

    console.log('随机分块 - 总块数:', chunkCount)
    console.log('随机分块 - 最终节点数:', result.ast.children.length)

    // 对比一次性解析的结果
    const onePassParser = new IncremarkParser()
    onePassParser.append(COMPREHENSIVE_MARKDOWN)
    const onePassResult = onePassParser.finalize()

    // 节点数量应该相同
    expect(result.ast.children.length).toBe(onePassResult.ast.children.length)
  })

  it('逐字符解析完整文档', () => {
    const parser = new IncremarkParser()

    for (let i = 0; i < COMPREHENSIVE_MARKDOWN.length; i++) {
      const update = parser.append(COMPREHENSIVE_MARKDOWN[i])

      // 验证 AST 始终有效
      expect(update.ast).toBeDefined()
      expect(update.ast.type).toBe('root')
    }

    const result = parser.finalize()

    console.log('逐字符解析 - 最终节点数:', result.ast.children.length)

    // 对比一次性解析的结果
    const onePassParser = new IncremarkParser()
    onePassParser.append(COMPREHENSIVE_MARKDOWN)
    const onePassResult = onePassParser.finalize()

    // 节点数量应该相同
    expect(result.ast.children.length).toBe(onePassResult.ast.children.length)
  })

  it('验证所有标题级别', () => {
    const parser = new IncremarkParser()
    parser.append(COMPREHENSIVE_MARKDOWN)
    const result = parser.finalize()

    const headings = result.ast.children.filter((n: any) => n.type === 'heading')
    const depths = headings.map((h: any) => h.depth)

    expect(depths).toContain(1)
    expect(depths).toContain(2)
    expect(depths).toContain(3)
    expect(depths).toContain(4)
    expect(depths).toContain(5)
    expect(depths).toContain(6)

    console.log('标题级别:', depths)
  })

  it('验证代码块语言', () => {
    const parser = new IncremarkParser()
    parser.append(COMPREHENSIVE_MARKDOWN)
    const result = parser.finalize()

    const codeBlocks = result.ast.children.filter((n: any) => n.type === 'code')
    const languages = codeBlocks.map((c: any) => c.lang || '(none)')

    expect(languages).toContain('javascript')
    expect(languages).toContain('python')

    console.log('代码块语言:', languages)
  })

  it('验证表格结构', () => {
    const parser = new IncremarkParser()
    parser.append(COMPREHENSIVE_MARKDOWN)
    const result = parser.finalize()

    const tables = result.ast.children.filter((n: any) => n.type === 'table')

    expect(tables.length).toBeGreaterThanOrEqual(2)

    for (const table of tables) {
      expect((table as any).children.length).toBeGreaterThan(0)
    }

    console.log('表格数量:', tables.length)
  })

  it('验证列表类型', () => {
    const parser = new IncremarkParser()
    parser.append(COMPREHENSIVE_MARKDOWN)
    const result = parser.finalize()

    const lists = result.ast.children.filter((n: any) => n.type === 'list')

    const orderedCount = lists.filter((l: any) => l.ordered).length
    const unorderedCount = lists.filter((l: any) => !l.ordered).length

    expect(orderedCount).toBeGreaterThan(0)
    expect(unorderedCount).toBeGreaterThan(0)

    console.log('有序列表:', orderedCount, '无序列表:', unorderedCount)
  })

  it('验证分割线', () => {
    const parser = new IncremarkParser()
    parser.append(COMPREHENSIVE_MARKDOWN)
    const result = parser.finalize()

    const thematicBreaks = result.ast.children.filter(
      (n: any) => n.type === 'thematicBreak'
    )

    expect(thematicBreaks.length).toBe(3)

    console.log('分割线数量:', thematicBreaks.length)
  })

  it('验证 abort 中断功能', () => {
    const parser = new IncremarkParser()

    // 只解析一部分
    const partial = COMPREHENSIVE_MARKDOWN.slice(0, 500)
    parser.append(partial)

    // 中断解析
    const result = parser.abort()

    expect(result.ast).toBeDefined()
    expect(result.ast.children.length).toBeGreaterThan(0)
    expect(result.pending.length).toBe(0) // abort 后没有 pending

    console.log('中断后节点数:', result.ast.children.length)
  })

  it('验证 reset 重置功能', () => {
    const parser = new IncremarkParser()

    parser.append('# Hello\n\nWorld')
    parser.finalize()

    // 重置
    parser.reset()

    // 重新解析
    parser.append('# New Content\n\nNew paragraph')
    const result = parser.finalize()

    expect(result.ast.children.length).toBe(2)

    const heading = result.ast.children[0] as any
    expect(heading.type).toBe('heading')
    expect(heading.children[0].value).toBe('New Content')
  })

  it('验证 GFM 扩展功能', () => {
    const parser = new IncremarkParser({ gfm: true })

    const gfmContent = `
| A | B |
|---|---|
| 1 | 2 |

- [x] Task 1
- [ ] Task 2

~~strikethrough~~

https://auto.link
`

    parser.append(gfmContent)
    const result = parser.finalize()

    // 应该有表格
    const tables = result.ast.children.filter((n: any) => n.type === 'table')
    expect(tables.length).toBe(1)

    // 应该有任务列表
    const lists = result.ast.children.filter((n: any) => n.type === 'list')
    expect(lists.length).toBeGreaterThan(0)

    console.log('GFM 功能验证通过')
  })

  it('验证禁用 GFM', () => {
    const parser = new IncremarkParser({ gfm: false })

    const content = `| A | B |
|---|---|
| 1 | 2 |`

    parser.append(content)
    const result = parser.finalize()

    // 没有 GFM，表格语法不会被解析为 table 节点
    const tables = result.ast.children.filter((n: any) => n.type === 'table')
    expect(tables.length).toBe(0)
  })
})

