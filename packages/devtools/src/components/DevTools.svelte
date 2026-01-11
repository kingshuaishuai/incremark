<!--
  @file DevTools.svelte - DevTools 主组件
  @description 包含触发器和面板的完整 DevTools 组件，支持拖拽和 floating-ui 定位
-->

<script lang="ts">
  import type { DevToolsStoreReturn } from '../stores/types'
  import DevToolsTrigger from './DevToolsTrigger.svelte'
  import DevToolsPanel from './DevToolsPanel.svelte'

  interface Props {
    /** DevTools store 实例 */
    store: DevToolsStoreReturn
    /** 主题 */
    theme?: 'dark' | 'light'
  }

  let {
    store,
    theme = 'dark'
  }: Props = $props()

  let containerEl: HTMLDivElement | null = $state(null)
  let triggerEl: HTMLDivElement | null = $state(null)
  let isDragging = $state(false)
  let startPos = $state({ x: 0, y: 0 })
  let currentPos = $state({ x: 0, y: 0 })

  function handleMouseDown(e: MouseEvent) {
    if (e.button !== 0) return

    isDragging = true
    startPos = {
      x: e.clientX - currentPos.x,
      y: e.clientY - currentPos.y
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    e.preventDefault()
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging || !containerEl) return

    currentPos = {
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y
    }
  }

  function handleMouseUp() {
    isDragging = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  function handleTouchStart(e: TouchEvent) {
    const touch = e.touches[0]
    isDragging = true
    startPos = {
      x: touch.clientX - currentPos.x,
      y: touch.clientY - currentPos.y
    }
  }

  function handleTouchMove(e: TouchEvent) {
    if (!isDragging || !containerEl) return

    const touch = e.touches[0]
    currentPos = {
      x: touch.clientX - startPos.x,
      y: touch.clientY - startPos.y
    }
    e.preventDefault()
  }

  function handleTouchEnd() {
    isDragging = false
  }
</script>

<div
  bind:this={containerEl}
  class="incremark-devtools {theme}"
  class:dragging={isDragging}
  style="transform: translate({currentPos.x}px, {currentPos.y}px)"
>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="trigger-wrapper"
    bind:this={triggerEl}
    onmousedown={handleMouseDown}
    ontouchstart={handleTouchStart}
    ontouchmove={handleTouchMove}
    ontouchend={handleTouchEnd}
  >
    <DevToolsTrigger
      {store}
      hasLoadingParser={store.hasLoadingParser}
      parserCount={store.parsersArray.length}
      onToggle={() => store.toggle()}
    />
  </div>
  <DevToolsPanel
    {store}
    isOpen={store.isOpen}
    parsers={store.parsersArray}
    selectedParserId={store.selectedParserId}
    selectedParser={store.selectedParser}
    activeTab={store.activeTab}
    selectedBlockId={store.selectedBlockId}
    referenceEl={triggerEl}
    onClose={() => store.close()}
    onSelectParser={(id) => store.selectParser(id)}
    onSetActiveTab={(tab) => store.setActiveTab(tab)}
    onSelectBlock={(id) => store.selectBlock(id)}
    onClearHistory={() => store.clearHistory()}
  />
</div>

<style>
  .incremark-devtools {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 99999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 13px;
    line-height: 1.5;
    will-change: transform;
  }

  .incremark-devtools.dragging {
    cursor: grabbing;
  }

  .incremark-devtools :global(*) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .trigger-wrapper {
    display: inline-block;
    cursor: grab;
    touch-action: none;
  }

  .trigger-wrapper:active {
    cursor: grabbing;
  }
</style>
