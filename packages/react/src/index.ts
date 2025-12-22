/**
 * @incremark/react
 *
 * React integration for Incremark - Incremental Markdown parser for AI streaming
 */

// Hooks
export { useIncremark, type UseIncremarkOptions, type UseIncremarkReturn, type TypewriterOptions, type TypewriterControls } from './hooks'
export { useDevTools, type UseDevToolsOptions } from './hooks'
export {
  useBlockTransformer,
  type UseBlockTransformerOptions,
  type UseBlockTransformerReturn
} from './hooks'

// Components
export { Incremark, type IncremarkProps } from './components'
export { IncremarkRenderer, type IncremarkRendererProps } from './components'
export {
  AutoScrollContainer,
  type AutoScrollContainerProps,
  type AutoScrollContainerRef
} from './components'
export {
  IncremarkHtmlElement,
  type IncremarkHtmlElementProps,
  type HtmlElementNode
} from './components'
export { IncremarkFootnotes, type IncremarkFootnotesProps } from './components'
export { ThemeProvider, type ThemeProviderProps } from './ThemeProvider'

// Definitions Context
export { 
  DefinitionsProvider, 
  useDefinitions,
  type DefinitionsContextValue,
  type DefinitionsProviderProps
} from './contexts/DefinitionsContext'

// Re-export core types
export type {
  ParsedBlock,
  IncrementalUpdate,
  ParserOptions,
  Root,
  RootContent,
  // Transformer types
  SourceBlock,
  DisplayBlock,
  TransformerOptions,
  TransformerPlugin,
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

