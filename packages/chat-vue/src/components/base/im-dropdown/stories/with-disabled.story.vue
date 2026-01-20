<script setup lang="ts">
import { ImDropdown, type DropdownItem } from '..';
import { ImButton } from '../../im-button';

const itemsWithDisabled: DropdownItem[] = [
  { key: 'copy', label: '复制' },
  { key: 'edit', label: '编辑', disabled: true },
  { key: 'delete', label: '删除' }
];
</script>

<template>
  <div style="padding: 100px;">
    <ImDropdown :items="itemsWithDisabled" placement="bottom-start">
      <ImButton>操作</ImButton>
    </ImDropdown>
  </div>
</template>
