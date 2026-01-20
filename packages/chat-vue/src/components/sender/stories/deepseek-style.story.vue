<script setup lang="ts">
/**
 * DeepSeek 风格布局示例
 * 模拟 DeepSeek 的输入框布局：
 * - 左侧：深度思考、联网搜索切换
 * - 右侧：附件、发送按钮
 */
import { ref } from 'vue';
import { Icon } from '@iconify/vue';
import Sender from '../sender.vue';
import SenderActionButton from '../components/sender-action-button.vue';
import SvgIcon from '../../svg-icon/svg-icon.vue';

const message = ref('');
const deepThink = ref(false);
const webSearch = ref(false);

const handleSubmit = (msg: { content: string }) => {
  console.log('Submit:', msg);
  console.log('Deep Think:', deepThink.value);
  console.log('Web Search:', webSearch.value);
};

const toggleDeepThink = () => {
  deepThink.value = !deepThink.value;
};

const toggleWebSearch = () => {
  webSearch.value = !webSearch.value;
};
</script>

<template>
  <div style="max-width: 700px; margin: 0 auto;">
    <Sender
      v-model="message"
      placeholder="给 DeepSeek 发送消息"
      @submit="handleSubmit"
    >
      <template #prefix>
        <SenderActionButton
          :active="deepThink"
          aria-label="深度思考"
          @click="toggleDeepThink"
        >
          <SvgIcon>
            <Icon icon="mdi:brain" />
          </SvgIcon>
          <span style="margin-left: 4px; font-size: 12px;">深度思考</span>
        </SenderActionButton>
        <SenderActionButton
          :active="webSearch"
          aria-label="联网搜索"
          @click="toggleWebSearch"
        >
          <SvgIcon>
            <Icon icon="mdi:web" />
          </SvgIcon>
          <span style="margin-left: 4px; font-size: 12px;">联网搜索</span>
        </SenderActionButton>
      </template>

      <template #suffix>
        <SenderActionButton square aria-label="添加附件">
          <SvgIcon>
            <Icon icon="mdi:paperclip" />
          </SvgIcon>
        </SenderActionButton>
      </template>
    </Sender>

    <p style="margin-top: 16px; color: #666; font-size: 14px;">
      深度思考: {{ deepThink ? '开启' : '关闭' }} |
      联网搜索: {{ webSearch ? '开启' : '关闭' }}
    </p>
  </div>
</template>
