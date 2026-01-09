<script setup lang="ts">
import { provide, ref, watch, type Ref } from 'vue'
import type { IncremarkLocale } from '@incremark/shared'
import { zhCN } from '@incremark/shared'
import { LOCALE_KEY } from '../composables/useLocale'

interface Props {
  /** locale 对象 */
  locale?: IncremarkLocale
}

const props = withDefaults(defineProps<Props>(), {
  locale: () => zhCN
})

// 提供 locale 给子组件（确保不是 undefined）
const localeRef: Ref<IncremarkLocale> = ref(props.locale || zhCN)
provide(LOCALE_KEY, localeRef)

// 监听 locale 变化
watch(
  () => props.locale,
  (newLocale) => {
    if (newLocale) {
      localeRef.value = newLocale
    }
  },
  { deep: true }
)
</script>

<template>
  <slot />
</template>
