<!--
  @file TimelineTab.svelte - Timeline Tab
  @description 显示 append 历史记录
-->

<script lang="ts">
  import type { AppendRecord } from '../../types'
  import type { DevToolsStoreReturn } from '../../stores/types'

  interface Props {
    appendHistory: AppendRecord[]
    store: DevToolsStoreReturn
    onClearHistory: () => void
  }

  let { appendHistory, store, onClearHistory }: Props = $props()

  function formatTime(timestamp: number): string {
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  }

  function truncate(str: string, len: number): string {
    return str.length > len ? str.slice(0, len) + '...' : str
  }

  function escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }
</script>

<div class="timeline-tab">
  <div class="timeline-header">
    <span>Total {appendHistory.length} {store.i18n.t('totalAppends')}</span>
    <button onclick={onClearHistory}>{store.i18n.t('btnClear')}</button>
  </div>
  <div class="timeline-list">
    {#each appendHistory as record}
      <div class="timeline-item">
        <span class="time">{formatTime(record.timestamp)}</span>
        <span class="chunk">{escapeHtml(truncate(record.chunk.replace(/\n/g, '↵'), 30))}</span>
        <span class="stats">C:{record.completedCount} P:{record.pendingCount}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .timeline-tab {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
  }

  .timeline-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    flex-shrink: 0;
  }

  .timeline-header button {
    padding: 4px 8px;
    border: none;
    background: #333;
    color: #888;
    border-radius: 4px;
    cursor: pointer;
  }

  .timeline-header button:hover {
    background: #444;
    color: #fff;
  }

  .timeline-list {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }

  .timeline-list::-webkit-scrollbar {
    width: 6px;
  }

  .timeline-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .timeline-list::-webkit-scrollbar-thumb {
    background: #444;
    border-radius: 3px;
  }

  .timeline-item {
    display: flex;
    gap: 12px;
    padding: 8px 0;
    border-bottom: 1px solid #333;
    font-size: 12px;
  }

  .timeline-item .time {
    color: #888;
    min-width: 70px;
  }

  .timeline-item .chunk {
    flex: 1;
    color: #22c55e;
    font-family: monospace;
  }

  .timeline-item .stats {
    color: #888;
  }

  :global(.light) .timeline-item {
    border-bottom-color: #e0e0e0;
  }

  :global(.light) .timeline-header button {
    background: #e5e5e5;
    color: #666;
  }

  :global(.light) .timeline-header button:hover {
    background: #f5f5f5;
  }
</style>
