<script setup lang="ts">
import type { Blockquote } from 'mdast'
import IncremarkParagraph from './IncremarkParagraph.vue'

defineProps<{
  node: Blockquote
}>()
</script>

<template>
  <blockquote class="incremark-blockquote">
    <template v-for="(child, index) in node.children" :key="index">
      <IncremarkParagraph v-if="child.type === 'paragraph'" :node="child" />
      <div v-else class="unknown-child">{{ child.type }}</div>
    </template>
  </blockquote>
</template>

<style scoped>
.incremark-blockquote {
  margin: 1em 0;
  padding: 0.5em 1em;
  border-left: 4px solid #3b82f6;
  background: #f0f7ff;
  border-radius: 0 4px 4px 0;
}

.incremark-blockquote :deep(p) {
  margin: 0.5em 0;
}

.incremark-blockquote :deep(p:first-child) {
  margin-top: 0;
}

.incremark-blockquote :deep(p:last-child) {
  margin-bottom: 0;
}
</style>

