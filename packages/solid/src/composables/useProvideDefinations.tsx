/* @jsxImportSource solid-js */

import { type Accessor, createSignal, type Setter } from 'solid-js'
import { createContext } from 'solid-js'
import type { Definition, FootnoteDefinition } from 'mdast'

export interface DefinationsContextValue {
  definations: Accessor<Record<string, Definition>>
  setDefinations: Setter<Record<string, Definition>>
  footnoteDefinitions: Accessor<Record<string, FootnoteDefinition>>
  setFootnoteDefinitions: Setter<Record<string, FootnoteDefinition>>
  footnoteReferenceOrder: Accessor<string[]>
  setFootnoteReferenceOrder: Setter<string[]>
  clearAllDefinations: () => void
}

export const DefinationsContext = createContext<DefinationsContextValue>()

export interface DefinationsProviderProps {
  children?: any
  value: DefinationsContextValue
}

export function DefinationsProvider(props: DefinationsProviderProps) {
  return (
    <DefinationsContext.Provider value={props.value}>
      {props.children}
    </DefinationsContext.Provider>
  )
}

/**
 * Provides definitions state management
 * Call this in a composable to get setter functions
 */
export function useProvideDefinations() {
  const [definations, setDefinations] = createSignal<Record<string, Definition>>({})
  const [footnoteDefinitions, setFootnoteDefinitions] = createSignal<Record<string, FootnoteDefinition>>({})
  const [footnoteReferenceOrder, setFootnoteReferenceOrder] = createSignal<string[]>([])

  function clearDefinations() {
    setDefinations({})
  }

  function clearFootnoteDefinitions() {
    setFootnoteDefinitions({})
  }

  function clearFootnoteReferenceOrder() {
    setFootnoteReferenceOrder([])
  }

  function clearAllDefinations() {
    clearDefinations()
    clearFootnoteDefinitions()
    clearFootnoteReferenceOrder()
  }

  const contextValue: DefinationsContextValue = {
    definations,
    setDefinations,
    footnoteDefinitions,
    setFootnoteDefinitions,
    footnoteReferenceOrder,
    setFootnoteReferenceOrder,
    clearAllDefinations
  }

  return {
    definations,
    setDefinations,
    footnoteDefinitions,
    setFootnoteDefinitions,
    footnoteReferenceOrder,
    setFootnoteReferenceOrder,
    clearDefinations,
    clearFootnoteDefinitions,
    clearFootnoteReferenceOrder,
    clearAllDefinations,
    DefinationsProvider,
    contextValue
  }
}
