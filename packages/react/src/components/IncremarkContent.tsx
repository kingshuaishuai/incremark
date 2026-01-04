import React, { useEffect, useRef, useMemo, useCallback } from 'react'
import { useIncremark } from '../hooks/useIncremark'
import type { IncremarkContentProps } from '../types'
import { Incremark } from './Incremark'
import { IncremarkContainerProvider } from './IncremarkContainerProvider'

/**
 * IncremarkContent 组件
 *
 * 提供开箱即用的 Markdown 渲染体验，自动处理流式内容和普通内容
 *
 * @example
 * ```tsx
 * // 普通内容
 * <IncremarkContent content={markdownString} />
 *
 * // 流式内容
 * <IncremarkContent stream={() => streamGenerator()} />
 *
 * // 增量更新内容
 * <IncremarkContent content={partialContent} isFinished={false} />
 * ```
 */
export const IncremarkContent: React.FC<IncremarkContentProps> = (props) => {
  const {
    stream,
    content,
    components,
    customContainers,
    customCodeBlocks,
    codeBlockConfigs,
    isFinished = false,
    incremarkOptions,
    showBlockStatus
  } = props

  // 初始化时使用的选项（使用 ref 避免重建 hook）
  const initialOptionsRef = useRef({
    gfm: true,
    htmlTree: true,
    containers: true,
    math: true,
    ...incremarkOptions
  })

  const { blocks, append, finalize, render, reset, isDisplayComplete, markdown, typewriter, _definitionsContextValue } = useIncremark(initialOptionsRef.current)

  // 监听 incremarkOptions 的变化，更新 typewriter 配置
  useEffect(() => {
    if (incremarkOptions?.typewriter) {
      typewriter.setOptions(incremarkOptions.typewriter)
    }
  }, [incremarkOptions?.typewriter, typewriter])

  const isStreamMode = useMemo(() => typeof stream === 'function', [stream])
  const prevContentRef = useRef<string | undefined>(undefined)
  const isStreamingRef = useRef(false)

  const handleStreamInput = useCallback(async () => {
    if (!stream || isStreamingRef.current) return

    isStreamingRef.current = true
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
      isStreamingRef.current = false
    }
  }, [stream, append, finalize])

  const handleContentInput = useCallback((newContent?: string, oldContent?: string) => {
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
  }, [append, render, reset])

  // 监听 content 变化
  useEffect(() => {
    if (isStreamMode) {
      handleStreamInput()
    } else {
      handleContentInput(content, prevContentRef.current)
    }
    prevContentRef.current = content
  }, [content, isStreamMode, handleStreamInput, handleContentInput])

  // 监听 isFinished 变化
  useEffect(() => {
    if (isFinished && content === markdown) {
      finalize()
    }
  }, [isFinished, content, markdown, finalize])

  return (
    <IncremarkContainerProvider definitions={_definitionsContextValue}>
      <Incremark
        blocks={blocks}
        isDisplayComplete={isDisplayComplete}
        showBlockStatus={showBlockStatus}
        components={components}
        customContainers={customContainers}
        customCodeBlocks={customCodeBlocks}
        codeBlockConfigs={codeBlockConfigs}
      />
    </IncremarkContainerProvider>
  )
}
