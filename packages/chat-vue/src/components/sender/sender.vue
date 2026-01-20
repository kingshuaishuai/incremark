<script setup lang="ts">
/**
 * Sender - 消息发送组件
 *
 * 布局结构：
 * ┌─────────────────────────────────────────────────┐
 * │  slot:header                                    │
 * ├─────────────────────────────────────────────────┤
 * │  ┌─────────────────────────────────────────┐   │
 * │  │  slot:attachments                        │   │
 * │  ├─────────────────────────────────────────┤   │
 * │  │  [输入框]                                │   │
 * │  ├─────────────────────────────────────────┤   │
 * │  │  [prefix]              [suffix]         │   │
 * │  └─────────────────────────────────────────┘   │
 * ├─────────────────────────────────────────────────┤
 * │  slot:footer                                    │
 * └─────────────────────────────────────────────────┘
 */

import { computed, provide, ref, toRef } from 'vue';
import { createImBem } from '@incremark/shared';
import { SenderInput } from '../sender-input';
import SenderSubmitButton from './components/sender-submit-button.vue';
import { useSender } from './composables';
import type { SenderProps, SenderEmits, SenderContext, SenderInputRef, SenderAttachment } from './types';

const props = withDefaults(defineProps<SenderProps>(), {
  placeholder: 'Type something...',
  disabled: false,
  bordered: true,
  loading: false,
  submitType: 'enter',
  clearOnSubmit: true,
});

const emit = defineEmits<SenderEmits>();

const modelValue = defineModel<string>('modelValue', { default: '' });
const attachments = defineModel<SenderAttachment[]>('attachments', { default: () => [] });

const bem = createImBem('sender');

// 输入框引用
const inputRef = ref<SenderInputRef>();

// 使用 composable 管理逻辑
const {
  canSubmit,
  submit,
  cancel,
  focus,
  blur,
  clear,
  addFiles,
  removeAttachment,
} = useSender({
  props,
  emit,
  modelValue,
  attachments,
  inputRef,
});

// 处理输入框提交事件
const handleInputSubmit = () => {
  submit();
};

// 处理发送按钮点击
const handleSubmitClick = () => {
  if (props.loading) {
    cancel();
  } else {
    submit();
  }
};

// 处理粘贴文件
const handlePasteFile = (files: File[]) => {
  addFiles(files);
};

// 文件配置
const fileConfig = computed(() => ({
  accept: props.accept,
  maxFiles: props.maxFiles,
  maxSize: props.maxSize,
}));

// 提供上下文给子组件
provide<SenderContext>('sender', {
  value: modelValue,
  attachments,
  disabled: toRef(props, 'disabled'),
  loading: toRef(props, 'loading'),
  canSubmit,
  submit,
  cancel,
  addFiles,
  removeAttachment,
  fileConfig: fileConfig.value,
});

// 暴露方法
defineExpose({
  focus,
  blur,
  clear,
  submit,
  addFiles,
  removeAttachment,
});
</script>

<template>
  <div :class="bem()">
    <!-- Header 插槽 -->
    <slot name="header" />

    <!-- 主体内容区 -->
    <div
      :class="bem('box', {
        bordered: props.bordered,
        disabled: props.disabled,
      })"
    >
      <!-- 附件区域插槽 -->
      <slot name="attachments" :attachments="attachments" :remove="removeAttachment" />

      <!-- 输入框 -->
      <SenderInput
        ref="inputRef"
        v-model="modelValue"
        :class="bem('input')"
        :placeholder="props.placeholder"
        :disabled="props.disabled || props.loading"
        :max-height="props.maxHeight"
        :submit-type="props.submitType"
        @submit="handleInputSubmit"
        @paste-file="handlePasteFile"
      />

      <!-- 工具栏 -->
      <div :class="bem('toolbar')">
        <!-- 左侧操作区 -->
        <div :class="bem('prefix')">
          <slot name="prefix" />
        </div>

        <!-- 右侧操作区 -->
        <div :class="bem('suffix')">
          <slot name="suffix" />

          <!-- 默认发送按钮 -->
          <SenderSubmitButton
            :disabled="!canSubmit"
            :loading="props.loading"
            @click="handleSubmitClick"
          />
        </div>
      </div>
    </div>

    <!-- Footer 插槽 -->
    <slot name="footer" />
  </div>
</template>
