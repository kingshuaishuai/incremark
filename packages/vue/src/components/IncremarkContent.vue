<script setup lang="ts">
  import { computed, watch } from 'vue';
  import { useIncremark } from '../composables';
  import { IncremarkContentProps } from '../types';
  import Incremark from './Incremark.vue';

  const props = defineProps<IncremarkContentProps>()

  const incremarkOptions = computed(() => ({
    gfm: true,
    htmlTree: true,
    containers: true,
    math: true,
    ...props.incremarkOptions
  }))

  const { blocks, append, finalize, render, reset, isDisplayComplete, markdown } = useIncremark(incremarkOptions);

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
      return;
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
  />
</template>