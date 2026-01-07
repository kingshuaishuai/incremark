<!--
  @file IncremarkTable.svelte - 表格组件
  @description 渲染 Markdown 表格
-->

<script lang="ts">
  import type { Table, TableCell, PhrasingContent } from 'mdast'
  import IncremarkInline from './IncremarkInline.svelte'

  /**
   * 组件 Props
   */
  interface Props {
    /** 表格节点 */
    node: Table
  }

  let { node }: Props = $props()

  /**
   * 获取单元格内容
   * 
   * @param cell - 单元格节点
   * @returns 行内内容数组
   */
  function getCellContent(cell: TableCell): PhrasingContent[] {
    return cell.children as PhrasingContent[]
  }

  /**
   * 获取单元格对齐类名
   * 
   * @param cellIndex - 单元格索引
   * @returns 对齐方式类名
   */
  function getCellAlignClass(cellIndex: number): string {
    return `incremark-table-align-${node.align?.[cellIndex] || 'left'}`
  }

  /**
   * 获取表头行（第一行）
   */
  const headerRow = $derived(node.children[0])

  /**
   * 获取数据行（除第一行外的所有行）
   */
  const bodyRows = $derived(node.children.slice(1))
</script>

<div class="incremark-table-wrapper">
  <table class="incremark-table">
    <thead>
      {#if headerRow}
        <tr>
          {#each headerRow.children as cell, cellIndex (cellIndex)}
            <th class={getCellAlignClass(cellIndex)}>
              <IncremarkInline nodes={getCellContent(cell)} />
            </th>
          {/each}
        </tr>
      {/if}
    </thead>
    <tbody>
      {#each bodyRows as row, rowIndex (rowIndex)}
        <tr>
          {#each row.children as cell, cellIndex (cellIndex)}
            <td class={getCellAlignClass(cellIndex)}>
              <IncremarkInline nodes={getCellContent(cell)} />
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
