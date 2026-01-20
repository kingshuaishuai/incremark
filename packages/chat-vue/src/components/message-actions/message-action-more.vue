<script setup lang="ts">
/**
 * MessageActionMore - 更多操作按钮（带 dropdown）
 */

import { h } from 'vue';
import { Icon } from '@iconify/vue';
import { createImBem } from '@incremark/shared';
import { useUIAdapter } from '../../composables/useUIAdapter';
import { ImDropdown } from '../base/im-dropdown';
import { ActionButton } from '../base/action-button';
import { SvgIcon } from '../svg-icon';
import type { MessageActionMoreProps, MoreActionItem } from './types';
import type { DropdownItem } from '../base/im-dropdown';

const props = withDefaults(defineProps<MessageActionMoreProps>(), {
  tooltip: '更多'
});

const emit = defineEmits<{
  select: [item: MoreActionItem];
}>();

const bem = createImBem('message-action-more');
const { Tooltip } = useUIAdapter();

// 默认图标
const defaultMoreIcon = h(Icon, { icon: 'ph:dots-three' });

// 转换为 dropdown items
const dropdownItems = computed<DropdownItem[]>(() => {
  return props.items.map<DropdownItem>(item => ({
    key: item.key,
    label: item.label,
    icon: item.icon,
    disabled: item.disabled,
    divider: item.divider
  }));
});

const handleSelect = (dropdownItem: DropdownItem) => {
  const item = props.items.find(i => i.key === dropdownItem.key);
  if (item) {
    emit('select', item);
  }
};
</script>

<script lang="ts">
import { computed } from 'vue';
</script>

<template>
  <ImDropdown
    :items="dropdownItems"
    placement="bottom-end"
    @select="handleSelect"
  >
    <component :is="Tooltip" :content="tooltip">
      <ActionButton
        :class="bem()"
        intent="action"
        size="sm"
        square
        :aria-label="tooltip"
      >
        <SvgIcon :class="bem('icon')">
          <component :is="defaultMoreIcon" />
        </SvgIcon>
      </ActionButton>
    </component>
  </ImDropdown>
</template>
