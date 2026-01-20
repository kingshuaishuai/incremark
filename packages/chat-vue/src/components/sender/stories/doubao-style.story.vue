<script setup lang="ts">
/**
 * 豆包/Coze 风格布局示例
 * 模拟豆包的输入框布局：
 * - 顶部：应用导航栏
 * - 左侧：附件按钮
 * - 右侧：发送按钮
 */
import { ref } from 'vue';
import { Icon } from '@iconify/vue';
import Sender from '../sender.vue';
import SenderActionButton from '../components/sender-action-button.vue';
import SvgIcon from '../../svg-icon/svg-icon.vue';

const message = ref('');
const activeApp = ref<string | null>(null);

const apps = [
  { key: 'ppt', label: 'PPT', icon: 'mdi:file-presentation-box' },
  { key: 'image', label: '生图', icon: 'mdi:image' },
  { key: 'doc', label: '文档', icon: 'mdi:file-document' },
  { key: 'app', label: '应用', icon: 'mdi:apps' },
  { key: 'visual', label: '可视化页面', icon: 'mdi:chart-bar' },
  { key: 'podcast', label: '播客', icon: 'mdi:podcast' },
  { key: 'data', label: '数据分析', icon: 'mdi:chart-line' },
  { key: 'custom', label: '自定义', icon: 'mdi:plus-box' },
];

const handleSubmit = (msg: { content: string }) => {
  console.log('Submit:', msg);
  console.log('Active App:', activeApp.value);
};

const selectApp = (key: string) => {
  activeApp.value = activeApp.value === key ? null : key;
};
</script>

<template>
  <div style="max-width: 800px; margin: 0 auto;">
    <Sender
      v-model="message"
      placeholder="和我探讨任何问"
      @submit="handleSubmit"
    >
      <!-- 应用导航栏 -->
      <template #header>
        <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; justify-content: center;">
          <button
            v-for="app in apps"
            :key="app.key"
            :style="{
              padding: '8px 16px',
              border: activeApp === app.key ? '1px solid #6366f1' : '1px solid #ddd',
              borderRadius: '20px',
              background: activeApp === app.key ? '#f0f0ff' : 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }"
            @click="selectApp(app.key)"
          >
            <Icon :icon="app.icon" />
            {{ app.label }}
          </button>
        </div>
      </template>

      <template #prefix>
        <SenderActionButton square aria-label="添加附件">
          <SvgIcon>
            <Icon icon="mdi:plus" />
          </SvgIcon>
        </SenderActionButton>
      </template>
    </Sender>

    <p style="margin-top: 16px; color: #666; font-size: 14px; text-align: center;">
      当前应用: {{ activeApp ? apps.find(a => a.key === activeApp)?.label : '无' }}
    </p>
  </div>
</template>
