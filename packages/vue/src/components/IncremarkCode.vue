<script setup lang="ts">
import type { Code } from 'mdast'
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
  }>(),
  {
    theme: 'github-dark',
    disableHighlight: false,
    mermaidDelay: 500
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
  <!-- Mermaid 图表 -->
  <div v-if="isMermaid" class="incremark-mermaid">
    <div class="mermaid-header">
      <span class="language">MERMAID</span>
      <div class="mermaid-actions">
        <button 
          class="view-toggle" 
          @click="toggleMermaidView" 
          type="button"
          :disabled="!mermaidSvg"
        >
          {{ mermaidViewMode === 'preview' ? '源码' : '预览' }}
        </button>
        <button class="copy-btn" @click="copyCode" type="button">
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
      <button class="copy-btn" @click="copyCode" type="button">
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

<style scoped>
/* Mermaid 样式 */
.incremark-mermaid {
  margin: 1em 0;
  border-radius: 8px;
  overflow: hidden;
  background: #1a1a2e;
}

.mermaid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #16213e;
  border-bottom: 1px solid #0f3460;
  font-size: 12px;
}

.mermaid-actions {
  display: flex;
  gap: 8px;
}

.view-toggle {
  padding: 4px 10px;
  border: 1px solid #0f3460;
  border-radius: 6px;
  background: transparent;
  color: #8b949e;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.view-toggle:hover:not(:disabled) {
  background: #0f3460;
  color: #e0e0e0;
}

.view-toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mermaid-content {
  padding: 16px;
  min-height: 100px;
}

.mermaid-loading {
  color: #8b949e;
  font-size: 14px;
}

.mermaid-source-code {
  margin: 0;
  padding: 12px;
  background: #0d1117;
  border-radius: 6px;
  color: #c9d1d9;
  font-family: 'Fira Code', 'SF Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  overflow-x: auto;
}

.mermaid-svg {
  overflow-x: auto;
}

.mermaid-svg :deep(svg) {
  max-width: 100%;
  height: auto;
}

/* 代码块样式 */
.incremark-code {
  margin: 1em 0;
  border-radius: 8px;
  overflow: hidden;
  background: #24292e;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #1f2428;
  border-bottom: 1px solid #30363d;
  font-size: 12px;
}

.language {
  color: #8b949e;
  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.copy-btn {
  padding: 4px 12px;
  border: 1px solid #30363d;
  border-radius: 6px;
  background: transparent;
  color: #8b949e;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: #30363d;
  color: #c9d1d9;
}

.code-content {
  overflow-x: auto;
}

.code-loading {
  opacity: 0.7;
}

/* Shiki 生成的代码样式 */
.shiki-wrapper :deep(pre) {
  margin: 0;
  padding: 16px;
  background: transparent !important;
  overflow-x: auto;
}

.shiki-wrapper :deep(code) {
  font-family: 'Fira Code', 'SF Mono', 'Monaco', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.6;
}

/* 回退样式 */
.code-fallback,
.code-loading pre {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
  background: transparent;
}

.code-fallback code,
.code-loading code {
  font-family: 'Fira Code', 'SF Mono', 'Monaco', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #c9d1d9;
}
</style>
