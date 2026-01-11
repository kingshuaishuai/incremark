<!--
  @file OverviewTab.svelte - 概览 Tab
  @description 显示解析统计信息
-->

<script lang="ts">
  import type { DevToolsState } from '../../types'
  import type { DevToolsStoreReturn } from '../../stores/types'

  const NODE_TYPE_COLORS: Record<string, string> = {
    heading: '#3b82f6',
    paragraph: '#22c55e',
    code: '#f59e0b',
    list: '#8b5cf6',
    table: '#ec4899',
    blockquote: '#06b6d4',
    thematicBreak: '#6b7280'
  }

  interface Props {
    devState: DevToolsState
    store: DevToolsStoreReturn
  }

  let { devState, store }: Props = $props()

  const nodeTypeStats = $derived.by(() => {
    const stats: Record<string, number> = {}
    for (const block of devState.blocks) {
      const type = block.node.type
      stats[type] = (stats[type] || 0) + 1
    }
    return stats
  })
</script>

<div class="overview-tab">
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-value">{devState.blocks.length}</div>
      <div class="stat-label">{store.i18n.t('totalBlocks')}</div>
    </div>
    <div class="stat-card completed">
      <div class="stat-value">{devState.completedBlocks.length}</div>
      <div class="stat-label">{store.i18n.t('completed')}</div>
    </div>
    <div class="stat-card pending">
      <div class="stat-value">{devState.pendingBlocks.length}</div>
      <div class="stat-label">{store.i18n.t('pending')}</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">{devState.markdown.length}</div>
      <div class="stat-label">{store.i18n.t('characters')}</div>
    </div>
  </div>

  <div class="section">
    <h4>{store.i18n.t('nodeTypes')}</h4>
    <div class="type-bars">
      {#each Object.entries(nodeTypeStats) as [type, count]}
        <div class="type-bar">
          <span class="type-color" style="background: {NODE_TYPE_COLORS[type] || '#9ca3af'}"></span>
          <span class="type-name">{type}</span>
          <span class="type-count">{count}</span>
        </div>
      {/each}
    </div>
  </div>

  <div class="section">
    <h4>{store.i18n.t('status')}</h4>
    <div class="status-indicator" class:loading={devState.isLoading}>
      {devState.isLoading ? store.i18n.t('statusStreaming') : store.i18n.t('statusComplete')}
    </div>
  </div>
</div>

<style>
  .overview-tab {
    flex: 1;
    overflow-y: auto;
    padding-right: 8px;
    margin-right: -8px;
  }

  .overview-tab::-webkit-scrollbar {
    width: 6px;
  }

  .overview-tab::-webkit-scrollbar-track {
    background: transparent;
  }

  .overview-tab::-webkit-scrollbar-thumb {
    background: #444;
    border-radius: 3px;
  }

  .overview-tab::-webkit-scrollbar-thumb:hover {
    background: #555;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }

  .stat-card {
    background: #2a2a2a;
    padding: 12px;
    border-radius: 8px;
    text-align: center;
  }

  .stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #fff;
  }

  .stat-label {
    font-size: 11px;
    color: #888;
    margin-top: 4px;
  }

  .stat-card.completed .stat-value {
    color: #22c55e;
  }

  .stat-card.pending .stat-value {
    color: #a855f7;
  }

  .section {
    margin-bottom: 20px;
  }

  .section h4 {
    margin: 0 0 12px;
    font-size: 12px;
    color: #888;
    text-transform: uppercase;
  }

  .type-bars {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 200px;
    overflow-y: auto;
  }

  .type-bars::-webkit-scrollbar {
    width: 6px;
  }

  .type-bars::-webkit-scrollbar-track {
    background: transparent;
  }

  .type-bars::-webkit-scrollbar-thumb {
    background: #444;
    border-radius: 3px;
  }

  .type-bar {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .type-color {
    width: 12px;
    height: 12px;
    border-radius: 3px;
  }

  .type-name {
    flex: 1;
  }

  .type-count {
    color: #888;
  }

  .status-indicator {
    padding: 8px 12px;
    background: #2a2a2a;
    border-radius: 6px;
  }

  .status-indicator.loading {
    background: #22c55e20;
    color: #22c55e;
  }

  :global(.light) .stat-card {
    background: #f5f5f5;
  }

  :global(.light) .stat-value {
    color: #333;
  }
</style>
