<script setup lang="ts">
import type { RootContent } from 'mdast'

defineProps<{
  node: RootContent
}>()
</script>

<template>
  <div class="incremark-default">
    <span class="type-badge">{{ node.type }}</span>
    <pre>{{ JSON.stringify(node, null, 2) }}</pre>
  </div>
</template>

<style scoped>
.incremark-default {
  margin: 0.5em 0;
  padding: 10px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 4px;
  font-size: 12px;
}

.type-badge {
  display: inline-block;
  padding: 2px 8px;
  background: #ffc107;
  border-radius: 4px;
  font-weight: 600;
  margin-bottom: 8px;
}

pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 11px;
}
</style>

