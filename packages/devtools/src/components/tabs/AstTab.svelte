<!--
  @file AstTab.svelte - AST Tab
  @description 显示完整的 AST 树
-->

<script lang="ts">
  import type { Root } from '@incremark/core'
  import type { DevToolsStoreReturn } from '../../stores/types'
  import JSONFormatter from 'json-formatter-js'

  interface Props {
    ast: Root
    store: DevToolsStoreReturn
  }

  let { ast, store }: Props = $props()

  let jsonContainer: HTMLDivElement | undefined = $state()

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(ast, null, 2))
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  // 渲染 JSON 树
  $effect(() => {
    if (ast && jsonContainer) {
      const formatter = new JSONFormatter(ast, 1, {
        theme: 'dark',
        animateOpen: false,
        animateClose: false
      })
      jsonContainer.innerHTML = ''
      jsonContainer.appendChild(formatter.render())

      return () => {
        jsonContainer.innerHTML = ''
      }
    }
  })
</script>

<div class="ast-tab">
  <div class="ast-header">
    <span>AST Tree</span>
    <button class="copy-btn" onclick={handleCopy}>{store.i18n.t('btnCopy')}</button>
  </div>
  <div class="json-tree" bind:this={jsonContainer}></div>
</div>

<style>
  .ast-tab {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
  }

  .ast-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    flex-shrink: 0;
  }

  .ast-header span {
    font-weight: 600;
    color: #fff;
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

  .json-tree {
    flex: 1;
    min-height: 100px;
    background: #1a1a1a;
    padding: 12px;
    padding-right: 6px;
    border-radius: 6px;
    overflow: auto;
    font-size: 12px;
  }

  .json-tree::-webkit-scrollbar {
    width: 6px;
  }

  .json-tree::-webkit-scrollbar-track {
    background: transparent;
  }

  .json-tree::-webkit-scrollbar-thumb {
    background: #444;
    border-radius: 3px;
  }

  .json-tree::-webkit-scrollbar-thumb:hover {
    background: #555;
  }

  .json-tree :global(.json-formatter-row) {
    line-height: 1.4;
  }

  :global(.light) .ast-header span {
    color: #333;
  }

  :global(.light) .copy-btn {
    background: #ddd;
    color: #666;
  }

  :global(.light) .copy-btn:hover {
    background: #ccc;
    color: #333;
  }

  :global(.light) .json-tree {
    background: #eee;
  }
</style>
