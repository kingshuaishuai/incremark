<script setup lang="ts">
import { ImDropdown, type DropdownItem } from '..';
import { ImButton } from '../../im-button';

const itemsWithDivider: DropdownItem[] = [
  { key: 'copy', label: '复制' },
  { key: 'edit', label: '编辑' },
  { key: 'divider1', label: '', divider: true },
  { key: 'delete', label: '删除' }
];
</script>

<template>
  <div style="padding: 100px;">
    <ImDropdown :items="itemsWithDivider" placement="bottom-start">
      <ImButton>操作</ImButton>
    </ImDropdown>
  </div>
</template>
