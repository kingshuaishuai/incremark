<script setup lang="ts">
/**
 * SenderFileButton - 文件选择按钮
 */

import { inject, ref } from 'vue';
import { Icon } from '@iconify/vue';
import { SvgIcon } from '../../svg-icon';
import SenderActionButton from './sender-action-button.vue';
import type { SenderContext } from '../types';

const props = defineProps<{
  /** 接受的文件类型，覆盖 Sender 的 accept */
  accept?: string;
  /** 是否允许多选 */
  multiple?: boolean;
  /** 无障碍标签 */
  ariaLabel?: string;
}>();

const sender = inject<SenderContext>('sender');

const inputRef = ref<HTMLInputElement>();

const handleClick = () => {
  inputRef.value?.click();
};

const handleChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const files = Array.from(input.files || []);
  if (files.length > 0) {
    sender?.addFiles(files);
  }
  // 清空 input，允许重复选择同一文件
  input.value = '';
};

const acceptValue = props.accept ?? sender?.fileConfig.accept;
</script>

<template>
  <SenderActionButton
    square
    :aria-label="ariaLabel || '添加文件'"
    :disabled="sender?.disabled.value"
    @click="handleClick"
  >
    <template #icon>
      <SvgIcon>
        <Icon icon="mdi:attachment" />
      </SvgIcon>
    </template>
  </SenderActionButton>

  <input
    ref="inputRef"
    type="file"
    :accept="acceptValue"
    :multiple="multiple !== false"
    style="display: none"
    @change="handleChange"
  />
</template>
