/**
 * @incremark/react
 *
 * React integration for Incremark - Incremental Markdown parser for AI streaming
 */

// Hooks
export { useIncremark, type UseIncremarkOptions, type UseIncremarkReturn, type TypewriterOptions, type TypewriterControls } from './hooks'
export { useLocale, type UseLocaleReturn } from './hooks'
export {
  useBlockTransformer,
  type UseBlockTransformerOptions,
  type UseBlockTransformerReturn
} from './hooks'
// Components
export { Incremark, type IncremarkProps, IncremarkContent, type IncremarkContentProps } from './components'
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
export { IncremarkInline, type IncremarkInlineProps } from './components'
export { IncremarkFootnotes } from './components'
export { IncremarkContainerProvider, type IncremarkContainerProviderProps } from './components'
export { ConfigProvider } from './components'
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

// Re-export mdast types
export type {
  Root as MdastRoot,
  Parent,
  // Nodes
  Heading,
  Paragraph,
  Code,
  Blockquote,
  List,
  ListItem,
  Table,
  TableCell,
  ThematicBreak,
  // Inline
  Text,
  PhrasingContent,
  InlineCode,
  Link,
  LinkReference,
  Image,
  ImageReference,
  // HTML
  HTML,
  // Definitions
  Definition,
  FootnoteDefinition
} from 'mdast'

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

