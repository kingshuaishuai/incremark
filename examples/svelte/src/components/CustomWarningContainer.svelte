<script lang="ts">
  import type { Snippet } from 'svelte';
  interface Props {
    name: string
    options?: Record<string, any>
    children?: Snippet;
  }

  let { options, children }: Props = $props()
</script>

<div class="custom-warning-container">
  <div class="custom-warning-header">
    <span class="custom-warning-icon">⚠️</span>
    <span class="custom-warning-title">
      {options?.title || '警告'}
    </span>
  </div>
  <div class="custom-warning-content">
    {#if children}
      {@render children()}
    {/if}
  </div>
</div>

