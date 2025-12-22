<script setup lang="ts">
import { ref, watch } from 'vue'
import type { DesignTokens } from '@incremark/theme'
import { applyTheme } from '@incremark/theme'

/**
 * 主题配置，可以是：
 * - 字符串：'default' | 'dark'
 * - 完整主题对象：DesignTokens
 * - 部分主题对象：Partial<DesignTokens>（会合并到默认主题）
 */
const props = withDefaults(
  defineProps<{
    theme: 'default' | 'dark' | DesignTokens | Partial<DesignTokens>
    class?: string
  }>(),
  {
    class: ''
  }
)

const containerRef = ref<HTMLElement>()

watch(
  () => props.theme,
  (theme) => {
    if (containerRef.value) {
      // 应用主题到容器元素
      applyTheme(containerRef.value, theme)
    }
  },
  { immediate: true }
)
</script>

<template>
  <div ref="containerRef" :class="props.class" class="incremark-theme-provider">
    <slot />
  </div>
</template>

