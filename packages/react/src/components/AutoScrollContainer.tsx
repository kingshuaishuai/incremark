import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
  forwardRef,
  useImperativeHandle
} from 'react'

export interface AutoScrollContainerProps {
  /** 子元素 */
  children: React.ReactNode
  /** 是否启用自动滚动 */
  enabled?: boolean
  /** 触发自动滚动的底部阈值（像素） */
  threshold?: number
  /** 滚动行为 */
  behavior?: ScrollBehavior
  /** 容器样式 */
  style?: React.CSSProperties
  /** 容器类名 */
  className?: string
}

export interface AutoScrollContainerRef {
  /** 强制滚动到底部 */
  scrollToBottom: () => void
  /** 是否用户手动向上滚动了 */
  isUserScrolledUp: () => boolean
  /** 容器元素引用 */
  container: HTMLDivElement | null
}

/**
 * 自动滚动容器
 *
 * 当内容更新时自动滚动到底部。
 * 如果用户手动向上滚动，则暂停自动滚动，直到用户再次滚动到底部。
 *
 * @example
 * ```tsx
 * const scrollRef = useRef<AutoScrollContainerRef>(null)
 *
 * <AutoScrollContainer ref={scrollRef} enabled={true}>
 *   <Incremark blocks={blocks} />
 * </AutoScrollContainer>
 *
 * // 强制滚动到底部
 * scrollRef.current?.scrollToBottom()
 * ```
 */
export const AutoScrollContainer = forwardRef<AutoScrollContainerRef, AutoScrollContainerProps>(
  (
    {
      children,
      enabled = true,
      threshold = 50,
      behavior = 'instant',
      style,
      className
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isUserScrolledUp, setIsUserScrolledUp] = useState(false)
    
    // 记录上一次滚动位置，用于判断滚动方向
    const lastScrollTopRef = useRef(0)
    const lastScrollHeightRef = useRef(0)

    /**
     * 检查是否在底部附近
     */
    const isNearBottom = useCallback((): boolean => {
      const container = containerRef.current
      if (!container) return true

      const { scrollTop, scrollHeight, clientHeight } = container
      return scrollHeight - scrollTop - clientHeight <= threshold
    }, [threshold])

    /**
     * 滚动到底部
     */
    const scrollToBottom = useCallback(
      (force = false): void => {
        const container = containerRef.current
        if (!container) return

        // 如果用户手动向上滚动了，且不是强制滚动，则不自动滚动
        if (isUserScrolledUp && !force) return

        container.scrollTo({
          top: container.scrollHeight,
          behavior
        })
      },
      [isUserScrolledUp, behavior]
    )

    /**
     * 检查是否有滚动条
     */
    const hasScrollbar = useCallback((): boolean => {
      const container = containerRef.current
      if (!container) return false
      return container.scrollHeight > container.clientHeight
    }, [])

    /**
     * 处理滚动事件
     */
    const handleScroll = useCallback((): void => {
      const container = containerRef.current
      if (!container) return

      const { scrollTop, scrollHeight, clientHeight } = container
      
      // 如果没有滚动条，恢复自动滚动
      if (scrollHeight <= clientHeight) {
        setIsUserScrolledUp(false)
        lastScrollTopRef.current = 0
        lastScrollHeightRef.current = scrollHeight
        return
      }
      
      // 检查用户是否滚动到底部附近
      if (isNearBottom()) {
        // 用户滚动到底部，恢复自动滚动
        setIsUserScrolledUp(false)
      } else {
        // 判断是否是用户主动向上滚动
        // 条件：scrollTop 减少（向上滚动）且 scrollHeight 没有变化（不是因为内容增加）
        const isScrollingUp = scrollTop < lastScrollTopRef.current
        const isContentUnchanged = scrollHeight === lastScrollHeightRef.current
        
        if (isScrollingUp && isContentUnchanged) {
          // 用户主动向上滚动，暂停自动滚动
          setIsUserScrolledUp(true)
        }
      }
      
      // 更新记录
      lastScrollTopRef.current = scrollTop
      lastScrollHeightRef.current = scrollHeight
    }, [isNearBottom])

    // 初始化滚动位置记录
    useEffect(() => {
      const container = containerRef.current
      if (container) {
        lastScrollTopRef.current = container.scrollTop
        lastScrollHeightRef.current = container.scrollHeight
      }
    }, [])

    // 监听内容变化
    useEffect(() => {
      const container = containerRef.current
      if (!container || !enabled) return

      const observer = new MutationObserver(() => {
        // 使用 requestAnimationFrame 确保 DOM 更新完成
        requestAnimationFrame(() => {
          if (!containerRef.current) return
          
          const { scrollHeight, clientHeight } = containerRef.current
          
          // 如果没有滚动条，重置状态
          if (scrollHeight <= clientHeight) {
            setIsUserScrolledUp(false)
          }
          
          // 更新 scrollHeight 记录（内容变化后）
          lastScrollHeightRef.current = scrollHeight
          
          // 自动滚动
          if (!isUserScrolledUp) {
            scrollToBottom()
          }
        })
      })

      observer.observe(container, {
        childList: true,
        subtree: true,
        characterData: true
      })

      return () => observer.disconnect()
    }, [enabled, isUserScrolledUp, scrollToBottom])

    // 暴露方法给父组件
    useImperativeHandle(
      ref,
      () => ({
        scrollToBottom: () => scrollToBottom(true),
        isUserScrolledUp: () => isUserScrolledUp,
        container: containerRef.current
      }),
      [scrollToBottom, isUserScrolledUp]
    )

    return (
      <div
        ref={containerRef}
        className={`auto-scroll-container ${className || ''}`.trim()}
        style={{
          overflowY: 'auto',
          height: '100%',
          ...style
        }}
        onScroll={handleScroll}
      >
        {children}
      </div>
    )
  }
)

AutoScrollContainer.displayName = 'AutoScrollContainer'
