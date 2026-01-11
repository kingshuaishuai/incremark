<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted, watchEffect } from 'vue'
import 'katex/dist/katex.min.css'

// 本地 composables 和组件
import { useLocale } from './composables'
import { IncremarkDemo } from './components'
import { zhCN } from '@incremark/vue'
import { createDevTools, setLocale as setDevToolsLocale } from '@incremark/devtools'

// ============ DevTools ============
const devtools = createDevTools({
  locale: 'zh-CN'
})

onMounted(() => {
  devtools.mount()
})

onUnmounted(() => {
  devtools.unmount()
})

// ============ 国际化 ============
const { locale, t, sampleMarkdown, toggleLocale } = useLocale()

// 同步 DevTools 语言
watchEffect(() => {
  setDevToolsLocale(locale.value === 'zh' ? 'zh-CN' : 'en-US')
})

// ============ Incremark Locale ============
const incremarkLocale = computed(() => locale.value === 'zh' ? zhCN : undefined)

// ============ HTML 模式 ============
const htmlEnabled = ref(true)
// 用于强制重新创建 incremark 实例
const incremarkKey = ref(0)

// 监听 HTML 模式或语言变化，重新创建 incremark 实例
watch([htmlEnabled, locale], () => {
  incremarkKey.value++
})
</script>

<template>
  <div class="app">
    <header>
      <div class="header-top">
        <h1>{{ t.title }}</h1>
        <button class="lang-toggle" @click="toggleLocale">
          {{ locale === 'zh' ? '🇺🇸 English' : '🇨🇳 中文' }}
        </button>
      </div>
      <div class="header-controls">
        <label class="checkbox html-toggle">
          <input type="checkbox" v-model="htmlEnabled" />
          {{ t.htmlMode }}
        </label>
      </div>
    </header>

    <IncremarkDemo
      :key="incremarkKey"
      :html-enabled="htmlEnabled"
      :sample-markdown="sampleMarkdown"
      :t="t"
      :locale="incremarkLocale"
      :devtools="devtools"
    />
  </div>
</template>

<style>
@import '../../shared/styles.css';

.header-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 8px;
}
</style>
