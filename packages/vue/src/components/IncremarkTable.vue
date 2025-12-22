<script setup lang="ts">
import type { Table, TableCell, PhrasingContent } from 'mdast'
import IncremarkInline from './IncremarkInline.vue'

defineProps<{
  node: Table
}>()

function getCellContent(cell: TableCell): PhrasingContent[] {
  return cell.children as PhrasingContent[]
}
</script>

<template>
  <div class="incremark-table-wrapper">
    <table class="incremark-table">
      <thead>
        <tr v-if="node.children[0]">
          <th 
            v-for="(cell, cellIndex) in node.children[0].children" 
            :key="cellIndex"
            :style="{ textAlign: node.align?.[cellIndex] || 'left' }"
          >
            <IncremarkInline :nodes="getCellContent(cell)" />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in node.children.slice(1)" :key="rowIndex">
          <td 
            v-for="(cell, cellIndex) in row.children" 
            :key="cellIndex"
            :style="{ textAlign: node.align?.[cellIndex] || 'left' }"
          >
            <IncremarkInline :nodes="getCellContent(cell)" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

