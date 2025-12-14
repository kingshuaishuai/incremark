<script setup lang="ts">
import type { Heading } from 'mdast'
import { computed } from 'vue'
import IncremarkInline from './IncremarkInline.vue'

const props = defineProps<{
  node: Heading
}>()

const tag = computed(() => `h${props.node.depth}`)
</script>

<template>
  <component :is="tag" class="incremark-heading">
    <IncremarkInline :nodes="node.children" />
  </component>
</template>

<style scoped>
.incremark-heading {
  margin: 0.5em 0;
  font-weight: 600;
  line-height: 1.3;
}

h1 { font-size: 2em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
h2 { font-size: 1.5em; }
h3 { font-size: 1.25em; }
h4 { font-size: 1em; }
h5 { font-size: 0.875em; }
h6 { font-size: 0.85em; color: #666; }
</style>

