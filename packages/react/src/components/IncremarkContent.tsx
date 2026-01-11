import React, { useEffect, useRef, useMemo, useCallback } from 'react'
import { useIncremark } from '../hooks/useIncremark'
import type { IncremarkContentProps } from '../types'
import { Incremark } from './Incremark'
import { IncremarkContainerProvider } from './IncremarkContainerProvider'
import { generateParserId } from '@incremark/shared'

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
 *
 * // 使用 DevTools
 * const devtools = createDevTools()
 * devtools.mount()
 * <IncremarkContent content={content} devtools={devtools} devtoolsId="msg-1" />
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
    showBlockStatus,
    pendingClass,
    devtools,
    devtoolsId,
    devtoolsLabel
  } = props

  // 初始化时使用的选项（使用 ref 保存，只用于首次创建 parser）
  const initialOptionsRef = useRef({
    gfm: true,
    htmlTree: true,
    containers: true,
    math: true,
    ...incremarkOptions
  })

  const incremark = useIncremark(initialOptionsRef.current)
  const { blocks, append, finalize, render, reset, updateOptions, isDisplayComplete, markdown, typewriter, _definitionsContextValue, parser } = incremark

  // DevTools 集成
  const parserIdRef = useRef(devtoolsId || generateParserId())

  useEffect(() => {
    if (devtools) {
      devtools.register(parser, {
        id: parserIdRef.current,
        label: devtoolsLabel || parserIdRef.current
      })

      return () => {
        devtools.unregister(parserIdRef.current)
      }
    }
  }, [devtools, parser, devtoolsLabel])

  // 监听 incremarkOptions 的变化，动态更新配置（包括引擎切换）
  const prevOptionsRef = useRef(incremarkOptions)
  useEffect(() => {
    const prev = prevOptionsRef.current
    const current = incremarkOptions

    // 跳过首次渲染
    if (prev === current) return

    prevOptionsRef.current = current

    // 序列化配置用于比较
    const prevMath = typeof prev?.math === 'object' ? JSON.stringify(prev.math) : String(prev?.math ?? true)
    const currentMath = typeof current?.math === 'object' ? JSON.stringify(current.math) : String(current?.math ?? true)
    const prevAstBuilder = prev?.astBuilder?.name ?? 'default'
    const currentAstBuilder = current?.astBuilder?.name ?? 'default'

    // 检查是否有配置变化（包括 astBuilder）
    if (prevMath !== currentMath ||
        prev?.gfm !== current?.gfm ||
        prev?.htmlTree !== current?.htmlTree ||
        prev?.containers !== current?.containers ||
        prevAstBuilder !== currentAstBuilder) {
      // 调用 updateOptions 更新配置（支持动态切换引擎）
      updateOptions({
        gfm: current?.gfm ?? true,
        math: current?.math ?? true,
        htmlTree: current?.htmlTree ?? true,
        containers: current?.containers ?? true,
        astBuilder: current?.astBuilder
      })
    }

    // typewriter 配置变化通过 setOptions 处理
    if (current?.typewriter) {
      typewriter.setOptions(current.typewriter)
    }
  }, [incremarkOptions, updateOptions, typewriter])

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
        pendingClass={pendingClass}
        components={components}
        customContainers={customContainers}
        customCodeBlocks={customCodeBlocks}
        codeBlockConfigs={codeBlockConfigs}
      />
    </IncremarkContainerProvider>
  )
}
