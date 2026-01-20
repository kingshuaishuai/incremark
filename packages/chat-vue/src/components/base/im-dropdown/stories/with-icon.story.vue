<script setup lang="ts">
import { h } from 'vue';
import { ImDropdown, type DropdownItem } from '..';
import { ImButton } from '../../im-button';
import { Icon } from '@iconify/vue';

const itemsWithIcon: DropdownItem[] = [
  { key: 'copy', label: '复制', icon: h(Icon, { icon: 'ph:copy' }) },
  { key: 'edit', label: '编辑', icon: h(Icon, { icon: 'ph:pencil' }) },
  { key: 'divider1', label: '', divider: true },
  { key: 'delete', label: '删除', icon: h(Icon, { icon: 'ph:trash' }) }
];
</script>

<template>
  <div style="padding: 100px;">
    <ImDropdown :items="itemsWithIcon" placement="bottom-start">
      <ImButton>带图标菜单</ImButton>
    </ImDropdown>
  </div>
</template>
