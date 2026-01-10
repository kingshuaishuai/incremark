<script setup lang="ts">
import { computed, ref, watch, shallowRef, onUnmounted } from 'vue'

// Math 节点类型（来自 mdast-util-math）
interface MathNode {
  type: 'math' | 'inlineMath'
  value: string
  data?: {
    hName?: string
    hProperties?: Record<string, any>
  }
}

const props = withDefaults(
  defineProps<{
    node: MathNode
    /** 渲染延迟（毫秒），用于流式输入时防抖 */
    renderDelay?: number
  }>(),
  {
    renderDelay: 0
  }
)

const renderedHtml = ref('')
const renderError = ref('')
const isLoading = ref(false)
const katexRef = shallowRef<any>(null)
let renderTimer: ReturnType<typeof setTimeout> | null = null

const isInline = computed(() => props.node.type === 'inlineMath')
const formula = computed(() => props.node.value)

// 带防抖动的渲染
function scheduleRender() {
  if (!formula.value) {
    renderedHtml.value = ''
    return
  }

  // 清除之前的定时器
  if (renderTimer) {
    clearTimeout(renderTimer)
  }

  isLoading.value = true

  // 防抖动延迟渲染
  renderTimer = setTimeout(() => {
    doRender()
  }, props.renderDelay)
}

async function doRender() {
  if (!formula.value) return

  try {
    // 动态导入 KaTeX
    if (!katexRef.value) {
      // @ts-ignore - katex 是可选依赖
      const katexModule = await import('katex')
      katexRef.value = katexModule.default
    }

    const katex = katexRef.value
    renderedHtml.value = katex.renderToString(formula.value, {
      displayMode: !isInline.value,
      throwOnError: false,
      strict: false
    })
    renderError.value = ''
  } catch (e: any) {
    // 静默失败，可能是公式不完整
    renderError.value = ''
    renderedHtml.value = ''
  } finally {
    isLoading.value = false
  }
}

onUnmounted(() => {
  if (renderTimer) {
    clearTimeout(renderTimer)
  }
})

watch(formula, scheduleRender, { immediate: true })
</script>

<template>
  <!-- 行内公式 -->
  <span v-if="isInline" class="incremark-math-inline">
    <!-- 渲染成功 -->
    <span v-if="renderedHtml && !isLoading" v-html="renderedHtml" />
    <!-- 加载中或未渲染：显示源码 -->
    <code v-else class="math-source">{{ formula }}</code>
  </span>
  <!-- 块级公式 -->
  <div v-else class="incremark-math-block">
    <!-- 渲染成功 -->
    <div v-if="renderedHtml && !isLoading" v-html="renderedHtml" class="math-rendered" />
    <!-- 加载中或未渲染：显示源码 -->
    <pre v-else class="math-source-block"><code>{{ formula }}</code></pre>
  </div>
</template>
