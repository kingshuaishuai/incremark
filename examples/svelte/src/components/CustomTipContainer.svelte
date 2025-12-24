<script lang="ts">
  import type { Snippet } from 'svelte';
  
  interface Props {
    name: string
    options?: Record<string, any>
    children?: Snippet;
  }

  let { options, children }: Props = $props()
</script>

<div class="custom-tip-container">
  <div class="custom-tip-header">
    <span class="custom-tip-icon">💡</span>
    <span class="custom-tip-title">
      {options?.title || '提示'}
    </span>
  </div>
  <div class="custom-tip-content">
    {#if children}
      {@render children()}
    {/if}
  </div>
</div>

