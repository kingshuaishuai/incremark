<script setup lang="ts">
import type { Heading, PhrasingContent } from 'mdast'
import { IncremarkInline } from '@incremark/vue'

defineProps<{
  node: Heading
}>()
</script>

<template>
  <component :is="`h${node.depth}`" class="custom-heading">
    ✨ <IncremarkInline :nodes="(node.children as PhrasingContent[])" />
  </component>
</template>

<!-- 样式已移动到共享的 styles.css -->

