/**
 * FilePreview 组件类型定义
 */

import type { FilePart } from '@incremark/chat-core';

/**
 * 文件类型分类
 */
export type FileCategory =
  | 'image'
  | 'video'
  | 'audio'
  | 'pdf'
  | 'word'
  | 'excel'
  | 'ppt'
  | 'archive'
  | 'code'
  | 'text'
  | 'unknown';

/**
 * 文件信息（用于 SenderAttachment 等场景）
 */
export interface FileInfo {
  /** 文件名 */
  name: string;
  /** MIME 类型 */
  type?: string;
  /** 文件大小（字节） */
  size?: number;
  /** 预览 URL（图片/视频等） */
  url?: string;
}

/**
 * FilePreview 组件 Props
 */
export interface FilePreviewProps {
  /** 文件 Part 数据（消息渲染场景） */
  part?: FilePart;
  /** 文件信息（附件预览场景） */
  file?: FileInfo;
  /** 最大预览宽度 */
  maxWidth?: number;
  /** 最大预览高度 */
  maxHeight?: number;
  /** 紧凑模式（用于附件列表） */
  compact?: boolean;
  /** 是否可删除 */
  removable?: boolean;
}

/**
 * FilePreview 组件 Emits
 */
export interface FilePreviewEmits {
  (e: 'remove'): void;
}
