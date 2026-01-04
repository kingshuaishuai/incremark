<script setup lang="ts">
import type { Code } from 'mdast'
import type { Component } from 'vue'
import { computed, ref, watch, onUnmounted, shallowRef } from 'vue'

import type { CodeBlockConfig } from './Incremark.vue'
import { useShiki } from '../composables/useShiki'

const props = withDefaults(
  defineProps<{
    node: Code
    /** Shiki 主题，默认 github-dark */
    theme?: string
    /** 默认回退主题（当指定主题加载失败时使用），默认 github-dark */
    fallbackTheme?: string
    /** 是否禁用代码高亮 */
    disableHighlight?: boolean
    /** Mermaid 渲染延迟（毫秒），用于流式输入时防抖 */
    mermaidDelay?: number
    /** 自定义代码块组件映射，key 为代码语言名称 */
    customCodeBlocks?: Record<string, Component>
    /** 代码块配置映射，key 为代码语言名称 */
    codeBlockConfigs?: Record<string, CodeBlockConfig>
    /** 块状态，用于判断是否使用自定义组件 */
    blockStatus?: 'pending' | 'stable' | 'completed'
  }>(),
  {
    theme: 'github-dark',
    fallbackTheme: 'github-dark',
    disableHighlight: false,
    mermaidDelay: 500,
    customCodeBlocks: () => ({}),
    codeBlockConfigs: () => ({}),
    blockStatus: 'completed'
  }
)

const copied = ref(false)
const highlightedHtml = ref('')

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
  const component = props.customCodeBlocks?.[language.value]
  if (!component) return null

  // 检查该语言的配置
  const config = props.codeBlockConfigs?.[language.value]

  // 如果配置了 takeOver 为 true，则从一开始就使用
  if (config?.takeOver) {
    return component
  }

  // 否则，默认行为：只在 completed 状态使用
  if (props.blockStatus !== 'completed') {
    return null
  }

  return component
})

// 使用 Shiki 单例管理器
const { isHighlighting, highlight } = useShiki(props.theme)

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
        securityLevel: 'loose',
        suppressErrorRendering: true
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

// 动态加载 shiki 并高亮
async function doHighlight() {
  if (isMermaid.value) {
    scheduleRenderMermaid()
    return
  }

  if (!code.value || props.disableHighlight) {
    highlightedHtml.value = ''
    return
  }

  try {
    const html = await highlight(code.value, language.value, props.fallbackTheme)
    highlightedHtml.value = html
  } catch (e) {
    // Shiki 不可用或加载失败
    highlightedHtml.value = ''
  }
}

// 监听代码变化，重新高亮/渲染
watch([code, () => props.theme, isMermaid], doHighlight, { immediate: true })

// 组件卸载时清理 Mermaid 定时器
onUnmounted(() => {
  if (mermaidTimer) {
    clearTimeout(mermaidTimer)
  }
})

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
    v-if="CustomCodeBlock"
    :is="CustomCodeBlock"
    :code-str="code"
    :lang="language"
    :completed="blockStatus === 'completed'"
    :takeOver="codeBlockConfigs?.[language]?.takeOver"
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
