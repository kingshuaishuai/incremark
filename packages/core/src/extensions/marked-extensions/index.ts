/**
 * Marked 扩展模块
 *
 * 提供增量解析所需的 marked 扩展
 */

// 扩展类型
export type {
  ContainerToken,
  FootnoteDefToken,
  OptimisticRefToken,
  ExplicitDefinitionToken,
  BlockMathToken,
  InlineMathToken,
  FootnoteDefinitionBlockToken,
  InlineHtmlToken,
  CustomMarkedToken,
  ExtendedToken
} from './types'

// 扩展工厂函数
export { createExplicitDefinitionExtension } from './explicitDefinitionExtension'
export { createOptimisticReferenceExtension } from './optimisticReferenceExtension'
export { createBlockMathExtension, createInlineMathExtension } from './mathExtension'
export { createFootnoteDefinitionExtension } from './footnoteDefinitionExtension'
export { createInlineHtmlExtension } from './inlineHtmlExtension'

