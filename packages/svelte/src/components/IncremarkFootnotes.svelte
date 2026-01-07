<!--
  @file IncremarkFootnotes.svelte - 脚注列表组件
  @description 在文档底部渲染所有脚注定义，按引用出现的顺序排列
-->

<script lang="ts">
  import type { RootContent } from 'mdast'
  import { getDefinitionsContext } from '../context/definitionsContext'
  import IncremarkRenderer from './IncremarkRenderer.svelte'

  const context = getDefinitionsContext()
  // 解构 store 以便使用 $ 语法订阅
  const { footnoteDefinitions, footnoteReferenceOrder } = context

  /**
   * 按引用顺序排列的脚注列表
   * 只显示已有定义的脚注
   */
  const orderedFootnotes = $derived.by(() => {
    const order = $footnoteReferenceOrder
    const definitions = $footnoteDefinitions
    
    return order
      .map(identifier => ({
        identifier,
        definition: definitions[identifier]
      }))
      .filter(item => item.definition !== undefined)
  })

  /**
   * 是否有脚注需要显示
   */
  const hasFootnotes = $derived(orderedFootnotes.length > 0)
</script>

{#if hasFootnotes}
  <section class="incremark-footnotes">
    <hr class="incremark-footnotes-divider" />
    <ol class="incremark-footnotes-list">
      {#each orderedFootnotes as item, index (item.identifier)}
        <li
          id="fn-{item.identifier}"
          class="incremark-footnote-item"
        >
          <div class="incremark-footnote-content">
            <!-- 脚注序号 -->
            <span class="incremark-footnote-number">{index + 1}.</span>
            
            <!-- 脚注内容 -->
            <div class="incremark-footnote-body">
              {#each item.definition.children as child, childIndex (childIndex)}
                <IncremarkRenderer node={child as RootContent} />
              {/each}
            </div>
          </div>
          
          <!-- 返回链接 -->
          <a 
            href="#fnref-{item.identifier}" 
            class="incremark-footnote-backref"
            aria-label="返回引用位置"
          >
            ↩
          </a>
        </li>
      {/each}
    </ol>
  </section>
{/if}

