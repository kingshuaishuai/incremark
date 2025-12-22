<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue'
import { useIncremark, useDevTools, Incremark, AutoScrollContainer } from '@incremark/vue'
// @ts-ignore
import { math } from 'micromark-extension-math'
// @ts-ignore
import { mathFromMarkdown } from 'mdast-util-math'

import { useBenchmark } from '../composables'
import { BenchmarkPanel, CustomInputPanel, CustomHeading } from './index'
import type { Messages } from '../locales'

const props = defineProps<{
  htmlEnabled: boolean
  sampleMarkdown: string
  t: Messages
}>()

// ============ 打字机配置 ============
const typewriterSpeed = ref(2)
const typewriterInterval = ref(30)
const typewriterRandomStep = ref(true)
const typewriterEffect = ref<'none' | 'fade-in' | 'typing'>('typing')

// ============ 初始化 Incremark（集成打字机） ============
const incremark = useIncremark({
  gfm: true,
  htmlTree: props.htmlEnabled,
  extensions: [math()],
  mdastExtensions: [mathFromMarkdown()],
  typewriter: {
    enabled: false,
    charsPerTick: [1, Math.max(2, typewriterSpeed.value)],
    tickInterval: typewriterInterval.value,
    effect: typewriterEffect.value,
    cursor: '|'
  }
})

const { markdown, blocks, completedBlocks, pendingBlocks, append, finalize, reset, render, typewriter } = incremark

useDevTools(incremark)

// 监听打字机配置变化
watch([typewriterSpeed, typewriterInterval, typewriterEffect, typewriterRandomStep], () => {
  typewriter.setOptions({
    charsPerTick: typewriterRandomStep.value
      ? [1, Math.max(2, typewriterSpeed.value)] as [number, number]
      : typewriterSpeed.value,
    tickInterval: typewriterInterval.value,
    effect: typewriterEffect.value
  })
})

// ============ 流式输出 ============
const isStreaming = ref(false)

async function simulateStream() {
  reset()
  isStreaming.value = true

  const content = customInputMode.value && customMarkdown.value.trim() 
    ? customMarkdown.value 
    : props.sampleMarkdown
  const chunks = content.match(/[\s\S]{1,20}/g) || []

  for (const chunk of chunks) {
    append(chunk)
    await new Promise((resolve) => setTimeout(resolve, 30))
  }

  finalize()
  isStreaming.value = false
}

function renderOnce() {
  const content = customInputMode.value && customMarkdown.value.trim() 
    ? customMarkdown.value 
    : props.sampleMarkdown
  render(content)
}

// ============ 自动滚动 ============
const autoScrollEnabled = ref(true)
const scrollContainerRef = ref<InstanceType<typeof AutoScrollContainer> | null>(null)

// ============ 自定义输入 ============
const customInputMode = ref(false)
const customMarkdown = ref('')

// ============ Benchmark ============
const { benchmarkMode, benchmarkRunning, benchmarkProgress, benchmarkStats, runBenchmark } = 
  useBenchmark(append, finalize, reset)

function handleRunBenchmark() {
  const content = customInputMode.value && customMarkdown.value.trim() 
    ? customMarkdown.value 
    : props.sampleMarkdown
  runBenchmark(content)
}

// ============ 自定义组件 ============
const useCustomComponents = ref(false)
const customComponents = { heading: CustomHeading }

// 暴露方法供父组件调用
defineExpose({
  reset,
  render,
  markdown,
  isStreaming,
  benchmarkRunning
})
</script>

<template>
  <div class="demo-content">
    <div class="controls">
      <button @click="simulateStream" :disabled="isStreaming || benchmarkRunning">
        {{ isStreaming ? t.streaming : t.simulateAI }}
      </button>
      <button @click="renderOnce" :disabled="isStreaming || benchmarkRunning">{{ t.renderOnce }}</button>
      <button @click="reset" :disabled="isStreaming || benchmarkRunning">{{ t.reset }}</button>
      
      <label class="checkbox">
        <input type="checkbox" v-model="useCustomComponents" />
        {{ t.customComponents }}
      </label>
      <label class="checkbox benchmark-toggle">
        <input type="checkbox" v-model="benchmarkMode" />
        {{ t.benchmarkMode }}
      </label>
      <label class="checkbox">
        <input type="checkbox" v-model="customInputMode" />
        {{ t.customInput }}
      </label>
      <label class="checkbox typewriter-toggle">
        <input type="checkbox" v-model="typewriter.enabled.value" />
        {{ t.typewriterMode }}
      </label>
      <label class="checkbox auto-scroll-toggle">
        <input type="checkbox" v-model="autoScrollEnabled" />
        {{ t.autoScroll }}
      </label>
      
      <template v-if="typewriter.enabled.value">
        <label class="speed-control">
          <input type="range" v-model.number="typewriterSpeed" min="1" max="10" step="1" />
          <span class="speed-value">{{ typewriterSpeed }} {{ t.charsPerTick }}</span>
        </label>
        <label class="speed-control">
          <input type="range" v-model.number="typewriterInterval" min="10" max="200" step="10" />
          <span class="speed-value">{{ typewriterInterval }} {{ t.intervalMs }}</span>
        </label>
        <label class="checkbox random-step-toggle">
          <input type="checkbox" v-model="typewriterRandomStep" />
          {{ t.randomStep }}
        </label>
        <select v-model="typewriterEffect" class="effect-select">
          <option value="none">{{ t.effectNone }}</option>
          <option value="fade-in">{{ t.effectFadeIn }}</option>
          <option value="typing">{{ t.effectTyping }}</option>
        </select>
        <button v-if="typewriter.isProcessing.value && !typewriter.isPaused.value" class="pause-btn" @click="typewriter.pause">
          ⏸️ {{ t.pause }}
        </button>
        <button v-if="typewriter.isPaused.value" class="resume-btn" @click="typewriter.resume">
          ▶️ {{ t.resume }}
        </button>
        <button v-if="typewriter.isProcessing.value" class="skip-btn" @click="typewriter.skip">
          ⏭️ {{ t.skip }}
        </button>
      </template>
      
      <span class="stats">
        📝 {{ markdown.length }} {{ t.chars }} |
        ✅ {{ completedBlocks.length }} {{ t.blocks }} |
        ⏳ {{ pendingBlocks.length }} {{ t.pending }}
        <template v-if="typewriter.enabled.value && typewriter.isProcessing.value">
          | ⌨️ {{ typewriter.isPaused.value ? t.paused : t.typing }}
        </template>
      </span>
    </div>

    <BenchmarkPanel
      v-if="benchmarkMode"
      :stats="benchmarkStats"
      :running="benchmarkRunning"
      :progress="benchmarkProgress"
      :t="t"
      @run="handleRunBenchmark"
    />

    <CustomInputPanel
      v-if="customInputMode"
      v-model="customMarkdown"
      :t="t"
      @use-example="customMarkdown = sampleMarkdown"
    />

    <main :class="['content', typewriter.enabled.value && `effect-${typewriterEffect}`]">
      <AutoScrollContainer ref="scrollContainerRef" :enabled="autoScrollEnabled" class="scroll-container">
        <Incremark
          :blocks="blocks"
          :components="useCustomComponents ? customComponents : {}"
          :show-block-status="true"
        />
      </AutoScrollContainer>
    </main>
  </div>
</template>

