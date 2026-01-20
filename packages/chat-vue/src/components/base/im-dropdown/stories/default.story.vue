<script setup lang="ts">
import { ImDropdown, type DropdownItem } from '..';
import { ImButton } from '../../im-button';

const basicItems: DropdownItem[] = [
  { key: 'copy', label: '复制' },
  { key: 'edit', label: '编辑' },
  { key: 'delete', label: '删除' }
];

const handleSelect = (item: DropdownItem) => {
  console.log('Selected:', item);
};
</script>

<template>
  <div style="padding: 100px;">
    <ImDropdown :items="basicItems" placement="bottom-start" @select="handleSelect">
      <ImButton>打开菜单</ImButton>
    </ImDropdown>
  </div>
</template>
