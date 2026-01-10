import { useContext } from 'solid-js'
import { DefinationsContext, type DefinationsContextValue } from './useProvideDefinations'

/**
 * Support definations and footnoteDefinitions
 * @returns DefinationsContextValue
 */
export function useDefinationsContext(): DefinationsContextValue {
  const context = useContext(DefinationsContext)

  if (!context) {
    throw new Error('DefinationsContext not found. Make sure you are using this within a component that provides DefinationsContext.')
  }

  return context
}
