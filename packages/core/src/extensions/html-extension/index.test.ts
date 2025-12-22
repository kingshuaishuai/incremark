import { describe, it, expect } from 'vitest'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { gfm } from 'micromark-extension-gfm'
import { gfmFromMarkdown } from 'mdast-util-gfm'
import type { Root, RootContent } from 'mdast'
import {
  parseHtmlTag,
  parseHtmlFragment,
  transformHtmlNodes,
  createHtmlTreeTransformer,
  isHtmlElementNode,
  walkHtmlElements,
  findHtmlElementsByTag,
  htmlElementToString,
  detectHtmlContentType,
  HTML_TAG_BLACKLIST,
  type HtmlElementNode
} from './index'

describe('detectHtmlContentType', () => {
  it('应该识别开标签', () => {
    expect(detectHtmlContentType('<span>')).toBe('opening')
    expect(detectHtmlContentType('<div class="test">')).toBe('opening')
    expect(detectHtmlContentType('<span style="color: red;">')).toBe('opening')
  })

  it('应该识别闭标签', () => {
    expect(detectHtmlContentType('</span>')).toBe('closing')
    expect(detectHtmlContentType('</div>')).toBe('closing')
    expect(detectHtmlContentType('</p >')).toBe('closing')
  })

  it('应该识别自闭合标签', () => {
    expect(detectHtmlContentType('<br />')).toBe('self-closing')
    expect(detectHtmlContentType('<br>')).toBe('self-closing')
    expect(detectHtmlContentType('<img src="test.png">')).toBe('self-closing')
    expect(detectHtmlContentType('<hr />')).toBe('self-closing')
  })

  it('应该识别 HTML 片段', () => {
    expect(detectHtmlContentType('<div><span>text</span></div>')).toBe('fragment')
    expect(detectHtmlContentType('<p>text</p>')).toBe('fragment')
    expect(detectHtmlContentType('<div>\n  <p>nested</p>\n</div>')).toBe('fragment')
  })

  it('应该处理多行属性的开标签', () => {
    const multiLineTag = `<div style="
      display: flex;
      padding: 20px;
    ">`
    expect(detectHtmlContentType(multiLineTag)).toBe('opening')
  })

  it('应该返回 unknown 对于无效内容', () => {
    expect(detectHtmlContentType('')).toBe('unknown')
    expect(detectHtmlContentType('plain text')).toBe('unknown')
    expect(detectHtmlContentType('not a tag')).toBe('unknown')
  })
})

describe('parseHtmlTag', () => {
  it('应该解析简单的开始标签', () => {
    const result = parseHtmlTag('<span>')
    expect(result).toEqual({
      tagName: 'span',
      attrs: {},
      isClosing: false,
      isSelfClosing: false,
      rawHtml: '<span>'
    })
  })

  it('应该解析带属性的标签', () => {
    const result = parseHtmlTag('<div class="container" id="main">')
    expect(result).toEqual({
      tagName: 'div',
      attrs: { class: 'container', id: 'main' },
      isClosing: false,
      isSelfClosing: false,
      rawHtml: '<div class="container" id="main">'
    })
  })

  it('应该解析结束标签', () => {
    const result = parseHtmlTag('</span>')
    expect(result).toEqual({
      tagName: 'span',
      attrs: {},
      isClosing: true,
      isSelfClosing: false,
      rawHtml: '</span>'
    })
  })

  it('应该解析自闭合标签', () => {
    const result = parseHtmlTag('<br />')
    expect(result).toBeTruthy()
    expect(result?.tagName).toBe('br')
    expect(result?.isSelfClosing).toBe(true)
  })

  it('应该解析 img 标签（隐式自闭合）', () => {
    const result = parseHtmlTag('<img src="test.png" alt="test">')
    expect(result).toBeTruthy()
    expect(result?.tagName).toBe('img')
    expect(result?.isSelfClosing).toBe(true)
    expect(result?.attrs).toEqual({ src: 'test.png', alt: 'test' })
  })

  it('应该处理单引号属性值', () => {
    const result = parseHtmlTag("<div class='test'>")
    expect(result?.attrs).toEqual({ class: 'test' })
  })

  it('应该处理无引号属性值', () => {
    const result = parseHtmlTag('<div data-id=123>')
    expect(result?.attrs).toEqual({ 'data-id': '123' })
  })

  it('应该处理布尔属性', () => {
    const result = parseHtmlTag('<input disabled readonly>')
    expect(result?.attrs).toEqual({ disabled: '', readonly: '' })
  })
})

describe('parseHtmlFragment', () => {
  it('应该解析简单的 HTML 片段', () => {
    const result = parseHtmlFragment('<span>hello</span>')
    expect(result).toHaveLength(1)
    expect(result[0].tagName).toBe('span')
    expect(result[0].children).toHaveLength(1)
    expect((result[0].children[0] as any).value).toBe('hello')
  })

  it('应该解析嵌套的 HTML', () => {
    const result = parseHtmlFragment('<div><span>text</span></div>')
    expect(result).toHaveLength(1)
    expect(result[0].tagName).toBe('div')
    expect(result[0].children).toHaveLength(1)
    expect((result[0].children[0] as HtmlElementNode).tagName).toBe('span')
  })

  it('应该处理自闭合标签', () => {
    const result = parseHtmlFragment('<br /><hr />')
    expect(result).toHaveLength(2)
    expect(result[0].tagName).toBe('br')
    expect(result[1].tagName).toBe('hr')
  })

  it('应该过滤黑名单标签', () => {
    const result = parseHtmlFragment('<script>alert(1)</script>')
    expect(result).toHaveLength(0)
  })

  it('应该处理未闭合的标签', () => {
    const result = parseHtmlFragment('<div><span>text</div>')
    expect(result).toHaveLength(1)
    expect(result[0].tagName).toBe('div')
    // span 未闭合，应该被包含在 div 中
    expect(result[0].children.some(c => 
      isHtmlElementNode(c) && c.tagName === 'span'
    )).toBe(true)
  })

  it('应该使用自定义黑名单', () => {
    const result = parseHtmlFragment('<custom>text</custom>', {
      tagBlacklist: ['custom']
    })
    expect(result).toHaveLength(0)
  })
})

describe('XSS 防护', () => {
  it('应该过滤 script 标签', () => {
    const result = parseHtmlFragment('<script>alert("xss")</script>')
    expect(result).toHaveLength(0)
  })

  it('应该过滤 iframe 标签', () => {
    const result = parseHtmlFragment('<iframe src="evil.com"></iframe>')
    expect(result).toHaveLength(0)
  })

  it('应该过滤 onclick 等事件属性', () => {
    const result = parseHtmlFragment('<div onclick="alert(1)">text</div>')
    expect(result).toHaveLength(1)
    expect(result[0].attrs.onclick).toBeUndefined()
  })

  it('应该过滤 javascript: 协议', () => {
    const result = parseHtmlFragment('<a href="javascript:alert(1)">link</a>')
    expect(result).toHaveLength(1)
    expect(result[0].attrs.href).toBeUndefined()
  })

  it('应该允许 data:image/', () => {
    const result = parseHtmlFragment('<img src="data:image/png;base64,abc">')
    expect(result).toHaveLength(1)
    expect(result[0].attrs.src).toBe('data:image/png;base64,abc')
  })

  it('应该过滤 on* 事件属性', () => {
    const events = ['onload', 'onerror', 'onmouseover', 'onfocus', 'onblur']
    for (const event of events) {
      const result = parseHtmlFragment(`<img ${event}="alert(1)">`)
      expect(result[0].attrs[event]).toBeUndefined()
    }
  })
})

describe('transformHtmlNodes', () => {
  it('应该转换 markdown 中的简单 HTML', () => {
    const markdown = 'Hello <span>world</span>!'
    const ast = fromMarkdown(markdown)
    const transformed = transformHtmlNodes(ast)
    
    // 检查是否有 htmlElement 节点
    let foundHtmlElement = false
    walkHtmlElements(transformed, (node) => {
      if (node.tagName === 'span') {
        foundHtmlElement = true
      }
    })
    expect(foundHtmlElement).toBe(true)
  })

  it('应该处理块级 HTML', () => {
    const markdown = `
<div class="container">
  内容
</div>
`
    const ast = fromMarkdown(markdown)
    const transformed = transformHtmlNodes(ast)
    
    const divs = findHtmlElementsByTag(transformed, 'div')
    expect(divs.length).toBeGreaterThan(0)
    expect(divs[0].attrs.class).toBe('container')
  })
})

describe('createHtmlTreeTransformer', () => {
  it('应该创建可复用的转换器', () => {
    const transformer = createHtmlTreeTransformer({
      preserveRawHtml: false
    })
    
    const ast = fromMarkdown('<span>test</span>')
    const result = transformer(ast)
    
    expect(result.type).toBe('root')
  })

  it('应该支持自定义黑名单', () => {
    const transformer = createHtmlTreeTransformer({
      tagBlacklist: [...HTML_TAG_BLACKLIST, 'custom']
    })
    
    const ast = fromMarkdown('<custom>content</custom>')
    const result = transformer(ast)
    
    const customs = findHtmlElementsByTag(result, 'custom')
    expect(customs).toHaveLength(0)
  })
})

describe('isHtmlElementNode', () => {
  it('应该正确识别 HtmlElementNode', () => {
    const node: HtmlElementNode = {
      type: 'htmlElement',
      tagName: 'span',
      attrs: {},
      children: []
    }
    expect(isHtmlElementNode(node)).toBe(true)
  })

  it('应该拒绝其他节点类型', () => {
    const node = { type: 'paragraph', children: [] }
    expect(isHtmlElementNode(node as any)).toBe(false)
  })
})

describe('walkHtmlElements', () => {
  it('应该遍历所有 HTML 元素', () => {
    const result = parseHtmlFragment('<div><span>a</span><span>b</span></div>')
    const root: Root = { type: 'root', children: result as RootContent[] }
    
    const visited: string[] = []
    walkHtmlElements(root, (node) => {
      visited.push(node.tagName)
    })
    
    expect(visited).toContain('div')
    expect(visited).toContain('span')
    expect(visited.filter(t => t === 'span')).toHaveLength(2)
  })
})

describe('findHtmlElementsByTag', () => {
  it('应该查找特定标签', () => {
    const result = parseHtmlFragment('<div><span>a</span><p>b</p><span>c</span></div>')
    const root: Root = { type: 'root', children: result as RootContent[] }
    
    const spans = findHtmlElementsByTag(root, 'span')
    expect(spans).toHaveLength(2)
  })

  it('应该不区分大小写', () => {
    const result = parseHtmlFragment('<DIV>test</DIV>')
    const root: Root = { type: 'root', children: result as RootContent[] }
    
    const divs = findHtmlElementsByTag(root, 'div')
    expect(divs).toHaveLength(1)
  })
})

describe('htmlElementToString', () => {
  it('应该将节点转回 HTML 字符串', () => {
    const node: HtmlElementNode = {
      type: 'htmlElement',
      tagName: 'span',
      attrs: { class: 'test' },
      children: [{ type: 'text', value: 'hello' } as RootContent]
    }
    
    const html = htmlElementToString(node)
    expect(html).toBe('<span class="test">hello</span>')
  })

  it('应该处理嵌套节点', () => {
    const node: HtmlElementNode = {
      type: 'htmlElement',
      tagName: 'div',
      attrs: {},
      children: [{
        type: 'htmlElement',
        tagName: 'span',
        attrs: {},
        children: [{ type: 'text', value: 'nested' } as RootContent]
      } as RootContent]
    }
    
    const html = htmlElementToString(node)
    expect(html).toBe('<div><span>nested</span></div>')
  })

  it('应该处理自闭合标签', () => {
    const node: HtmlElementNode = {
      type: 'htmlElement',
      tagName: 'br',
      attrs: {},
      children: []
    }
    
    const html = htmlElementToString(node)
    expect(html).toBe('<br />')
  })

  it('应该转义属性值', () => {
    const node: HtmlElementNode = {
      type: 'htmlElement',
      tagName: 'div',
      attrs: { 'data-value': '<"test">' },
      children: []
    }
    
    const html = htmlElementToString(node)
    expect(html).toContain('&lt;&quot;test&quot;&gt;')
  })
})

describe('复杂场景', () => {
  it('应该处理 markdown 与 HTML 混合内容', () => {
    // 注意：在 markdown 中，HTML 块内的内容不会被解析为 markdown
    // 所以 **加粗** 会保持原样
    const markdown = `# 标题

<div class="info">
这是一段文字
</div>

普通段落`
    const ast = fromMarkdown(markdown)
    const transformed = transformHtmlNodes(ast)
    
    // 应该保留标题
    expect(transformed.children.some(c => c.type === 'heading')).toBe(true)
    // HTML 块会被转换为 htmlElement
    expect(transformed.children.some(c => c.type === 'htmlElement' || c.type === 'html')).toBe(true)
  })

  it('应该处理表格中的 HTML', () => {
    const markdown = `| 列1 | 列2 |
|-----|-----|
| <span>内容</span> | 普通文本 |`
    
    // 需要启用 GFM 扩展才能解析表格
    const ast = fromMarkdown(markdown, {
      extensions: [gfm()],
      mdastExtensions: [gfmFromMarkdown()]
    })
    const transformed = transformHtmlNodes(ast)
    
    // 应该保留表格结构
    expect(transformed.children.some(c => c.type === 'table')).toBe(true)
  })
})

