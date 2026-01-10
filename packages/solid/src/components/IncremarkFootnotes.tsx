/* @jsxImportSource solid-js */

import type { FootnoteDefinition, RootContent } from 'mdast'
import { Component, For, Show } from 'solid-js'
import { useDefinationsContext } from '../composables/useDefinationsContext'
import IncremarkRenderer from './IncremarkRenderer'

export interface IncremarkFootnotesProps {}

/**
 * 脚注列表组件
 *
 * 在文档底部渲染所有脚注定义，按引用出现的顺序排列
 */
export const IncremarkFootnotes: Component<IncremarkFootnotesProps> = () => {
  const { footnoteDefinitions, footnoteReferenceOrder } = useDefinationsContext()

  /**
   * 按引用顺序排列的脚注列表
   * 只显示已有定义的脚注
   */
  const orderedFootnotes = () => {
    return footnoteReferenceOrder()
      .map(identifier => ({
        identifier,
        definition: footnoteDefinitions()[identifier]
      }))
      .filter(item => item.definition !== undefined)
  }

  /**
   * 是否有脚注需要显示
   */
  const hasFootnotes = () => orderedFootnotes().length > 0

  return (
    <Show when={hasFootnotes()}>
      <section class="incremark-footnotes">
        <hr class="incremark-footnotes-divider" />
        <ol class="incremark-footnotes-list">
          <For each={orderedFootnotes()}>
            {(item, index) => (
              <li
                id={`fn-${item.identifier}`}
                class="incremark-footnote-item"
              >
                <div class="incremark-footnote-content">
                  {/* 脚注序号 */}
                  <span class="incremark-footnote-number">{index() + 1}.</span>

                  {/* 脚注内容 */}
                  <div class="incremark-footnote-body">
                    <For each={item.definition.children}>
                      {(child) => (
                        <IncremarkRenderer
                          node={(child as RootContent)}
                        />
                      )}
                    </For>
                  </div>
                </div>

                {/* 返回链接 */}
                <a
                  href={`#fnref-${item.identifier}`}
                  class="incremark-footnote-backref"
                  aria-label="返回引用位置"
                >
                  ↩
                </a>
              </li>
            )}
          </For>
        </ol>
      </section>
    </Show>
  )
}
