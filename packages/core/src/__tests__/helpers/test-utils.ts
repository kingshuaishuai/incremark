/**
 * 测试辅助工具函数
 *
 * 提供通用的测试工具，包括:
 * - CommonMark 测试用例处理
 * - AST 比较工具
 * - 增量解析一致性测试
 * - 各种分块策略
 */

import type { Root } from 'mdast'
import { IncremarkParser } from '../../parser/IncremarkParser'

// ============ CommonMark 测试用例类型定义 ============

/**
 * CommonMark 规范测试用例
 */
export interface CommonMarkTestCase {
  /** Markdown 输入 */
  markdown: string
  /** 预期的 HTML 输出 */
  html: string
  /** 测试用例所在的章节 */
  section: string
  /** 测试用例编号 */
  number: number
  /** 测试用例说明（可选） */
  example?: number
}

// ============ AST 比较工具 ============

/**
 * 规范化 AST 节点
 *
 * 移除 position 等动态信息，只保留结构
 */
export function normalizeAst(node: any): any {
  if (node === null || node === undefined) {
    return node
  }

  // 处理数组
  if (Array.isArray(node)) {
    return node.map(normalizeAst)
  }

  // 处理对象
  if (typeof node === 'object') {
    const result: any = {}

    for (const key of Object.keys(node)) {
      // 跳过 position 等动态属性
      if (key === 'position' || key === '_gfmTasklistFirstMemberOfTasklist') {
        continue
      }

      // 递归处理子节点
      result[key] = normalizeAst(node[key])
    }

    return result
  }

  // 基本类型直接返回
  return node
}

/**
 * 深度比较两个 AST 节点
 *
 * @param ast1 第一个 AST
 * @param ast2 第二个 AST
 * @returns 是否相等
 */
export function compareAst(ast1: Root, ast2: Root): boolean {
  const normalized1 = normalizeAst(ast1)
  const normalized2 = normalizeAst(ast2)

  try {
    return deepEqual(normalized1, normalized2)
  } catch (error) {
    console.error('AST 比较失败:', error)
    return false
  }
}

/**
 * 深度比较两个对象
 */
function deepEqual(obj1: any, obj2: any): boolean {
  // 基本类型比较
  if (obj1 === obj2) {
    return true
  }

  // 类型不同
  if (typeof obj1 !== typeof obj2) {
    return false
  }

  // null/undefined 比较
  if (obj1 === null || obj1 === undefined || obj2 === null || obj2 === undefined) {
    return obj1 === obj2
  }

  // 数组比较
  if (Array.isArray(obj1)) {
    if (!Array.isArray(obj2)) {
      return false
    }
    if (obj1.length !== obj2.length) {
      return false
    }
    for (let i = 0; i < obj1.length; i++) {
      if (!deepEqual(obj1[i], obj2[i])) {
        return false
      }
    }
    return true
  }

  // 对象比较
  if (typeof obj1 === 'object') {
    const keys1 = Object.keys(obj1).sort()
    const keys2 = Object.keys(obj2).sort()

    if (keys1.length !== keys2.length) {
      return false
    }

    for (const key of keys1) {
      if (!keys2.includes(key)) {
        return false
      }
      if (!deepEqual(obj1[key], obj2[key])) {
        return false
      }
    }
    return true
  }

  return false
}

/**
 * 将 HTML 转换为 AST
 *
 * 注意：这里使用 fromMarkdown，而不是直接的 HTML 解析
 * 因为 CommonMark 测试用例提供的是 HTML 输出，我们需要先将其转换回 Markdown（简化）再解析
 *
 * @param html HTML 字符串
 * @param options 解析选项
 * @returns AST
 */
export function htmlToAst(html: string, options: { gfm?: boolean } = {}): Root {
  // 简化：直接将 HTML 作为 markdown 解析（这不完全准确）
  // 更准确的做法是：
  // 1. 解析 HTML 为 DOM
  // 2. 将 DOM 转换为 Markdown
  // 3. 解析 Markdown 为 AST

  // 为了简单起见，这里先跳过 HTML 到 AST 的转换
  // 直接返回一个空的 root 节点
  // 实际使用时，应该使用更准确的方法

  throw new Error('htmlToAst 尚未实现，需要额外的 HTML 解析库')
}

// ============ 分块策略 ============

/**
 * 分块策略接口
 */
export interface ChunkStrategy {
  /** 策略名称 */
  name: string
  /** 固定分块大小 */
  size?: number
  /** 分隔符 */
  delimiter?: string
  /** 随机分块的最小值 */
  min?: number
  /** 随机分块的最大值 */
  max?: number
}

/**
 * 预定义的分块策略
 */
export const DEFAULT_CHUNK_STRATEGIES: ChunkStrategy[] = [
  { name: '逐字符', size: 1 },
  { name: '逐词（5字符）', size: 5 },
  { name: '逐行', delimiter: '\n' },
  { name: '随机（1-50）', min: 1, max: 50 },
  { name: '小块（10字符）', size: 10 },
  { name: '中块（50字符）', size: 50 },
  { name: '大块（100字符）', size: 100 },
  { name: '超块（500字符）', size: 500 },
]

/**
 * 根据策略将文本分块
 *
 * @param text 文本
 * @param strategy 分块策略
 * @returns 分块后的数组
 */
export function chunkText(text: string, strategy: ChunkStrategy): string[] {
  const chunks: string[] = []

  if (strategy.size !== undefined) {
    // 固定大小分块
    for (let i = 0; i < text.length; i += strategy.size) {
      chunks.push(text.slice(i, i + strategy.size))
    }
  } else if (strategy.delimiter !== undefined) {
    // 按分隔符分块
    const parts = text.split(strategy.delimiter)
    for (let i = 0; i < parts.length; i++) {
      chunks.push(parts[i] + (i < parts.length - 1 ? strategy.delimiter : ''))
    }
  } else if (strategy.min !== undefined && strategy.max !== undefined) {
    // 随机分块
    let remaining = text
    while (remaining.length > 0) {
      const size = Math.min(
        Math.floor(Math.random() * (strategy.max - strategy.min)) + strategy.min,
        remaining.length
      )
      chunks.push(remaining.slice(0, size))
      remaining = remaining.slice(size)
    }
  }

  return chunks
}

// ============ 增量解析一致性测试 ============

/**
 * 增量解析一致性测试结果
 */
export interface IncrementalConsistencyResult {
  /** 策略名称 */
  strategy: string
  /** 是否一致 */
  consistent: boolean
  /** 一次解析的 AST */
  onePassAst: Root
  /** 增量解析的 AST */
  incrementalAst: Root
  /** 错误信息（如果不一致） */
  error?: string
  /** 分块数量 */
  chunkCount: number
}

/**
 * 测试增量解析与一次解析的一致性
 *
 * @param markdown Markdown 文本
 * @param description 测试描述
 * @param strategies 分块策略数组
 * @returns 测试结果数组
 */
export function testIncrementalConsistency(
  markdown: string,
  description: string,
  strategies: ChunkStrategy[] = DEFAULT_CHUNK_STRATEGIES
): IncrementalConsistencyResult[] {
  const results: IncrementalConsistencyResult[] = []

  // 一次解析（基准）
  const onePassParser = new IncremarkParser()
  const onePassResult = onePassParser.append(markdown)
  onePassParser.finalize()

  // 对每种分块策略进行测试
  for (const strategy of strategies) {
    try {
      // 增量解析
      const incrementalParser = new IncremarkParser()
      const chunks = chunkText(markdown, strategy)

      for (const chunk of chunks) {
        incrementalParser.append(chunk)
      }
      incrementalParser.finalize()

      // 比较 AST
      const consistent = compareAst(onePassParser.getAst(), incrementalParser.getAst())

      results.push({
        strategy: strategy.name,
        consistent,
        onePassAst: onePassParser.getAst(),
        incrementalAst: incrementalParser.getAst(),
        chunkCount: chunks.length,
      })

      if (!consistent) {
        results[results.length - 1].error = 'AST 结构不一致'
      }
    } catch (error) {
      results.push({
        strategy: strategy.name,
        consistent: false,
        onePassAst: onePassParser.getAst(),
        incrementalAst: { type: 'root', children: [] },
        error: error instanceof Error ? error.message : String(error),
        chunkCount: 0,
      })
    }
  }

  return results
}

/**
 * 断言增量解析与一次解析一致
 *
 * @param markdown Markdown 文本
 * @param description 测试描述
 * @param strategies 分块策略数组
 * @throws 如果不一致则抛出错误
 */
export function assertIncrementalConsistency(
  markdown: string,
  description: string,
  strategies: ChunkStrategy[] = DEFAULT_CHUNK_STRATEGIES
): void {
  const results = testIncrementalConsistency(markdown, description, strategies)

  const inconsistentResults = results.filter(r => !r.consistent)

  if (inconsistentResults.length > 0) {
    const errorMessages = inconsistentResults.map(r => {
      return `- ${r.strategy}: ${r.error || 'AST 不一致'} (${r.chunkCount} 块)`
    })

    throw new Error(
      `增量解析与一次解析不一致！\n` +
      `测试: ${description}\n` +
      `不一致的策略:\n${errorMessages.join('\n')}`
    )
  }
}

// ============ CommonMark 测试辅助 ============

/**
 * 加载 CommonMark 规范测试用例
 *
 * @param specPath 规范测试文件路径（JSON 格式）
 * @returns 测试用例数组
 */
export async function loadCommonMarkSpec(specPath: string): Promise<CommonMarkTestCase[]> {
  // 实际实现中，这里应该从文件系统读取 JSON
  // 这里只是类型定义

  const spec = await import(specPath)
  const testCases: CommonMarkTestCase[] = []

  // 解析 spec.json 格式
  // spec.json 的结构:
  // {
  //   "sections": [
  //     {
  //       "name": "ATX headings",
  //       "examples": [
  //         {
  //           "markdown": "# foo",
  //           "html": "<h1>foo</h1>",
  //           "section": "ATX headings",
  //           "number": 1
  //         }
  //       ]
  //     }
  //   ]
  // }

  for (const section of spec.sections || []) {
    for (const example of section.examples || []) {
      testCases.push({
        markdown: example.markdown,
        html: example.html,
        section: section.name,
        number: example.number || 0,
      })
    }
  }

  return testCases
}

/**
 * 过滤 CommonMark 测试用例
 *
 * @param testCases 所有测试用例
 * @param filters 过滤条件
 * @returns 过滤后的测试用例
 */
export function filterCommonMarkTests(
  testCases: CommonMarkTestCase[],
  filters: {
    sections?: string[]
    numbers?: number[]
    includeNumbers?: number[]
    excludeNumbers?: number[]
  }
): CommonMarkTestCase[] {
  let filtered = [...testCases]

  if (filters.sections && filters.sections.length > 0) {
    filtered = filtered.filter(tc => filters.sections!.includes(tc.section))
  }

  if (filters.numbers && filters.numbers.length > 0) {
    filtered = filtered.filter(tc => filters.numbers!.includes(tc.number))
  }

  if (filters.includeNumbers && filters.includeNumbers.length > 0) {
    filtered = filtered.filter(tc => filters.includeNumbers!.includes(tc.number))
  }

  if (filters.excludeNumbers && filters.excludeNumbers.length > 0) {
    filtered = filtered.filter(tc => !filters.excludeNumbers!.includes(tc.number))
  }

  return filtered
}

// ============ 性能测试辅助 ============

/**
 * 性能测试结果
 */
export interface BenchmarkResult {
  /** 测试名称 */
  name: string
  /** 一次解析时间（ms） */
  onePassTime: number
  /** 增量解析时间（ms） */
  incrementalTime: number
  /** 分块大小 */
  chunkSize: number
  /** 总块数 */
  totalChunks: number
  /** 开销百分比（增量解析相对于一次解析） */
  overhead: number
}

/**
 * 运行性能测试
 *
 * @param name 测试名称
 * @param markdown Markdown 文本
 * @param chunkSizes 分块大小数组
 * @param iterations 迭代次数
 * @returns 性能测试结果数组
 */
export function runBenchmark(
  name: string,
  markdown: string,
  chunkSizes: number[] = [1, 5, 10, 50, 100],
  iterations: number = 100
): BenchmarkResult[] {
  const results: BenchmarkResult[] = []

  // 预热
  for (let i = 0; i < 10; i++) {
    const parser = new IncremarkParser()
    parser.append(markdown)
    parser.finalize()
  }

  // 测试一次解析
  const onePassTimes: number[] = []
  for (let i = 0; i < iterations; i++) {
    const start = performance.now()
    const parser = new IncremarkParser()
    parser.append(markdown)
    parser.finalize()
    const end = performance.now()
    onePassTimes.push(end - start)
  }

  const avgOnePassTime = onePassTimes.reduce((a, b) => a + b) / onePassTimes.length

  // 测试增量解析
  for (const chunkSize of chunkSizes) {
    const incrementalTimes: number[] = []

    for (let i = 0; i < iterations; i++) {
      const parser = new IncremarkParser()
      const chunks = chunkText(markdown, { name: '自定义大小', size: chunkSize })

      const start = performance.now()
      for (const chunk of chunks) {
        parser.append(chunk)
      }
      parser.finalize()
      const end = performance.now()

      incrementalTimes.push(end - start)
    }

    const avgIncrementalTime = incrementalTimes.reduce((a, b) => a + b) / incrementalTimes.length

    results.push({
      name,
      onePassTime: avgOnePassTime,
      incrementalTime: avgIncrementalTime,
      chunkSize,
      totalChunks: Math.ceil(markdown.length / chunkSize),
      overhead: ((avgIncrementalTime - avgOnePassTime) / avgOnePassTime) * 100,
    })
  }

  return results
}

/**
 * 打印性能测试结果
 */
export function printBenchmarkResults(results: BenchmarkResult[]): void {
  console.log('\n========== 性能测试结果 ==========')
  console.log(`测试: ${results[0].name}`)
  console.log('')

  for (const result of results) {
    console.log(`分块大小: ${result.chunkSize} 字符`)
    console.log(`总块数: ${result.totalChunks}`)
    console.log(`一次解析: ${result.onePassTime.toFixed(2)} ms`)
    console.log(`增量解析: ${result.incrementalTime.toFixed(2)} ms`)
    console.log(`开销: ${result.overhead.toFixed(2)}%`)
    console.log('')
  }

  console.log('===================================\n')
}

