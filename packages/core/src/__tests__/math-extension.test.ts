/**
 * 数学公式扩展测试
 *
 * 测试 Marked 引擎对数学公式的解析能力
 *
 * 默认支持的分隔符：
 * - 行内公式：$...$
 * - 块级公式：$$...$$
 *
 * 可选支持的分隔符（需要配置开启）：
 * - 行内公式：\(...\)
 * - 块级公式：\[...\]
 */
import { describe, it, expect } from 'vitest'
import { MarkedAstBuilder } from '../parser/ast/MarkedAstBuildter'
import type { Paragraph } from 'mdast'

describe('Marked 数学公式扩展 - 默认配置', () => {
  // 默认配置：只支持 $ 和 $$ 语法
  const builder = new MarkedAstBuilder({ math: true, gfm: true })

  describe('行内公式 - $ 分隔符', () => {
    it('解析简单行内公式', () => {
      const ast = builder.parse('这是 $E = mc^2$ 公式')
      const para = ast.children[0] as Paragraph

      expect(para.type).toBe('paragraph')
      expect(para.children.length).toBe(3)
      expect(para.children[0]).toMatchObject({ type: 'text', value: '这是 ' })
      expect(para.children[1]).toMatchObject({ type: 'inlineMath', value: 'E = mc^2' })
      expect(para.children[2]).toMatchObject({ type: 'text', value: ' 公式' })
    })

    it('解析多个行内公式', () => {
      const ast = builder.parse('公式 $a$ 和 $b$ 以及 $c$')
      const para = ast.children[0] as Paragraph

      const mathNodes = para.children.filter((c: any) => c.type === 'inlineMath')
      expect(mathNodes.length).toBe(3)
      expect((mathNodes[0] as any).value).toBe('a')
      expect((mathNodes[1] as any).value).toBe('b')
      expect((mathNodes[2] as any).value).toBe('c')
    })

    it('解析带下标的公式', () => {
      const ast = builder.parse('$x_1 + x_2 = x_3$')
      const para = ast.children[0] as Paragraph

      expect(para.children[0]).toMatchObject({ type: 'inlineMath', value: 'x_1 + x_2 = x_3' })
    })

    it('解析带上标的公式', () => {
      const ast = builder.parse('$x^2 + y^2 = z^2$')
      const para = ast.children[0] as Paragraph

      expect(para.children[0]).toMatchObject({ type: 'inlineMath', value: 'x^2 + y^2 = z^2' })
    })

    it('解析带 LaTeX 命令的公式', () => {
      const ast = builder.parse('$\\frac{a}{b} = c$')
      const para = ast.children[0] as Paragraph

      expect(para.children[0]).toMatchObject({ type: 'inlineMath', value: '\\frac{a}{b} = c' })
    })

    it('不匹配 $$ 开头（块级公式）', () => {
      const ast = builder.parse('$$x^2$$')

      // 应该被解析为块级公式，不是行内
      expect((ast.children[0] as any).type).toBe('math')
    })

    it('不匹配后跟数字的 $（如价格）', () => {
      const ast = builder.parse('价格是 $100')
      const para = ast.children[0] as Paragraph

      // 应该保留为普通文本
      expect(para.children[0]).toMatchObject({ type: 'text', value: '价格是 $100' })
    })
  })

  describe('块级公式 - $$ 分隔符', () => {
    it('解析简单块级公式', () => {
      const ast = builder.parse('$$\nE = mc^2\n$$')

      expect(ast.children[0]).toMatchObject({ type: 'math', value: 'E = mc^2' })
    })

    it('解析单行块级公式', () => {
      const ast = builder.parse('$$E = mc^2$$')

      expect(ast.children[0]).toMatchObject({ type: 'math', value: 'E = mc^2' })
    })

    it('解析多行块级公式', () => {
      const ast = builder.parse('$$\na + b = c \\\\\nc + d = e\n$$')
      const mathNode = ast.children[0] as any

      expect(mathNode.type).toBe('math')
      expect(mathNode.value).toContain('a + b = c')
      expect(mathNode.value).toContain('c + d = e')
    })

    it('解析带对齐环境的公式', () => {
      const md = `$$
\\begin{align}
a &= b + c \\\\
d &= e + f
\\end{align}
$$`
      const ast = builder.parse(md)
      const mathNode = ast.children[0] as any

      expect(mathNode.type).toBe('math')
      expect(mathNode.value).toContain('\\begin{align}')
    })
  })

  describe('默认不支持 LaTeX 分隔符', () => {
    it('\\( \\) 不被解析为公式（默认关闭）', () => {
      const ast = builder.parse('这是 \\(E = mc^2\\) 公式')
      const para = ast.children[0] as Paragraph

      // 默认配置下，\( \) 不应该被解析为公式
      expect(para.children.every((c: any) => c.type !== 'inlineMath')).toBe(true)
    })

    it('\\[ \\] 不被解析为公式（默认关闭）', () => {
      const ast = builder.parse('\\[\nE = mc^2\n\\]')

      // 默认配置下，\[ \] 不应该被解析为块级公式
      expect((ast.children[0] as any).type).not.toBe('math')
    })
  })

  describe('边界情况', () => {
    it('公式前后有其他 Markdown 语法', () => {
      const ast = builder.parse('**粗体** $x^2$ *斜体*')
      const para = ast.children[0] as Paragraph

      expect(para.children.some((c: any) => c.type === 'inlineMath')).toBe(true)
      expect(para.children.some((c: any) => c.type === 'strong')).toBe(true)
      expect(para.children.some((c: any) => c.type === 'emphasis')).toBe(true)
    })

    it('代码块中的 $ 不被解析为公式', () => {
      const ast = builder.parse('`$x^2$`')
      const para = ast.children[0] as Paragraph

      expect(para.children[0]).toMatchObject({ type: 'inlineCode', value: '$x^2$' })
    })

    it('行内代码后的公式正常解析', () => {
      const ast = builder.parse('代码 `code` 和公式 $x$')
      const para = ast.children[0] as Paragraph

      expect(para.children.some((c: any) => c.type === 'inlineCode')).toBe(true)
      expect(para.children.some((c: any) => c.type === 'inlineMath')).toBe(true)
    })

    it('空公式不被解析', () => {
      const ast = builder.parse('空的 $$ 不是公式')
      const para = ast.children[0] as Paragraph

      // 空的 $$ 不应该被解析为公式
      expect(para.children.every((c: any) => c.type !== 'inlineMath')).toBe(true)
    })
  })
})

describe('Marked 数学公式扩展 - 启用 TeX 风格', () => {
  // 启用 TeX 风格：支持 \( \) 和 \[ \]
  const builder = new MarkedAstBuilder({
    math: { tex: true },
    gfm: true,
  })

  describe('行内公式 - \\( \\) 分隔符', () => {
    it('解析简单行内公式', () => {
      const ast = builder.parse('这是 \\(E = mc^2\\) 公式')
      const para = ast.children[0] as Paragraph

      expect(para.type).toBe('paragraph')
      expect(para.children.length).toBe(3)
      expect(para.children[0]).toMatchObject({ type: 'text', value: '这是 ' })
      expect(para.children[1]).toMatchObject({ type: 'inlineMath', value: 'E = mc^2' })
      expect(para.children[2]).toMatchObject({ type: 'text', value: ' 公式' })
    })

    it('解析带 LaTeX 命令的公式', () => {
      const ast = builder.parse('公式 \\(\\theta^{\\star}\\) 表示参数')
      const para = ast.children[0] as Paragraph

      const mathNode = para.children.find((c: any) => c.type === 'inlineMath')
      expect(mathNode).toBeDefined()
      expect((mathNode as any).value).toBe('\\theta^{\\star}')
    })

    it('解析复杂的学术公式', () => {
      const ast = builder.parse('内积 \\(\\langle \\theta^{\\star}, z \\rangle\\) 计算')
      const para = ast.children[0] as Paragraph

      const mathNode = para.children.find((c: any) => c.type === 'inlineMath')
      expect(mathNode).toBeDefined()
      expect((mathNode as any).value).toContain('\\langle')
    })

    it('解析多个 LaTeX 风格公式', () => {
      const ast = builder.parse('有 \\(a\\) 和 \\(b\\) 两个变量')
      const para = ast.children[0] as Paragraph

      const mathNodes = para.children.filter((c: any) => c.type === 'inlineMath')
      expect(mathNodes.length).toBe(2)
    })
  })

  describe('块级公式 - \\[ \\] 分隔符', () => {
    it('解析简单块级公式', () => {
      const ast = builder.parse('\\[\nE = mc^2\n\\]')

      expect(ast.children[0]).toMatchObject({ type: 'math', value: 'E = mc^2' })
    })

    it('解析单行块级公式', () => {
      const ast = builder.parse('\\[E = mc^2\\]')

      expect(ast.children[0]).toMatchObject({ type: 'math', value: 'E = mc^2' })
    })

    it('解析复杂的 LaTeX 公式', () => {
      const md = `\\[
L = \\frac{1}{2} \\rho v^2 S C_L
\\]`
      const ast = builder.parse(md)
      const mathNode = ast.children[0] as any

      expect(mathNode.type).toBe('math')
      expect(mathNode.value).toContain('\\frac')
    })

    it('解析多行块级公式', () => {
      const md = `\\[
\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}
\\]`
      const ast = builder.parse(md)
      const mathNode = ast.children[0] as any

      expect(mathNode.type).toBe('math')
      expect(mathNode.value).toContain('\\sum')
    })
  })

  describe('混合分隔符', () => {
    it('同时使用 $ 和 \\( \\) 行内公式', () => {
      const ast = builder.parse('有 $a$ 和 \\(b\\) 两个变量')
      const para = ast.children[0] as Paragraph

      const mathNodes = para.children.filter((c: any) => c.type === 'inlineMath')
      expect(mathNodes.length).toBe(2)
      expect((mathNodes[0] as any).value).toBe('a')
      expect((mathNodes[1] as any).value).toBe('b')
    })

    it('同时使用 $$ 和 \\[ \\] 块级公式', () => {
      const md = `$$
a = b
$$

\\[
c = d
\\]`
      const ast = builder.parse(md)

      expect(ast.children.length).toBe(2)
      expect((ast.children[0] as any).type).toBe('math')
      expect((ast.children[0] as any).value).toBe('a = b')
      expect((ast.children[1] as any).type).toBe('math')
      expect((ast.children[1] as any).value).toBe('c = d')
    })
  })

  describe('真实场景 - 学术论文', () => {
    it('解析学术论文中的公式', () => {
      const md = `本研究探讨了神经网络在学习高斯单索引模型时的表现。输出 \\(y\\) 依赖于输入 \\(z \\sim \\mathcal{N}(0, I_d)\\) 与未知信号 \\(\\theta^{\\star} \\in \\mathbb{R}^d\\) 之间的内积。`
      const ast = builder.parse(md)
      const para = ast.children[0] as Paragraph

      const mathNodes = para.children.filter((c: any) => c.type === 'inlineMath')
      expect(mathNodes.length).toBeGreaterThanOrEqual(3)
    })

    it('解析带复杂度表示的公式', () => {
      const md = `样本复杂度为 \\(\\tilde{O}(d^{s^{\\star}/2} \\vee d)\\)，对于所有 \\(s^{\\star} \\geq 1\\) 的情况。`
      const ast = builder.parse(md)
      const para = ast.children[0] as Paragraph

      const mathNodes = para.children.filter((c: any) => c.type === 'inlineMath')
      expect(mathNodes.length).toBe(2)
    })
  })
})

describe('数学公式 - 未启用 math 选项', () => {
  const builder = new MarkedAstBuilder({ math: false, gfm: true })

  it('$ 不被解析为公式', () => {
    const ast = builder.parse('$x^2$')
    const para = ast.children[0] as Paragraph

    // 没有启用 math 时，$ 应该保留为普通文本
    expect(para.children[0]).toMatchObject({ type: 'text' })
    expect((para.children[0] as any).value).toContain('$')
  })

  it('\\( \\) 不被解析为公式', () => {
    const ast = builder.parse('\\(x^2\\)')
    const para = ast.children[0] as Paragraph

    // 没有启用 math 时，\( \) 应该保留为普通文本
    expect(para.children.every((c: any) => c.type !== 'inlineMath')).toBe(true)
  })
})

describe('数学公式 - tex 配置测试', () => {
  describe('tex: false（默认）', () => {
    const builder = new MarkedAstBuilder({
      math: { tex: false },
      gfm: true,
    })

    it('\\( \\) 不被解析为公式', () => {
      const ast = builder.parse('这是 \\(E = mc^2\\) 公式')
      const para = ast.children[0] as Paragraph

      expect(para.children.every((c: any) => c.type !== 'inlineMath')).toBe(true)
    })

    it('\\[ \\] 不被解析为公式', () => {
      const ast = builder.parse('\\[\nE = mc^2\n\\]')

      // tex 未启用，\[ \] 不应该被解析
      expect((ast.children[0] as any).type).not.toBe('math')
    })
  })

  describe('tex: true', () => {
    const builder = new MarkedAstBuilder({
      math: { tex: true },
      gfm: true,
    })

    it('\\( \\) 被解析为公式', () => {
      const ast = builder.parse('这是 \\(E = mc^2\\) 公式')
      const para = ast.children[0] as Paragraph

      expect(para.children.some((c: any) => c.type === 'inlineMath')).toBe(true)
    })

    it('\\[ \\] 被解析为公式', () => {
      const ast = builder.parse('\\[\nE = mc^2\n\\]')

      expect(ast.children[0]).toMatchObject({ type: 'math', value: 'E = mc^2' })
    })
  })
})
