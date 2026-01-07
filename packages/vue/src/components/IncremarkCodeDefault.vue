<script setup lang="ts">
import type { Code } from 'mdast'
import { computed, onUnmounted, ref, watch } from 'vue'
import { LucideCopy, LucideCopyCheck } from '@incremark/icons'
import { isClipboardAvailable } from '@incremark/shared'
import SvgIcon from './SvgIcon.vue'
import { useShiki } from '../composables/useShiki'

interface Props {
  node: Code
  /** Shiki 主题，默认 github-dark */
  theme?: string
  /** 默认回退主题（当指定主题加载失败时使用），默认 github-dark */
  fallbackTheme?: string
  /** 是否禁用代码高亮 */
  disableHighlight?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'github-dark',
  fallbackTheme: 'github-dark',
  disableHighlight: false
})

const copied = ref(false)
const highlightedHtml = ref('')

const language = computed(() => props.node.lang || 'text')
const code = computed(() => props.node.value)

// 使用 Shiki 单例管理器
const { isHighlighting, highlight } = useShiki(props.theme)

// 动态加载 shiki 并高亮
async function doHighlight() {
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

// 监听代码变化，重新高亮
watch([code, () => props.theme], doHighlight, { immediate: true })

let copyTimeoutId: ReturnType<typeof setTimeout> | null = null

async function copyCode() {
  if (!isClipboardAvailable()) return

  try {
    await navigator.clipboard.writeText(code.value)
    copied.value = true

    // 清理之前的定时器
    if (copyTimeoutId) {
      clearTimeout(copyTimeoutId)
    }

    copyTimeoutId = setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // 复制失败静默处理
  }
}

onUnmounted(() => {
  if (copyTimeoutId) {
    clearTimeout(copyTimeoutId)
  }
})
</script>

<template>
  <div class="incremark-code">
    <div class="code-header">
      <span class="language">{{ language }}</span>
      <button 
        class="code-btn" 
        @click="copyCode" 
        type="button"
        :title="copied ? 'Copied!' : 'Copy'"
      >
        <SvgIcon :svg="copied ? LucideCopyCheck : LucideCopy" />
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
