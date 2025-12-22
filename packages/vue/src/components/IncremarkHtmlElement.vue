<script setup lang="ts">
import type { RootContent, PhrasingContent } from 'mdast'
import IncremarkInline from './IncremarkInline.vue'

/**
 * HtmlElementNode 类型定义（与 @incremark/core 中的定义一致）
 */
interface HtmlElementNode {
  type: 'htmlElement'
  tagName: string
  attrs: Record<string, string>
  children: RootContent[]
  data?: {
    rawHtml?: string
    parsed?: boolean
    originalType?: string
  }
}

defineProps<{
  node: HtmlElementNode
}>()

/**
 * 判断是否是行内元素
 */
function isInlineElement(tagName: string): boolean {
  const inlineElements = [
    'a', 'abbr', 'acronym', 'b', 'bdo', 'big', 'br', 'button', 'cite', 
    'code', 'dfn', 'em', 'i', 'img', 'input', 'kbd', 'label', 'map', 
    'object', 'output', 'q', 'samp', 'script', 'select', 'small', 
    'span', 'strong', 'sub', 'sup', 'textarea', 'time', 'tt', 'var'
  ]
  return inlineElements.includes(tagName.toLowerCase())
}

/**
 * 判断是否是自闭合元素
 */
function isVoidElement(tagName: string): boolean {
  const voidElements = [
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 
    'link', 'meta', 'param', 'source', 'track', 'wbr'
  ]
  return voidElements.includes(tagName.toLowerCase())
}

/**
 * 判断子节点是否都是行内内容
 */
function hasOnlyInlineChildren(children: RootContent[]): boolean {
  if (!children || children.length === 0) return true
  
  return children.every(child => {
    const type = child.type
    // 常见的行内类型
    const inlineTypes = ['text', 'strong', 'emphasis', 'inlineCode', 'link', 'image', 'break', 'html', 'htmlElement']
    if (inlineTypes.includes(type)) {
      // 如果是 htmlElement，检查是否是行内元素
      if (type === 'htmlElement') {
        return isInlineElement((child as unknown as HtmlElementNode).tagName)
      }
      return true
    }
    return false
  })
}

/**
 * 将属性对象转换为 HTML 属性字符串（用于 v-bind）
 */
function getAttrs(attrs: Record<string, string>): Record<string, string> {
  // 过滤掉可能有问题的属性
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(attrs)) {
    // 跳过事件属性（已在解析时过滤，这里双重保险）
    if (key.startsWith('on')) continue
    result[key] = value
  }
  return result
}
</script>

<template>
  <component 
    :is="node.tagName" 
    v-bind="getAttrs(node.attrs)"
    :class="['incremark-html-element', `incremark-${node.tagName}`]"
  >
    <!-- 自闭合元素没有子节点 -->
    <template v-if="!isVoidElement(node.tagName)">
      <!-- 如果子节点都是行内内容，使用 IncremarkInline -->
      <template v-if="hasOnlyInlineChildren(node.children)">
        <IncremarkInline :nodes="(node.children as PhrasingContent[])" />
      </template>
      
      <!-- 否则递归渲染每个子节点 -->
      <template v-else>
        <template v-for="(child, idx) in node.children" :key="idx">
          <!-- 如果子节点是 htmlElement，递归 -->
          <IncremarkHtmlElement 
            v-if="child.type === 'htmlElement'" 
            :node="(child as unknown as HtmlElementNode)" 
          />
          <!-- 如果是文本节点 -->
          <template v-else-if="child.type === 'text'">
            {{ (child as any).value }}
          </template>
          <!-- 其他类型尝试用 IncremarkInline -->
          <IncremarkInline 
            v-else-if="['strong', 'emphasis', 'inlineCode', 'link', 'image', 'break'].includes(child.type)"
            :nodes="[child as PhrasingContent]" 
          />
          <!-- 段落等块级元素 -->
          <template v-else-if="child.type === 'paragraph'">
            <p><IncremarkInline :nodes="((child as any).children as PhrasingContent[])" /></p>
          </template>
          <!-- 其他未知类型，显示原始 -->
          <template v-else>
            <div class="incremark-unknown-child">{{ child.type }}</div>
          </template>
        </template>
      </template>
    </template>
  </component>
</template>

<style scoped>
.incremark-html-element {
  /* 保持原有样式 */
}

.incremark-unknown-child {
  color: #999;
  font-style: italic;
}
</style>

