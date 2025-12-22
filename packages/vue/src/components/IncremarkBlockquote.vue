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

