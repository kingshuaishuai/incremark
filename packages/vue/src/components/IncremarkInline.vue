<script setup lang="ts">
import type { PhrasingContent } from 'mdast'
import type { TextChunk } from '@incremark/core'
import IncremarkMath from './IncremarkMath.vue'

// 扩展的文本节点类型（支持 chunks）
interface TextNodeWithChunks {
  type: 'text'
  value: string
  stableLength?: number
  chunks?: TextChunk[]
}

defineProps<{
  nodes: PhrasingContent[]
}>()

/**
 * 获取文本节点的稳定部分（不需要动画）
 */
function getStableText(node: TextNodeWithChunks): string {
  if (!node.chunks || node.chunks.length === 0) {
    return node.value
  }
  // 使用 stableLength 来确定稳定部分
  return node.value.slice(0, node.stableLength ?? 0)
}
</script>

<template>
  <template v-for="(node, idx) in nodes" :key="idx">
    <!-- 文本（支持 chunks 渐入动画） -->
    <template v-if="node.type === 'text'">
      <!-- 稳定文本（已经显示过的部分，无动画） -->
      {{ getStableText(node as unknown as TextNodeWithChunks) }}
      <!-- 新增的 chunk 部分（带渐入动画） -->
      <span 
        v-for="(chunk, chunkIdx) in (node as any).chunks" 
        :key="chunkIdx"
        class="incremark-fade-in"
      >{{ chunk.text }}</span>
    </template>

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

    <!-- 原始 HTML -->
    <span v-else-if="(node as any).type === 'html'" v-html="(node as any).value"></span>
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

/* 渐入动画 */
.incremark-fade-in {
  animation: incremark-fade-in 0.4s ease-out;
}

@keyframes incremark-fade-in {
  from { 
    opacity: 0; 
  }
  to { 
    opacity: 1; 
  }
}
</style>
