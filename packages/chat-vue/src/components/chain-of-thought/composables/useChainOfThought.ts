/**
 * useChainOfThought - ChainOfThought 组件逻辑
 */

import { computed } from 'vue';
import { formatDuration } from '@incremark/shared';
import type { ChainOfThoughtProps } from '../types';

export function useChainOfThought(props: ChainOfThoughtProps) {
  const duration = computed(() => {
    if (!props.startTime) return null;
    const end = props.endTime || Date.now();
    return formatDuration(end - props.startTime, props.locale);
  });

  return { duration };
}
