<script setup lang="ts">
/**
 * Perplexity 风格布局示例
 * 模拟 Perplexity 的输入框布局：
 * - 左侧：搜索模式切换（搜索/深度/推理）
 * - 右侧：地球、聚焦、附件、语音、发送
 */
import { ref } from 'vue';
import { Icon } from '@iconify/vue';
import Sender from '../sender.vue';
import SenderActionButton from '../components/sender-action-button.vue';
import SvgIcon from '../../svg-icon/svg-icon.vue';

const message = ref('');
const searchMode = ref<'search' | 'deep' | 'reason'>('search');
const loading = ref(false);

const handleSubmit = (msg: { content: string }) => {
  console.log('Submit:', msg);
  console.log('Mode:', searchMode.value);
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 2000);
};

const setMode = (mode: 'search' | 'deep' | 'reason') => {
  searchMode.value = mode;
};
</script>

<template>
  <div style="max-width: 700px; margin: 0 auto;">
    <Sender
      v-model="message"
      :loading="loading"
      placeholder="Ask anything. Type @ for mentions and / for shortcuts."
      @submit="handleSubmit"
    >
      <template #prefix>
        <SenderActionButton
          square
          :active="searchMode === 'search'"
          aria-label="搜索"
          @click="setMode('search')"
        >
          <SvgIcon>
            <Icon icon="mdi:magnify" />
          </SvgIcon>
        </SenderActionButton>
        <SenderActionButton
          square
          :active="searchMode === 'deep'"
          aria-label="深度研究"
          @click="setMode('deep')"
        >
          <SvgIcon>
            <Icon icon="mdi:flask-outline" />
          </SvgIcon>
        </SenderActionButton>
        <SenderActionButton
          square
          :active="searchMode === 'reason'"
          aria-label="推理"
          @click="setMode('reason')"
        >
          <SvgIcon>
            <Icon icon="mdi:head-cog-outline" />
          </SvgIcon>
        </SenderActionButton>
      </template>

      <template #suffix>
        <SenderActionButton square aria-label="全球搜索">
          <SvgIcon>
            <Icon icon="mdi:earth" />
          </SvgIcon>
        </SenderActionButton>
        <SenderActionButton square aria-label="聚焦">
          <SvgIcon>
            <Icon icon="mdi:target" />
          </SvgIcon>
        </SenderActionButton>
        <SenderActionButton square aria-label="添加附件">
          <SvgIcon>
            <Icon icon="mdi:paperclip" />
          </SvgIcon>
        </SenderActionButton>
        <SenderActionButton square aria-label="语音输入">
          <SvgIcon>
            <Icon icon="mdi:microphone-outline" />
          </SvgIcon>
        </SenderActionButton>
      </template>
    </Sender>

    <!-- 底部快捷标签 -->
    <div style="display: flex; gap: 8px; margin-top: 16px; justify-content: center; flex-wrap: wrap;">
      <button style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 20px; background: white; cursor: pointer;">
        <Icon icon="mdi:heart-outline" style="margin-right: 4px;" /> Health
      </button>
      <button style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 20px; background: white; cursor: pointer;">
        <Icon icon="mdi:scale-balance" style="margin-right: 4px;" /> Compare
      </button>
      <button style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 20px; background: white; cursor: pointer;">
        <Icon icon="mdi:thumb-up-outline" style="margin-right: 4px;" /> Recommend
      </button>
      <button style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 20px; background: white; cursor: pointer;">
        <Icon icon="mdi:check-circle-outline" style="margin-right: 4px;" /> Fact Check
      </button>
    </div>

    <p style="margin-top: 16px; color: #666; font-size: 14px; text-align: center;">
      当前模式: {{ searchMode === 'search' ? '搜索' : searchMode === 'deep' ? '深度研究' : '推理' }}
    </p>
  </div>
</template>
