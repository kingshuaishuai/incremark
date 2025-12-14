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

<style scoped>
.incremark-table-wrapper {
  overflow-x: auto;
  margin: 1em 0;
}

.incremark-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.incremark-table th,
.incremark-table td {
  border: 1px solid #ddd;
  padding: 10px 14px;
}

.incremark-table th {
  background: #f8f9fa;
  font-weight: 600;
}

.incremark-table tr:nth-child(even) {
  background: #fafafa;
}

.incremark-table tr:hover {
  background: #f0f0f0;
}
</style>

