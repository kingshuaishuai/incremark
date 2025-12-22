<script setup lang="ts">
import type { PhrasingContent, RootContent, ImageReference, LinkReference } from 'mdast'
import type { TextChunk } from '@incremark/core'
import {
  type TextNodeWithChunks,
  hasChunks,
  getStableText,
  isHtmlNode
} from '@incremark/shared'
import IncremarkMath from './IncremarkMath.vue'
import IncremarkHtmlElement from './IncremarkHtmlElement.vue'
import { useDefinationsContext } from '../composables/useDefinationsContext'

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

/**
 * 类型守卫：检查是否是 imageReference 节点
 */
function isImageReference(node: PhrasingContent): node is ImageReference {
  return node.type === 'imageReference'
}

/**
 * 类型守卫：检查是否是 linkReference 节点
 */
function isLinkReference(node: PhrasingContent): node is LinkReference {
  return node.type === 'linkReference'
}

const props = defineProps<{
  nodes: PhrasingContent[]
}>()

const {
  definations,
  footnoteDefinitions
} = useDefinationsContext()

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
      class="incremark-link"
      :href="node.url"
      target="_blank"
      rel="noopener noreferrer"
    >
      <IncremarkInline :nodes="(node.children as PhrasingContent[])" />
    </a>

    <!-- 图片 -->
    <img
      v-else-if="node.type === 'image'"
      class="incremark-image"
      :src="node.url"
      :alt="node.alt || ''"
      :title="(node as any).title || undefined"
      loading="lazy"
    />

    <!-- 引用式图片（imageReference） -->
    <template v-else-if="isImageReference(node)">
      <img
        v-if="definations[node.identifier]"
        class="incremark-image incremark-reference-image"
        :src="definations[node.identifier].url"
        :alt="(node as ImageReference).alt || ''"
        :title="definations[node.identifier].title || undefined"
        loading="lazy"
      />
      <!-- 如果没有找到定义，渲染为原始文本（降级处理） -->
      <span v-else class="incremark-image-ref-missing">
        ![{{ (node as ImageReference).alt }}][{{ (node as ImageReference).identifier || (node as ImageReference).label }}]
      </span>
    </template>

    <!-- 引用式链接（linkReference） -->
    <template v-else-if="isLinkReference(node)">
      <a
        v-if="definations[node.identifier]"
        class="incremark-link incremark-reference-link"
        :href="definations[node.identifier].url"
        :title="definations[node.identifier].title || undefined"
        target="_blank"
        rel="noopener noreferrer"
      >
        <IncremarkInline :nodes="((node as LinkReference).children as PhrasingContent[])" />
      </a>
      <!-- 如果没有找到定义，渲染为原始文本（降级处理） -->
      <span v-else class="incremark-link-ref-missing">
        [{{ ((node as LinkReference).children as any[]).map((c: any) => c.value).join('') }}][{{ (node as LinkReference).identifier || (node as LinkReference).label }}]
      </span>
    </template>

    <!-- 脚注引用（footnoteReference） -->
    <sup v-else-if="node.type === 'footnoteReference'" class="incremark-footnote-ref">
      <a :href="`#fn-${(node as any).identifier}`" :id="`fnref-${(node as any).identifier}`">
        [{{ (node as any).identifier }}]
      </a>
    </sup>

    <!-- 换行 -->
    <br v-else-if="node.type === 'break'" />

    <!-- 删除线 -->
    <del v-else-if="node.type === 'delete'">
      <IncremarkInline :nodes="(node.children as PhrasingContent[])" />
    </del>
  </template>
</template>
