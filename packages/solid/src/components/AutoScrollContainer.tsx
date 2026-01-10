/* @jsxImportSource solid-js */

import { Component, createEffect, createSignal, onCleanup, onMount, JSX } from 'solid-js'
import type { Accessor } from 'solid-js'

export interface AutoScrollContainerProps extends JSX.HTMLAttributes<HTMLDivElement> {
  /** 是否启用自动滚动 */
  enabled?: Accessor<boolean> | boolean
  /** 触发自动滚动的底部阈值（像素） */
  threshold?: number
  /** 滚动行为 */
  behavior?: ScrollBehavior
}

/**
 * 自动滚动容器组件
 *
 * 当内容更新时自动滚动到底部，除非用户手动向上滚动
 */
export const AutoScrollContainer: Component<AutoScrollContainerProps> = (props) => {
  let containerRef: HTMLDivElement | undefined

  const [isUserScrolledUp, setIsUserScrolledUp] = createSignal(false)

  // 记录上一次滚动位置，用于判断滚动方向
  let lastScrollTop = 0
  let lastScrollHeight = 0

  const enabled = () => typeof props.enabled === 'function' ? props.enabled() : props.enabled ?? true
  const threshold = () => props.threshold ?? 50
  const scrollBehavior = () => props.behavior ?? 'instant'

  /**
   * 检查是否在底部附近
   */
  function isNearBottom(): boolean {
    if (!containerRef) return true

    const { scrollTop, scrollHeight, clientHeight } = containerRef
    return scrollHeight - scrollTop - clientHeight <= threshold()
  }

  /**
   * 滚动到底部
   */
  function scrollToBottom(force = false): void {
    if (!containerRef) return

    // 如果用户手动向上滚动了，且不是强制滚动，则不自动滚动
    if (isUserScrolledUp() && !force) return

    containerRef.scrollTo({
      top: containerRef.scrollHeight,
      behavior: scrollBehavior()
    })
  }

  /**
   * 检查是否有滚动条
   */
  function hasScrollbar(): boolean {
    if (!containerRef) return false
    return containerRef.scrollHeight > containerRef.clientHeight
  }

  /**
   * 处理滚动事件
   */
  function handleScroll(): void {
    if (!containerRef) return

    const { scrollTop, scrollHeight, clientHeight } = containerRef

    // 如果没有滚动条，恢复自动滚动
    if (scrollHeight <= clientHeight) {
      setIsUserScrolledUp(false)
      lastScrollTop = 0
      lastScrollHeight = scrollHeight
      return
    }

    // 检查用户是否滚动到底部附近
    if (isNearBottom()) {
      // 用户滚动到底部，恢复自动滚动
      setIsUserScrolledUp(false)
    } else {
      // 判断是否是用户主动向上滚动
      // 条件：scrollTop 减少（向上滚动）且 scrollHeight 没有变化（不是因为内容增加）
      const isScrollingUp = scrollTop < lastScrollTop
      const isContentUnchanged = scrollHeight === lastScrollHeight

      if (isScrollingUp && isContentUnchanged) {
        // 用户主动向上滚动，暂停自动滚动
        setIsUserScrolledUp(true)
      }
    }

    // 更新记录
    lastScrollTop = scrollTop
    lastScrollHeight = scrollHeight
  }

  // 监听内容变化（使用 MutationObserver）
  let observer: MutationObserver | null = null

  onMount(() => {
    if (!containerRef) return

    // 初始化滚动位置记录
    lastScrollTop = containerRef.scrollTop
    lastScrollHeight = containerRef.scrollHeight

    observer = new MutationObserver(() => {
      // 使用 requestAnimationFrame 避免 layout thrashing
      requestAnimationFrame(() => {
        if (!containerRef) return

        // 如果没有滚动条，重置状态
        if (!hasScrollbar()) {
          setIsUserScrolledUp(false)
        }

        // 更新 scrollHeight 记录（内容变化后）
        lastScrollHeight = containerRef.scrollHeight

        // 自动滚动
        if (enabled() && !isUserScrolledUp()) {
          scrollToBottom()
        }
      })
    })

    observer.observe(containerRef, {
      childList: true,
      subtree: true,
      characterData: true
    })
  })

  onCleanup(() => {
    observer?.disconnect()
  })

  return (
    <div
      ref={containerRef}
      class="auto-scroll-container"
      onScroll={handleScroll}
    >
      {props.children}
    </div>
  )
}
