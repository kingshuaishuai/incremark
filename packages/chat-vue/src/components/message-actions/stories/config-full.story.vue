<script setup lang="ts">
import { h, ref } from 'vue';
import { Icon } from '@iconify/vue';
import { MessageActions } from '..';
import type { FeedbackValue, ActionItem } from '..';

const feedback = ref<FeedbackValue>('default');
const actions: ActionItem[] = [
  {
    key: 'copy',
    type: 'copy',
    copyText: '这是要复制的消息内容',
    tooltip: '复制'
  },
  {
    key: 'regenerate',
    icon: h(Icon, { icon: 'ph:arrows-clockwise' }),
    tooltip: '重新生成',
    label: '重新生成',
    handler: () => alert('重新生成')
  },
  {
    key: 'feedback',
    type: 'feedback'
  },
  {
    key: 'edit',
    icon: h(Icon, { icon: 'ph:pencil-simple' }),
    tooltip: '编辑',
    label: '编辑',
    handler: () => alert('编辑')
  },
  {
    key: 'share',
    icon: h(Icon, { icon: 'ph:share' }),
    tooltip: '分享',
    label: '分享',
    handler: () => alert('分享')
  },
  {
    key: 'delete',
    icon: h(Icon, { icon: 'ph:trash' }),
    tooltip: '删除',
    label: '删除',
    handler: () => alert('删除')
  }
];
const handleAction = (item: ActionItem) => {
  console.log('Action triggered:', item.key);
};
</script>

<template>
  <div>
    <p style="margin-bottom: 12px; color: #666;">配置方式：6 个操作，maxVisible=4</p>
    <MessageActions
      variant="filled"
      :actions="actions"
      :max-visible="4"
      v-model:feedback-value="feedback"
      @action="handleAction"
    />
    <p style="margin-top: 8px; color: #666;">反馈状态: {{ feedback }}</p>
  </div>
</template>
