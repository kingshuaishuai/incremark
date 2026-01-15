<script setup lang="ts">
import type { Blockquote } from 'mdast'
import type { Component } from 'vue'
import IncremarkRenderer from './IncremarkRenderer.vue'
import type { CodeBlockConfig } from './Incremark.vue'

defineProps<{
  node: Blockquote
  customContainers?: Record<string, Component>
  customCodeBlocks?: Record<string, Component>
  codeBlockConfigs?: Record<string, CodeBlockConfig>
  blockStatus?: 'pending' | 'stable' | 'completed'
  components?: Partial<Record<string, Component>>
}>()
</script>

<template>
  <blockquote class="incremark-blockquote">
    <IncremarkRenderer
      v-for="(child, index) in node.children"
      :key="index"
      :node="child"
      :custom-containers="customContainers"
      :custom-code-blocks="customCodeBlocks"
      :code-block-configs="codeBlockConfigs"
      :block-status="blockStatus"
      :components="components"
    />
  </blockquote>
</template>

