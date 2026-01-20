/**
 * useCopyAction - 复制操作逻辑
 */

import { ref, type Ref } from 'vue';

export interface UseCopyActionOptions {
  /** 复制成功后重置状态的延迟时间 (ms) */
  resetDelay?: number;
}

export interface UseCopyActionReturn {
  /** 是否已复制 */
  copied: Ref<boolean>;
  /** 执行复制 */
  copy: () => Promise<void>;
}

/**
 * 复制操作 composable
 * @param text 要复制的文本 (响应式)
 * @param options 配置选项
 */
export function useCopyAction(
  text: Ref<string>,
  options: UseCopyActionOptions = {}
): UseCopyActionReturn {
  const { resetDelay = 2000 } = options;

  const copied = ref(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text.value);
      copied.value = true;
      setTimeout(() => {
        copied.value = false;
      }, resetDelay);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return { copied, copy };
}
