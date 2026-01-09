<script setup lang="ts">
import type { Code } from 'mdast'
import { computed, onMounted, ref, watch } from 'vue'
import { LucideCopy, LucideCopyCheck } from '@incremark/icons'
import { isClipboardAvailable } from '@incremark/shared'
import SvgIcon from './SvgIcon.vue'
import { useShiki } from '../composables/useShiki'
import { useLocale } from '../composables/useLocale'
import CachedCodeRenderer from './CachedCodeRenderer.vue'

interface Props {
  node: Code
  /** Shiki 主题，默认 github-dark */
  theme?: string
  /** 默认回退主题（当指定主题加载失败时使用），默认 github-dark */
  fallbackTheme?: string
  /** 是否禁用代码高亮 */
  disableHighlight?: boolean
  /** block 状态 */
  blockStatus?: 'pending' | 'stable' | 'completed'
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'github-dark',
  fallbackTheme: 'github-dark',
  disableHighlight: false,
  blockStatus: 'pending'
})

const copied = ref(false)

const language = computed(() => props.node.lang || 'text')
const code = computed(() => props.node.value)

// 使用 i18n
const { t } = useLocale()

// 使用 Shiki 单例管理器
const { highlighterInfo, initHighlighter } = useShiki(props.theme)

// 语言是否已加载完成
const isLanguageLoaded = ref(false)

// 是否应该启用高亮（需要有代码内容才开始高亮逻辑）
const shouldEnableHighlight = computed(() => {
  return !props.disableHighlight && code.value && code.value.length > 0
})

// 初始化 highlighter 并加载语言
// 只有当存在代码内容时才开始加载语言，避免流式渲染时语言标识不完整导致的错误
watch([highlighterInfo, language, shouldEnableHighlight], async ([info, lang, shouldHighlight]) => {
  // 如果不需要高亮，直接返回
  if (!shouldHighlight) {
    return
  }

  if (!info) {
    await initHighlighter()
  } else if (lang && lang !== 'text') {
    // 检查语言是否已加载
    if (!info.loadedLanguages.has(lang as any)) {
      try {
        isLanguageLoaded.value = false
        // 检查语言是否被 shiki 支持
        const supportedLangs = info.highlighter.getLoadedLanguages()
        const bundledLangs = await import('shiki').then(m => Object.keys(m.bundledLanguages || {}))
        const isSupported = supportedLangs.includes(lang) || bundledLangs.includes(lang)

        if (isSupported) {
          await info.highlighter.loadLanguage(lang as any)
          info.loadedLanguages.add(lang as any)
        }
        // 无论是否支持，都标记为已加载（不支持的语言会 fallback 到纯文本显示）
        isLanguageLoaded.value = true
      } catch {
        // 语言加载失败，标记为已加载（回退到无高亮）
        isLanguageLoaded.value = true
      }
    } else {
      isLanguageLoaded.value = true
    }
  } else {
    // text 语言不需要加载
    isLanguageLoaded.value = true
  }
}, { immediate: true, deep: true })

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
</script>

<template>
  <div class="incremark-code">
    <div class="code-header">
      <span class="language">{{ language }}</span>
      <button
        class="code-btn"
        @click="copyCode"
        type="button"
        :aria-label="copied ? t('code.copied') : t('code.copy')"
        :title="copied ? 'Copied!' : 'Copy'"
      >
        <SvgIcon :svg="copied ? LucideCopyCheck : LucideCopy" />
      </button>
    </div>
    <div class="code-content">
      <div class="shiki-wrapper">
        <!-- Stream 高亮（只有当存在代码内容且语言加载完成后才渲染） -->
        <CachedCodeRenderer
          v-if="shouldEnableHighlight && highlighterInfo && isLanguageLoaded"
          :code="code"
          :lang="language"
          :theme="theme"
          :highlighter="highlighterInfo.highlighter"
        />
        <!-- 无高亮模式（禁用高亮、无代码内容、或语言未加载完成时显示） -->
        <pre v-else class="code-fallback"><code>{{ code }}</code></pre>
      </div>
    </div>
  </div>
</template>
