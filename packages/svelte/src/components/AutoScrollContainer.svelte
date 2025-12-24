<!--
  @file AutoScrollContainer.svelte - 自动滚动容器组件
  @description 自动滚动到底部，但尊重用户的手动滚动行为
-->

<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements';

  /**
   * 组件 Props
   */
  interface Props extends HTMLAttributes<HTMLDivElement>{
    /** 是否启用自动滚动 */
    enabled?: boolean
    /** 触发自动滚动的底部阈值（像素） */
    threshold?: number
    /** 滚动行为 */
    behavior?: ScrollBehavior
    /** 子组件 */
    children?: import('svelte').Snippet
  }

  let {
    enabled = true,
    threshold = 50,
    behavior = 'instant',
    children
  }: Props = $props()

  // 容器引用
  let containerRef: HTMLDivElement | null = null

  // 状态
  let isUserScrolledUp = $state(false)

  // 记录上一次滚动位置，用于判断滚动方向
  let lastScrollTop = 0
  let lastScrollHeight = 0
  let observer: MutationObserver | null = null

  /**
   * 检查是否在底部附近
   */
  function isNearBottom(): boolean {
    if (!containerRef) return true
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef
    return scrollHeight - scrollTop - clientHeight <= threshold
  }

  /**
   * 滚动到底部
   */
  function scrollToBottom(force = false): void {
    if (!containerRef) return
    
    // 如果用户手动向上滚动了，且不是强制滚动，则不自动滚动
    if (isUserScrolledUp && !force) return
    
    containerRef.scrollTo({
      top: containerRef.scrollHeight,
      behavior
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
      isUserScrolledUp = false
      lastScrollTop = 0
      lastScrollHeight = scrollHeight
      return
    }
    
    // 检查用户是否滚动到底部附近
    if (isNearBottom()) {
      // 用户滚动到底部，恢复自动滚动
      isUserScrolledUp = false
    } else {
      // 判断是否是用户主动向上滚动
      // 条件：scrollTop 减少（向上滚动）且 scrollHeight 没有变化（不是因为内容增加）
      const isScrollingUp = scrollTop < lastScrollTop
      const isContentUnchanged = scrollHeight === lastScrollHeight
      
      if (isScrollingUp && isContentUnchanged) {
        // 用户主动向上滚动，暂停自动滚动
        isUserScrolledUp = true
      }
    }
    
    // 更新记录
    lastScrollTop = scrollTop
    lastScrollHeight = scrollHeight
  }

  // 监听 slot 内容变化（使用 MutationObserver）
  onMount(() => {
    if (!containerRef) return
    
    // 初始化滚动位置记录
    lastScrollTop = containerRef.scrollTop
    lastScrollHeight = containerRef.scrollHeight
    
    observer = new MutationObserver(() => {
      // 使用 tick 等待 DOM 更新
      setTimeout(() => {
        if (!containerRef) return
        
        // 如果没有滚动条，重置状态
        if (!hasScrollbar()) {
          isUserScrolledUp = false
        }
        
        // 更新 scrollHeight 记录（内容变化后）
        lastScrollHeight = containerRef.scrollHeight
        
        // 自动滚动
        if (enabled && !isUserScrolledUp) {
          scrollToBottom()
        }
      }, 0)
    })
    
    observer.observe(containerRef, {
      childList: true,
      subtree: true,
      characterData: true
    })
  })

  onDestroy(() => {
    observer?.disconnect()
  })

  // 暴露方法（通过 bind:this 或使用 Svelte 5 的方式）
  // 在 Svelte 5 中，可以使用 $props 的 bind:this 或者通过 context 暴露
</script>

<div
  bind:this={containerRef}
  class="auto-scroll-container"
  onscroll={handleScroll}
>
  {#if children}
    {@render children()}
  {/if}
</div>

