<script setup lang="ts">
import { computed, type Component } from 'vue'
import type { ParsedBlock } from '@incremark/core'
import { useDefinationsContext } from '../composables/useDefinationsContext'
import type { UseIncremarkReturn } from '../composables/useIncremark'
import IncremarkRenderer from './IncremarkRenderer.vue'
import IncremarkFootnotes from './IncremarkFootnotes.vue'

// 组件映射类型
export type ComponentMap = Partial<Record<string, Component>>

// 可渲染的块类型（带 isLastPending 字段用于打字机光标）
export type RenderableBlock = ParsedBlock & { isLastPending?: boolean }

/**
 * 代码块配置
 */
export interface CodeBlockConfig {
  /** 是否从一开始就接管渲染，而不是等到 completed 状态 */
  takeOver?: boolean
}

const props = withDefaults(
  defineProps<{
    /** 要渲染的块列表（来自 useIncremark 的 blocks） */
    blocks?: RenderableBlock[]
    /** 内容是否完全显示完成（用于控制脚注等需要在内容完全显示后才出现的元素）
     * 如果传入了 incremark，则会自动使用 incremark.isDisplayComplete，此 prop 被忽略 */
    isDisplayComplete?: boolean
    /** 自定义组件映射，key 为节点类型 */
    components?: ComponentMap
    /** 自定义容器组件映射，key 为容器名称（如 'warning', 'info'） */
    customContainers?: Record<string, Component>
    /** 自定义代码块组件映射，key 为代码语言名称（如 'echart', 'mermaid'） */
    customCodeBlocks?: Record<string, Component>
    /** 代码块配置映射，key 为代码语言名称 */
    codeBlockConfigs?: Record<string, CodeBlockConfig>
    /** 待处理块的样式类名 */
    pendingClass?: string
    /** 已完成块的样式类名 */
    completedClass?: string
    /** 是否显示块状态边框 */
    showBlockStatus?: boolean
    /** 可选：useIncremark 返回的对象（用于自动注入数据） */
    incremark?: UseIncremarkReturn
  }>(),
  {
    blocks: () => [],
    isDisplayComplete: false,
    components: () => ({}),
    customContainers: () => ({}),
    customCodeBlocks: () => ({}),
    codeBlockConfigs: () => ({}),
    pendingClass: 'incremark-pending',
    completedClass: 'incremark-completed',
    showBlockStatus: false
  }
)

const {
  footnoteReferenceOrder
} = useDefinationsContext();

// 计算实际使用的 blocks 和 isDisplayComplete
const actualBlocks = computed<RenderableBlock[]>(() => props.incremark?.blocks.value || props.blocks || [])
const actualIsDisplayComplete = computed(() => {
  // 优先使用 incremark 提供的 isDisplayComplete（已考虑打字机等状态）
  if (props.incremark) {
    return props.incremark.isDisplayComplete.value
  }
  // 否则使用用户传入的 isDisplayComplete
  return props.isDisplayComplete
})

</script>

<template>
  <div class="incremark">
    <!-- 主要内容块 -->
    <template v-for="block in actualBlocks">
      <div
        v-if="block.node.type !== 'definition' && block.node.type !== 'footnoteDefinition'"
        :key="block.id"
        :class="[
          'incremark-block',
          block.status === 'completed' ? completedClass : pendingClass,
          { 'incremark-show-status': showBlockStatus },
          { 'incremark-last-pending': block.isLastPending }
        ]"
      >
        <!-- 使用 IncremarkRenderer 统一处理所有节点类型 -->
        <IncremarkRenderer
          :node="block.node"
          :block-status="block.status"
          :custom-containers="customContainers"
          :custom-code-blocks="customCodeBlocks"
          :code-block-configs="codeBlockConfigs"
          :components="components"
        />
      </div>
    </template>

    <!-- 脚注列表（仅在内容完全显示后显示） -->
    <IncremarkFootnotes
      v-if="actualIsDisplayComplete && footnoteReferenceOrder.length > 0"
    />
  </div>
</template>
