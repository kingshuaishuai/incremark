<script setup lang="ts">
/**
 * ImPopover - 基础浮动层组件
 * 基于 @floating-ui/vue 实现
 * 支持 hover/click/focus/manual 触发方式
 */

import { ref, computed, watch, CSSProperties } from 'vue';
import { useFloating, offset as offsetMiddleware, flip, shift, arrow as arrowMiddleware, autoUpdate } from '@floating-ui/vue';
import { onClickOutside } from '@vueuse/core';
import { createImBem } from '@incremark/shared';
import type { ImPopoverProps } from './types';

const props = withDefaults(defineProps<ImPopoverProps>(), {
  trigger: 'click',
  placement: 'bottom',
  offset: 8,
  arrow: false,
  disabled: false,
  strategy: 'absolute',
  to: 'body',
  teleportDisabled: false
});

const visible = defineModel<boolean>('visible', { default: false });

const bem = createImBem('popover');

const referenceEl = ref<HTMLElement | null>(null);
const floatingEl = ref<HTMLElement | null>(null);
const arrowEl = ref<HTMLElement | null>(null);

// 构建 middleware
const middleware = computed(() => {
  const list = [offsetMiddleware(props.offset), flip(), shift({ padding: 8 })];
  if (props.arrow) {
    list.push(arrowMiddleware({ element: arrowEl }));
  }
  return list;
});

const { floatingStyles, middlewareData, placement: finalPlacement, isPositioned } = useFloating(referenceEl, floatingEl, {
  placement: computed(() => props.placement),
  strategy: computed(() => props.strategy),
  middleware,
  whileElementsMounted: autoUpdate
});

// 合并 floatingStyles 和 visibility 控制
const popoverStyles = computed<CSSProperties>(() => ({
  ...floatingStyles.value,
  // 在位置计算完成前隐藏，避免从角落飘入
  visibility: isPositioned.value ? 'visible' : 'hidden'
}));

const arrowStyles = computed(() => {
  if (!props.arrow) return {};
  const { x, y } = middlewareData.value.arrow || {};
  const side = finalPlacement.value.split('-')[0];
  const staticSide = { top: 'bottom', right: 'left', bottom: 'top', left: 'right' }[side]!;
  return {
    left: x != null ? `${x}px` : '',
    top: y != null ? `${y}px` : '',
    [staticSide]: '-5px'
  };
});

const teleportTarget = computed(() => {
  const { to } = props;
  return typeof to === 'function' ? to() : to;
});

// 触发逻辑
let hideTimeout: ReturnType<typeof setTimeout> | null = null;

const show = () => {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
  if (!props.disabled) visible.value = true;
};

const hide = () => {
  visible.value = false;
};

const delayedHide = () => {
  hideTimeout = setTimeout(() => {
    hide();
  }, 100);
};

const toggle = () => {
  if (!props.disabled) visible.value = !visible.value;
};

// 点击外部关闭
onClickOutside(floatingEl, (e) => {
  if (props.trigger === 'click' && visible.value) {
    if (referenceEl.value?.contains(e.target as Node)) return;
    hide();
  }
}, { ignore: [referenceEl] });

// hover 模式下 popover 内容的事件处理
const onFloatingMouseenter = () => {
  if (props.trigger === 'hover') {
    show();
  }
};

const onFloatingMouseleave = () => {
  if (props.trigger === 'hover') {
    delayedHide();
  }
};

// 触发器事件
const onTriggerClick = () => {
  if (props.trigger === 'click') {
    toggle();
  }
};

const onTriggerMouseenter = () => {
  if (props.trigger === 'hover') {
    show();
  }
};

const onTriggerMouseleave = () => {
  if (props.trigger === 'hover') {
    delayedHide();
  }
};

const onTriggerFocus = () => {
  if (props.trigger === 'focus') {
    show();
  }
};

const onTriggerBlur = () => {
  if (props.trigger === 'focus') {
    hide();
  }
};

// 暴露方法
defineExpose({
  show,
  hide,
  toggle
});
</script>

<template>
  <span
    ref="referenceEl"
    class="im-popover-trigger"
    @click="onTriggerClick"
    @mouseenter="onTriggerMouseenter"
    @mouseleave="onTriggerMouseleave"
    @focusin="onTriggerFocus"
    @focusout="onTriggerBlur"
  >
    <slot />
  </span>
  <Teleport :to="teleportTarget" :disabled="teleportDisabled">
    <Transition name="im-popover-fade">
      <div
        v-if="visible"
        ref="floatingEl"
        :class="bem()"
        :style="popoverStyles"
        :data-placement="finalPlacement"
        @mouseenter="onFloatingMouseenter"
        @mouseleave="onFloatingMouseleave"
      >
        <slot name="content" />
        <div v-if="arrow" ref="arrowEl" :class="bem('arrow')" :style="arrowStyles" />
      </div>
    </Transition>
  </Teleport>
</template>
