/* @jsxImportSource solid-js */

import { Component, createEffect, createMemo, onMount } from 'solid-js'
import type { JSX } from 'solid-js'
import { useIncremark } from '../composables/useIncremark'
import type { IncremarkContentProps } from '../types'
import Incremark from './Incremark'

/**
 * IncremarkContent 组件
 *
 * 全合一组件，自动处理流式和内容模式
 */
export const IncremarkContent: Component<IncremarkContentProps> = (props) => {
  const incremarkOptions = () => ({
    gfm: true,
    htmlTree: true,
    containers: true,
    math: true,
    ...props.incremarkOptions
  })

  const { blocks, append, finalize, render, reset, isDisplayComplete, markdown, contextValue, DefinationsProvider } = useIncremark(incremarkOptions)

  const isStreamMode = () => typeof props.stream === 'function'

  async function handleStreamInput() {
    if (!props.stream) return

    try {
      const stream = props.stream()

      for await (const chunk of stream) {
        append(chunk)
      }

      finalize()
    } catch (error) {
      console.error('Stream error: ', error)
      finalize()
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
  createEffect(() => {
    const newContent = props.content

    if (isStreamMode()) {
      handleStreamInput()
    } else {
      handleContentInput(newContent, markdown())
    }
  })

  // 监听 isFinished 变化
  createEffect(() => {
    const newIsFinished = props.isFinished
    if (newIsFinished && props.content === markdown()) {
      finalize()
    }
  })

  return (
    <DefinationsProvider value={contextValue}>
      <Incremark
        blocks={blocks}
        pendingClass={props.pendingClass}
        isDisplayComplete={isDisplayComplete()}
        showBlockStatus={props.showBlockStatus}
        components={props.components}
        customContainers={props.customContainers}
        customCodeBlocks={props.customCodeBlocks}
        codeBlockConfigs={props.codeBlockConfigs}
      />
    </DefinationsProvider>
  )
}

export default IncremarkContent
