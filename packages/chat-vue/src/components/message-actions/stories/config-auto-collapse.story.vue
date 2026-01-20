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
    copyText: '消息内容',
    tooltip: '复制'
  },
  {
    key: 'feedback',
    type: 'feedback'
  },
  {
    key: 'regenerate',
    icon: h(Icon, { icon: 'ph:arrows-clockwise' }),
    tooltip: '重新生成',
    label: '重新生成',
    handler: () => alert('重新生成')
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
  }
];
</script>

<template>
  <div>
    <p style="margin-bottom: 12px; color: #666;">maxVisible=3，超出部分自动折叠到"更多"</p>
    <MessageActions
      :actions="actions"
      :max-visible="3"
      v-model:feedback-value="feedback"
    />
  </div>
</template>
