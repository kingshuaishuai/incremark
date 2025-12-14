<script setup lang="ts">
import type { PhrasingContent } from 'mdast'
import IncremarkMath from './IncremarkMath.vue'

defineProps<{
  nodes: PhrasingContent[]
}>()

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
</script>

<template>
  <template v-for="(node, idx) in nodes" :key="idx">
    <!-- 文本 -->
    <template v-if="node.type === 'text'">{{ node.value }}</template>

    <!-- 行内公式 -->
    <IncremarkMath v-else-if="(node as any).type === 'inlineMath'" :node="node as any" />

    <!-- 加粗 -->
    <strong v-else-if="node.type === 'strong'">
      <IncremarkInline :nodes="(node.children as PhrasingContent[])" />
    </strong>

    <!-- 斜体 -->
    <em v-else-if="node.type === 'emphasis'">
      <IncremarkInline :nodes="(node.children as PhrasingContent[])" />
    </em>

    <!-- 行内代码 -->
    <code v-else-if="node.type === 'inlineCode'" class="incremark-inline-code">{{ node.value }}</code>

    <!-- 链接 -->
    <a
      v-else-if="node.type === 'link'"
      :href="node.url"
      target="_blank"
      rel="noopener"
    >
      <IncremarkInline :nodes="(node.children as PhrasingContent[])" />
    </a>

    <!-- 图片 -->
    <img
      v-else-if="node.type === 'image'"
      :src="node.url"
      :alt="node.alt || ''"
      loading="lazy"
    />

    <!-- 换行 -->
    <br v-else-if="node.type === 'break'" />

    <!-- 删除线 -->
    <del v-else-if="node.type === 'delete'">
      <IncremarkInline :nodes="(node.children as PhrasingContent[])" />
    </del>
  </template>
</template>

<style>
.incremark-inline-code {
  padding: 0.2em 0.4em;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 4px;
  font-family: 'Fira Code', 'SF Mono', Consolas, monospace;
  font-size: 0.9em;
}
</style>
