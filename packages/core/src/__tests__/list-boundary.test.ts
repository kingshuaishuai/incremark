/**
 * P0-2: 列表边界检测测试
 *
 * 测试列表项之间的空行边界判断，确保增量解析与一次解析结果一致
 */

import { describe, it, expect } from 'vitest'
import { IncremarkParser } from '../parser/IncremarkParser'

/**
 * 移除 AST 中的 position 等动态属性，便于比较
 */
function normalizeAst(ast: any): any {
  if (!ast || typeof ast !== 'object') {
    return ast
  }

  if (Array.isArray(ast)) {
    return ast.map(normalizeAst)
  }

  const result: any = {}
  for (const key in ast) {
    if (key === 'position') {
      continue
    }
    result[key] = normalizeAst(ast[key])
  }
  return result
}

/**
 * 比较两个 AST 是否相等
 */
function astEqual(ast1: any, ast2: any): boolean {
  return JSON.stringify(normalizeAst(ast1)) === JSON.stringify(normalizeAst(ast2))
}

describe('P0-2: 列表边界检测', () => {
  it('列表后接段落（有空行）', () => {
    const markdown = `- 第一项\n- 第二项\n\n段落开始`

    // 一次性解析
    const onePassParser = new IncremarkParser()
    onePassParser.append(markdown)
    onePassParser.finalize()
    const onePassAst = onePassParser.getAst()

    // 逐字符增量解析
    const incrementalParser = new IncremarkParser()
    for (const char of markdown) {
      incrementalParser.append(char)
    }
    incrementalParser.finalize()
    const incrementalAst = incrementalParser.getAst()

    // 验证顶级节点数量
    const onePassChildren = onePassAst.children || []
    const incrementalChildren = incrementalAst.children || []

    console.log('一次性解析节点数:', onePassChildren.length)
    console.log('增量解析节点数:', incrementalChildren.length)

    onePassChildren.forEach((node: any, index: number) => {
      console.log(`  节点 ${index}:`, node.type)
    })

    incrementalChildren.forEach((node: any, index: number) => {
      console.log(`  节点 ${index}:`, node.type)
    })

    // 预期：1 个列表 + 1 个段落 = 2 个节点
    expect(onePassChildren.length).toBe(2)
    expect(incrementalChildren.length).toBe(2)

    // 验证节点类型
    expect(onePassChildren[0].type).toBe('list')
    expect(onePassChildren[1].type).toBe('paragraph')

    // 验证 AST 结构一致
    expect(astEqual(onePassAst, incrementalAst)).toBe(true)

    console.log('✅ 列表后接段落（有空行）解析一致')
  })

  it('列表内空行（不应该作为边界）', () => {
    const markdown = `- 第一项\n\n- 第二项`

    // 一次性解析
    const onePassParser = new IncremarkParser()
    onePassParser.append(markdown)
    onePassParser.finalize()
    const onePassAst = onePassParser.getAst()

    // 逐字符增量解析
    const incrementalParser = new IncremarkParser()
    for (const char of markdown) {
      incrementalParser.append(char)
    }
    incrementalParser.finalize()
    const incrementalAst = incrementalParser.getAst()

    // 验证顶级节点数量
    const onePassChildren = onePassAst.children || []
    const incrementalChildren = incrementalAst.children || []

    console.log('一次性解析节点数:', onePassChildren.length)
    console.log('增量解析节点数:', incrementalChildren.length)

    // 预期：1 个列表（包含 2 个列表项）
    expect(onePassChildren.length).toBe(1)
    expect(incrementalChildren.length).toBe(1)

    expect(onePassChildren[0].type).toBe('list')
    const onePassList = onePassChildren[0] as any
    expect(onePassList.children.length).toBe(2)

    const incrementalList = incrementalChildren[0] as any
    expect(incrementalList.children.length).toBe(2)

    // 验证 AST 结构一致
    expect(astEqual(onePassAst, incrementalAst)).toBe(true)

    console.log('✅ 列表内空行解析一致')
  })

  it('列表项内容缩进', () => {
    const markdown = `- 第一项\n  第一项的续行\n- 第二项`

    // 一次性解析
    const onePassParser = new IncremarkParser()
    onePassParser.append(markdown)
    onePassParser.finalize()
    const onePassAst = onePassParser.getAst()

    // 逐字符增量解析
    const incrementalParser = new IncremarkParser()
    for (const char of markdown) {
      incrementalParser.append(char)
    }
    incrementalParser.finalize()
    const incrementalAst = incrementalParser.getAst()

    // 验证 AST 结构一致
    expect(astEqual(onePassAst, incrementalAst)).toBe(true)

    console.log('✅ 列表项内容缩进解析一致')
  })

  it('有序列表后接段落', () => {
    const markdown = `1. 第一项\n2. 第二项\n\n段落开始`

    // 一次性解析
    const onePassParser = new IncremarkParser()
    onePassParser.append(markdown)
    onePassParser.finalize()
    const onePassAst = onePassParser.getAst()

    // 逐字符增量解析
    const incrementalParser = new IncremarkParser()
    for (const char of markdown) {
      incrementalParser.append(char)
    }
    incrementalParser.finalize()
    const incrementalAst = incrementalParser.getAst()

    // 验证顶级节点数量
    const onePassChildren = onePassAst.children || []
    const incrementalChildren = incrementalAst.children || []

    // 预期：1 个列表 + 1 个段落 = 2 个节点
    expect(onePassChildren.length).toBe(2)
    expect(incrementalChildren.length).toBe(2)

    // 验证节点类型
    expect(onePassChildren[0].type).toBe('list')
    expect(onePassChildren[1].type).toBe('paragraph')

    // 验证 AST 结构一致
    expect(astEqual(onePassAst, incrementalAst)).toBe(true)

    console.log('✅ 有序列表后接段落解析一致')
  })

  it('列表后接标题', () => {
    const markdown = `- 第一项\n- 第二项\n\n# 标题`

    // 一次性解析
    const onePassParser = new IncremarkParser()
    onePassParser.append(markdown)
    onePassParser.finalize()
    const onePassAst = onePassParser.getAst()

    // 逐字符增量解析
    const incrementalParser = new IncremarkParser()
    for (const char of markdown) {
      incrementalParser.append(char)
    }
    incrementalParser.finalize()
    const incrementalAst = incrementalParser.getAst()

    // 验证顶级节点数量
    const onePassChildren = onePassAst.children || []
    const incrementalChildren = incrementalAst.children || []

    // 预期：1 个列表 + 1 个标题 = 2 个节点
    expect(onePassChildren.length).toBe(2)
    expect(incrementalChildren.length).toBe(2)

    // 验证节点类型
    expect(onePassChildren[0].type).toBe('list')
    expect(onePassChildren[1].type).toBe('heading')

    // 验证 AST 结构一致
    expect(astEqual(onePassAst, incrementalAst)).toBe(true)

    console.log('✅ 列表后接标题解析一致')
  })

  it('列表后接代码块', () => {
    const markdown = `- 第一项\n- 第二项\n\n\`\`\`javascript\nconst x = 1\n\`\`\``

    // 一次性解析
    const onePassParser = new IncremarkParser()
    onePassParser.append(markdown)
    onePassParser.finalize()
    const onePassAst = onePassParser.getAst()

    // 逐字符增量解析
    const incrementalParser = new IncremarkParser()
    for (const char of markdown) {
      incrementalParser.append(char)
    }
    incrementalParser.finalize()
    const incrementalAst = incrementalParser.getAst()

    // 验证顶级节点数量
    const onePassChildren = onePassAst.children || []
    const incrementalChildren = incrementalAst.children || []

    // 预期：1 个列表 + 1 个代码块 = 2 个节点
    expect(onePassChildren.length).toBe(2)
    expect(incrementalChildren.length).toBe(2)

    // 验证节点类型
    expect(onePassChildren[0].type).toBe('list')
    expect(onePassChildren[1].type).toBe('code')

    // 验证 AST 结构一致
    expect(astEqual(onePassAst, incrementalAst)).toBe(true)

    console.log('✅ 列表后接代码块解析一致')
  })

  it('嵌套列表边界', () => {
    const markdown = `- 第一项\n  - 嵌套项\n- 第二项`

    // 一次性解析
    const onePassParser = new IncremarkParser()
    onePassParser.append(markdown)
    onePassParser.finalize()
    const onePassAst = onePassParser.getAst()

    // 逐字符增量解析
    const incrementalParser = new IncremarkParser()
    for (const char of markdown) {
      incrementalParser.append(char)
    }
    incrementalParser.finalize()
    const incrementalAst = incrementalParser.getAst()

    // 验证顶级节点数量
    const onePassChildren = onePassAst.children || []
    const incrementalChildren = incrementalAst.children || []

    // 预期：1 个列表
    expect(onePassChildren.length).toBe(1)
    expect(incrementalChildren.length).toBe(1)

    // 验证 AST 结构一致
    expect(astEqual(onePassAst, incrementalAst)).toBe(true)

    console.log('✅ 嵌套列表边界解析一致')
  })
})

