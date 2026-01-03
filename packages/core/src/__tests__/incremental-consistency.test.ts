/**
 * 增量解析一致性测试
 *
 * 核心目标：确保增量解析与一次性解析的 AST 结构完全一致
 *
 * 测试策略：
 * 1. 基于 CommonMark 语法创建代表性测试用例
 * 2. 对比增量解析（多种分块策略）与一次性解析的 AST
 * 3. 确保所有分块策略都能得到相同的 AST
 */

import { describe, it, expect } from 'vitest'
import { IncremarkParser } from '../parser/IncremarkParser'
import {
  assertIncrementalConsistency,
  DEFAULT_CHUNK_STRATEGIES,
} from './helpers/test-utils'

describe('增量解析一致性测试 - 基础语法', () => {
  describe('ATX 标题', () => {
    it('一级标题', () => {
      assertIncrementalConsistency(
        '# 一级标题',
        '一级标题'
      )
    })

    it('所有级别标题', () => {
      const markdown = `# 一级标题

## 二级标题

### 三级标题

#### 四级标题

##### 五级标题

###### 六级标题`

      assertIncrementalConsistency(
        markdown,
        '所有级别标题'
      )
    })

    it('标题后紧接内容', () => {
      const markdown = `# 标题
内容段落`

      assertIncrementalConsistency(
        markdown,
        '标题后紧接内容'
      )
    })

    it('标题间有空行', () => {
      const markdown = `# 第一个标题

# 第二个标题

# 第三个标题`

      assertIncrementalConsistency(
        markdown,
        '标题间有空行'
      )
    })
  })

  describe('段落', () => {
    it('单个段落', () => {
      assertIncrementalConsistency(
        '这是一个简单的段落。',
        '单个段落'
      )
    })

    it('多个段落（空行分隔）', () => {
      const markdown = `第一个段落。

第二个段落。

第三个段落。`

      assertIncrementalConsistency(
        markdown,
        '多个段落'
      )
    })

    it('段落内行内格式', () => {
      const markdown = `段落包含**粗体**、*斜体*、\\\`代码\\\`和[链接](https://example.com)。`

      assertIncrementalConsistency(
        markdown,
        '段落内行内格式'
      )
    })

    it('段落内转义字符', () => {
      const markdown = `段落包含\\\\#不是标题和\\\\*\\\\*不是粗体\\\\*\\\\*的内容。`

      assertIncrementalConsistency(
        markdown,
        '段落内转义字符'
      )
    })
  })

  describe('分割线', () => {
    it('星号分割线', () => {
      assertIncrementalConsistency(
        '***',
        '星号分割线'
      )
    })

    it('减号分割线', () => {
      assertIncrementalConsistency(
        '---',
        '减号分割线'
      )
    })

    it('下划线分割线', () => {
      assertIncrementalConsistency(
        '___',
        '下划线分割线'
      )
    })

    it('分割线前后有内容', () => {
      const markdown = `分割线前

***

分割线后`

      assertIncrementalConsistency(
        markdown,
        '分割线前后有内容'
      )
    })
  })

  describe('代码块', () => {
    it('简单代码块', () => {
      const markdown = `\\\`\\\`\\\`javascript
console.log('Hello, World!');
\\\`\\\`\\\``

      assertIncrementalConsistency(
        markdown,
        '简单代码块'
      )
    })

    it('多行代码块', () => {
      const markdown = `\\\`\\\`\\\`python
def hello(name):
    print(f"Hello, {name}!")

hello('World')
\\\`\\\`\\\``

      assertIncrementalConsistency(
        markdown,
        '多行代码块'
      )
    })

    it('无语言标识代码块', () => {
      const markdown = `\\\`\\\`\\\`
纯文本代码
\\\`\\\`\\\``

      assertIncrementalConsistency(
        markdown,
        '无语言标识代码块'
      )
    })

    it('波浪线代码块', () => {
      const markdown = `~~~\n波浪线代码块\n~~~`

      assertIncrementalConsistency(
        markdown,
        '波浪线代码块'
      )
    })

    it('代码块包含特殊字符', () => {
      const markdown = `\\\`\\\`\\\`
包含特殊字符: \\\`'"$&*()[]{}
\\\`\\\`\\\``

      assertIncrementalConsistency(
        markdown,
        '代码块包含特殊字符'
      )
    })

    it('代码块后接内容', () => {
      const markdown = `\\\`\\\`\\\`
代码内容
\\\`\\\`\\\`

后续段落`

      assertIncrementalConsistency(
        markdown,
        '代码块后接内容'
      )
    })
  })

  describe('行内代码', () => {
    it('简单行内代码', () => {
      assertIncrementalConsistency(
        '这是一段包含`code`的文本。',
        '简单行内代码'
      )
    })

    it('多个行内代码', () => {
      assertIncrementalConsistency(
        '包含`first`和`second`和`third`的文本。',
        '多个行内代码'
      )
    })

    it('行内代码包含特殊字符', () => {
      assertIncrementalConsistency(
        '包含`code with "quotes" and \'apostrophes\'`的文本。',
        '行内代码包含特殊字符'
      )
    })
  })
})

describe('增量解析一致性测试 - 列表', () => {
  describe('无序列表', () => {
    it('简单无序列表', () => {
      const markdown = `- 第一项
- 第二项
- 第三项`

      assertIncrementalConsistency(
        markdown,
        '简单无序列表'
      )
    })

    it('不同标记符无序列表', () => {
      const markdown = `- 减号项
* 星号项
+ 加号项`

      assertIncrementalConsistency(
        markdown,
        '不同标记符无序列表'
      )
    })

    it('嵌套无序列表', () => {
      const markdown = `- 第一层
  - 第二层
    - 第三层`

      assertIncrementalConsistency(
        markdown,
        '嵌套无序列表'
      )
    })

    it('列表项多行内容', () => {
      const markdown = `- 第一项
  续行内容
- 第二项`

      assertIncrementalConsistency(
        markdown,
        '列表项多行内容'
      )
    })

    it('列表项间有空行', () => {
      const markdown = `- 第一项

- 第二项

- 第三项`

      assertIncrementalConsistency(
        markdown,
        '列表项间有空行'
      )
    })

    it('列表包含段落', () => {
      const markdown = `- 第一项

  续段落内容

- 第二项`

      assertIncrementalConsistency(
        markdown,
        '列表包含段落'
      )
    })
  })

  describe('有序列表', () => {
    it('简单有序列表', () => {
      const markdown = `1. 第一项
2. 第二项
3. 第三项`

      assertIncrementalConsistency(
        markdown,
        '简单有序列表'
      )
    })

    it('不连续数字有序列表', () => {
      const markdown = `1. 第一项
5. 第二项
10. 第三项`

      assertIncrementalConsistency(
        markdown,
        '不连续数字有序列表'
      )
    })

    it('嵌套有序列表', () => {
      const markdown = `1. 第一层
   1. 第二层
      1. 第三层`

      assertIncrementalConsistency(
        markdown,
        '嵌套有序列表'
      )
    })

    it('混合列表（有序+无序）', () => {
      const markdown = `1. 有序列表项
   - 无序子项
   - 另一个子项
2. 第二个有序项`

      assertIncrementalConsistency(
        markdown,
        '混合列表'
      )
    })
  })

  describe('任务列表', () => {
    it('已完成任务', () => {
      const markdown = `- [x] 已完成任务
- [x] 另一个已完成`

      assertIncrementalConsistency(
        markdown,
        '已完成任务'
      )
    })

    it('未完成任务', () => {
      const markdown = `- [ ] 未完成任务
- [ ] 另一个未完成`

      assertIncrementalConsistency(
        markdown,
        '未完成任务'
      )
    })

    it('混合任务状态', () => {
      const markdown = `- [x] 已完成
- [ ] 未完成
- [x] 又已完成`

      assertIncrementalConsistency(
        markdown,
        '混合任务状态'
      )
    })
  })
})

describe('增量解析一致性测试 - 引用块', () => {
  it('简单引用块', () => {
    assertIncrementalConsistency(
      '> 这是一个引用块',
      '简单引用块'
    )
  })

  it('多行引用块', () => {
    const markdown = `> 第一行引用
> 第二行引用
> 第三行引用`

    assertIncrementalConsistency(
      markdown,
      '多行引用块'
    )
  })

  it('嵌套引用块', () => {
    const markdown = `> 外层引用
>> 内层引用
>>> 更深层的引用`

    assertIncrementalConsistency(
      markdown,
      '嵌套引用块'
    )
  })

  it('引用块包含其他元素', () => {
    const markdown = `> 引用中的**粗体**
> 引用中的*斜体*
> 引用中的\\\`代码\\\``

      assertIncrementalConsistency(
        markdown,
        '引用块包含其他元素'
      )
    })

  it('引用块包含列表', () => {
    const markdown = `> 引用段落
>
> - 列表项 1
> - 列表项 2`

    assertIncrementalConsistency(
      markdown,
      '引用块包含列表'
    )
  })

  it('引用块包含代码块', () => {
    const markdown = `> 引用段落
>
> \\\`\\\`\\\`
> 引用中的代码块
> \\\`\\\`\\\``

      assertIncrementalConsistency(
        markdown,
        '引用块包含代码块'
      )
    })
})

describe('增量解析一致性测试 - 链接和图片', () => {
  describe('链接', () => {
    it('行内链接', () => {
      assertIncrementalConsistency(
        '这是一个[链接](https://example.com)。',
        '行内链接'
      )
    })

    it('带标题的链接', () => {
      assertIncrementalConsistency(
        '这是一个[链接](https://example.com "标题")。',
        '带标题的链接'
      )
    })

    it('引用式链接', () => {
      const markdown = `这是一个[引用式链接][id]。

[id]: https://example.com "链接标题"`

      assertIncrementalConsistency(
        markdown,
        '引用式链接'
      )
    })

    it('简化引用式链接', () => {
      const markdown = `[简化链接][]

[simplified]: https://example.com`

      assertIncrementalConsistency(
        markdown,
        '简化引用式链接'
      )
    })

    it('自动链接', () => {
      assertIncrementalConsistency(
        '这是一个自动链接：https://example.com',
        '自动链接'
      )
    })
  })

  describe('图片', () => {
    it('行内图片', () => {
      assertIncrementalConsistency(
        '这是一张![图片](https://example.com/image.png)。',
        '行内图片'
      )
    })

    it('带标题的图片', () => {
      assertIncrementalConsistency(
        '这是一张![图片](https://example.com/image.png "图片标题")。',
        '带标题的图片'
      )
    })

    it('引用式图片', () => {
      const markdown = `这是一张![引用式图片][img]。

[img]: https://example.com/image.png "图片标题"`

      assertIncrementalConsistency(
        markdown,
        '引用式图片'
      )
    })

    it('引用式图片在定义前', () => {
      const markdown = `这是![图片][id]。

[id]: https://example.com/image.png`

      assertIncrementalConsistency(
        markdown,
        '引用式图片在定义前'
      )
    })
  })

  describe('Definition 增量解析', () => {
    it('定义在引用后', () => {
      const markdown = `使用[链接][id]。

[id]: https://example.com`

      assertIncrementalConsistency(
        markdown,
        '定义在引用后'
      )
    })

    it('多个定义', () => {
      const markdown = `[ref1]: https://example1.com
[ref2]: https://example2.com
[ref3]: https://example3.com`

      assertIncrementalConsistency(
        markdown,
        '多个定义'
      )
    })

    it('增量添加定义', () => {
      // 这个测试需要手动测试增量解析过程
      // 因为需要验证中间状态
      const markdown = `使用[link1]和[link2]。

[link1]: https://example1.com
[link2]: https://example2.com`

      assertIncrementalConsistency(
        markdown,
        '增量添加定义'
      )
    })
  })
})

describe('增量解析一致性测试 - 表格', () => {
  it('简单表格', () => {
    const markdown = `| 表头 1 | 表头 2 |
|---------|---------|
| 单元格 1 | 单元格 2 |`

      assertIncrementalConsistency(
        markdown,
        '简单表格'
      )
  })

  it('对齐表格', () => {
    const markdown = `| 左对齐 | 居中 | 右对齐 |
|:--------|:----:|--------:|
| 左     | 中    | 右     |`

      assertIncrementalConsistency(
        markdown,
        '对齐表格'
      )
  })

  it('多行表格', () => {
    const markdown = `| A | B | C |
|---|---|---|
| 1 | 2 | 3 |
| 4 | 5 | 6 |
| 7 | 8 | 9 |`

      assertIncrementalConsistency(
        markdown,
        '多行表格'
      )
  })

  it('表格包含行内格式', () => {
    const markdown = `| 正常 | **粗体** | \\\`代码\\\` |
|-------|---------|------|
| 文本 | 粗体  | 代码  |`

      assertIncrementalConsistency(
        markdown,
        '表格包含行内格式'
      )
  })
})

describe('增量解析一致性测试 - 脚注', () => {
  it('简单脚注', () => {
    const markdown = `段落[^1]。

[^1]: 脚注内容。`

    assertIncrementalConsistency(
      markdown,
      '简单脚注'
    )
  })

  it('多个脚注', () => {
    const markdown = `第一个[^a]和第二个[^b]。

[^a]: 脚注 A。
[^b]: 脚注 B。`

    assertIncrementalConsistency(
      markdown,
      '多个脚注'
    )
  })

  it('多行脚注', () => {
    const markdown = `脚注[^long]。

[^long]: 第一段
    第二段（缩进）
    第三段（缩进）`

    assertIncrementalConsistency(
      markdown,
      '多行脚注'
    )
  })

  it('脚注包含列表', () => {
    const markdown = `段落[^1]。

[^1]: 脚注说明
    - 列表项 1
    - 列表项 2`

    assertIncrementalConsistency(
      markdown,
      '脚注包含列表'
    )
  })

  it('脚注引用顺序', () => {
    const markdown = `第二个[^2]出现在第一个[^1]之前。

[^1]: 第一个定义。
[^2]: 第二个定义。`

      assertIncrementalConsistency(
        markdown,
        '脚注引用顺序'
      )
  })
})

describe('增量解析一致性测试 - 复杂嵌套', () => {
  it('引用中嵌套列表', () => {
    const markdown = `> 引用段落
>
> - 列表项 1
> - 列表项 2`

      assertIncrementalConsistency(
        markdown,
        '引用中嵌套列表'
      )
  })

  it('列表中嵌套引用', () => {
    const markdown = `- 列表项
  > 嵌套引用
  > 引用续行
- 另一个列表项`

      assertIncrementalConsistency(
        markdown,
        '列表中嵌套引用'
      )
  })

    it('三重嵌套（引用-列表-代码）', () => {
      const markdown = `> 外层引用
>   - 中层列表
>     \\\`\\\`\\\`
>     内层代码块
>     \\\`\\\`\\\``

      assertIncrementalConsistency(
        markdown,
        '三重嵌套'
      )
    })

  it('混合嵌套场景', () => {
    const markdown = `# 标题

> 引用开始
>
> ## 引用中的标题
>
> - 列表项
>   > 列表中的引用
>   > \\\`\\\`\\\`
>   > 引用列表中的代码
>   > \\\`\\\`\\\`
>
> 引用结束

普通段落继续。

1. 有序列表
2. 第二项
   - 嵌套无序
   - 第二个嵌套

\`\`\`
代码块
\`\`\``

      assertIncrementalConsistency(
        markdown,
        '混合嵌套场景'
      )
  })
})

describe('增量解析一致性测试 - 边界情况', () => {
  it('空输入', () => {
    assertIncrementalConsistency(
      '',
      '空输入'
    )
  })

  it('只有空白字符', () => {
    assertIncrementalConsistency(
      '   \n\n\t\t\n   \n',
      '只有空白字符'
    )
  })

  it('只有换行符', () => {
    assertIncrementalConsistency(
      '\n\n\n\n\n',
      '只有换行符'
    )
  })

  it('单个字符', () => {
    assertIncrementalConsistency(
      'a',
      '单个字符'
    )
  })

  it('超长单行', () => {
    const longLine = 'a'.repeat(1000)
    assertIncrementalConsistency(
      longLine,
      '超长单行'
    )
  })

  it('大量短行', () => {
    const lines = Array.from({ length: 100 }, (_, i) => `line ${i}`).join('\n')
    assertIncrementalConsistency(
      lines,
      '大量短行'
    )
  })

  it('未闭合的代码块', () => {
    assertIncrementalConsistency(
      '```javascript\nconst x = 1;\n// 没有闭合',
      '未闭合的代码块'
    )
  })

  it('不完整的链接', () => {
    assertIncrementalConsistency(
      '[链接文字(没有URL',
      '不完整的链接'
    )
  })

  it('不匹配的代码块标记', () => {
    assertIncrementalConsistency(
      '```\ncode\n~~~',
      '不匹配的代码块标记'
    )
  })

  it('嵌套的代码块标记', () => {
    assertIncrementalConsistency(
      '````\n```\ncode\n```\n````',
      '嵌套的代码块标记'
    )
  })
})

describe('增量解析一致性测试 - 混合内容', () => {
  it('文档级别的混合', () => {
    const markdown = `# 文档标题

这是一段介绍文字，包含**粗体**和*斜体*。

## 子标题

> 这是一个引用块
> 包含\\\`行内代码\\\`

### 三级标题

- 列表项 1
- 列表项 2
  - 嵌套项

---

分割线

\`\`\`javascript
console.log('代码');
\`\`\`

[链接](https://example.com)

[^1]: 脚注说明

第二段普通文本。`

    assertIncrementalConsistency(
      markdown,
      '文档级别的混合'
    )
  })

  it('AI 聊天场景', () => {
    const markdown = `这是一个模拟 AI 流式输出的文档。

首先，我来介绍一些基础知识：

## Markdown 基础

Markdown 是一种轻量级标记语言，主要特点包括：

1. 易读易写
2. 纯文本格式
3. 转换为 HTML

> "Markdown 的设计目标是使其尽可能易读。"
> —— John Gruber

### 常用语法

- **粗体文本**
- *斜体文本*
- \`代码片段\`
- [链接](https://example.com)

#### 代码示例

\`\`\`python
def hello_world():
    print("Hello, World!")
    
hello_world()
\`\`\`

### 表格示例

| 功能 | 支持情况 |
|------|----------|
| 基础语法 | ✅ |
| GFM 扩展 | ✅ |
| 数学公式 | ✅ |

---

总结：Markdown 适合编写技术文档[^1]。

[^1]: 更多信息请参考 [CommonMark 规范](https://spec.commonmark.org/)。`

    assertIncrementalConsistency(
      markdown,
      'AI 聊天场景'
    )
  })
})

