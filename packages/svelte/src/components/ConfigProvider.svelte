<script lang="ts">
  import type { IncremarkLocale } from '@incremark/shared'
  import { zhCN } from '@incremark/shared'
  import { provideLocale } from '../stores/useLocale.svelte'

  interface Props {
    locale?: IncremarkLocale
    children: import('svelte').Snippet
  }

  // 提供 locale 给子组件（确保不是 undefined）
  const { locale, children }: Props = $props()

  // 在组件初始化时同步设置 context
  // 使用函数返回 locale 以支持响应式更新
  provideLocale(() => locale || zhCN)
</script>

{@render children()}
