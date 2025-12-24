<script setup lang="ts">
import type { RootContent } from 'mdast'
import type { Component } from 'vue'
import IncremarkRenderer from './IncremarkRenderer.vue'

/**
 * 容器节点类型定义
 * 根据 directive 解析后的结构
 */
export interface ContainerNode {
  type: 'containerDirective' | 'leafDirective' | 'textDirective'
  name: string
  attributes?: Record<string, string>
  children?: RootContent[]
}

const props = defineProps<{
  node: ContainerNode
  customContainers?: Record<string, Component>
}>()

/**
 * 解析 attributes 字符串为对象
 * directive 的 attributes 可能是字符串格式，需要解析
 */
function parseOptions(attributes?: Record<string, string>): Record<string, any> {
  if (!attributes) return {}
  
  const options: Record<string, any> = {}
  for (const [key, value] of Object.entries(attributes)) {
    // 尝试解析 JSON 值
    try {
      options[key] = JSON.parse(value)
    } catch {
      // 如果不是 JSON，直接使用字符串值
      options[key] = value
    }
  }
  return options
}

const containerName = props.node.name
const options = parseOptions(props.node.attributes)
const CustomContainer = props.customContainers?.[containerName]

// 如果没有自定义容器组件，使用默认渲染
const hasCustomContainer = !!CustomContainer
</script>

<template>
  <!-- 如果有自定义容器组件，使用自定义组件 -->
  <component
    v-if="hasCustomContainer"
    :is="CustomContainer"
    :name="containerName"
    :options="options"
  >
    <!-- 将容器内容作为默认 slot 传递 -->
    <template v-if="node.children && node.children.length > 0">
      <template v-for="(child, index) in node.children" :key="index">
        <IncremarkRenderer :node="child" />
      </template>
    </template>
  </component>
  
  <!-- 如果没有自定义容器组件，使用默认渲染 -->
  <div v-else :class="['incremark-container', `incremark-container-${containerName}`]">
    <div v-if="node.children && node.children.length > 0" class="incremark-container-content">
      <template v-for="(child, index) in node.children" :key="index">
        <IncremarkRenderer :node="child" />
      </template>
    </div>
  </div>
</template>

