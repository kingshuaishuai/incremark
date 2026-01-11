<script setup lang="ts">
  import { computed, watch, onMounted, onUnmounted } from 'vue';
  import { useIncremark } from '../composables';
  import { IncremarkContentProps } from '../types';
  import Incremark from './Incremark.vue';
  import { generateParserId } from '@incremark/shared';

  const props = defineProps<IncremarkContentProps>()

  const incremarkOptions = computed(() => ({
    gfm: true,
    htmlTree: true,
    containers: true,
    math: true,
    ...props.incremarkOptions
  }))

  const incremark = useIncremark(incremarkOptions);
  const { blocks, append, finalize, render, reset, isDisplayComplete, markdown } = incremark;

  // DevTools 集成
  const parserId = props.devtoolsId || generateParserId()

  onMounted(() => {
    // 如果传入了 devtools，注册当前 parser
    // 由于 devtools 支持待注册队列，即使 mount() 还没完成也能正常注册
    if (props.devtools) {
      props.devtools.register(incremark.parser, {
        id: parserId,
        label: props.devtoolsLabel || parserId
      })
    }
  })

  onUnmounted(() => {
    // 组件销毁时注销
    if (props.devtools) {
      props.devtools.unregister(parserId)
    }
  })

  const isStreamMode = computed(() => typeof props.stream === 'function');

  async function handleStreamInput() {
    if (!props.stream) return;

    try {
      const stream = props.stream();

      for await (const chunk of stream) {
        append(chunk);
      }

      finalize();
    } catch (error) {
      console.error('Stream error: ', error);
      finalize();
    }
  }

  function handleContentInput(newContent?: string, oldContent?: string) {
    if (!newContent) {
      if (oldContent) {
        reset();
      }
      return;
    }

    if (newContent?.startsWith(oldContent ?? '')) {
      const delta = newContent.slice((oldContent || '').length)
      append(delta);
    } else {
      render(newContent);
    }
  }

  watch(() => props.content, async (newContent, oldContent) => {
    if (isStreamMode.value) {
      await handleStreamInput();
    } else {
      handleContentInput(newContent, oldContent);
    }
  }, { immediate: true });

  watch(() => props.isFinished, (newIsFinished) => {
    if (newIsFinished && props.content === markdown.value) {
      finalize();
    }
  }, { immediate: true })
</script>

<template>
  <Incremark
    :blocks="blocks"
    :pending-class="pendingClass"
    :is-display-complete="isDisplayComplete"
    :show-block-status="showBlockStatus"
    :components="components"
    :custom-containers="customContainers"
    :custom-code-blocks="customCodeBlocks"
    :code-block-configs="codeBlockConfigs"
  />
</template>
