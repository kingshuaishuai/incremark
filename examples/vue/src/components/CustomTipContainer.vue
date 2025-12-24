<script setup lang="ts">
defineProps<{
  name: string
  options?: Record<string, any>
}>()
</script>

<template>
  <div class="custom-tip-container">
    <div class="custom-tip-header">
      <span class="custom-tip-icon">💡</span>
      <span v-if="options?.title" class="custom-tip-title">{{ options.title }}</span>
      <span v-else class="custom-tip-title">提示</span>
    </div>
    <div class="custom-tip-content">
      <slot />
    </div>
  </div>
</template>

<!-- 样式已移动到共享的 styles.css -->

