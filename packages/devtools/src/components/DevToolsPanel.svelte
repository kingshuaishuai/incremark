<!--
  @file DevToolsPanel.svelte - 面板组件
  @description DevTools 主面板，包含 header 和 tabs
-->

<script lang="ts">
  import type { ParserRegistration, TabType } from '../types'
  import type { DevToolsStoreReturn } from '../stores/types'
  import { OverviewTab, BlocksTab, AstTab, TimelineTab } from './tabs/index'

  interface Props {
    isOpen: boolean
    parsers: ParserRegistration[]
    selectedParserId: string | null
    selectedParser: ParserRegistration | null
    activeTab: TabType
    selectedBlockId: string | null
    store: DevToolsStoreReturn
    onClose: () => void
    onSelectParser: (id: string) => void
    onSetActiveTab: (tab: TabType) => void
    onSelectBlock: (id: string | null) => void
    onClearHistory: () => void
  }

  let {
    isOpen,
    parsers,
    selectedParserId,
    selectedParser,
    activeTab,
    selectedBlockId,
    store,
    onClose,
    onSelectParser,
    onSetActiveTab,
    onSelectBlock,
    onClearHistory
  }: Props = $props()

  const tabs: TabType[] = ['overview', 'blocks', 'ast', 'timeline']

  function handleParserChange(event: Event) {
    const target = event.target as HTMLSelectElement
    onSelectParser(target.value)
  }
</script>

<div class="devtools-panel" class:open={isOpen}>
  <header class="devtools-header">
    <h3>{store.i18n.t('panelTitle')}</h3>
    {#if parsers.length > 1}
      <select class="parser-selector" value={selectedParserId} onchange={handleParserChange}>
        {#each parsers as p}
          <option value={p.id}>
            {p.label} {p.state?.isLoading ? '⏳' : '✅'}
          </option>
        {/each}
      </select>
    {/if}
    <div class="devtools-tabs">
      {#each tabs as tab}
        <button
          class:active={activeTab === tab}
          onclick={() => onSetActiveTab(tab)}
        >
          {store.i18n.t(`tab${tab.charAt(0).toUpperCase() + tab.slice(1)}` as any)}
        </button>
      {/each}
    </div>
    <button class="close-btn" onclick={onClose}>{store.i18n.t('btnClose')}</button>
  </header>

  <main class="devtools-content">
    {#if selectedParser?.state}
      {#if activeTab === 'overview'}
        <OverviewTab {store} devState={selectedParser.state} />
      {:else if activeTab === 'blocks'}
        <BlocksTab
          {store}
          devState={selectedParser.state}
          {selectedBlockId}
          {onSelectBlock}
        />
      {:else if activeTab === 'ast'}
        <AstTab {store} ast={selectedParser.state.ast} />
      {:else if activeTab === 'timeline'}
        <TimelineTab
          {store}
          appendHistory={selectedParser.appendHistory}
          {onClearHistory}
        />
      {/if}
    {:else}
      <div class="empty-state">{store.i18n.t('waitingForData')}</div>
    {/if}
  </main>
</div>

<style>
  .devtools-panel {
    position: absolute;
    width: 450px;
    height: 550px;
    background: #1e1e1e;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    overflow: hidden;
    display: none;
    flex-direction: column;
  }

  .devtools-panel.open {
    display: flex;
  }

  :global(.bottom-right) .devtools-panel,
  :global(.bottom-left) .devtools-panel {
    bottom: 60px;
  }

  :global(.top-right) .devtools-panel,
  :global(.top-left) .devtools-panel {
    top: 60px;
  }

  :global(.bottom-right) .devtools-panel,
  :global(.top-right) .devtools-panel {
    right: 0;
  }

  :global(.bottom-left) .devtools-panel,
  :global(.top-left) .devtools-panel {
    left: 0;
  }

  .devtools-header {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background: #252525;
    border-bottom: 1px solid #333;
    gap: 12px;
  }

  .devtools-header h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    white-space: nowrap;
  }

  .parser-selector {
    padding: 4px 8px;
    border: 1px solid #444;
    border-radius: 4px;
    background: #2a2a2a;
    color: #e0e0e0;
    font-size: 12px;
    cursor: pointer;
    max-width: 140px;
  }

  .parser-selector:focus {
    outline: none;
    border-color: #3b82f6;
  }

  .devtools-tabs {
    display: flex;
    gap: 4px;
    margin-left: auto;
    margin-right: 8px;
  }

  .devtools-tabs button {
    padding: 4px 10px;
    border: none;
    background: transparent;
    color: #888;
    cursor: pointer;
    border-radius: 4px;
    font-size: 12px;
    text-transform: capitalize;
  }

  .devtools-tabs button:hover {
    background: #333;
    color: #fff;
  }

  .devtools-tabs button.active {
    background: #3b82f6;
    color: white;
  }

  .close-btn {
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    color: #888;
    cursor: pointer;
    font-size: 18px;
    line-height: 1;
    border-radius: 4px;
  }

  .close-btn:hover {
    color: #fff;
    background: #333;
  }

  .devtools-content {
    flex: 1;
    overflow: hidden;
    padding: 16px;
    color: #e0e0e0;
    min-height: 200px;
    display: flex;
    flex-direction: column;
  }

  .empty-state {
    color: #888;
    text-align: center;
    padding: 40px 20px;
  }

  :global(.light) .devtools-panel {
    background: #fff;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  }

  :global(.light) .devtools-header {
    background: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
  }

  :global(.light) .devtools-header h3 {
    color: #333;
  }

  :global(.light) .parser-selector {
    background: #fff;
    border-color: #ddd;
    color: #333;
  }

  :global(.light) .devtools-tabs button {
    color: #666;
  }

  :global(.light) .devtools-tabs button:hover {
    background: #e5e5e5;
  }

  :global(.light) .devtools-content {
    color: #333;
  }
</style>
