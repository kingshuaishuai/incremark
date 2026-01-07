<script lang="ts">
  import type { IncremarkLocale } from '@incremark/svelte'
  import { en } from '../index'
  import { provideLocale } from '../stores/useLocale.svelte'

  interface Props {
    locale?: IncremarkLocale
    children: import('svelte').Snippet
  }

  const { locale = en, children }: Props = $props()

  // 在组件初始化时同步设置 context
  // 使用函数返回 locale 以支持响应式更新
  provideLocale(() => locale)
</script>

{@render children()}
