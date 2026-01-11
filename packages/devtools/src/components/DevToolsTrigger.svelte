<!--
  @file DevToolsTrigger.svelte - 触发按钮
  @description 悬浮的触发按钮，点击打开/关闭 DevTools 面板
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
</script>

<button class="devtools-trigger" title={store.i18n.t('toolTriggerTitle')} onclick={onToggle}>
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
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    position: relative;
    font-size: 20px;
    transition: all 0.2s;
  }

  .devtools-trigger:hover {
    background: #2d2d2d;
    transform: scale(1.05);
  }

  .devtools-trigger:active {
    transform: scale(0.95);
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
  }
</style>
