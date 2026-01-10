/* @jsxImportSource solid-js */

import { Component, Show } from 'solid-js'
import type { BenchmarkStats } from '../hooks/useBenchmark'

export interface BenchmarkPanelProps {
  stats: BenchmarkStats
  running: boolean
  progress: number
  t: {
    benchmark: string
    runBenchmark: string
    running: string
    traditional: string
    incremark: string
    totalTime: string
    totalChars: string
    speedup: string
    benchmarkNote: string
  }
  onRun: () => void
}

export const BenchmarkPanel: Component<BenchmarkPanelProps> = (props) => {
  return (
    <div class="benchmark-panel">
      <div class="benchmark-header">
        <h2>⚡ {props.t.benchmark}</h2>
        <button
          class="benchmark-btn"
          disabled={props.running}
          onClick={props.onRun}
        >
          {props.running ? props.t.running : props.t.runBenchmark}
        </button>
      </div>

      <Show when={props.running}>
        <div class="benchmark-progress">
          <div class="progress-bar" style={{ width: `${props.progress}%` }}></div>
        </div>
      </Show>

      <Show when={props.stats.traditional.time > 0}>
        <div class="benchmark-results">
          <div class="benchmark-card traditional">
            <h3>🐢 {props.t.traditional}</h3>
            <div class="stat">
              <span class="label">{props.t.totalTime}</span>
              <span class="value">{props.stats.traditional.time.toFixed(2)} ms</span>
            </div>
            <div class="stat">
              <span class="label">{props.t.totalChars}</span>
              <span class="value">{(props.stats.traditional.totalChars / 1000).toFixed(1)}K</span>
            </div>
          </div>

          <div class="benchmark-card incremark">
            <h3>🚀 {props.t.incremark}</h3>
            <div class="stat">
              <span class="label">{props.t.totalTime}</span>
              <span class="value">{props.stats.incremark.time.toFixed(2)} ms</span>
            </div>
            <div class="stat">
              <span class="label">{props.t.totalChars}</span>
              <span class="value">{(props.stats.incremark.totalChars / 1000).toFixed(1)}K</span>
            </div>
          </div>

          <div class="benchmark-card speedup">
            <h3>📈 {props.t.speedup}</h3>
            <div class="speedup-value">
              {(props.stats.traditional.time / props.stats.incremark.time).toFixed(1)}x
            </div>
          </div>
        </div>
      </Show>

      <p class="benchmark-note">💡 {props.t.benchmarkNote}</p>
    </div>
  )
}
