<script setup lang="ts">
import type { RootContent } from 'mdast'
import type { Component } from 'vue'
import IncremarkHeading from './IncremarkHeading.vue'
import IncremarkParagraph from './IncremarkParagraph.vue'
import IncremarkCode from './IncremarkCode.vue'
import IncremarkList from './IncremarkList.vue'
import IncremarkTable from './IncremarkTable.vue'
import IncremarkBlockquote from './IncremarkBlockquote.vue'
import IncremarkThematicBreak from './IncremarkThematicBreak.vue'
import IncremarkMath from './IncremarkMath.vue'
import IncremarkDefault from './IncremarkDefault.vue'

defineProps<{
  node: RootContent
}>()

const componentMap: Record<string, Component> = {
  heading: IncremarkHeading,
  paragraph: IncremarkParagraph,
  code: IncremarkCode,
  list: IncremarkList,
  table: IncremarkTable,
  blockquote: IncremarkBlockquote,
  thematicBreak: IncremarkThematicBreak,
  math: IncremarkMath,
  inlineMath: IncremarkMath,
}

function getComponent(type: string): Component {
  return componentMap[type] || IncremarkDefault
}
</script>

<template>
  <component :is="getComponent(node.type)" :node="node" />
</template>

