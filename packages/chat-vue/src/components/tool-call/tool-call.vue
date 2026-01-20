<script setup lang="ts">
/**
 * ToolCall - 工具调用渲染器
 *
 * 支持自定义工具渲染器注册
 * 支持自定义输出渲染器注册
 * 根据工具状态显示不同 UI
 */

import { computed, ref } from 'vue';
import { Icon } from '@iconify/vue';
import { createImBem } from '@incremark/shared';
import { TOOL_CALL_STATES } from '@incremark/chat-core';
import { SvgIcon } from '../svg-icon';
import type { ToolCallProps, ToolRendererProps, OutputRendererProps, StateLabels, StateCategories } from './types';

const props = withDefaults(defineProps<ToolCallProps>(), {
  showArgs: true,
  showOutput: true,
  defaultExpanded: true
});

const expanded = ref(props.defaultExpanded);

function toggle() {
  expanded.value = !expanded.value;
}

const bem = createImBem('tool-call');

// 默认状态分类
const defaultStateCategories: StateCategories = {
  loading: [TOOL_CALL_STATES.INPUT_STREAMING, TOOL_CALL_STATES.EXECUTING],
  complete: [TOOL_CALL_STATES.OUTPUT_AVAILABLE],
  error: [TOOL_CALL_STATES.OUTPUT_ERROR],
  denied: [TOOL_CALL_STATES.OUTPUT_DENIED],
  approval: [TOOL_CALL_STATES.APPROVAL_REQUESTED]
};

// 合并状态分类
const mergedCategories = computed(() => ({
  loading: [...(defaultStateCategories.loading || []), ...(props.stateCategories?.loading || [])],
  complete: [...(defaultStateCategories.complete || []), ...(props.stateCategories?.complete || [])],
  error: [...(defaultStateCategories.error || []), ...(props.stateCategories?.error || [])],
  denied: [...(defaultStateCategories.denied || []), ...(props.stateCategories?.denied || [])],
  approval: [...(defaultStateCategories.approval || []), ...(props.stateCategories?.approval || [])]
}));

// 获取对应的工具渲染器
const toolRenderer = computed(() => {
  if (props.tools?.[props.part.toolName]) {
    return props.tools[props.part.toolName];
  }
  return props.defaultRenderer;
});

// 获取对应的输出渲染器
const outputRenderer = computed(() => {
  return props.outputRenderers?.[props.part.toolName];
});

// 传递给渲染器的 props
const rendererProps = computed<ToolRendererProps>(() => ({
  toolCallId: props.part.toolCallId,
  toolName: props.part.toolName,
  args: props.part.args,
  state: props.part.state,
  output: props.part.output,
  error: props.part.error
}));

// 传递给输出渲染器的 props
const outputRendererProps = computed<OutputRendererProps>(() => ({
  toolName: props.part.toolName,
  output: props.part.output
}));

// 状态判断 - 基于 stateCategories
const isLoading = computed(() => mergedCategories.value.loading.includes(props.part.state));
const isComplete = computed(() => mergedCategories.value.complete.includes(props.part.state));
const isError = computed(() => mergedCategories.value.error.includes(props.part.state));
const isDenied = computed(() => mergedCategories.value.denied.includes(props.part.state));
const isAwaitingApproval = computed(() => mergedCategories.value.approval.includes(props.part.state));

// 格式化参数显示
const formattedArgs = computed(() => {
  try {
    return JSON.stringify(props.part.args, null, 2);
  } catch {
    return String(props.part.args);
  }
});

// 格式化结果显示
const formattedOutput = computed(() => {
  if (props.part.output === undefined) return '';
  try {
    return JSON.stringify(props.part.output, null, 2);
  } catch {
    return String(props.part.output);
  }
});

// 默认状态标签
const defaultStateLabels: StateLabels = {
  [TOOL_CALL_STATES.INPUT_STREAMING]: 'Streaming...',
  [TOOL_CALL_STATES.INPUT_AVAILABLE]: 'Ready',
  [TOOL_CALL_STATES.APPROVAL_REQUESTED]: 'Awaiting Approval',
  [TOOL_CALL_STATES.APPROVAL_RESPONDED]: 'Approved',
  [TOOL_CALL_STATES.EXECUTING]: 'Executing...',
  [TOOL_CALL_STATES.OUTPUT_AVAILABLE]: 'Completed',
  [TOOL_CALL_STATES.OUTPUT_ERROR]: 'Error',
  [TOOL_CALL_STATES.OUTPUT_DENIED]: 'Denied'
};

// 合并状态标签
const stateLabel = computed(() => {
  const labels = { ...defaultStateLabels, ...props.stateLabels };
  return labels[props.part.state] || props.part.state;
});
</script>

<template>
  <div
    :class="[
      bem(),
      bem('', props.part.state),
      { [bem('', 'loading')]: isLoading }
    ]"
    :data-tool-name="part.toolName"
    :data-tool-state="part.state"
  >
    <!-- 自定义渲染器 -->
    <component
      v-if="toolRenderer"
      :is="toolRenderer"
      v-bind="rendererProps"
    />

    <!-- 默认渲染器 -->
    <template v-else>
      <!-- 头部：工具名称 + 状态 -->
      <div :class="bem('header')" @click="toggle">
        <div :class="bem('header-left')">
          <SvgIcon :class="bem('chevron', { expanded })">
            <Icon icon="ph:caret-right" />
          </SvgIcon>
          <span :class="bem('name')">{{ part.toolName }}</span>
        </div>
        <span :class="[bem('state'), bem('state', part.state)]">
          {{ stateLabel }}
        </span>
      </div>

      <template v-if="expanded">
        <!-- 参数 -->
        <div v-if="showArgs && Object.keys(part.args).length > 0" :class="bem('args')">
          <pre>{{ formattedArgs }}</pre>
        </div>

        <!-- 结果：优先使用自定义输出渲染器 -->
        <div v-if="showOutput && isComplete && part.output !== undefined" :class="bem('output')">
          <component
            v-if="outputRenderer"
            :is="outputRenderer"
            v-bind="outputRendererProps"
          />
          <pre v-else>{{ formattedOutput }}</pre>
        </div>

        <!-- 错误 -->
        <div v-if="isError && part.error" :class="bem('error')">
          {{ part.error }}
        </div>

        <!-- 拒绝 -->
        <div v-if="isDenied" :class="bem('denied')">
          用户已拒绝执行此操作
        </div>

        <!-- 等待审批 -->
        <div v-if="isAwaitingApproval" :class="bem('approval')">
          <slot name="approval">
            <span>此操作需要您的确认</span>
          </slot>
        </div>
      </template>
    </template>
  </div>
</template>
