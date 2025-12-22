<script setup lang="ts">
import { computed } from 'vue'
import type { PhrasingContent, RootContent } from 'mdast'
import type { TextChunk } from '@incremark/core'
import {
  type TextNodeWithChunks,
  hasChunks,
  getStableText,
  isHtmlNode
} from '@incremark/shared'
import IncremarkMath from './IncremarkMath.vue'
import IncremarkHtmlElement from './IncremarkHtmlElement.vue'

// Math 节点类型
interface MathNode {
  type: 'math' | 'inlineMath'
  value: string
}

// HtmlElement 节点类型
interface HtmlElementNode {
  type: 'htmlElement'
  tagName: string
  attrs: Record<string, string>
  children: RootContent[]
}

/**
 * 类型守卫：检查是否是 htmlElement 节点
 */
function isHtmlElementNode(node: PhrasingContent): node is PhrasingContent & HtmlElementNode {
  return (node as unknown as HtmlElementNode).type === 'htmlElement'
}

const props = defineProps<{
  nodes: PhrasingContent[]
}>()

/**
 * 获取节点的 chunks（类型安全）
 */
function getChunks(node: PhrasingContent): TextChunk[] | undefined {
  if (hasChunks(node)) {
    return (node as TextNodeWithChunks).chunks
  }
  return undefined
}

/**
 * 类型守卫：检查是否是 inlineMath 节点
 * inlineMath 是 mdast-util-math 扩展的类型，不在标准 PhrasingContent 中
 */
function isInlineMath(node: PhrasingContent): node is PhrasingContent & MathNode {
  return (node as unknown as MathNode).type === 'inlineMath'
}

</script>

<template>
  <template v-for="(node, idx) in nodes" :key="idx">
    <!-- 文本（支持 chunks 渐入动画） -->
    <template v-if="node.type === 'text'">
      <!-- 稳定文本（已经显示过的部分，无动画） -->
      {{ getStableText(node as TextNodeWithChunks) }}
      <!-- 新增的 chunk 部分（带渐入动画） -->
      <span 
        v-for="chunk in getChunks(node)" 
        :key="chunk.createdAt"
        class="incremark-fade-in"
      >{{ chunk.text }}</span>
    </template>

    <!-- 行内公式 -->
    <IncremarkMath v-else-if="isInlineMath(node)" :node="(node as unknown as MathNode)" />

    <!-- htmlElement 节点（结构化的 HTML 元素） -->
    <IncremarkHtmlElement 
      v-else-if="isHtmlElementNode(node)" 
      :node="(node as unknown as HtmlElementNode)" 
    />

    <!-- HTML 节点（原始 HTML，如未启用 htmlTree 选项） -->
    <span v-else-if="isHtmlNode(node)" style="display: contents;" v-html="(node as any).value"></span>

    <!-- 加粗 -->
    <strong v-else-if="node.type === 'strong'">
      <IncremarkInline :nodes="(node.children as PhrasingContent[])" />
    </strong>

    <!-- 斜体 -->
    <em v-else-if="node.type === 'emphasis'">
      <IncremarkInline :nodes="(node.children as PhrasingContent[])" />
    </em>

    <!-- 行内代码 -->
    <code v-else-if="node.type === 'inlineCode'" class="incremark-inline-code">{{ (node as any).value }}</code>

    <!-- 链接 -->
    <a
      v-else-if="node.type === 'link'"
      :href="node.url"
      target="_blank"
      rel="noopener noreferrer"
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
