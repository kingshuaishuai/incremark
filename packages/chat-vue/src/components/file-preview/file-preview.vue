<script setup lang="ts">
/**
 * FilePreview - 文件预览渲染器
 *
 * 支持两种使用场景：
 * 1. 消息渲染：传入 part（FilePart）
 * 2. 附件预览：传入 file（FileInfo）
 */

import { computed, toRef } from 'vue';
import { createImBem } from '@incremark/shared';
import { formatFileSize } from '@incremark/shared';
import { Icon } from '@iconify/vue';
import { ImButton } from '../base/im-button';
import { useFileType } from './composables/useFileType';
import type { FilePreviewProps } from './types';

const props = withDefaults(defineProps<FilePreviewProps>(), {
  maxWidth: 400,
  maxHeight: 300,
  compact: false,
  removable: false,
});

const emit = defineEmits<{
  remove: [];
}>();

const bem = createImBem('file-preview');

// 统一获取文件信息
const filename = computed(() => props.file?.name ?? props.part?.filename ?? '文件');
const mimeType = computed(() => props.file?.type ?? props.part?.mediaType);
const fileSize = computed(() => props.file?.size);

// 文件类型判断
const mimeTypeRef = toRef(() => mimeType.value);
const filenameRef = toRef(() => filename.value);
const { icon, isImage, isVideo, isAudio } = useFileType(mimeTypeRef, filenameRef);

// 预览 URL
const previewUrl = computed(() => {
  // 附件预览场景
  if (props.file?.url) {
    return props.file.url;
  }
  // 消息渲染场景
  if (props.part) {
    if (props.part.data.startsWith('data:') || props.part.data.startsWith('http')) {
      return props.part.data;
    }
    return `data:${props.part.mediaType};base64,${props.part.data}`;
  }
  return '';
});

const previewStyle = computed(() => ({
  maxWidth: `${props.maxWidth}px`,
  maxHeight: `${props.maxHeight}px`,
}));

const handleRemove = () => {
  emit('remove');
};
</script>

<template>
  <div :class="[bem(), compact && bem('', 'compact')]">
    <!-- 紧凑模式：用于附件列表 -->
    <template v-if="compact">
      <!-- 图片缩略图 -->
      <div v-if="isImage && previewUrl" :class="bem('thumbnail')">
        <img :src="previewUrl" :alt="filename" :class="bem('thumbnail-img')" />
      </div>
      <!-- 文件图标（vscode-icons 自带颜色） -->
      <div v-else :class="bem('icon-box')">
        <Icon :icon="icon" :class="bem('icon')" />
      </div>

      <!-- 文件信息 -->
      <div :class="bem('info')">
        <span :class="bem('name')">{{ filename }}</span>
        <span v-if="fileSize" :class="bem('size')">{{ formatFileSize(fileSize) }}</span>
      </div>

      <!-- 删除按钮 -->
      <ImButton
        v-if="removable"
        variant="ghost"
        color="neutral"
        size="xs"
        circle
        :class="bem('remove')"
        aria-label="删除"
        @click="handleRemove"
      >
        <template #icon>
          <Icon icon="mdi:close" />
        </template>
      </ImButton>
    </template>

    <!-- 标准模式：用于消息预览 -->
    <template v-else>
      <!-- 图片预览 -->
      <img
        v-if="isImage && previewUrl"
        :src="previewUrl"
        :alt="filename"
        :class="bem('image')"
        :style="previewStyle"
      />

      <!-- 视频预览 -->
      <video
        v-else-if="isVideo && previewUrl"
        :src="previewUrl"
        :class="bem('video')"
        :style="previewStyle"
        controls
      />

      <!-- 音频预览 -->
      <audio
        v-else-if="isAudio && previewUrl"
        :src="previewUrl"
        :class="bem('audio')"
        controls
      />

      <!-- 其他文件 -->
      <div v-else :class="bem('file')">
        <div :class="bem('icon-box')">
          <Icon :icon="icon" :class="bem('icon')" />
        </div>
        <div :class="bem('file-info')">
          <span :class="bem('filename')">{{ filename }}</span>
          <span v-if="mimeType" :class="bem('type')">{{ mimeType }}</span>
        </div>
      </div>
    </template>
  </div>
</template>
