<script setup lang="ts">
import { ChainOfThought, ChainOfThoughtStep } from '../index';

const args = {
  title: '思考过程'
};
</script>

<template>
  <ChainOfThought v-bind="args">
    <ChainOfThoughtStep label="搜索结果" status="complete" collapsible show-divider>
      <div>找到 15 条相关结果</div>
      <div>- 结果 1: Vue 组件设计模式</div>
      <div>- 结果 2: 响应式数据原理</div>
    </ChainOfThoughtStep>
    <ChainOfThoughtStep label="分析过程" status="complete" collapsible :default-expanded="false">
      <div>这部分默认折叠，点击展开查看详情...</div>
    </ChainOfThoughtStep>
  </ChainOfThought>
</template>
