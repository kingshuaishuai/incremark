<script setup lang="ts">
import { computed, type Component } from 'vue'
import type { ParsedBlock } from '@incremark/core'
import IncremarkHeading from './IncremarkHeading.vue'
import IncremarkParagraph from './IncremarkParagraph.vue'
import IncremarkCode from './IncremarkCode.vue'
import IncremarkList from './IncremarkList.vue'
import IncremarkTable from './IncremarkTable.vue'
import IncremarkBlockquote from './IncremarkBlockquote.vue'
import IncremarkThematicBreak from './IncremarkThematicBreak.vue'
import IncremarkMath from './IncremarkMath.vue'
import IncremarkDefault from './IncremarkDefault.vue'

// 组件映射类型
export type ComponentMap = Partial<Record<string, Component>>

// 带稳定 ID 的块类型
export interface BlockWithStableId extends ParsedBlock {
  stableId: string
}

const props = withDefaults(
  defineProps<{
    /** 要渲染的块列表（来自 useIncremark 的 blocks） */
    blocks: BlockWithStableId[]
    /** 自定义组件映射，key 为节点类型 */
    components?: ComponentMap
    /** 待处理块的样式类名 */
    pendingClass?: string
    /** 已完成块的样式类名 */
    completedClass?: string
    /** 是否显示块状态边框 */
    showBlockStatus?: boolean
  }>(),
  {
    components: () => ({}),
    pendingClass: 'incremark-pending',
    completedClass: 'incremark-completed',
    showBlockStatus: false
  }
)

// 默认组件映射
const defaultComponents: Record<string, Component> = {
  heading: IncremarkHeading,
  paragraph: IncremarkParagraph,
  code: IncremarkCode,
  list: IncremarkList,
  table: IncremarkTable,
  blockquote: IncremarkBlockquote,
  thematicBreak: IncremarkThematicBreak,
  math: IncremarkMath,
  inlineMath: IncremarkMath
}

// 合并用户组件和默认组件
const mergedComponents = computed(() => ({
  ...defaultComponents,
  ...props.components
}))

function getComponent(type: string): Component {
  return mergedComponents.value[type] || props.components?.default || IncremarkDefault
}
</script>

<template>
  <div class="incremark">
    <TransitionGroup name="incremark-fade">
      <div
        v-for="block in blocks"
        :key="block.stableId"
        :class="[
          'incremark-block',
          block.status === 'completed' ? completedClass : pendingClass,
          { 'incremark-show-status': showBlockStatus }
        ]"
      >
        <component :is="getComponent(block.node.type)" :node="block.node" />
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.incremark-block.incremark-show-status.incremark-pending {
  border-left: 3px solid #a855f7;
  padding-left: 12px;
  opacity: 0.8;
}

.incremark-fade-enter-active {
  transition: opacity 0.2s ease-out;
}

.incremark-fade-enter-from {
  opacity: 0;
}
</style>
