/**
 * @file @incremark/svelte 主入口文件
 * @description Svelte 5 集成库的导出入口
 */

// Stores/Utilities
export { useIncremark, type UseIncremarkOptions, type UseIncremarkReturn, type TypewriterOptions, type TypewriterControls } from './stores/useIncremark'
export { useDevTools, type UseDevToolsOptions } from './stores/useDevTools.svelte'
export {
  useBlockTransformer,
  type UseBlockTransformerOptions,
  type UseBlockTransformerReturn
} from './stores/useBlockTransformer'
export { useLocale, type UseLocaleReturn } from './stores/useLocale.svelte'

// Context
export { setDefinitionsContext, getDefinitionsContext, type DefinitionsContextValue } from './context/definitionsContext'

// Components
export {
  Incremark,
  IncremarkContent,
  IncremarkParagraph,
  IncremarkInline,
  IncremarkHeading,
  IncremarkCode,
  IncremarkList,
  IncremarkTable,
  IncremarkBlockquote,
  IncremarkThematicBreak,
  IncremarkMath,
  IncremarkHtmlElement,
  IncremarkFootnotes,
  IncremarkDefault,
  IncremarkRenderer,
  type ComponentMap,
  type RenderableBlock,
  type IncremarkContentProps,
  type CodeBlockConfig
} from './components'

// Additional Components
export { default as AutoScrollContainer } from './components/AutoScrollContainer.svelte'
export { default as ThemeProvider } from './ThemeProvider.svelte'
export { default as ConfigProvider } from './components/ConfigProvider.svelte'

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

// Re-export i18n utilities
import { en as enShared, zhCN as zhCNShared } from '@incremark/shared'
import type { IncremarkLocale } from '@incremark/shared'

export { enShared as en, zhCNShared as zhCN }
export type { IncremarkLocale }

