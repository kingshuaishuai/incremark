/**
 * useSender - Sender 组件核心逻辑
 */

import { computed, type Ref, type ComputedRef } from 'vue';
import type { SenderProps, SenderMessage, SenderEmits, SenderInputRef, SenderAttachment } from '../types';

let attachmentId = 0;

export interface UseSenderOptions {
  props: SenderProps;
  emit: SenderEmits;
  modelValue: Ref<string>;
  attachments: Ref<SenderAttachment[]>;
  inputRef: Ref<SenderInputRef | undefined>;
}

export interface UseSenderReturn {
  /** 是否可以提交 */
  canSubmit: ComputedRef<boolean>;
  /** 提交消息 */
  submit: () => void;
  /** 取消发送 */
  cancel: () => void;
  /** 聚焦输入框 */
  focus: () => void;
  /** 失焦输入框 */
  blur: () => void;
  /** 清空输入框 */
  clear: () => void;
  /** 添加文件 */
  addFiles: (files: File[]) => void;
  /** 移除附件 */
  removeAttachment: (id: string) => void;
}

/**
 * 检查文件类型是否匹配 accept
 */
function isFileTypeAccepted(file: File, accept?: string): boolean {
  if (!accept) return true;

  const acceptTypes = accept.split(',').map(t => t.trim());

  return acceptTypes.some(type => {
    if (type.startsWith('.')) {
      // 扩展名匹配
      return file.name.toLowerCase().endsWith(type.toLowerCase());
    } else if (type.endsWith('/*')) {
      // MIME 类型通配符，如 image/*
      const baseType = type.slice(0, -2);
      return file.type.startsWith(baseType);
    } else {
      // 精确 MIME 类型匹配
      return file.type === type;
    }
  });
}

export function useSender(options: UseSenderOptions): UseSenderReturn {
  const { props, emit, modelValue, attachments, inputRef } = options;

  // 是否可以提交：非禁用、非加载中、内容或附件不为空
  const canSubmit = computed(() => {
    const hasContent = modelValue.value.trim().length > 0;
    const hasAttachments = attachments.value.length > 0;
    return !props.disabled && !props.loading && (hasContent || hasAttachments);
  });

  const submit = () => {
    if (!canSubmit.value) return;

    const message: SenderMessage = {
      content: modelValue.value.trim(),
      attachments: attachments.value.length > 0 ? [...attachments.value] : undefined,
    };

    emit('submit', message);

    // 提交后清空
    if (props.clearOnSubmit !== false) {
      modelValue.value = '';
      attachments.value = [];
      inputRef.value?.clear();
    }
  };

  const cancel = () => {
    emit('cancel');
  };

  const focus = () => {
    inputRef.value?.focus();
  };

  const blur = () => {
    inputRef.value?.blur();
  };

  const clear = () => {
    modelValue.value = '';
    attachments.value = [];
    inputRef.value?.clear();
  };

  const addFiles = (files: File[]) => {
    for (const file of files) {
      // 检查文件类型
      if (!isFileTypeAccepted(file, props.accept)) {
        emit('fileError', { type: 'type', file, message: `不支持的文件类型: ${file.type || file.name}` });
        continue;
      }

      // 检查文件大小
      if (props.maxSize && file.size > props.maxSize) {
        emit('fileError', { type: 'size', file, message: `文件过大: ${file.name}` });
        continue;
      }

      // 检查文件数量
      if (props.maxFiles && attachments.value.length >= props.maxFiles) {
        emit('fileError', { type: 'count', file, message: `最多只能上传 ${props.maxFiles} 个文件` });
        break;
      }

      // 创建附件
      const attachment: SenderAttachment = {
        id: `attachment-${++attachmentId}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        file,
      };

      attachments.value.push(attachment);
    }
  };

  const removeAttachment = (id: string) => {
    const index = attachments.value.findIndex(a => a.id === id);
    if (index !== -1) {
      const attachment = attachments.value[index];
      // 释放 blob URL
      if (attachment.url?.startsWith('blob:')) {
        URL.revokeObjectURL(attachment.url);
      }
      attachments.value.splice(index, 1);
    }
  };

  return {
    canSubmit,
    submit,
    cancel,
    focus,
    blur,
    clear,
    addFiles,
    removeAttachment,
  };
}
