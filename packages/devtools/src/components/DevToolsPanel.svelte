<!--
  @file DevToolsPanel.svelte - 面板组件
  @description DevTools 主面板，使用 floating-ui 进行定位
-->

<script lang="ts">
  import type { ParserRegistration, TabType } from '../types'
  import type { DevToolsStoreReturn } from '../stores/types'
  import { OverviewTab, BlocksTab, AstTab, TimelineTab } from './tabs/index'
  import { computePosition, flip, shift, offset, autoUpdate } from '@floating-ui/dom'

  interface Props {
    isOpen: boolean
    parsers: ParserRegistration[]
    selectedParserId: string | null
    selectedParser: ParserRegistration | null
    activeTab: TabType
    selectedBlockId: string | null
    store: DevToolsStoreReturn
    referenceEl: HTMLElement | null
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
    referenceEl,
    onClose,
    onSelectParser,
    onSetActiveTab,
    onSelectBlock,
    onClearHistory
  }: Props = $props()

  const tabs: TabType[] = ['overview', 'blocks', 'ast', 'timeline']

  let panelEl: HTMLDivElement | null = $state(null)
  let cleanup: (() => void) | null = null

  function handleParserChange(event: Event) {
    const target = event.target as HTMLSelectElement
    onSelectParser(target.value)
  }

  function updatePosition() {
    if (!referenceEl || !panelEl) return

    computePosition(referenceEl, panelEl, {
      placement: 'top-end',
      middleware: [
        offset(12),
        flip({
          fallbackPlacements: ['top-start', 'bottom-end', 'bottom-start', 'left', 'right']
        }),
        shift({ padding: 12 })
      ]
    }).then(({ x, y }) => {
      if (panelEl) {
        Object.assign(panelEl.style, {
          left: `${x}px`,
          top: `${y}px`
        })
      }
    })
  }

  $effect(() => {
    if (isOpen && referenceEl && panelEl) {
      cleanup = autoUpdate(referenceEl, panelEl, updatePosition)
    } else if (cleanup) {
      cleanup()
      cleanup = null
    }

    return () => {
      if (cleanup) {
        cleanup()
        cleanup = null
      }
    }
  })
</script>

{#if isOpen}
  <div bind:this={panelEl} class="devtools-panel">
    <header class="devtools-header">
      <div class="header-top">
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
        <button class="close-btn" onclick={onClose}>{store.i18n.t('btnClose')}</button>
      </div>
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
{/if}

<style>
  .devtools-panel {
    position: fixed;
    width: 450px;
    height: 550px;
    background: #1e1e1e;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    z-index: 99998;
  }

  .devtools-header {
    display: flex;
    flex-direction: column;
    background: #252525;
    border-bottom: 1px solid #333;
  }

  .header-top {
    display: flex;
    align-items: center;
    padding: 12px 16px;
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
    flex: 1;
    min-width: 0;
    padding: 6px 10px;
    border: 1px solid #444;
    border-radius: 6px;
    background: #2a2a2a;
    color: #e0e0e0;
    font-size: 12px;
    cursor: pointer;
  }

  .parser-selector:focus {
    outline: none;
    border-color: #3b82f6;
  }

  .close-btn {
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    color: #888;
    cursor: pointer;
    font-size: 18px;
    line-height: 1;
    border-radius: 6px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .close-btn:hover {
    color: #fff;
    background: #333;
  }

  .devtools-tabs {
    display: flex;
    padding: 0 12px 10px;
    gap: 6px;
  }

  .devtools-tabs button {
    flex: 1;
    padding: 6px 12px;
    border: none;
    background: #333;
    color: #888;
    cursor: pointer;
    border-radius: 6px;
    font-size: 12px;
    text-transform: capitalize;
    transition: all 0.15s;
  }

  .devtools-tabs button:hover {
    background: #404040;
    color: #fff;
  }

  .devtools-tabs button.active {
    background: #3b82f6;
    color: white;
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

  /* Light theme */
  :global(.light) .devtools-panel {
    background: #fff;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  }

  :global(.light) .devtools-header {
    background: #f8f8f8;
    border-bottom: 1px solid #e5e5e5;
  }

  :global(.light) .devtools-header h3 {
    color: #333;
  }

  :global(.light) .parser-selector {
    background: #fff;
    border-color: #ddd;
    color: #333;
  }

  :global(.light) .close-btn {
    color: #666;
  }

  :global(.light) .close-btn:hover {
    color: #333;
    background: #e5e5e5;
  }

  :global(.light) .devtools-tabs button {
    background: #e8e8e8;
    color: #666;
  }

  :global(.light) .devtools-tabs button:hover {
    background: #ddd;
    color: #333;
  }

  :global(.light) .devtools-tabs button.active {
    background: #3b82f6;
    color: white;
  }

  :global(.light) .devtools-content {
    color: #333;
  }
</style>
