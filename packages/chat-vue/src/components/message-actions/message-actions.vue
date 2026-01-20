<script setup lang="ts">
/**
 * MessageActions - 消息操作容器组件
 * 支持配置方式和 slot 方式
 */

import { computed, useSlots } from 'vue';
import { createImBem } from '@incremark/shared';
import MessageAction from './message-action.vue';
import MessageActionCopy from './message-action-copy.vue';
import MessageActionFeedback from './message-action-feedback.vue';
import MessageActionMore from './message-action-more.vue';
import type { MessageActionsProps, ActionItem, FeedbackValue, MoreActionItem } from './types';

const props = withDefaults(defineProps<MessageActionsProps>(), {
  variant: 'borderless',
  maxVisible: Infinity
});

const emit = defineEmits<{
  action: [item: ActionItem];
  'update:feedbackValue': [value: FeedbackValue];
}>();

const slots = useSlots();
const bem = createImBem('message-actions');

const rootClass = computed(() => [
  bem(),
  bem('', props.variant)
]);

// 是否使用配置方式
const useConfigMode = computed(() => {
  return props.actions && props.actions.length > 0 && !slots.default;
});

// 可见的操作项
const visibleActions = computed(() => {
  if (!props.actions) return [];
  return props.actions.slice(0, props.maxVisible);
});

// 折叠到"更多"的操作项
const moreActions = computed<MoreActionItem[]>(() => {
  if (!props.actions || props.actions.length <= props.maxVisible) return [];
  return props.actions.slice(props.maxVisible).map(item => ({
    key: item.key,
    label: item.label || item.tooltip || item.key,
    icon: item.icon,
    disabled: item.disabled
  }));
});

// 处理操作点击
const handleAction = (item: ActionItem) => {
  if (item.handler) {
    item.handler();
  }
  emit('action', item);
};

// 处理更多菜单选择
const handleMoreSelect = (moreItem: MoreActionItem) => {
  const item = props.actions?.find(a => a.key === moreItem.key);
  if (item) {
    handleAction(item);
  }
};

// 处理反馈变化
const handleFeedbackChange = (value: FeedbackValue) => {
  emit('update:feedbackValue', value);
};
</script>

<template>
  <div :class="rootClass">
    <!-- 配置方式 -->
    <template v-if="useConfigMode">
      <template v-for="item in visibleActions" :key="item.key">
        <!-- 复制类型 -->
        <MessageActionCopy
          v-if="item.type === 'copy' && item.copyText"
          :text="item.copyText"
          :tooltip="item.tooltip"
        />
        <!-- 反馈类型 -->
        <MessageActionFeedback
          v-else-if="item.type === 'feedback'"
          :value="feedbackValue"
          @update:value="handleFeedbackChange"
        />
        <!-- 自定义类型 -->
        <MessageAction
          v-else
          :icon="item.icon"
          :tooltip="item.tooltip"
          :disabled="item.disabled"
          @click="handleAction(item)"
        />
      </template>
      <!-- 更多操作 -->
      <MessageActionMore
        v-if="moreActions.length > 0"
        :items="moreActions"
        @select="handleMoreSelect"
      />
    </template>
    <!-- slot 方式 -->
    <slot v-else />
  </div>
</template>
