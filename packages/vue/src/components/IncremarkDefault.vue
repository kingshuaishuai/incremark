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

