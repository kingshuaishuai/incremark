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
  <component :is="tag" :class="`incremark-heading h${node.depth}`">
    <IncremarkInline :nodes="node.children" />
  </component>
</template>
