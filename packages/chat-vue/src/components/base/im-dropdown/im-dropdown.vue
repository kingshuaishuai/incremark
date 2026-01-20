<script setup lang="ts">
/**
 * ImDropdown - 下拉菜单组件
 * 基于 ImPopover 实现，click 触发
 */

import { ref } from 'vue';
import { createImBem } from '@incremark/shared';
import { ImPopover } from '../im-popover';
import { SvgIcon } from '../../svg-icon';
import type { ImDropdownProps, DropdownItem } from './types';

const props = withDefaults(defineProps<ImDropdownProps>(), {
  placement: 'bottom-start',
  offset: 4,
  disabled: false,
  to: 'body',
  teleportDisabled: false
});

const emit = defineEmits<{
  select: [item: DropdownItem];
}>();

const bem = createImBem('dropdown');
const visible = ref(false);

const handleSelect = (item: DropdownItem) => {
  if (item.disabled || item.divider) return;
  emit('select', item);
  visible.value = false;
};
</script>

<template>
  <ImPopover
    v-model:visible="visible"
    trigger="click"
    :placement="placement"
    :offset="offset"
    :disabled="disabled"
    :to="to"
    :teleport-disabled="teleportDisabled"
  >
    <slot />
    <template #content>
      <div :class="bem('menu')">
        <template v-for="item in items" :key="item.key">
          <div v-if="item.divider" :class="bem('divider')" />
          <div
            v-else
            :class="[bem('item'), { [bem('item', 'disabled')]: item.disabled }]"
            @click="handleSelect(item)"
          >
            <span v-if="item.icon" :class="bem('icon')">
              <SvgIcon>
                <component :is="item.icon" />
              </SvgIcon>
            </span>
            <span :class="bem('label')">{{ item.label }}</span>
          </div>
        </template>
      </div>
    </template>
  </ImPopover>
</template>
