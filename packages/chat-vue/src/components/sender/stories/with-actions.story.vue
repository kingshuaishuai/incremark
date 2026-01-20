<script setup lang="ts">
/**
 * 带操作按钮的 Sender 示例
 * 演示如何通过插槽添加自定义操作按钮
 */
import { ref } from 'vue';
import { Icon } from '@iconify/vue';
import Sender from '../sender.vue';
import SenderActionButton from '../components/sender-action-button.vue';
import SvgIcon from '../../svg-icon/svg-icon.vue';

const message = ref('');

const handleSubmit = (msg: { content: string }) => {
  console.log('Submit:', msg);
};

const handleAttachment = () => {
  console.log('Add attachment');
};

const handleVoice = () => {
  console.log('Voice input');
};
</script>

<template>
  <div style="max-width: 600px; margin: 0 auto;">
    <Sender
      v-model="message"
      placeholder="输入消息..."
      @submit="handleSubmit"
    >
      <template #prefix>
        <SenderActionButton square aria-label="添加附件" @click="handleAttachment">
          <SvgIcon>
            <Icon icon="mdi:plus" />
          </SvgIcon>
        </SenderActionButton>
        <SenderActionButton square aria-label="语音输入" @click="handleVoice">
          <SvgIcon>
            <Icon icon="mdi:microphone-outline" />
          </SvgIcon>
        </SenderActionButton>
      </template>
    </Sender>
  </div>
</template>
