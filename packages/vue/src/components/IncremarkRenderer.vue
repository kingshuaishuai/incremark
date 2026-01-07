<script setup lang="ts">
import type { RootContent, HTML, Code } from 'mdast'
import type { Component } from 'vue'
import { computed } from 'vue'
import IncremarkHeading from './IncremarkHeading.vue'
import IncremarkParagraph from './IncremarkParagraph.vue'
import IncremarkCode from './IncremarkCode.vue'
import IncremarkList from './IncremarkList.vue'
import IncremarkTable from './IncremarkTable.vue'
import IncremarkBlockquote from './IncremarkBlockquote.vue'
import IncremarkThematicBreak from './IncremarkThematicBreak.vue'
import IncremarkMath from './IncremarkMath.vue'
import IncremarkHtmlElement from './IncremarkHtmlElement.vue'
import IncremarkContainer from './IncremarkContainer.vue'
import IncremarkDefault from './IncremarkDefault.vue'
import type { ContainerNode } from './IncremarkContainer.vue'
import type { CodeBlockConfig } from './Incremark.vue'

type ExtendedRootContent = RootContent | ContainerNode

const props = defineProps<{
  node: ExtendedRootContent
  customContainers?: Record<string, Component>
  customCodeBlocks?: Record<string, Component>
  codeBlockConfigs?: Record<string, CodeBlockConfig>
  blockStatus?: 'pending' | 'stable' | 'completed'
  components?: Partial<Record<string, Component>>
}>()

// 默认组件映射
const defaultComponentMap: Record<string, Component> = {
  heading: IncremarkHeading,
  paragraph: IncremarkParagraph,
  code: IncremarkCode,
  list: IncremarkList,
  table: IncremarkTable,
  blockquote: IncremarkBlockquote,
  thematicBreak: IncremarkThematicBreak,
  math: IncremarkMath,
  inlineMath: IncremarkMath,
  htmlElement: IncremarkHtmlElement,
  containerDirective: IncremarkContainer,
  leafDirective: IncremarkContainer,
  textDirective: IncremarkContainer,
}

// 合并用户自定义组件
const componentMap = computed(() => ({
  ...defaultComponentMap,
  ...props.components
}))

function getComponent(type: string): Component {
  return componentMap.value[type] || IncremarkDefault
}

/**
 * 检查是否是容器节点
 */
function isContainerNode(node: ExtendedRootContent): node is ContainerNode {
  return (node as any).type === 'containerDirective' || 
         (node as any).type === 'leafDirective' || 
         (node as any).type === 'textDirective'
}

/**
 * 检查是否是 html 节点
 */
function isHtmlNode(node: ExtendedRootContent): node is HTML {
  return node.type === 'html'
}
</script>

<template>
  <!-- HTML 节点：渲染为代码块显示源代码 -->
  <pre v-if="isHtmlNode(node)" class="incremark-html-code"><code>{{ (node as HTML).value }}</code></pre>
  <!-- 容器节点：使用容器组件，传递 customContainers -->
  <IncremarkContainer
    v-else-if="isContainerNode(node)"
    :node="node as ContainerNode"
    :custom-containers="customContainers"
  />
  <!-- 代码节点：特殊处理，传递 customCodeBlocks、codeBlockConfigs 和 blockStatus -->
  <IncremarkCode
    v-else-if="(node as RootContent).type === 'code'"
    :node="node as Code"
    :custom-code-blocks="customCodeBlocks"
    :code-block-configs="codeBlockConfigs"
    :block-status="blockStatus"
    :default-code-component="components?.['code']"
  />
  <!-- 其他节点：使用对应组件 -->
  <component v-else :is="getComponent((node as RootContent).type)" :node="node as RootContent" />
</template>

