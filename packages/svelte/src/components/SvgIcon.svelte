<!--
  SvgIcon 组件
  
  直接渲染 SVG 字符串
-->
<script lang="ts">
  interface Props {
    /** SVG 字符串内容 */
    svg: string
    /** 图标大小 class，如 incremark-icon--sm, incremark-icon--md 等 */
    sizeClass?: string
    /** 自定义类名 */
    class?: string
  }

  let {
    svg,
    sizeClass,
    class: className
  }: Props = $props()
</script>

<span class="incremark-icon {sizeClass || ''} {className || ''}">
  {@html svg}
</span>
