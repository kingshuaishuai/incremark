<script setup lang="ts">
/**
 * Claude 风格布局示例
 * 模拟 Claude 的输入框布局：
 * - 左侧：附件按钮、历史按钮
 * - 右侧：模型选择、发送按钮
 */
import { ref } from 'vue';
import { Icon } from '@iconify/vue';
import Sender from '../sender.vue';
import SenderActionButton from '../components/sender-action-button.vue';
import SvgIcon from '../../svg-icon/svg-icon.vue';

const message = ref('');
const loading = ref(false);

const handleSubmit = (msg: { content: string }) => {
  console.log('Submit:', msg);
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 2000);
};

const handleCancel = () => {
  loading.value = false;
};
</script>

<template>
  <div style="max-width: 700px; margin: 0 auto;">
    <Sender
      v-model="message"
      :loading="loading"
      placeholder="How can I help you today?"
      @submit="handleSubmit"
      @cancel="handleCancel"
    >
      <template #prefix>
        <SenderActionButton square aria-label="添加附件">
          <SvgIcon>
            <Icon icon="mdi:plus" />
          </SvgIcon>
        </SenderActionButton>
        <SenderActionButton square aria-label="历史记录">
          <SvgIcon>
            <Icon icon="mdi:history" />
          </SvgIcon>
        </SenderActionButton>
      </template>

      <template #suffix>
        <SenderActionButton aria-label="选择模型">
          <span style="font-size: 12px; white-space: nowrap;">Sonnet 4.5</span>
          <SvgIcon style="margin-left: 4px;">
            <Icon icon="mdi:chevron-down" />
          </SvgIcon>
        </SenderActionButton>
      </template>
    </Sender>

    <!-- 底部快捷标签 -->
    <div style="display: flex; gap: 8px; margin-top: 16px; justify-content: center;">
      <button style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 20px; background: white; cursor: pointer;">
        <Icon icon="mdi:code-tags" style="margin-right: 4px;" /> Code
      </button>
      <button style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 20px; background: white; cursor: pointer;">
        <Icon icon="mdi:school" style="margin-right: 4px;" /> Learn
      </button>
      <button style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 20px; background: white; cursor: pointer;">
        <Icon icon="mdi:pencil" style="margin-right: 4px;" /> Write
      </button>
    </div>
  </div>
</template>
