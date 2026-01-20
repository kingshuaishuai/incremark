<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { MessageActions } from '..';
import { MessageAction } from '..';
import { MessageActionCopy } from '..';
import { SvgIcon } from '../../svg-icon';

const handleRefresh = () => {
  alert('Refresh clicked!');
};
</script>

<template>
  <MessageActions>
    <MessageActionCopy text="Custom content to copy" />
    <MessageAction tooltip="重新生成" @click="handleRefresh">
      <SvgIcon>
        <Icon icon="ph:arrows-clockwise" />
      </SvgIcon>
    </MessageAction>
  </MessageActions>
</template>
