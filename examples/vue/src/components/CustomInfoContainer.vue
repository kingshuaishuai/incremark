<script setup lang="ts">
defineProps<{
  name: string
  options?: Record<string, any>
}>()
</script>

<template>
  <div class="custom-info-container">
    <div class="custom-info-header">
      <span class="custom-info-icon">ℹ️</span>
      <span v-if="options?.title" class="custom-info-title">{{ options.title }}</span>
      <span v-else class="custom-info-title">信息</span>
    </div>
    <div class="custom-info-content">
      <slot />
    </div>
  </div>
</template>

<!-- 样式已移动到共享的 styles.css -->

