<script setup lang="ts">
/**
 * SourceReference - 来源引用渲染器
 */

import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { createImBem } from '@incremark/shared';
import SvgIcon from '../svg-icon/svg-icon.vue';
import type { SourceReferenceProps } from './types';

const props = withDefaults(defineProps<SourceReferenceProps>(), {
  openInNewTab: true
});

const bem = createImBem('source-reference');

const isUrl = computed(() => props.part.sourceType === 'url');
const isDocument = computed(() => props.part.sourceType === 'document');

const linkTarget = computed(() => props.openInNewTab ? '_blank' : undefined);
const linkRel = computed(() => props.openInNewTab ? 'noopener noreferrer' : undefined);

// 文件类型图标和颜色映射
interface FileTypeInfo {
  icon: string;
  color: string;
}

// 常见文件类型映射（基于 mediaType 或文件扩展名）
const fileTypeMap: Record<string, FileTypeInfo> = {
  // PDF - 红色
  'application/pdf': { icon: 'mdi:file-pdf-box', color: '#FF4B4B' },

  // Word - 蓝色
  'application/msword': { icon: 'mdi:file-word', color: '#2B579A' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: 'mdi:file-word', color: '#2B579A' },

  // Excel - 绿色
  'application/vnd.ms-excel': { icon: 'mdi:file-excel', color: '#217346' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: 'mdi:file-excel', color: '#217346' },

  // PowerPoint - 橙色
  'application/vnd.ms-powerpoint': { icon: 'mdi:file-powerpoint', color: '#D24726' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { icon: 'mdi:file-powerpoint', color: '#D24726' },

  // 图片 - 紫色
  'image/jpeg': { icon: 'mdi:file-image', color: '#9B59B6' },
  'image/png': { icon: 'mdi:file-image', color: '#9B59B6' },
  'image/gif': { icon: 'mdi:file-image', color: '#9B59B6' },
  'image/webp': { icon: 'mdi:file-image', color: '#9B59B6' },
  'image/svg+xml': { icon: 'mdi:file-image', color: '#9B59B6' },

  // 视频 - 深紫色
  'video/mp4': { icon: 'mdi:file-video', color: '#8E44AD' },
  'video/webm': { icon: 'mdi:file-video', color: '#8E44AD' },
  'video/quicktime': { icon: 'mdi:file-video', color: '#8E44AD' },

  // 音频 - 青色
  'audio/mpeg': { icon: 'mdi:file-music', color: '#1ABC9C' },
  'audio/wav': { icon: 'mdi:file-music', color: '#1ABC9C' },
  'audio/ogg': { icon: 'mdi:file-music', color: '#1ABC9C' },

  // 压缩文件 - 黄色
  'application/zip': { icon: 'mdi:file-zip', color: '#F39C12' },
  'application/x-rar-compressed': { icon: 'mdi:file-zip', color: '#F39C12' },
  'application/x-7z-compressed': { icon: 'mdi:file-zip', color: '#F39C12' },
  'application/x-tar': { icon: 'mdi:file-zip', color: '#F39C12' },

  // 文本 - 灰色
  'text/plain': { icon: 'mdi:file-document-outline', color: '#7F8C8D' },
  'text/html': { icon: 'mdi:file-code', color: '#7F8C8D' },
  'text/css': { icon: 'mdi:file-code', color: '#7F8C8D' },
  'text/javascript': { icon: 'mdi:file-code', color: '#7F8C8D' },

  // JSON/XML
  'application/json': { icon: 'mdi:file-code', color: '#7F8C8D' },
  'application/xml': { icon: 'mdi:file-code', color: '#7F8C8D' },
  'text/xml': { icon: 'mdi:file-code', color: '#7F8C8D' },

  // Markdown
  'text/markdown': { icon: 'mdi:language-markdown', color: '#7F8C8D' },

  // 代码文件
  'application/x-sh': { icon: 'mdi:file-code', color: '#7F8C8D' },
  'application/x-python': { icon: 'mdi:language-python', color: '#7F8C8D' },
};

// 根据 URL 扩展名推断文件类型
const getFileTypeFromUrl = (url: string): FileTypeInfo | undefined => {
  const extension = url.split('.').pop()?.toLowerCase();
  if (!extension) return undefined;

  const extMap: Record<string, FileTypeInfo> = {
    'pdf': { icon: 'mdi:file-pdf-box', color: '#FF4B4B' },
    'doc': { icon: 'mdi:file-word', color: '#2B579A' },
    'docx': { icon: 'mdi:file-word', color: '#2B579A' },
    'xls': { icon: 'mdi:file-excel', color: '#217346' },
    'xlsx': { icon: 'mdi:file-excel', color: '#217346' },
    'ppt': { icon: 'mdi:file-powerpoint', color: '#D24726' },
    'pptx': { icon: 'mdi:file-powerpoint', color: '#D24726' },
    'jpg': { icon: 'mdi:file-image', color: '#9B59B6' },
    'jpeg': { icon: 'mdi:file-image', color: '#9B59B6' },
    'png': { icon: 'mdi:file-image', color: '#9B59B6' },
    'gif': { icon: 'mdi:file-image', color: '#9B59B6' },
    'webp': { icon: 'mdi:file-image', color: '#9B59B6' },
    'svg': { icon: 'mdi:file-image', color: '#9B59B6' },
    'mp4': { icon: 'mdi:file-video', color: '#8E44AD' },
    'webm': { icon: 'mdi:file-video', color: '#8E44AD' },
    'mov': { icon: 'mdi:file-video', color: '#8E44AD' },
    'mp3': { icon: 'mdi:file-music', color: '#1ABC9C' },
    'wav': { icon: 'mdi:file-music', color: '#1ABC9C' },
    'zip': { icon: 'mdi:file-zip', color: '#F39C12' },
    'rar': { icon: 'mdi:file-zip', color: '#F39C12' },
    '7z': { icon: 'mdi:file-zip', color: '#F39C12' },
    'txt': { icon: 'mdi:file-document-outline', color: '#7F8C8D' },
    'md': { icon: 'mdi:language-markdown', color: '#7F8C8D' },
    'json': { icon: 'mdi:file-code', color: '#7F8C8D' },
    'xml': { icon: 'mdi:file-code', color: '#7F8C8D' },
    'html': { icon: 'mdi:file-code', color: '#7F8C8D' },
    'css': { icon: 'mdi:file-code', color: '#7F8C8D' },
    'js': { icon: 'mdi:file-code', color: '#7F8C8D' },
    'ts': { icon: 'mdi:file-code', color: '#7F8C8D' },
    'py': { icon: 'mdi:language-python', color: '#7F8C8D' },
    'sh': { icon: 'mdi:file-code', color: '#7F8C8D' },
  };

  return extMap[extension];
};

// 获取文件类型信息
const fileTypeInfo = computed<FileTypeInfo | undefined>(() => {
  // 如果是文档类型，优先使用 mediaType
  if (isDocument.value && props.part.mediaType) {
    return fileTypeMap[props.part.mediaType];
  }

  // 如果是 URL 类型，尝试从 URL 推断文件类型
  if (isUrl.value && props.part.url) {
    return getFileTypeFromUrl(props.part.url);
  }

  return undefined;
});

// 获取图标
const defaultIcon = computed(() => {
  // 如果有特定文件类型图标，使用它
  if (fileTypeInfo.value) {
    return fileTypeInfo.value.icon;
  }

  // 默认图标
  if (isUrl.value) return 'mdi:link-variant';
  if (isDocument.value) return 'mdi:file-document-outline';
  return undefined;
});

// 获取图标颜色
const iconColor = computed(() => {
  return fileTypeInfo.value?.color;
});

const hasDefaultIcon = computed(() => defaultIcon.value !== undefined);
</script>

<template>
  <div :class="[bem(), bem('', part.sourceType)]">
    <!-- URL 类型 -->
    <a
      v-if="isUrl && part.url"
      :href="part.url"
      :target="linkTarget"
      :rel="linkRel"
      :class="bem('link')"
    >
      <!-- 图标插槽，优先使用外部定制 -->
      <slot name="icon">
        <SvgIcon v-if="hasDefaultIcon" :class="bem('icon')" :style="{ color: iconColor }">
          <Icon :icon="defaultIcon!" />
        </SvgIcon>
      </slot>
      <span :class="bem('title')">{{ part.title || part.url }}</span>
    </a>

    <!-- 文档类型 -->
    <div v-else-if="isDocument" :class="bem('document')">
      <slot name="icon">
        <SvgIcon v-if="hasDefaultIcon" :class="bem('icon')" :style="{ color: iconColor }">
          <Icon :icon="defaultIcon!" />
        </SvgIcon>
      </slot>
      <span :class="bem('title')">{{ part.title }}</span>
      <span v-if="part.mediaType" :class="bem('type')">{{ part.mediaType }}</span>
    </div>

    <!-- 支持完全自定义内容 -->
    <slot />
  </div>
</template>
