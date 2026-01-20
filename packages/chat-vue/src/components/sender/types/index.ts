/**
 * Sender 组件类型定义
 */

import type { Ref } from 'vue';

/**
 * 提交类型
 * - enter: 按 Enter 发送，Shift+Enter 换行
 * - shiftEnter: 按 Shift+Enter 发送，Enter 换行
 * - manual: 仅通过按钮发送
 */
export type SenderSubmitType = 'enter' | 'shiftEnter' | 'manual';

/**
 * 附件项
 */
export interface SenderAttachment {
  /** 唯一标识 */
  id: string;
  /** 文件名 */
  name: string;
  /** 文件大小（字节） */
  size?: number;
  /** MIME 类型 */
  type?: string;
  /** 预览 URL */
  url?: string;
  /** 原始文件对象 */
  file?: File;
}

/**
 * 提交的消息
 */
export interface SenderMessage {
  /** 消息内容 */
  content: string;
  /** 附件列表 */
  attachments?: SenderAttachment[];
}

/**
 * Sender 组件 Props
 */
export interface SenderProps {
  /** 输入框内容（v-model） */
  modelValue?: string;
  /** 附件列表（v-model:attachments） */
  attachments?: SenderAttachment[];
  /** 占位文本 */
  placeholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否显示边框 */
  bordered?: boolean;
  /** 是否加载中（发送中） */
  loading?: boolean;
  /** 输入框最大高度 */
  maxHeight?: string | number;
  /** 提交方式 */
  submitType?: SenderSubmitType;
  /** 是否在发送后清空输入框 */
  clearOnSubmit?: boolean;
  /** 接受的文件类型，如 'image/*,.pdf' */
  accept?: string;
  /** 最大文件数量 */
  maxFiles?: number;
  /** 单文件最大大小（字节） */
  maxSize?: number;
}

/**
 * Sender 组件 Emits
 * 注意：update:modelValue 由 defineModel 自动处理，无需手动定义
 */
export interface SenderEmits {
  /** 提交消息 */
  (e: 'submit', message: SenderMessage): void;
  /** 取消发送（loading 状态下点击按钮） */
  (e: 'cancel'): void;
  /** 文件校验失败 */
  (e: 'fileError', error: { type: 'type' | 'size' | 'count'; file?: File; message: string }): void;
}

/**
 * Sender 上下文（provide/inject）
 */
export interface SenderContext {
  /** 输入内容 */
  value: Ref<string>;
  /** 附件列表 */
  attachments: Ref<SenderAttachment[]>;
  /** 是否禁用 */
  disabled: Ref<boolean>;
  /** 是否加载中 */
  loading: Ref<boolean>;
  /** 是否可提交 */
  canSubmit: Ref<boolean>;
  /** 提交方法 */
  submit: () => void;
  /** 取消方法 */
  cancel: () => void;
  /** 添加文件 */
  addFiles: (files: File[]) => void;
  /** 移除附件 */
  removeAttachment: (id: string) => void;
  /** 文件配置 */
  fileConfig: {
    accept?: string;
    maxFiles?: number;
    maxSize?: number;
  };
}

/**
 * SenderInput Props
 */
export interface SenderInputProps {
  /** 输入框内容（v-model） */
  modelValue?: string;
  /** 占位文本 */
  placeholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否显示边框 */
  bordered?: boolean;
  /** 输入框最大高度 */
  maxHeight?: string | number;
  /** 提交方式 */
  submitType?: SenderSubmitType;
}

/**
 * SenderInput Emits
 */
export interface SenderInputEmits {
  (e: 'update:modelValue', value: string): void;
  (e: 'focus', event: FocusEvent): void;
  (e: 'blur', event: FocusEvent): void;
  (e: 'submit'): void;
  (e: 'paste'): void;
  (e: 'pasteFile', files: File[]): void;
}

/**
 * SenderSubmitButton Props
 */
export interface SenderSubmitButtonProps {
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否加载中 */
  loading?: boolean;
}

/**
 * SenderActionButton Props
 */
export interface SenderActionButtonProps {
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否激活状态 */
  active?: boolean;
  /** 是否为正方形（仅图标时使用） */
  square?: boolean;
  /** 无障碍标签 */
  ariaLabel?: string;
}

/**
 * SenderInput 组件暴露的方法
 */
export interface SenderInputRef {
  /** 聚焦输入框 */
  focus: () => void;
  /** 失焦输入框 */
  blur: () => void;
  /** 清空输入内容 */
  clear: () => void;
  /** 插入文本 */
  insert: (text: string) => void;
}
