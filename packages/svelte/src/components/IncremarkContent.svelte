<!--
  @file IncremarkContent.svelte - 开箱即用的 Markdown 渲染组件
  @description 自动处理流式内容和普通内容的高级组件
-->

<script lang="ts">
  import { useIncremark, type UseIncremarkOptions } from '../stores/useIncremark'
  import type { IncremarkContentProps } from './types'
  import Incremark from './Incremark.svelte'
  import { get } from 'svelte/store'
  import { untrack } from 'svelte'

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

  // 创建稳定的 incremark 实例
  // 使用 untrack 读取初始值，因为 useIncremark 只需初始化一次
  // 后续的配置更新通过 typewriter.setOptions 在 $effect 中处理
  const incremarkInstance = untrack(() => useIncremark({
    gfm: incremarkOptions?.gfm ?? true,
    htmlTree: incremarkOptions?.htmlTree ?? true,
    containers: incremarkOptions?.containers ?? true,
    math: incremarkOptions?.math ?? true,
    typewriter: incremarkOptions?.typewriter
  }))
  const { blocks, append, finalize, render, reset, isDisplayComplete, markdown, typewriter } = incremarkInstance

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
