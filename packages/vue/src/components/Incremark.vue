<script setup lang="ts">
import { computed, type Component } from 'vue'
import type { ParsedBlock, RootContent } from '@incremark/core'
import type { HTML } from 'mdast'
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
import IncremarkFootnotes from './IncremarkFootnotes.vue'

// 组件映射类型
export type ComponentMap = Partial<Record<string, Component>>

/**
 * 检查是否是 html 节点
 */
function isHtmlNode(node: RootContent): node is HTML {
  return node.type === 'html'
}

// 带稳定 ID 的块类型
export interface BlockWithStableId extends ParsedBlock {
  stableId: string
  isLastPending?: boolean // 是否是最后一个 pending 块
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
    /** 是否已完成（用于决定是否显示脚注） */
    isFinalized?: boolean
    /** 脚注引用的出现顺序（用于渲染脚注列表） */
    footnoteReferenceOrder?: string[]
  }>(),
  {
    components: () => ({}),
    pendingClass: 'incremark-pending',
    completedClass: 'incremark-completed',
    showBlockStatus: false,
    isFinalized: false,
    footnoteReferenceOrder: () => []
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
  inlineMath: IncremarkMath,
  htmlElement: IncremarkHtmlElement
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
    <!-- 主要内容块 -->
    <template v-for="block in blocks">
      <div
        v-if="block.node.type !== 'definition' && block.node.type !== 'footnoteDefinition'"
        :key="block.stableId"
        :class="[
          'incremark-block',
          block.status === 'completed' ? completedClass : pendingClass,
          { 'incremark-show-status': showBlockStatus },
          { 'incremark-last-pending': block.isLastPending }
        ]"
      >
        <!-- HTML 节点：渲染为代码块显示源代码 -->
        <pre v-if="isHtmlNode(block.node)" class="incremark-html-code"><code>{{ (block.node as HTML).value }}</code></pre>
        <!-- 其他节点：使用对应组件 -->
        <component v-else :is="getComponent(block.node.type)" :node="block.node" />
      </div>
    </template>

    <!-- 脚注列表（仅在 finalize 后显示） -->
    <IncremarkFootnotes 
      v-if="isFinalized && footnoteReferenceOrder.length > 0"
      :footnote-reference-order="footnoteReferenceOrder"
    />
  </div>
</template>
