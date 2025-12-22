<script setup lang="ts">
import { ref, watch } from 'vue'
import 'katex/dist/katex.min.css'

// 本地 composables 和组件
import { useLocale } from './composables'
import { IncremarkDemo } from './components'

// ============ 国际化 ============
const { locale, t, sampleMarkdown, toggleLocale } = useLocale()

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
