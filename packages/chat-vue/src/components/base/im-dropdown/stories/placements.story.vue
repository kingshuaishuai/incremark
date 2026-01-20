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
  <div style="padding: 100px; display: flex; gap: 16px; flex-wrap: wrap;">
    <ImDropdown :items="basicItems" placement="bottom-start">
      <ImButton>bottom-start</ImButton>
    </ImDropdown>
    <ImDropdown :items="basicItems" placement="bottom">
      <ImButton>bottom</ImButton>
    </ImDropdown>
    <ImDropdown :items="basicItems" placement="bottom-end">
      <ImButton>bottom-end</ImButton>
    </ImDropdown>
  </div>
</template>
