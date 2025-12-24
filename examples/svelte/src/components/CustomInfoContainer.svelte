<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    name: string
    options?: Record<string, any>
    children?: Snippet;
  }

  let { options, children }: Props = $props()
</script>

<div class="custom-info-container">
  <div class="custom-info-header">
    <span class="custom-info-icon">ℹ️</span>
    <span class="custom-info-title">
      {options?.title || '信息'}
    </span>
  </div>
  <div class="custom-info-content">
    {#if children}
      {@render children()}
    {/if}
  </div>
</div>

