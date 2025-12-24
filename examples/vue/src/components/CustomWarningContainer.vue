<script setup lang="ts">
defineProps<{
  name: string
  options?: Record<string, any>
}>()
</script>

<template>
  <div class="custom-warning-container">
    <div class="custom-warning-header">
      <span class="custom-warning-icon">⚠️</span>
      <span v-if="options?.title" class="custom-warning-title">{{ options.title }}</span>
      <span v-else class="custom-warning-title">警告</span>
    </div>
    <div class="custom-warning-content">
      <slot />
    </div>
  </div>
</template>

<!-- 样式已移动到共享的 styles.css -->

