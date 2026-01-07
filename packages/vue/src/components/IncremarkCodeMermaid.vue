<script setup lang="ts">
import type { Code } from 'mdast'
import { computed, ref, onUnmounted, shallowRef, watch } from 'vue'
import { GravityMermaid, LucideCode, LucideEye, LucideCopy, LucideCopyCheck } from '@incremark/icons'
import SvgIcon from './SvgIcon.vue'

interface Props {
  node: Code
  /** Mermaid 渲染延迟（毫秒），用于流式输入时防抖 */
  mermaidDelay?: number
}

const props = withDefaults(defineProps<Props>(), {
  mermaidDelay: 500
})

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

const code = computed(() => props.node.value)

// Mermaid 渲染（带防抖动）
function scheduleRenderMermaid() {
  if (!code.value) return

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

// 监听代码变化，重新渲染
watch(code, scheduleRenderMermaid, { immediate: true })

// 组件卸载时清理 Mermaid 定时器
onUnmounted(() => {
  if (mermaidTimer) {
    clearTimeout(mermaidTimer)
  }
})

const copied = ref(false)

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
  <div class="incremark-mermaid">
    <div class="mermaid-header">
      <span class="language">
        <SvgIcon :svg="GravityMermaid" class="language-icon" />
        MERMAID
      </span>
      <div class="mermaid-actions">
        <button
          class="code-btn"
          @click="toggleMermaidView"
          type="button"
          :disabled="!mermaidSvg"
          :title="mermaidViewMode === 'preview' ? 'View Source' : 'Preview'"
        >
          <SvgIcon :svg="mermaidViewMode === 'preview' ? LucideCode : LucideEye" />
        </button>
        <button 
          class="code-btn" 
          @click="copyCode" 
          type="button"
          :title="copied ? 'Copied!' : 'Copy'"
        >
          <SvgIcon :svg="copied ? LucideCopyCheck : LucideCopy" />
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
</template>
