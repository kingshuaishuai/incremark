/**
 * @incremark/react
 *
 * React integration for Incremark - Incremental Markdown parser for AI streaming
 */

// Hooks
export { useIncremark, type UseIncremarkOptions, type UseIncremarkReturn } from './hooks'
export { useDevTools, type UseDevToolsOptions } from './hooks'

// Components
export { Incremark, type IncremarkProps } from './components'
export { IncremarkRenderer, type IncremarkRendererProps } from './components'

// Re-export core types
export type {
  ParsedBlock,
  IncrementalUpdate,
  ParserOptions,
  Root,
  RootContent
} from '@incremark/core'

