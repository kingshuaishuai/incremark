<!--
  @file IncremarkList.svelte - 列表组件
  @description 渲染 Markdown 列表（有序列表和无序列表），支持任务列表和所有块级内容
-->

<script lang="ts">
  import type { List, ListItem, RootContent } from 'mdast'
  import IncremarkInline from './IncremarkInline.svelte'
  import IncremarkRenderer from './IncremarkRenderer.svelte'

  /**
   * 组件 Props
   */
  interface Props {
    /** 列表节点 */
    node: List
  }

  let { node }: Props = $props()

  /**
   * 根据 ordered 属性计算标签名
   */
  const tag = $derived(node.ordered ? 'ol' : 'ul')

  /**
   * 判断是否是任务列表
   */
  const isTaskList = $derived(
    node.children.some(item => item.checked !== null && item.checked !== undefined)
  )

  /**
   * 获取列表项的内联内容（来自第一个 paragraph）
   *
   * @param item - 列表项节点
   * @returns 行内内容数组
   */
  function getItemInlineContent(item: ListItem) {
    const firstChild = item.children[0]
    if (firstChild?.type === 'paragraph') {
      return firstChild.children
    }
    return []
  }

  /**
   * 获取列表项的块级子节点（嵌套列表、代码块等）
   * 排除第一个 paragraph，因为它已经被 getItemInlineContent 处理
   *
   * @param item - 列表项节点
   * @returns 块级子节点数组
   */
  function getItemBlockChildren(item: ListItem): RootContent[] {
    return item.children.filter((child, index) => {
      // 第一个 paragraph 已经被处理为内联内容
      if (index === 0 && child.type === 'paragraph') {
        return false
      }
      return true
    })
  }

  /**
   * 判断列表项是否是任务项
   *
   * @param item - 列表项节点
   * @returns 是否是任务项
   */
  function isTaskItem(item: ListItem): boolean {
    return item.checked !== null && item.checked !== undefined
  }
</script>

<svelte:element
  this={tag}
  class="incremark-list"
  class:task-list={isTaskList}
  start={node.start || undefined}
>
  {#each node.children as item, index (index)}
    <li
      class="incremark-list-item"
      class:task-item={isTaskItem(item)}
    >
      {#if isTaskItem(item)}
        <label class="task-label">
          <input
            type="checkbox"
            checked={item.checked}
            disabled
            class="checkbox"
          />
          <span class="task-content">
            <IncremarkInline nodes={getItemInlineContent(item)} />
          </span>
        </label>
      {:else}
        <IncremarkInline nodes={getItemInlineContent(item)} />
        <!-- 递归渲染所有块级内容（嵌套列表、heading、blockquote、code、table 等） -->
        {#each getItemBlockChildren(item) as child, childIndex (childIndex)}
          <IncremarkRenderer node={child} />
        {/each}
      {/if}
    </li>
  {/each}
</svelte:element>

