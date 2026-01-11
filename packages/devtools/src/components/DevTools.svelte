<!--
  @file DevTools.svelte - DevTools 主组件
  @description 包含触发器和面板的完整 DevTools 组件
-->

<script lang="ts">
  import type { DevToolsStoreReturn } from '../stores/types'
  import DevToolsTrigger from './DevToolsTrigger.svelte'
  import DevToolsPanel from './DevToolsPanel.svelte'

  interface Props {
    /** DevTools store 实例 */
    store: DevToolsStoreReturn
    /** 位置配置 */
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
    /** 主题 */
    theme?: 'dark' | 'light'
  }

  let {
    store,
    position = 'bottom-right',
    theme = 'dark'
  }: Props = $props()
</script>

<div class="incremark-devtools {position} {theme}">
  <DevToolsTrigger
    {store}
    hasLoadingParser={store.hasLoadingParser}
    parserCount={store.parsersArray.length}
    onToggle={() => store.toggle()}
  />
  <DevToolsPanel
    {store}
    isOpen={store.isOpen}
    parsers={store.parsersArray}
    selectedParserId={store.selectedParserId}
    selectedParser={store.selectedParser}
    activeTab={store.activeTab}
    selectedBlockId={store.selectedBlockId}
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
    z-index: 99999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 13px;
    line-height: 1.5;
  }

  .incremark-devtools :global(*) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .incremark-devtools.bottom-right {
    bottom: 20px;
    right: 20px;
  }

  .incremark-devtools.bottom-left {
    bottom: 20px;
    left: 20px;
  }

  .incremark-devtools.top-right {
    top: 20px;
    right: 20px;
  }

  .incremark-devtools.top-left {
    top: 20px;
    left: 20px;
  }
</style>
