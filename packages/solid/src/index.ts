// Composables
export { useIncremark, useStreamRenderer, useDevTools, useBlockTransformer, useLocale } from './composables'
export { useProvideDefinations } from './composables/useProvideDefinations'
export { useDefinationsContext } from './composables/useDefinationsContext'
export type {
  UseIncremarkOptions,
  TypewriterOptions,
  TypewriterControls,
  UseStreamRendererOptions,
  UseStreamRendererReturn,
  UseDevToolsOptions,
  UseDevToolsReturn,
  UseBlockTransformerOptions,
  UseBlockTransformerReturn
} from './composables'

// Components
export * from './components';

// Utilities
export { clearAnimatedChunks, shouldAnimateChunk } from './utils/animatedChunks'

export { ThemeProvider as ThemeProviderExport, useTheme } from './components/ThemeProvider'
export { ConfigProvider as ConfigProviderExport } from './components/ConfigProvider'

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
