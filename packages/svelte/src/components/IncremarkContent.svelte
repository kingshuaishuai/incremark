<!--
  @file IncremarkContent.svelte - 开箱即用的 Markdown 渲染组件
  @description 自动处理流式内容和普通内容的高级组件
-->

<script lang="ts">
  import type { Component } from 'svelte'
  import { useIncremark, type UseIncremarkOptions } from '../stores/useIncremark'
  import type { ComponentMap, IncremarkContentProps } from './types'
  import Incremark from './Incremark.svelte'
  import { get } from 'svelte/store'

  let {
    stream,
    content,
    components = {},
    customContainers = {},
    customCodeBlocks = {},
    codeBlockConfigs = {},
    isFinished = false,
    incremarkOptions,
    pendingClass = 'incremark-pending',
    showBlockStatus = false
  }: IncremarkContentProps = $props()

  // 合并默认选项（初始化时使用）
  const initialOptions: UseIncremarkOptions = {
    gfm: true,
    htmlTree: true,
    containers: true,
    math: true,
    ...incremarkOptions
  }

  const { blocks, append, finalize, render, reset, isDisplayComplete, markdown, typewriter } = useIncremark(initialOptions)

  // 监听 incremarkOptions 的变化，更新 typewriter 配置
  $effect(() => {
    if (incremarkOptions?.typewriter) {
      typewriter.setOptions(incremarkOptions.typewriter)
    }
  })

  // 派生状态
  const isStreamMode = $derived(typeof stream === 'function')

  // 保存前一个 content 值用于增量更新
  let prevContent: string | undefined = $state(undefined)
  let isStreaming = $state(false)

  async function handleStreamInput() {
    if (!stream || isStreaming) return

    isStreaming = true
    try {
      const streamGen = stream()

      for await (const chunk of streamGen) {
        append(chunk)
      }

      finalize()
    } catch (error) {
      console.error('Stream error: ', error)
      finalize()
    } finally {
      isStreaming = false
    }
  }

  function handleContentInput(newContent?: string, oldContent?: string) {
    if (!newContent) {
      if (oldContent) {
        reset()
      }
      return
    }

    if (newContent?.startsWith(oldContent ?? '')) {
      const delta = newContent.slice((oldContent || '').length)
      append(delta)
    } else {
      render(newContent)
    }
  }

  // 监听 content 变化
  $effect(() => {
    if (isStreamMode) {
      handleStreamInput()
    } else {
      handleContentInput(content, prevContent)
    }
    prevContent = content
  })

  // 监听 isFinished 变化
  $effect(() => {
    if (isFinished && content === get(markdown)) {
      finalize()
    }
  })
</script>

<Incremark
  blocks={$blocks}
  isDisplayComplete={$isDisplayComplete}
  {pendingClass}
  {showBlockStatus}
  {components}
  {customContainers}
  {customCodeBlocks}
  {codeBlockConfigs}
/>
