<!--
  @file App.svelte - 主应用组件
  @description Svelte 示例应用的主组件
-->

<script lang="ts">
  import { useLocale } from './composables'
  import { IncremarkDemo } from './components'

  // ============ 国际化 ============
  const { locale, t, sampleMarkdown, toggleLocale } = useLocale()

  // ============ HTML 模式 ============
  let htmlEnabled = $state(true)

  // 用于强制重新创建 incremark 实例的 key（基于 htmlEnabled 和 locale）
  const incremarkKey = $derived(`${htmlEnabled}-${$locale}`)
</script>

<div class="app">
  <header>
    <div class="header-top">
      <h1>{$t.title}</h1>
      <button class="lang-toggle" onclick={toggleLocale}>
        {$locale === 'zh' ? '🇺🇸 English' : '🇨🇳 中文'}
      </button>
    </div>
    <div class="header-controls">
      <label class="checkbox html-toggle">
        <input type="checkbox" bind:checked={htmlEnabled} />
        {$t.htmlMode}
      </label>
    </div>
  </header>
  {#key incremarkKey}
    <IncremarkDemo 
      {htmlEnabled} 
      sampleMarkdown={$sampleMarkdown} 
      t={$t}
    />
  {/key}
</div>

<style>
  @import '../../shared/styles.css';

  .header-controls {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 8px;
  }
</style>

