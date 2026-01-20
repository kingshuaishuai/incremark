<script setup lang="ts">
/**
 * ActionButton 选中状态
 * 展示 active 属性的效果，常用于切换按钮
 */
import { ref } from 'vue';
import { Icon } from '@iconify/vue';
import ActionButton from '../action-button.vue';
import SvgIcon from '../../../svg-icon/svg-icon.vue';

const deepThink = ref(false);
const webSearch = ref(true);
const selectedMode = ref<'search' | 'deep' | 'reason'>('search');
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 24px;">
    <!-- 切换按钮 -->
    <div>
      <h4 style="margin: 0 0 12px; color: #333;">切换按钮</h4>
      <div style="display: flex; gap: 12px; align-items: center;">
        <ActionButton :active="deepThink" @click="deepThink = !deepThink">
          <SvgIcon>
            <Icon icon="mdi:brain" />
          </SvgIcon>
          深度思考
        </ActionButton>
        <ActionButton :active="webSearch" @click="webSearch = !webSearch">
          <SvgIcon>
            <Icon icon="mdi:web" />
          </SvgIcon>
          联网搜索
        </ActionButton>
      </div>
      <p style="margin-top: 8px; color: #666; font-size: 14px;">
        深度思考: {{ deepThink ? '开启' : '关闭' }} |
        联网搜索: {{ webSearch ? '开启' : '关闭' }}
      </p>
    </div>

    <!-- 单选组 -->
    <div>
      <h4 style="margin: 0 0 12px; color: #333;">单选组（模式切换）</h4>
      <div style="display: flex; gap: 8px; align-items: center;">
        <ActionButton
          square
          :active="selectedMode === 'search'"
          aria-label="搜索"
          @click="selectedMode = 'search'"
        >
          <SvgIcon>
            <Icon icon="mdi:magnify" />
          </SvgIcon>
        </ActionButton>
        <ActionButton
          square
          :active="selectedMode === 'deep'"
          aria-label="深度研究"
          @click="selectedMode = 'deep'"
        >
          <SvgIcon>
            <Icon icon="mdi:flask-outline" />
          </SvgIcon>
        </ActionButton>
        <ActionButton
          square
          :active="selectedMode === 'reason'"
          aria-label="推理"
          @click="selectedMode = 'reason'"
        >
          <SvgIcon>
            <Icon icon="mdi:head-cog-outline" />
          </SvgIcon>
        </ActionButton>
      </div>
      <p style="margin-top: 8px; color: #666; font-size: 14px;">
        当前模式: {{ selectedMode === 'search' ? '搜索' : selectedMode === 'deep' ? '深度研究' : '推理' }}
      </p>
    </div>

    <!-- 静态对比 -->
    <div>
      <h4 style="margin: 0 0 12px; color: #333;">状态对比</h4>
      <div style="display: flex; gap: 12px; align-items: center;">
        <div style="text-align: center;">
          <ActionButton>
            <SvgIcon>
              <Icon icon="mdi:star-outline" />
            </SvgIcon>
            默认
          </ActionButton>
          <div style="font-size: 12px; color: #999; margin-top: 4px;">Normal</div>
        </div>
        <div style="text-align: center;">
          <ActionButton active>
            <SvgIcon>
              <Icon icon="mdi:star" />
            </SvgIcon>
            选中
          </ActionButton>
          <div style="font-size: 12px; color: #999; margin-top: 4px;">Active</div>
        </div>
      </div>
    </div>
  </div>
</template>
