/**
 * 文件类型判断和图标映射 composable
 */

import { computed, type Ref } from 'vue';
import type { FileCategory } from '../types';

/**
 * 文件类型配置
 */
export interface FileTypeConfig {
  /** 文件分类 */
  category: FileCategory;
  /** 图标名称（Iconify） */
  icon: string;
  /** 主题颜色 */
  color: string;
  /** 背景颜色 */
  bgColor: string;
}

/**
 * MIME 类型到分类的映射
 */
const mimeTypeMap: Record<string, FileCategory> = {
  // PDF
  'application/pdf': 'pdf',
  // Word
  'application/msword': 'word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'word',
  // Excel
  'application/vnd.ms-excel': 'excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'excel',
  'text/csv': 'excel',
  // PPT
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'ppt',
  // Archive
  'application/zip': 'archive',
  'application/x-rar-compressed': 'archive',
  'application/x-7z-compressed': 'archive',
  'application/gzip': 'archive',
  'application/x-tar': 'archive',
  // Code
  'application/javascript': 'code',
  'application/typescript': 'code',
  'application/json': 'code',
  'application/xml': 'code',
  'text/html': 'code',
  'text/css': 'code',
  'text/javascript': 'code',
  'text/xml': 'code',
  // Text
  'text/plain': 'text',
  'text/markdown': 'text',
  'text/rtf': 'text',
};

/**
 * 文件扩展名到分类的映射
 */
const extensionMap: Record<string, FileCategory> = {
  // PDF
  pdf: 'pdf',
  // Word
  doc: 'word',
  docx: 'word',
  odt: 'word',
  // Excel
  xls: 'excel',
  xlsx: 'excel',
  csv: 'excel',
  ods: 'excel',
  // PPT
  ppt: 'ppt',
  pptx: 'ppt',
  odp: 'ppt',
  // Archive
  zip: 'archive',
  rar: 'archive',
  '7z': 'archive',
  gz: 'archive',
  tar: 'archive',
  // Code
  js: 'code',
  ts: 'code',
  jsx: 'code',
  tsx: 'code',
  vue: 'code',
  py: 'code',
  java: 'code',
  c: 'code',
  cpp: 'code',
  h: 'code',
  go: 'code',
  rs: 'code',
  rb: 'code',
  php: 'code',
  swift: 'code',
  kt: 'code',
  json: 'code',
  xml: 'code',
  html: 'code',
  css: 'code',
  scss: 'code',
  less: 'code',
  yaml: 'code',
  yml: 'code',
  sh: 'code',
  sql: 'code',
  // Text
  txt: 'text',
  md: 'text',
  rtf: 'text',
  log: 'text',
};

/**
 * 分类到配置的映射
 * 使用 vscode-icons 系列图标，视觉更统一
 */
const categoryConfig: Record<FileCategory, Omit<FileTypeConfig, 'category'>> = {
  image: {
    icon: 'vscode-icons:file-type-image',
    color: 'var(--incremark-base-colors-purple-6)',
    bgColor: 'var(--incremark-base-colors-purple-1)',
  },
  video: {
    icon: 'vscode-icons:file-type-video',
    color: 'var(--incremark-base-colors-pink-6)',
    bgColor: 'var(--incremark-base-colors-pink-1)',
  },
  audio: {
    icon: 'vscode-icons:file-type-audio',
    color: 'var(--incremark-base-colors-cyan-6)',
    bgColor: 'var(--incremark-base-colors-cyan-1)',
  },
  pdf: {
    icon: 'vscode-icons:file-type-pdf2',
    color: 'var(--incremark-base-colors-red-6)',
    bgColor: 'var(--incremark-base-colors-red-1)',
  },
  word: {
    icon: 'vscode-icons:file-type-word',
    color: 'var(--incremark-base-colors-blue-6)',
    bgColor: 'var(--incremark-base-colors-blue-1)',
  },
  excel: {
    icon: 'vscode-icons:file-type-excel',
    color: 'var(--incremark-base-colors-green-6)',
    bgColor: 'var(--incremark-base-colors-green-1)',
  },
  ppt: {
    icon: 'vscode-icons:file-type-powerpoint',
    color: 'var(--incremark-base-colors-orange-6)',
    bgColor: 'var(--incremark-base-colors-orange-1)',
  },
  archive: {
    icon: 'vscode-icons:file-type-zip',
    color: 'var(--incremark-base-colors-yellow-6)',
    bgColor: 'var(--incremark-base-colors-yellow-1)',
  },
  code: {
    icon: 'vscode-icons:file-type-typescript',
    color: 'var(--incremark-base-colors-indigo-6)',
    bgColor: 'var(--incremark-base-colors-indigo-1)',
  },
  text: {
    icon: 'vscode-icons:file-type-text',
    color: 'var(--incremark-color-neutral-6)',
    bgColor: 'var(--incremark-color-neutral-2)',
  },
  unknown: {
    icon: 'vscode-icons:default-file',
    color: 'var(--incremark-color-neutral-6)',
    bgColor: 'var(--incremark-color-neutral-2)',
  },
};

/**
 * 从文件名获取扩展名
 */
function getExtension(filename: string): string {
  const parts = filename.toLowerCase().split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

/**
 * 判断文件分类
 */
export function getFileCategory(mimeType?: string, filename?: string): FileCategory {
  // 优先通过 MIME 类型判断
  if (mimeType) {
    // 检查前缀（image/*, video/*, audio/*）
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';

    // 检查完整 MIME 类型
    const categoryByMime = mimeTypeMap[mimeType];
    if (categoryByMime) return categoryByMime;
  }

  // 其次通过文件扩展名判断
  if (filename) {
    const ext = getExtension(filename);
    const categoryByExt = extensionMap[ext];
    if (categoryByExt) return categoryByExt;
  }

  return 'unknown';
}

/**
 * 获取文件类型配置
 */
export function getFileTypeConfig(mimeType?: string, filename?: string): FileTypeConfig {
  const category = getFileCategory(mimeType, filename);
  return {
    category,
    ...categoryConfig[category],
  };
}

/**
 * 文件类型 composable
 */
export function useFileType(
  mimeType: Ref<string | undefined>,
  filename: Ref<string | undefined>
) {
  const config = computed(() => getFileTypeConfig(mimeType.value, filename.value));

  const category = computed(() => config.value.category);
  const icon = computed(() => config.value.icon);
  const color = computed(() => config.value.color);
  const bgColor = computed(() => config.value.bgColor);

  const isImage = computed(() => category.value === 'image');
  const isVideo = computed(() => category.value === 'video');
  const isAudio = computed(() => category.value === 'audio');
  const isPreviewable = computed(() => isImage.value || isVideo.value || isAudio.value);

  return {
    config,
    category,
    icon,
    color,
    bgColor,
    isImage,
    isVideo,
    isAudio,
    isPreviewable,
  };
}
