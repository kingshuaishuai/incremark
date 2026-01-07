<script setup lang="ts">
/**
 * SvgIcon 组件
 * 
 * 直接渲染 SVG 字符串
 */
interface Props {
  /** SVG 字符串内容 */
  svg: string
  /** 图标大小 class，如 incremark-icon--sm, incremark-icon--md 等 */
  sizeClass?: string
}

defineProps<Props>()
</script>

<template>
  <span
    :class="['incremark-icon', sizeClass]"
    v-html="svg"
  />
</template>
