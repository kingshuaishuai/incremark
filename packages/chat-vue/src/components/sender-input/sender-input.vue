<script setup lang="ts">
/**
 * SenderInput - 消息输入框组件
 * 基于 Tiptap 编辑器，支持 Markdown 输入和快捷键提交
 */

import { computed, nextTick, ref, watch } from 'vue';
import { createImBem } from '@incremark/shared';
import { EditorContent, useEditor } from '@tiptap/vue-3';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { Placeholder, UndoRedo } from '@tiptap/extensions';
import { Markdown } from '@tiptap/markdown';
import type { SenderInputEmits, SenderInputProps } from './types';

const defaultPlaceholder = 'Type something...';

const props = withDefaults(defineProps<SenderInputProps>(), {
  placeholder: defaultPlaceholder,
  disabled: false,
  bordered: false,
  submitType: 'enter',
});

const emit = defineEmits<SenderInputEmits>();

const modelValue = defineModel<string>('modelValue', { default: '' });

const bem = createImBem('sender-input');

// 用于追踪内容变化来源，避免循环更新
const modelValueChangeByEditor = ref(false);
const setContentByModelValue = ref(false);

/**
 * 处理键盘提交事件
 * @returns true 表示已处理（阻止 Tiptap 继续处理），false 表示未处理
 */
const handleKeyDown = (event: KeyboardEvent): boolean => {
  if (props.disabled) return false;

  const isEnter = event.key === 'Enter';
  const hasShift = event.shiftKey;
  const hasMeta = event.metaKey || event.ctrlKey;

  if (!isEnter) return false;

  // Cmd/Ctrl + Enter 总是提交
  if (hasMeta) {
    event.preventDefault();
    emit('submit');
    return true;
  }

  // 根据 submitType 决定行为
  if (props.submitType === 'enter' && !hasShift) {
    event.preventDefault();
    emit('submit');
    return true;
  } else if (props.submitType === 'shiftEnter' && hasShift) {
    event.preventDefault();
    emit('submit');
    return true;
  }

  // manual 模式或其他情况，让 Tiptap 继续处理
  return false;
};

const editor = useEditor({
  editorProps: {
    editable: () => !props.disabled,
    attributes: {
      class: bem('editor'),
    },
    handleKeyDown: (_view, event) => {
      return handleKeyDown(event);
    },
    handlePaste: (_view, event) => {
      const files = Array.from(event.clipboardData?.files || []);
      if (files.length > 0) {
        emit('pasteFile', files);
        return true;
      }
      return false;
    },
  },
  content: modelValue.value,
  extensions: [
    Markdown,
    Document,
    Paragraph.configure(),
    Text,
    Placeholder.configure({
      placeholder: () => props.placeholder || defaultPlaceholder,
      showOnlyWhenEditable: false,
    }),
    UndoRedo,
  ],
  onFocus: (options) => {
    emit('focus', options.event);
  },
  onBlur: (options) => {
    emit('blur', options.event);
  },
  onUpdate: (options) => {
    if (setContentByModelValue.value) {
      setContentByModelValue.value = false;
      return;
    }

    const markdownContent = options.editor.getMarkdown().trim();

    if (markdownContent === modelValue.value) {
      return;
    }

    modelValueChangeByEditor.value = true;
    modelValue.value = markdownContent;
  },
});

// 监听 placeholder 变化
watch(() => props.placeholder, (newPlaceholder) => {
  const newPlaceholderValue = newPlaceholder || defaultPlaceholder;
  editor.value?.commands.setMeta('placeholder', newPlaceholderValue);
});

// 监听外部 modelValue 变化
watch(modelValue, (newVal) => {
  if (modelValueChangeByEditor.value) {
    modelValueChangeByEditor.value = false;
    return;
  }

  const newContent = newVal ?? '';
  setContentByModelValue.value = true;
  editor.value?.commands.setContent(newContent);
});

// 监听 disabled 变化
watch(() => props.disabled, (newDisable) => {
  editor.value?.setEditable(!newDisable);
});

const maxHeightValue = computed(() => {
  if (!props.maxHeight) return undefined;
  return typeof props.maxHeight === 'number'
    ? `${props.maxHeight}px`
    : props.maxHeight;
});

const handleClick = () => {
  nextTick(() => {
    if (editor.value?.isEditable && !editor.value.isFocused) {
      editor.value?.commands.focus();
    }
  });
};

// 暴露方法
const focus = () => {
  editor.value?.commands.focus();
};

const blur = () => {
  editor.value?.commands.blur();
};

const clear = () => {
  editor.value?.commands.clearContent();
  modelValue.value = '';
};

const insert = (text: string) => {
  editor.value?.commands.insertContent(text);
};

defineExpose({
  focus,
  blur,
  clear,
  insert,
});
</script>

<template>
  <EditorContent
    :class="bem('', {
      bordered: props.bordered,
      disabled: props.disabled,
    })"
    :style="{
      '--im-sender-input-max-height': maxHeightValue,
    }"
    :editor="editor"
    @click="handleClick"
  />
</template>
