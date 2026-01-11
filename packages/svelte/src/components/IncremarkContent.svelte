<!--
  @file IncremarkContent.svelte - 开箱即用的 Markdown 渲染组件
  @description 自动处理流式内容和普通内容的高级组件
-->

<script lang="ts">
  import { useIncremark } from '../stores/useIncremark.svelte.ts'
  import type { IncremarkContentProps } from './types'
  import Incremark from './Incremark.svelte'
  import { untrack, onDestroy } from 'svelte'
  import { generateParserId } from '@incremark/shared'

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
    showBlockStatus = false,
    devtools,
    devtoolsId,
    devtoolsLabel
  }: IncremarkContentProps = $props()

  // 创建 incremark 实例（只创建一次）
  const incremark = untrack(() => useIncremark({
    gfm: incremarkOptions?.gfm ?? true,
    htmlTree: incremarkOptions?.htmlTree ?? true,
    containers: incremarkOptions?.containers ?? true,
    math: incremarkOptions?.math ?? true,
    astBuilder: incremarkOptions?.astBuilder,
    typewriter: incremarkOptions?.typewriter
  }))

  // DevTools 集成 - 生成稳定的默认 ID（只生成一次）
  const defaultParserId = generateParserId()

  $effect(() => {
    if (devtools) {
      const id = devtoolsId || defaultParserId
      devtools.register(incremark.parser, {
        id,
        label: devtoolsLabel || id
      })

      return () => {
        devtools.unregister(id)
      }
    }
  })

  // 计算 parser 配置的稳定 key（用于检测变化）
  // astBuilder 用名称标识，因为它是类不能 JSON.stringify
  function getConfigKey() {
    const { typewriter: _, astBuilder, ...parserOptions } = incremarkOptions ?? {}
    return JSON.stringify(parserOptions) + '|' + (astBuilder?.name ?? 'default')
  }

  // 监听 parser 配置变化，使用 updateOptions 动态更新（不重建实例）
  let prevConfigKey = getConfigKey()
  let isFirstRender = true
  $effect(() => {
    const currentConfigKey = getConfigKey()
    if (isFirstRender) {
      isFirstRender = false
      return
    }
    if (prevConfigKey !== currentConfigKey) {
      prevConfigKey = currentConfigKey
      // 使用 updateOptions 动态更新配置（包括引擎切换）
      incremark.updateOptions({
        gfm: incremarkOptions?.gfm ?? true,
        htmlTree: incremarkOptions?.htmlTree ?? true,
        containers: incremarkOptions?.containers ?? true,
        math: incremarkOptions?.math ?? true,
        astBuilder: incremarkOptions?.astBuilder
      })
    }
  })

  // 监听 incremarkOptions 的变化，更新 typewriter 配置
  $effect(() => {
    if (incremarkOptions?.typewriter) {
      incremark.typewriter.setOptions(incremarkOptions.typewriter)
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
        incremark.append(chunk)
      }

      incremark.finalize()
    } catch (error) {
      console.error('Stream error: ', error)
      incremark.finalize()
    } finally {
      isStreaming = false
    }
  }

  function handleContentInput(newContent?: string, oldContent?: string) {
    if (!newContent) {
      if (oldContent) {
        incremark.reset()
      }
      return
    }

    if (newContent?.startsWith(oldContent ?? '')) {
      const delta = newContent.slice((oldContent || '').length)
      incremark.append(delta)
    } else {
      incremark.render(newContent)
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
    if (isFinished && content === incremark.markdown) {
      incremark.finalize()
    }
  })
</script>

<Incremark
  blocks={incremark.blocks}
  isDisplayComplete={incremark.isDisplayComplete}
  {pendingClass}
  {showBlockStatus}
  {components}
  {customContainers}
  {customCodeBlocks}
  {codeBlockConfigs}
/>
