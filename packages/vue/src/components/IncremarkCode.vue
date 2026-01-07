<script setup lang="ts">
import type { Code } from 'mdast'
import type { Component } from 'vue'
import { computed } from 'vue'

import type { CodeBlockConfig } from './Incremark.vue'
import IncremarkCodeMermaid from './IncremarkCodeMermaid.vue'
import IncremarkCodeDefault from './IncremarkCodeDefault.vue'

interface Props {
  node: Code
  /** Shiki 主题，默认 github-dark */
  theme?: string
  /** 默认回退主题（当指定主题加载失败时使用），默认 github-dark */
  fallbackTheme?: string
  /** 是否禁用代码高亮 */
  disableHighlight?: boolean
  /** Mermaid 渲染延迟（毫秒），用于流式输入时防抖 */
  mermaidDelay?: number
  /** 自定义代码块组件映射，key 为代码语言名称 */
  customCodeBlocks?: Record<string, Component>
  /** 代码块配置映射，key 为代码语言名称 */
  codeBlockConfigs?: Record<string, CodeBlockConfig>
  /** 块状态，用于判断是否使用自定义组件 */
  blockStatus?: 'pending' | 'stable' | 'completed'
  /** 默认代码块渲染组件（当不是 mermaid 且没有自定义组件时使用） */
  defaultCodeComponent?: Component
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'github-dark',
  fallbackTheme: 'github-dark',
  disableHighlight: false,
  mermaidDelay: 500,
  customCodeBlocks: () => ({}),
  codeBlockConfigs: () => ({}),
  blockStatus: 'completed',
  defaultCodeComponent: () => IncremarkCodeDefault
})

const language = computed(() => props.node.lang || 'text')

// 检查是否有自定义代码块组件
const CustomCodeBlock = computed(() => {
  const component = props.customCodeBlocks?.[language.value]
  if (!component) return null

  // 检查该语言的配置
  const config = props.codeBlockConfigs?.[language.value]

  // 如果配置了 takeOver 为 true，则从一开始就使用
  if (config?.takeOver) {
    return component
  }

  // 否则，默认行为：只在 completed 状态使用
  if (props.blockStatus !== 'completed') {
    return null
  }

  return component
})

// 判断是否为 mermaid
const isMermaid = computed(() => language.value === 'mermaid')
</script>

<template>
  <!-- 自定义代码块组件 -->
  <component
    v-if="CustomCodeBlock"
    :is="CustomCodeBlock"
    :code-str="node.value"
    :lang="language"
    :completed="blockStatus === 'completed'"
    :takeOver="codeBlockConfigs?.[language]?.takeOver"
  />

  <!-- Mermaid 图表 -->
  <IncremarkCodeMermaid
    v-else-if="isMermaid"
    :node="node"
    :mermaid-delay="mermaidDelay"
  />

  <!-- 默认代码块渲染（支持用户自定义） -->
  <component
    v-else
    :is="defaultCodeComponent"
    :node="node"
    :theme="theme"
    :fallback-theme="fallbackTheme"
    :disable-highlight="disableHighlight"
  />
</template>
