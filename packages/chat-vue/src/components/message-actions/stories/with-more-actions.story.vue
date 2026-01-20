<script setup lang="ts">
import { h, ref } from 'vue';
import { Icon } from '@iconify/vue';
import { MessageActions } from '..';
import { MessageActionCopy } from '..';
import { MessageActionFeedback } from '..';
import { MessageActionMore } from '..';
import type { FeedbackValue, MoreActionItem } from '..';

const feedback = ref<FeedbackValue>('default');
const moreItems: MoreActionItem[] = [
  {
    key: 'regenerate',
    label: '重新生成',
    icon: h(Icon, { icon: 'ph:arrows-clockwise' })
  },
  {
    key: 'edit',
    label: '编辑消息',
    icon: h(Icon, { icon: 'ph:pencil-simple' })
  },
  {
    key: 'divider1',
    label: '',
    divider: true
  },
  {
    key: 'share',
    label: '分享',
    icon: h(Icon, { icon: 'ph:share' })
  },
  {
    key: 'delete',
    label: '删除',
    icon: h(Icon, { icon: 'ph:trash' })
  }
];
const handleSelect = (item: MoreActionItem) => {
  alert(`选择了: ${item.label}`);
};
</script>

<template>
  <MessageActions>
    <MessageActionCopy text="Hello, World!" />
    <MessageActionFeedback v-model:value="feedback" />
    <MessageActionMore :items="moreItems" @select="handleSelect" />
  </MessageActions>
</template>
