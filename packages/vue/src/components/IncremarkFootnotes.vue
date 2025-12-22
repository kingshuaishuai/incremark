<!--
/**
 * 脚注列表组件
 * 
 * 在文档底部渲染所有脚注定义，按引用出现的顺序排列
 * 
 * @component IncremarkFootnotes
 * 
 * @remarks
 * 样式定义在 @incremark/theme 中的 footnotes.less
 */
-->
<script setup lang="ts">
import { computed } from 'vue'
import type { FootnoteDefinition, RootContent } from 'mdast'
import { useDefinationsContext } from '../composables/useDefinationsContext'
import IncremarkRenderer from './IncremarkRenderer.vue'

/**
 * Props
 */
interface Props {
  /** 脚注引用的出现顺序（从 parser 获取） */
  footnoteReferenceOrder: string[]
}

const props = defineProps<Props>()

const { definations, footnoteDefinitions } = useDefinationsContext()

/**
 * 按引用顺序排列的脚注列表
 * 只显示已有定义的脚注
 */
const orderedFootnotes = computed<Array<{ identifier: string; definition: FootnoteDefinition }>>(() => {
  return props.footnoteReferenceOrder
    .map(identifier => ({
      identifier,
      definition: footnoteDefinitions.value[identifier]
    }))
    .filter(item => item.definition !== undefined)
})

/**
 * 是否有脚注需要显示
 */
const hasFootnotes = computed(() => orderedFootnotes.value.length > 0)
</script>

<template>
  <section v-if="hasFootnotes" class="incremark-footnotes">
    <hr class="incremark-footnotes-divider" />
    <ol class="incremark-footnotes-list">
      <li
        v-for="(item, index) in orderedFootnotes"
        :key="item.identifier"
        :id="`fn-${item.identifier}`"
        class="incremark-footnote-item"
      >
        <div class="incremark-footnote-content">
          <!-- 脚注序号 -->
          <span class="incremark-footnote-number">{{ index + 1 }}.</span>
          
          <!-- 脚注内容 -->
          <div class="incremark-footnote-body">
            <IncremarkRenderer
              v-for="(child, childIndex) in item.definition.children"
              :key="childIndex"
              :node="(child as RootContent)"
            />
          </div>
        </div>
        
        <!-- 返回链接 -->
        <a 
          :href="`#fnref-${item.identifier}`" 
          class="incremark-footnote-backref"
          aria-label="返回引用位置"
        >
          ↩
        </a>
      </li>
    </ol>
  </section>
</template>


