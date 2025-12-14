<script setup lang="ts">
import type { Paragraph } from 'mdast'
import IncremarkInline from './IncremarkInline.vue'

defineProps<{
  node: Paragraph
}>()
</script>

<template>
  <p class="incremark-paragraph">
    <IncremarkInline :nodes="node.children" />
  </p>
</template>

<style scoped>
.incremark-paragraph {
  margin: 0.75em 0;
  line-height: 1.6;
}
</style>
