/**
 * Incremental Markdown Parser Performance Benchmark
 *
 * Test methodology:
 * 1. Read all .md files from test-data directory
 * 2. Split content into small chunks (simulating AI token-by-token output)
 * 3. Let each parser process these chunks
 * 4. Compare performance and generate report
 */

import { performance } from 'perf_hooks'
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Incremark - incremental parsing
import { createIncremarkParser } from '@incremark/core'

// Streamdown - full re-parsing
import { parseMarkdownIntoBlocks } from 'streamdown'

// markstream-vue - full re-parsing
import { getMarkdown, parseMarkdownToStructure } from 'markstream-vue'

// Marked (simulating ant-design-x which uses Marked internally)
import { Marked } from 'marked'

// Simulate ant-design-x Parser (essentially a Marked wrapper)
// Reference: https://github.com/ant-design/x/blob/main/components/x-markdown/core/Parser.ts
class AntDesignXParser {
  private markdownInstance: Marked

  constructor() {
    this.markdownInstance = new Marked()
  }

  parse(content: string): string {
    return this.markdownInstance.parse(content) as string
  }
}

// ES module __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ========== Type Definitions ==========

interface BenchmarkResult {
  scenario: string
  parser: 'Incremark' | 'Streamdown' | 'markstream-vue' | 'ant-design-x'
  totalTime: number
  perChunkAvg: number
  maxChunkTime: number
  minChunkTime: number
  memoryUsage: {
    heapUsed: number
    heapTotal: number
    external: number
    rss: number
  }
}

interface ScenarioStats {
  fileName: string
  totalChars: number
  totalLines: number
  chunkSize: number
  chunkCount: number
  description?: string
}

interface TestScenario {
  name: string
  stats: ScenarioStats
  results: BenchmarkResult[]
}

// ========== Helper Functions ==========

/**
 * Get memory usage (MB)
 */
function getMemoryUsage() {
  const usage = process.memoryUsage()
  return {
    heapUsed: Math.round((usage.heapUsed / 1024 / 1024) * 100) / 100,
    heapTotal: Math.round((usage.heapTotal / 1024 / 1024) * 100) / 100,
    external: Math.round((usage.external / 1024 / 1024) * 100) / 100,
    rss: Math.round((usage.rss / 1024 / 1024) * 100) / 100
  }
}

/**
 * Extract description from filename
 */
function extractDescription(fileName: string): string {
  const name = fileName.replace('.md', '')
  return name.replace(/[-_]/g, ' ')
}

/**
 * Read all markdown files from test data directory
 */
function getTestFiles(): string[] {
  const testDir = join(__dirname, 'test-data')
  const files = readdirSync(testDir)
  return files.filter((f) => f.endsWith('.md')).sort()
}

/**
 * Test a single parser
 */
function testParser(
  parserName: 'Incremark' | 'Streamdown' | 'markstream-vue' | 'ant-design-x',
  chunks: string[]
): Omit<BenchmarkResult, 'scenario' | 'parser'> {
  const chunkTimes: number[] = []

  // Get initial memory
  ;(global as any).gc?.()
  const startMem = getMemoryUsage()

  const startTime = performance.now()

  if (parserName === 'Incremark') {
    // Incremark: O(n) incremental parsing
    // Only parses new content, completed blocks are never re-processed
    const parser = createIncremarkParser()
    parser.reset()

    for (const chunk of chunks) {
      const chunkStart = performance.now()
      parser.append(chunk)
      const chunkTime = performance.now() - chunkStart
      chunkTimes.push(chunkTime)
    }

    parser.finalize()
  } else if (parserName === 'Streamdown') {
    // Streamdown: O(n²) full re-parsing
    // Re-parses entire accumulated content on each chunk
    let accumulated = ''
    let result: any

    for (const chunk of chunks) {
      const chunkStart = performance.now()
      accumulated += chunk
      result = parseMarkdownIntoBlocks(accumulated)
      const chunkTime = performance.now() - chunkStart
      chunkTimes.push(chunkTime)
    }

    // Prevent result from being optimized away
    if (!result) console.log()
  } else if (parserName === 'markstream-vue') {
    // markstream-vue: O(n²) full re-parsing
    let accumulated = ''
    const md = getMarkdown()
    let result: any

    for (const chunk of chunks) {
      const chunkStart = performance.now()
      accumulated += chunk
      result = parseMarkdownToStructure(accumulated, md)
      const chunkTime = performance.now() - chunkStart
      chunkTimes.push(chunkTime)
    }

    if (!result) console.log()
  } else if (parserName === 'ant-design-x') {
    // ant-design-x (Marked): O(n²) full re-parsing
    let accumulated = ''
    const parser = new AntDesignXParser()
    let result: any

    for (const chunk of chunks) {
      const chunkStart = performance.now()
      accumulated += chunk
      result = parser.parse(accumulated)
      const chunkTime = performance.now() - chunkStart
      chunkTimes.push(chunkTime)
    }

    if (!result) console.log()
  }

  const totalTime = performance.now() - startTime

  // Get final memory
  ;(global as any).gc?.()
  const endMem = getMemoryUsage()

  return {
    totalTime,
    perChunkAvg: totalTime / chunks.length,
    maxChunkTime: Math.max(...chunkTimes),
    minChunkTime: Math.min(...chunkTimes),
    memoryUsage: {
      heapUsed: endMem.heapUsed - startMem.heapUsed,
      heapTotal: endMem.heapTotal - startMem.heapTotal,
      external: endMem.external - startMem.external,
      rss: endMem.rss - startMem.rss
    }
  }
}

/**
 * Save results to JSON
 */
function saveResults(scenarios: TestScenario[]): void {
  const flatResults: BenchmarkResult[] = []

  for (const scenario of scenarios) {
    for (const result of scenario.results) {
      flatResults.push(result)
    }
  }

  const outputPath = join(__dirname, 'benchmark-results.json')
  writeFileSync(outputPath, JSON.stringify(flatResults, null, 2))
  console.log(`\n💾 Results saved to: ${outputPath}`)
}

/**
 * Print summary table (sorted by lines)
 */
function printSummaryTable(scenarios: TestScenario[]): void {
  const sorted = [...scenarios].sort((a, b) => a.stats.totalLines - b.stats.totalLines)

  console.log('\n' + '='.repeat(140))
  console.log('📊 Performance Summary (sorted by lines)')
  console.log('='.repeat(140))

  // Header
  console.log(
    '\n| filename                            | lines | chars   | size(KB) | Incremark | Streamdown | markstream | ant-design-x | vs Streamdown | vs markstream | vs ant-design-x |'
  )
  console.log(
    '|-------------------------------------|-------|---------|----------|-----------|------------|------------|--------------|---------------|---------------|-----------------|'
  )

  for (const scenario of sorted) {
    const stats = scenario.stats
    const fileName =
      stats.fileName.length > 35 ? stats.fileName.substring(0, 32) + '...' : stats.fileName
    const sizeKB = (stats.totalChars / 1024).toFixed(2)

    const incremark = scenario.results.find((r) => r.parser === 'Incremark')
    const streamdown = scenario.results.find((r) => r.parser === 'Streamdown')
    const markstream = scenario.results.find((r) => r.parser === 'markstream-vue')
    const antDesignX = scenario.results.find((r) => r.parser === 'ant-design-x')

    const incremarkTime = incremark ? incremark.totalTime.toFixed(1) : '-'
    const streamdownTime = streamdown ? streamdown.totalTime.toFixed(1) : '-'
    const markstreamTime = markstream ? markstream.totalTime.toFixed(1) : '-'
    const antDesignXTime = antDesignX ? antDesignX.totalTime.toFixed(1) : '-'

    let vsStreamdown = '-'
    let vsMarkstream = '-'
    let vsAntDesignX = '-'
    if (incremark) {
      if (streamdown) vsStreamdown = (streamdown.totalTime / incremark.totalTime).toFixed(1) + 'x'
      if (markstream) vsMarkstream = (markstream.totalTime / incremark.totalTime).toFixed(1) + 'x'
      if (antDesignX) vsAntDesignX = (antDesignX.totalTime / incremark.totalTime).toFixed(1) + 'x'
    }

    console.log(
      `| ${fileName.padEnd(35)} | ` +
        `${String(stats.totalLines).padStart(5)} | ` +
        `${String(stats.totalChars).padStart(7)} | ` +
        `${sizeKB.padStart(8)} | ` +
        `${incremarkTime.padStart(9)} | ` +
        `${streamdownTime.padStart(10)} | ` +
        `${markstreamTime.padStart(10)} | ` +
        `${antDesignXTime.padStart(12)} | ` +
        `${vsStreamdown.padStart(13)} | ` +
        `${vsMarkstream.padStart(13)} | ` +
        `${vsAntDesignX.padStart(15)} |`
    )
  }

  // Summary
  console.log(
    '|-------------------------------------|-------|---------|----------|-----------|------------|------------|--------------|---------------|---------------|-----------------|'
  )

  let totalIncremarkTime = 0
  let totalStreamdownTime = 0
  let totalMarkstreamTime = 0
  let totalAntDesignXTime = 0
  let totalChars = 0
  let totalLines = 0

  for (const scenario of scenarios) {
    totalChars += scenario.stats.totalChars
    totalLines += scenario.stats.totalLines

    const incremark = scenario.results.find((r) => r.parser === 'Incremark')
    const streamdown = scenario.results.find((r) => r.parser === 'Streamdown')
    const markstream = scenario.results.find((r) => r.parser === 'markstream-vue')
    const antDesignX = scenario.results.find((r) => r.parser === 'ant-design-x')

    if (incremark) totalIncremarkTime += incremark.totalTime
    if (streamdown) totalStreamdownTime += streamdown.totalTime
    if (markstream) totalMarkstreamTime += markstream.totalTime
    if (antDesignX) totalAntDesignXTime += antDesignX.totalTime
  }

  const totalSizeKB = (totalChars / 1024).toFixed(2)
  const totalVsStreamdown = (totalStreamdownTime / totalIncremarkTime).toFixed(1) + 'x'
  const totalVsMarkstream = (totalMarkstreamTime / totalIncremarkTime).toFixed(1) + 'x'
  const totalVsAntDesignX = (totalAntDesignXTime / totalIncremarkTime).toFixed(1) + 'x'

  console.log(
    `| ${'【TOTAL】'.padEnd(35)} | ` +
      `${String(totalLines).padStart(5)} | ` +
      `${String(totalChars).padStart(7)} | ` +
      `${totalSizeKB.padStart(8)} | ` +
      `${totalIncremarkTime.toFixed(1).padStart(9)} | ` +
      `${totalStreamdownTime.toFixed(1).padStart(10)} | ` +
      `${totalMarkstreamTime.toFixed(1).padStart(10)} | ` +
      `${totalAntDesignXTime.toFixed(1).padStart(12)} | ` +
      `${totalVsStreamdown.padStart(13)} | ` +
      `${totalVsMarkstream.padStart(13)} | ` +
      `${totalVsAntDesignX.padStart(15)} |`
  )

  console.log('\n' + '='.repeat(140))
  console.log('✅ All tests completed!')
  console.log('='.repeat(140))

  // Print summary
  console.log('\n📈 Performance Summary:')
  console.log(`   - Incremark total: ${totalIncremarkTime.toFixed(2)} ms`)
  console.log(
    `   - Streamdown total: ${totalStreamdownTime.toFixed(2)} ms (${(totalStreamdownTime / totalIncremarkTime).toFixed(1)}x slower)`
  )
  console.log(
    `   - markstream-vue total: ${totalMarkstreamTime.toFixed(2)} ms (${(totalMarkstreamTime / totalIncremarkTime).toFixed(1)}x slower)`
  )
  console.log(
    `   - ant-design-x total: ${totalAntDesignXTime.toFixed(2)} ms (${(totalAntDesignXTime / totalIncremarkTime).toFixed(1)}x slower)`
  )
}

// ========== Main Test Flow ==========

const chunkSizes = [5] // Characters per chunk
const testFiles = getTestFiles()

console.log('\n' + '='.repeat(80))
console.log('🚀 Incremental Markdown Parser Performance Benchmark')
console.log('='.repeat(80))
console.log(`📁 Found ${testFiles.length} test files`)
console.log(`🔢 Config: chunk size = ${chunkSizes.join(', ')} characters`)

const allScenarios: TestScenario[] = []

for (const fileName of testFiles) {
  const filePath = join(__dirname, 'test-data', fileName)
  const content = readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  const stats: ScenarioStats = {
    fileName,
    totalChars: content.length,
    totalLines: lines.length,
    chunkSize: chunkSizes[0],
    chunkCount: 0,
    description: extractDescription(fileName)
  }

  const scenarioResults: BenchmarkResult[] = []

  for (const chunkSize of chunkSizes) {
    stats.chunkSize = chunkSize

    // Generate chunks (simulating streaming output)
    const chunks: string[] = []
    for (let i = 0; i < content.length; i += chunkSize) {
      const end = Math.min(i + chunkSize, content.length)
      chunks.push(content.substring(i, end))
    }
    stats.chunkCount = chunks.length

    console.log('\n' + '='.repeat(80))
    console.log(`📄 Test file: ${fileName}`)
    console.log(`📊 ${stats.totalChars.toLocaleString()} chars, ${stats.totalLines} lines`)
    console.log(`🔢 ${chunks.length} chunks (${chunkSize} chars each)`)
    console.log('='.repeat(80))

    // Test Incremark
    console.log('\n🔵 Testing Incremark (incremental parsing)...')
    const incremarkResult = testParser('Incremark', chunks)
    scenarioResults.push({
      scenario: fileName,
      parser: 'Incremark',
      ...incremarkResult
    })
    console.log(`   ✅ Total: ${incremarkResult.totalTime.toFixed(2)} ms`)

    // Test Streamdown
    try {
      console.log('\n🟦 Testing Streamdown (full re-parsing)...')
      const streamdownResult = testParser('Streamdown', chunks)
      scenarioResults.push({
        scenario: fileName,
        parser: 'Streamdown',
        ...streamdownResult
      })
      console.log(`   ✅ Total: ${streamdownResult.totalTime.toFixed(2)} ms`)
    } catch (e) {
      console.log(`   ⚠️  Streamdown unavailable, skipping`)
    }

    // Test markstream-vue
    try {
      console.log('\n🟧 Testing markstream-vue (full re-parsing)...')
      const markstreamResult = testParser('markstream-vue', chunks)
      scenarioResults.push({
        scenario: fileName,
        parser: 'markstream-vue',
        ...markstreamResult
      })
      console.log(`   ✅ Total: ${markstreamResult.totalTime.toFixed(2)} ms`)
    } catch (e) {
      console.log(`   ⚠️  markstream-vue unavailable, skipping`)
    }

    // Test ant-design-x
    try {
      console.log('\n🟪 Testing ant-design-x (full re-parsing)...')
      const antDesignXResult = testParser('ant-design-x', chunks)
      scenarioResults.push({
        scenario: fileName,
        parser: 'ant-design-x',
        ...antDesignXResult
      })
      console.log(`   ✅ Total: ${antDesignXResult.totalTime.toFixed(2)} ms`)
    } catch (e) {
      console.log(`   ⚠️  ant-design-x unavailable, skipping`)
    }
  }

  allScenarios.push({
    name: fileName,
    stats,
    results: scenarioResults
  })
}

// Save JSON results
saveResults(allScenarios)

// Print summary table
printSummaryTable(allScenarios)

console.log('\n💡 Test Notes:')
console.log('   - Each chunk contains only new content, not accumulated content')
console.log('   - Incremark uses append() with internal accumulation (O(n) incremental parsing)')
console.log(
  '   - Streamdown/markstream-vue/ant-design-x accumulate strings and re-parse full content (O(n²) full re-parsing)'
)
console.log('   - ant-design-x is the markdown engine from Ant Design X, based on marked@15')
console.log('   - This simulates real AI streaming output scenarios\n')
