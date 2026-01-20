<script setup lang="ts">
/**
 * MessageActionFeedback - 反馈操作按钮 (点赞/点踩)
 */

import { computed, h } from 'vue';
import { Icon } from '@iconify/vue';
import { createImBem } from '@incremark/shared';
import { useUIAdapter } from '../../composables/useUIAdapter';
import MessageAction from './message-action.vue';
import type { MessageActionFeedbackProps, FeedbackValue } from './types';

const props = withDefaults(defineProps<MessageActionFeedbackProps>(), {
  value: 'default',
  likeTooltip: '有帮助',
  dislikeTooltip: '没帮助'
});

const emit = defineEmits<{
  'update:value': [value: FeedbackValue];
  change: [value: FeedbackValue];
}>();

const bem = createImBem('message-action-feedback');
const { icons } = useUIAdapter();

// 默认图标使用 Phosphor
const defaultThumbUp = h(Icon, { icon: 'ph:thumbs-up' });
const defaultThumbUpFill = h(Icon, { icon: 'ph:thumbs-up-fill' });
const defaultThumbDown = h(Icon, { icon: 'ph:thumbs-down' });
const defaultThumbDownFill = h(Icon, { icon: 'ph:thumbs-down-fill' });

const likeIcon = computed(() => {
  if (props.value === 'like') {
    return icons?.thumbUpFilled || defaultThumbUpFill;
  }
  return icons?.thumbUp || defaultThumbUp;
});

const dislikeIcon = computed(() => {
  if (props.value === 'dislike') {
    return icons?.thumbDownFilled || defaultThumbDownFill;
  }
  return icons?.thumbDown || defaultThumbDown;
});

const handleLike = () => {
  const newValue: FeedbackValue = props.value === 'like' ? 'default' : 'like';
  emit('update:value', newValue);
  emit('change', newValue);
};

const handleDislike = () => {
  const newValue: FeedbackValue = props.value === 'dislike' ? 'default' : 'dislike';
  emit('update:value', newValue);
  emit('change', newValue);
};

const showLike = computed(() => props.value === 'default' || props.value === 'like');
const showDislike = computed(() => props.value === 'default' || props.value === 'dislike');
</script>

<template>
  <span :class="bem()">
    <MessageAction
      v-if="showLike"
      :icon="likeIcon"
      :tooltip="likeTooltip"
      :label="likeTooltip"
      :class="[bem('like'), value === 'like' && bem('like', 'active')]"
      @click="handleLike"
    />
    <MessageAction
      v-if="showDislike"
      :icon="dislikeIcon"
      :tooltip="dislikeTooltip"
      :label="dislikeTooltip"
      :class="[bem('dislike'), value === 'dislike' && bem('dislike', 'active')]"
      @click="handleDislike"
    />
  </span>
</template>
