import zhMessages from './zh.json'
import enMessages from './en.json'
import sampleZh from './sample-zh.md?raw'
import sampleEn from './sample-en.md?raw'

export type Locale = 'zh' | 'en'

export interface Messages {
  title: string
  simulateAI: string
  streaming: string
  renderOnce: string
  reset: string
  customComponents: string
  chars: string
  blocks: string
  pending: string
  benchmark: string
  benchmarkMode: string
  runBenchmark: string
  running: string
  traditional: string
  incremark: string
  totalTime: string
  parseCount: string
  totalChars: string
  speedup: string
  benchmarkNote: string
  customInput: string
  inputPlaceholder: string
  useExample: string
  typewriterMode: string
  typewriterSpeed: string
  skip: string
  pause: string
  resume: string
  typing: string
  paused: string
  charsPerTick: string
  intervalMs: string
  randomStep: string
  effectNone: string
  effectFadeIn: string
  effectTyping: string
  autoScroll: string
  scrollPaused: string
  htmlMode: string
}

export const messages: Record<Locale, Messages> = {
  zh: zhMessages,
  en: enMessages
}

export const sampleMarkdowns: Record<Locale, string> = {
  zh: sampleZh,
  en: sampleEn
}

