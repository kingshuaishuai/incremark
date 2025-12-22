<script setup lang="ts">
import type { List, ListItem, PhrasingContent } from 'mdast'
import { computed } from 'vue'
import IncremarkInline from './IncremarkInline.vue'

const props = defineProps<{
  node: List
}>()

const tag = computed(() => props.node.ordered ? 'ol' : 'ul')

function getItemContent(item: ListItem): PhrasingContent[] {
  const firstChild = item.children[0]
  if (firstChild?.type === 'paragraph') {
    return firstChild.children as PhrasingContent[]
  }
  return []
}
</script>

<template>
  <component :is="tag" class="incremark-list" :class="{ 'task-list': node.children.some(item => item.checked !== null && item.checked !== undefined) }">
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
          <IncremarkInline :nodes="getItemContent(item)" />
        </span>
      </label>
      <template v-else>
        <IncremarkInline :nodes="getItemContent(item)" />
      </template>
    </li>
  </component>
</template>

