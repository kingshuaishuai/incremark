<script setup lang="ts">
import { ImDropdown, type DropdownItem } from '..';
import { ImButton } from '../../im-button';

const basicItems: DropdownItem[] = [
  { key: 'copy', label: '复制' },
  { key: 'edit', label: '编辑' },
  { key: 'delete', label: '删除' }
];
</script>

<template>
  <div style="padding: 100px;">
    <ImDropdown :items="basicItems" :disabled="true">
      <ImButton disabled>禁用的菜单</ImButton>
    </ImDropdown>
  </div>
</template>
