// Composables
export { useIncremark, useStreamRenderer, useDevTools, useBlockTransformer } from './composables'
export { useProvideDefinations } from './composables/useProvideDefinations'
export { useDefinationsContext } from './composables/useDefinationsContext'
export type {
  UseIncremarkOptions,
  TypewriterOptions,
  TypewriterControls,
  UseStreamRendererOptions,
  UseDevToolsOptions,
  UseBlockTransformerOptions,
  UseBlockTransformerReturn
} from './composables'

// Components
export {
  Incremark,
  IncremarkRenderer,
  IncremarkHeading,
  IncremarkParagraph,
  IncremarkCode,
  IncremarkList,
  IncremarkTable,
  IncremarkBlockquote,
  IncremarkThematicBreak,
  IncremarkInline,
  IncremarkMath,
  IncremarkHtmlElement,
  IncremarkDefault,
  IncremarkFootnotes,
  AutoScrollContainer
} from './components'
export type { ComponentMap, BlockWithStableId } from './components'
export { default as ThemeProvider } from './ThemeProvider.vue'

// Re-export core types
export type {
  ParsedBlock,
  IncrementalUpdate,
  ParserOptions,
  BlockStatus,
  Root,
  RootContent,
  // Transformer types
  SourceBlock,
  DisplayBlock,
  TransformerPlugin,
  TransformerOptions,
  TransformerState,
  AnimationEffect
} from '@incremark/core'

// Re-export transformer utilities and plugins
export {
  BlockTransformer,
  createBlockTransformer,
  countChars,
  sliceAst,
  cloneNode,
  codeBlockPlugin,
  mermaidPlugin,
  imagePlugin,
  mathPlugin,
  thematicBreakPlugin,
  defaultPlugins,
  allPlugins,
  createPlugin
} from '@incremark/core'

// Re-export theme utilities
export {
  type DesignTokens,
  defaultTheme,
  darkTheme,
  generateCSSVars,
  mergeTheme,
  applyTheme
} from '@incremark/theme'
