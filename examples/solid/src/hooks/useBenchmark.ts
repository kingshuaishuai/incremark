import { createSignal } from 'solid-js'
import { createIncremarkParser } from '@incremark/core'

export interface BenchmarkStats {
  traditional: { time: number; parseCount: number; totalChars: number }
  incremark: { time: number; parseCount: number; totalChars: number }
}

export function useBenchmark(
  append: (chunk: string) => void,
  finalize: () => void,
  reset: () => void
) {
  const [benchmarkMode, setBenchmarkMode] = createSignal(false)
  const [benchmarkRunning, setBenchmarkRunning] = createSignal(false)
  const [benchmarkProgress, setBenchmarkProgress] = createSignal(0)
  const [benchmarkStats, setBenchmarkStats] = createSignal<BenchmarkStats>({
    traditional: { time: 0, parseCount: 0, totalChars: 0 },
    incremark: { time: 0, parseCount: 0, totalChars: 0 }
  })

  async function runBenchmark(content: string) {
    reset()
    setBenchmarkRunning(true)
    setBenchmarkProgress(0)

    const chunks = content.match(/[\s\S]{1,20}/g) || []

    // 1. 测试传统方式：每次追加都重新从头解析全部内容
    let traditionalTime = 0
    let traditionalParseCount = 0
    let traditionalTotalChars = 0
    let accumulated = ''

    for (let i = 0; i < chunks.length; i++) {
      accumulated += chunks[i]
      const start = performance.now()
      const traditionalParser = createIncremarkParser({ gfm: true })
      traditionalParser.append(accumulated)
      traditionalParser.finalize()
      traditionalParser.getCompletedBlocks()
      traditionalTime += performance.now() - start
      traditionalParseCount++
      traditionalTotalChars += accumulated.length
      setBenchmarkProgress(((i + 1) / chunks.length) * 50)
      await new Promise(r => setTimeout(r, 5))
    }

    // 2. 测试 Incremark 增量方式
    reset()
    let incremarkTime = 0
    let incremarkParseCount = 0
    let incremarkTotalChars = 0

    for (let i = 0; i < chunks.length; i++) {
      const start = performance.now()
      append(chunks[i])
      incremarkTime += performance.now() - start
      incremarkParseCount++
      incremarkTotalChars += chunks[i].length
      setBenchmarkProgress(50 + ((i + 1) / chunks.length) * 50)
      await new Promise(r => setTimeout(r, 5))
    }
    finalize()

    setBenchmarkStats({
      traditional: { time: traditionalTime, parseCount: traditionalParseCount, totalChars: traditionalTotalChars },
      incremark: { time: incremarkTime, parseCount: incremarkParseCount, totalChars: incremarkTotalChars }
    })

    setBenchmarkRunning(false)
    setBenchmarkProgress(100)
  }

  return {
    benchmarkMode,
    benchmarkRunning,
    benchmarkProgress,
    benchmarkStats,
    runBenchmark
  }
}
