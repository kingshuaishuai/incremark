<!--
  @file BlocksTab.svelte - Blocks Tab
  @description 显示解析的 blocks 列表和详情
-->

<script lang="ts">
  import type { DevToolsState } from '../../types'
  import type { DevToolsStoreReturn } from '../../stores/types'
  import JSONFormatter from 'json-formatter-js'

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
    selectedBlockId: string | null
    onSelectBlock: (id: string | null) => void
  }

  let { devState, store, selectedBlockId, onSelectBlock }: Props = $props()

  const selectedBlock = $derived(
    devState.blocks.find(b => b.id === selectedBlockId)
  )

  let jsonContainerRef: HTMLDivElement | undefined = $state()

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

  async function handleCopy(data: unknown) {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  // 渲染 JSON 树
  $effect(() => {
    if (selectedBlock && jsonContainerRef) {
      const formatter = new JSONFormatter(selectedBlock.node, 2, {
        theme: 'dark',
        animateOpen: false,
        animateClose: false
      })
      jsonContainerRef.innerHTML = ''
      jsonContainerRef.appendChild(formatter.render())

      return () => {
        if (jsonContainerRef) {
          jsonContainerRef.innerHTML = ''
        }
      }
    }
  })
</script>

<div class="blocks-tab">
  <div class="blocks-list">
    {#each devState.blocks as block}
      <button
        class="block-item"
        class:selected={block.id === selectedBlockId}
        onclick={() => onSelectBlock(block.id)}
      >
        <span class="block-status" class:completed={block.status === 'completed'} class:pending={block.status === 'pending'}></span>
        <span class="block-type" style="color: {NODE_TYPE_COLORS[block.node.type] || '#9ca3af'}">
          {block.node.type}
        </span>
        <span class="block-preview">{truncate(block.rawText, 50)}</span>
      </button>
    {/each}
  </div>

  {#if selectedBlock}
    <div class="block-detail">
      <div class="detail-header">
        <h4>{store.i18n.t('blockDetails')}</h4>
        <button class="copy-btn" onclick={() => handleCopy(selectedBlock?.node)}>{store.i18n.t('btnCopy')}</button>
      </div>
      <div class="detail-row">
        <span class="label">{store.i18n.t('blockId')}:</span>
        <span class="value">{selectedBlock.id}</span>
      </div>
      <div class="detail-row">
        <span class="label">{store.i18n.t('blockType')}:</span>
        <span class="value">{selectedBlock.node.type}</span>
      </div>
      <div class="detail-row">
        <span class="label">{store.i18n.t('blockStatus')}:</span>
        <span class="value" class:completed={selectedBlock.status === 'completed'} class:pending={selectedBlock.status === 'pending'}>
          {selectedBlock.status}
        </span>
      </div>
      <h5>{store.i18n.t('rawText')}</h5>
      <pre class="raw-text">{escapeHtml(selectedBlock.rawText)}</pre>
      <h5>{store.i18n.t('astNode')}</h5>
      <div class="json-tree" bind:this={jsonContainerRef}></div>
    </div>
  {:else}
    <div class="empty-hint">{store.i18n.t('selectBlockHint')}</div>
  {/if}
</div>

<style>
  .blocks-tab {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
  }

  .blocks-list {
    max-height: 180px;
    min-height: 100px;
    overflow-y: auto;
    margin-bottom: 12px;
    flex-shrink: 0;
  }

  .blocks-list::-webkit-scrollbar {
    width: 6px;
  }

  .blocks-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .blocks-list::-webkit-scrollbar-thumb {
    background: #444;
    border-radius: 3px;
  }

  .block-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    cursor: pointer;
    border-radius: 6px;
    width: 100%;
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
  }

  .block-item:hover {
    background: #2a2a2a;
  }

  .block-item.selected {
    background: #3b82f620;
  }

  .block-status {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #888;
  }

  .block-status.completed {
    background: #22c55e;
  }

  .block-status.pending {
    background: #a855f7;
  }

  .block-type {
    font-weight: 600;
    min-width: 80px;
  }

  .block-preview {
    color: #888;
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .block-detail {
    flex: 1;
    min-height: 0;
    background: #2a2a2a;
    padding: 12px;
    border-radius: 8px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .block-detail::-webkit-scrollbar {
    width: 6px;
  }

  .block-detail::-webkit-scrollbar-track {
    background: transparent;
  }

  .block-detail::-webkit-scrollbar-thumb {
    background: #555;
    border-radius: 3px;
  }

  .block-detail :global(h4),
  .block-detail :global(h5) {
    margin: 0 0 8px;
    font-size: 12px;
    color: #888;
    flex-shrink: 0;
  }

  .block-detail :global(h5) {
    margin-top: 12px;
  }

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    flex-shrink: 0;
  }

  .detail-header h4 {
    margin: 0;
  }

  .detail-row {
    display: flex;
    gap: 8px;
    margin-bottom: 4px;
    flex-shrink: 0;
  }

  .detail-row .label {
    color: #888;
    min-width: 50px;
  }

  .detail-row .value.completed {
    color: #22c55e;
  }

  .detail-row .value.pending {
    color: #a855f7;
  }

  .empty-hint {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #888;
    font-size: 13px;
    background: #2a2a2a;
    border-radius: 8px;
  }

  .copy-btn {
    padding: 4px 10px;
    border: none;
    background: #444;
    color: #ccc;
    border-radius: 4px;
    cursor: pointer;
    font-size: 11px;
    transition: all 0.2s;
  }

  .copy-btn:hover {
    background: #555;
    color: #fff;
  }

  .raw-text {
    background: #1a1a1a;
    padding: 12px;
    border-radius: 6px;
    overflow-x: auto;
    font-size: 11px;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 120px;
    font-family: monospace;
    flex-shrink: 0;
  }

  .json-tree {
    flex: 1;
    min-height: 100px;
    background: #1a1a1a;
    padding: 12px;
    border-radius: 6px;
    overflow: auto;
    font-size: 12px;
  }

  .json-tree :global(.json-formatter-row) {
    line-height: 1.4;
  }

  :global(.light) .block-item:hover {
    background: #f5f5f5;
  }

  :global(.light) .block-item.selected {
    background: #3b82f620;
  }

  :global(.light) .block-detail {
    background: #f5f5f5;
  }

  :global(.light) .empty-hint {
    background: #f5f5f5;
  }

  :global(.light) .copy-btn {
    background: #ddd;
    color: #666;
  }

  :global(.light) .copy-btn:hover {
    background: #ccc;
    color: #333;
  }

  :global(.light) .raw-text,
  :global(.light) .json-tree {
    background: #eee;
  }
</style>
