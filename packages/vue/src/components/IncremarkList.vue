<script setup lang="ts">
import type { List, ListItem, RootContent } from 'mdast'
import type { Component } from 'vue'
import { computed } from 'vue'
import IncremarkInline from './IncremarkInline.vue'
import IncremarkRenderer from './IncremarkRenderer.vue'
import type { CodeBlockConfig } from './Incremark.vue'

// 设置组件名称以支持递归引用
defineOptions({
  name: 'IncremarkList'
})

const props = defineProps<{
  node: List
  customContainers?: Record<string, Component>
  customCodeBlocks?: Record<string, Component>
  codeBlockConfigs?: Record<string, CodeBlockConfig>
  blockStatus?: 'pending' | 'stable' | 'completed'
  components?: Partial<Record<string, Component>>
}>()

const tag = computed(() => props.node.ordered ? 'ol' : 'ul')

/**
 * 获取列表项的内联内容（来自第一个 paragraph）
 */
function getItemInlineContent(item: ListItem) {
  const firstChild = item.children[0]
  if (firstChild?.type === 'paragraph') {
    return firstChild.children
  }
  return []
}

/**
 * 获取列表项的块级子节点（嵌套列表、代码块等）
 * 排除第一个 paragraph，因为它已经被 getItemInlineContent 处理
 */
function getItemBlockChildren(item: ListItem): RootContent[] {
  return item.children.filter((child, index) => {
    // 第一个 paragraph 已经被处理为内联内容
    if (index === 0 && child.type === 'paragraph') {
      return false
    }
    return true
  })
}

/**
 * 检查列表项是否有块级子节点（嵌套列表等）
 */
function hasBlockChildren(item: ListItem): boolean {
  return getItemBlockChildren(item).length > 0
}
</script>

<template>
  <component 
    :is="tag" 
    class="incremark-list" 
    :class="{ 'task-list': node.children.some(item => item.checked !== null && item.checked !== undefined) }"
    :start="node.start || undefined"
>
    <li
      v-for="(item, index) in node.children"
      :key="index"
      class="incremark-list-item"
      :class="{ 'task-item': item.checked !== null && item.checked !== undefined }"
    >
      <label v-if="item.checked !== null && item.checked !== undefined" class="task-label">
        <input
          type="checkbox"
          :checked="item.checked"
          disabled
          class="checkbox"
        />
        <span class="task-content">
          <IncremarkInline :nodes="getItemInlineContent(item)" />
        </span>
      </label>
      <template v-else>
        <IncremarkInline :nodes="getItemInlineContent(item)" />
        <!-- 递归渲染所有块级内容（嵌套列表、heading、blockquote、code、table 等） -->
        <template v-if="hasBlockChildren(item)">
          <template v-for="(child, childIndex) in getItemBlockChildren(item)" :key="childIndex">
            <IncremarkRenderer
              :node="child"
              :custom-containers="customContainers"
              :custom-code-blocks="customCodeBlocks"
              :code-block-configs="codeBlockConfigs"
              :block-status="blockStatus"
              :components="components"
            />
          </template>
        </template>
      </template>
    </li>
  </component>
</template>

