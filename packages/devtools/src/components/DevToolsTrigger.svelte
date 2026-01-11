<!--
  @file DevToolsTrigger.svelte - 触发按钮
  @description 悬浮的触发按钮，支持拖拽移动，点击打开/关闭 DevTools 面板
-->

<script lang="ts">
  import type { DevToolsStoreReturn } from '../stores/types'

  interface Props {
    hasLoadingParser: boolean
    parserCount: number
    store: DevToolsStoreReturn
    onToggle: () => void
  }

  let { hasLoadingParser, parserCount, store, onToggle }: Props = $props()

  let isDragging = $state(false)
  let hasMoved = $state(false)
  let startPos = $state({ x: 0, y: 0 })

  function handleMouseDown(e: MouseEvent) {
    if (e.button !== 0) return

    isDragging = true
    hasMoved = false
    startPos = { x: e.clientX, y: e.clientY }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    e.preventDefault()
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging) return

    const deltaX = e.clientX - startPos.x
    const deltaY = e.clientY - startPos.y

    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      hasMoved = true
    }
  }

  function handleMouseUp() {
    isDragging = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  function handleClick(e: MouseEvent) {
    if (hasMoved) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    onToggle()
  }

  function handleTouchStart(e: TouchEvent) {
    const touch = e.touches[0]
    isDragging = true
    hasMoved = false
    startPos = { x: touch.clientX, y: touch.clientY }
  }

  function handleTouchMove(e: TouchEvent) {
    if (!isDragging) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - startPos.x
    const deltaY = touch.clientY - startPos.y

    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      hasMoved = true
    }
  }

  function handleTouchEnd() {
    isDragging = false
  }
</script>

<button
  class="devtools-trigger"
  class:dragging={isDragging}
  title={store.i18n.t('toolTriggerTitle')}
  onmousedown={handleMouseDown}
  onclick={handleClick}
  ontouchstart={handleTouchStart}
  ontouchmove={handleTouchMove}
  ontouchend={handleTouchEnd}
>
  <span>🔧</span>
  {#if hasLoadingParser}
    <span class="loading-dot"></span>
  {/if}
  {#if parserCount > 1}
    <span class="parser-count">{parserCount}</span>
  {/if}
</button>

<style>
  .devtools-trigger {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: none;
    background: #1e1e1e;
    color: white;
    cursor: grab;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    position: relative;
    font-size: 20px;
    transition: background 0.2s, box-shadow 0.2s;
    user-select: none;
    touch-action: none;
  }

  .devtools-trigger:hover {
    background: #2d2d2d;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
  }

  .devtools-trigger:active,
  .devtools-trigger.dragging {
    cursor: grabbing;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  }

  .loading-dot {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 8px;
    height: 8px;
    background: #22c55e;
    border-radius: 50%;
    animation: pulse 1s infinite;
  }

  .parser-count {
    position: absolute;
    bottom: 4px;
    right: 4px;
    min-width: 16px;
    height: 16px;
    background: #3b82f6;
    border-radius: 8px;
    font-size: 10px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
    color: white;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  :global(.light) .devtools-trigger {
    background: #fff;
    color: #333;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  :global(.light) .devtools-trigger:hover {
    background: #f5f5f5;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }
</style>
