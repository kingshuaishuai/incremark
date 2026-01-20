<script setup lang="ts">
import { h, ref } from 'vue';
import { Icon } from '@iconify/vue';
import { MessageActions, MessageAction, MessageActionCopy, MessageActionFeedback, MessageActionMore, type FeedbackValue, type MoreActionItem } from '..';
import { SvgIcon } from '../../svg-icon';

const feedback = ref<FeedbackValue>('default');
const moreItems: MoreActionItem[] = [
  {
    key: 'edit',
    label: '编辑',
    icon: h(Icon, { icon: 'ph:pencil-simple' })
  },
  {
    key: 'share',
    label: '分享',
    icon: h(Icon, { icon: 'ph:share' })
  },
  {
    key: 'divider',
    label: '',
    divider: true
  },
  {
    key: 'report',
    label: '举报',
    icon: h(Icon, { icon: 'ph:flag' })
  }
];
const handleRefresh = () => alert('重新生成');
const handleSelect = (item: MoreActionItem) => alert(`选择了: ${item.label}`);
</script>

<template>
  <MessageActions variant="filled">
    <MessageActionCopy text="消息内容" />
    <MessageAction tooltip="重新生成" @click="handleRefresh">
      <SvgIcon>
        <Icon icon="ph:arrows-clockwise" />
      </SvgIcon>
    </MessageAction>
    <MessageActionFeedback v-model:value="feedback" />
    <MessageActionMore :items="moreItems" @select="handleSelect" />
  </MessageActions>
</template>
