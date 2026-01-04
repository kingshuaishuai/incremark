export type { IncremarkContentProps } from '../types'
// 主组件
export { default as Incremark } from './Incremark.vue'
export { default as IncremarkContent } from '../components/IncremarkContent.vue'
export type { ComponentMap, RenderableBlock } from './Incremark.vue'

// 渲染器组件 - 用于自定义渲染
export { default as IncremarkRenderer } from './IncremarkRenderer.vue'

// 各节点类型组件 - 用于自定义或扩展
export { default as IncremarkHeading } from './IncremarkHeading.vue'
export { default as IncremarkParagraph } from './IncremarkParagraph.vue'
export { default as IncremarkCode } from './IncremarkCode.vue'
export { default as IncremarkList } from './IncremarkList.vue'
export { default as IncremarkTable } from './IncremarkTable.vue'
export { default as IncremarkBlockquote } from './IncremarkBlockquote.vue'
export { default as IncremarkThematicBreak } from './IncremarkThematicBreak.vue'
export { default as IncremarkInline } from './IncremarkInline.vue'
export { default as IncremarkMath } from './IncremarkMath.vue'
export { default as IncremarkHtmlElement } from './IncremarkHtmlElement.vue'
export { default as IncremarkDefault } from './IncremarkDefault.vue'
export { default as IncremarkFootnotes } from './IncremarkFootnotes.vue'

// 工具组件
export { default as AutoScrollContainer } from './AutoScrollContainer.vue'
