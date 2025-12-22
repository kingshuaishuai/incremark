<script setup lang="ts">
import type { RootContent, HTML } from 'mdast'
import type { Component } from 'vue'
import IncremarkHeading from './IncremarkHeading.vue'
import IncremarkParagraph from './IncremarkParagraph.vue'
import IncremarkCode from './IncremarkCode.vue'
import IncremarkList from './IncremarkList.vue'
import IncremarkTable from './IncremarkTable.vue'
import IncremarkBlockquote from './IncremarkBlockquote.vue'
import IncremarkThematicBreak from './IncremarkThematicBreak.vue'
import IncremarkMath from './IncremarkMath.vue'
import IncremarkHtmlElement from './IncremarkHtmlElement.vue'
import IncremarkDefault from './IncremarkDefault.vue'

const props = defineProps<{
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
  htmlElement: IncremarkHtmlElement,
}

function getComponent(type: string): Component {
  return componentMap[type] || IncremarkDefault
}

/**
 * 检查是否是 html 节点
 */
function isHtmlNode(node: RootContent): node is HTML {
  return node.type === 'html'
}
</script>

<template>
  <!-- HTML 节点：渲染为代码块显示源代码 -->
  <pre v-if="isHtmlNode(node)" class="incremark-html-code"><code>{{ (node as HTML).value }}</code></pre>
  <!-- 其他节点：使用对应组件 -->
  <component v-else :is="getComponent(node.type)" :node="node" />
</template>

