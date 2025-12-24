<script setup lang="ts">
import type { Code } from 'mdast'
import type { Component } from 'vue'
import { computed, ref, watch, shallowRef, onUnmounted } from 'vue'

const props = withDefaults(
  defineProps<{
    node: Code
    /** Shiki 主题，默认 github-dark */
    theme?: string
    /** 是否禁用代码高亮 */
    disableHighlight?: boolean
    /** Mermaid 渲染延迟（毫秒），用于流式输入时防抖 */
    mermaidDelay?: number
    /** 自定义代码块组件映射，key 为代码语言名称 */
    customCodeBlocks?: Record<string, Component>
    /** 块状态，用于判断是否使用自定义组件 */
    blockStatus?: 'pending' | 'stable' | 'completed'
  }>(),
  {
    theme: 'github-dark',
    disableHighlight: false,
    mermaidDelay: 500,
    customCodeBlocks: () => ({}),
    blockStatus: 'completed'
  }
)

const copied = ref(false)
const highlightedHtml = ref('')
const isHighlighting = ref(false)
const highlightError = ref(false)

// Mermaid 支持
const mermaidSvg = ref('')
const mermaidError = ref('')
const mermaidLoading = ref(false)
const mermaidRef = shallowRef<any>(null)
let mermaidTimer: ReturnType<typeof setTimeout> | null = null
// 视图模式：'preview' | 'source'
const mermaidViewMode = ref<'preview' | 'source'>('preview')

function toggleMermaidView() {
  mermaidViewMode.value = mermaidViewMode.value === 'preview' ? 'source' : 'preview'
}

const language = computed(() => props.node.lang || 'text')
const code = computed(() => props.node.value)
const isMermaid = computed(() => language.value === 'mermaid')

// 检查是否有自定义代码块组件
const CustomCodeBlock = computed(() => {
  // 如果代码块还在 pending 状态，不使用自定义组件
  if (props.blockStatus === 'pending') {
    return null
  }
  return props.customCodeBlocks?.[language.value] || null
})

// 是否使用自定义组件
const useCustomComponent = computed(() => !!CustomCodeBlock.value)

// 缓存 highlighter
const highlighterRef = shallowRef<any>(null)
const loadedLanguages = new Set<string>()
const loadedThemes = new Set<string>()

// Mermaid 渲染（带防抖动）
function scheduleRenderMermaid() {
  if (!isMermaid.value || !code.value) return

  // 清除之前的定时器
  if (mermaidTimer) {
    clearTimeout(mermaidTimer)
  }

  // 显示加载状态
  mermaidLoading.value = true

  // 防抖动延迟渲染
  mermaidTimer = setTimeout(() => {
    doRenderMermaid()
  }, props.mermaidDelay)
}

async function doRenderMermaid() {
  if (!code.value) return

  mermaidError.value = ''

  try {
    // 动态导入 mermaid
    if (!mermaidRef.value) {
      // @ts-ignore - mermaid 是可选依赖
      const mermaidModule = await import('mermaid')
      mermaidRef.value = mermaidModule.default
      mermaidRef.value.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose'
      })
    }

    const mermaid = mermaidRef.value
    const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2)}`

    const { svg } = await mermaid.render(id, code.value)
    mermaidSvg.value = svg
  } catch (e: any) {
    // 不显示错误，可能是代码还不完整
    mermaidError.value = ''
    mermaidSvg.value = ''
  } finally {
    mermaidLoading.value = false
  }
}

onUnmounted(() => {
  if (mermaidTimer) {
    clearTimeout(mermaidTimer)
  }
})

// 动态加载 shiki 并高亮
async function highlight() {
  if (isMermaid.value) {
    scheduleRenderMermaid()
    return
  }

  if (!code.value || props.disableHighlight) {
    highlightedHtml.value = ''
    return
  }

  isHighlighting.value = true
  highlightError.value = false

  try {
    // 动态导入 shiki
    if (!highlighterRef.value) {
      const { createHighlighter } = await import('shiki')
      highlighterRef.value = await createHighlighter({
        themes: [props.theme as any],
        langs: []
      })
      loadedThemes.add(props.theme)
    }

    const highlighter = highlighterRef.value
    const lang = language.value

    // 按需加载语言
    if (!loadedLanguages.has(lang) && lang !== 'text') {
      try {
        await highlighter.loadLanguage(lang)
        loadedLanguages.add(lang)
      } catch {
        // 语言不支持，标记但不阻止
      }
    }

    // 按需加载主题
    if (!loadedThemes.has(props.theme)) {
      try {
        await highlighter.loadTheme(props.theme)
        loadedThemes.add(props.theme)
      } catch {
        // 主题不支持
      }
    }

    const html = highlighter.codeToHtml(code.value, {
      lang: loadedLanguages.has(lang) ? lang : 'text',
      theme: loadedThemes.has(props.theme) ? props.theme : 'github-dark'
    })
    highlightedHtml.value = html
  } catch (e) {
    // Shiki 不可用或加载失败
    highlightError.value = true
    highlightedHtml.value = ''
  } finally {
    isHighlighting.value = false
  }
}

// 监听代码变化，重新高亮/渲染
watch([code, () => props.theme, isMermaid], highlight, { immediate: true })

async function copyCode() {
  try {
    await navigator.clipboard.writeText(code.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // 复制失败静默处理
  }
}
</script>

<template>
  <!-- 自定义代码块组件 -->
  <component
    v-if="useCustomComponent && CustomCodeBlock"
    :is="CustomCodeBlock"
    :code-str="code"
    :lang="language"
  />

  <!-- Mermaid 图表（如果没有自定义组件） -->
  <div v-else-if="isMermaid" class="incremark-mermaid">
    <div class="mermaid-header">
      <span class="language">MERMAID</span>
      <div class="mermaid-actions">
        <button 
          class="code-btn" 
          @click="toggleMermaidView" 
          type="button"
          :disabled="!mermaidSvg"
        >
          {{ mermaidViewMode === 'preview' ? '源码' : '预览' }}
        </button>
        <button class="code-btn" @click="copyCode" type="button">
          {{ copied ? '✓ 已复制' : '复制' }}
        </button>
      </div>
    </div>
    <div class="mermaid-content">
      <!-- 加载中 -->
      <div v-if="mermaidLoading && !mermaidSvg" class="mermaid-loading">
        <pre class="mermaid-source-code">{{ code }}</pre>
      </div>
      <!-- 源码模式 -->
      <pre v-else-if="mermaidViewMode === 'source'" class="mermaid-source-code">{{ code }}</pre>
      <!-- 预览模式 -->
      <div v-else-if="mermaidSvg" v-html="mermaidSvg" class="mermaid-svg" />
      <!-- 无法渲染时显示源码 -->
      <pre v-else class="mermaid-source-code">{{ code }}</pre>
    </div>
  </div>

  <!-- 普通代码块 -->
  <div v-else class="incremark-code">
    <div class="code-header">
      <span class="language">{{ language }}</span>
      <button class="code-btn" @click="copyCode" type="button">
        {{ copied ? '✓ 已复制' : '复制' }}
      </button>
    </div>
    <div class="code-content">
      <!-- 正在加载高亮 -->
      <div v-if="isHighlighting && !highlightedHtml" class="code-loading">
        <pre><code>{{ code }}</code></pre>
      </div>
      <!-- 高亮后的代码 -->
      <div v-else-if="highlightedHtml" v-html="highlightedHtml" class="shiki-wrapper" />
      <!-- 回退：无高亮 -->
      <pre v-else class="code-fallback"><code>{{ code }}</code></pre>
    </div>
  </div>
</template>
