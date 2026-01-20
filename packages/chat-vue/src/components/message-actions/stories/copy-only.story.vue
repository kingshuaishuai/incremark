<script setup lang="ts">
import { MessageActions } from '..';
import { MessageActionCopy } from '..';
</script>

<template>
  <MessageActions>
    <MessageActionCopy
      text="This is the text that will be copied to clipboard"
      tooltip="复制内容"
      copied-tooltip="复制成功！"
    />
  </MessageActions>
</template>
