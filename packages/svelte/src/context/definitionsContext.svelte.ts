/**
 * @file Definitions Context - Svelte Context 实现
 * @description 管理 definitions 和 footnotes 的共享状态，使用 Svelte 5 runes 语法
 */

import { setContext, getContext } from 'svelte'
import type { Definition, FootnoteDefinition } from 'mdast'

/**
 * Definitions Context 值类型（使用 getter 函数）
 */
export interface DefinitionsContextValue {
  /** 获取 Definitions 映射 */
  getDefinations: () => Record<string, Definition>
  /** 获取 Footnote definitions 映射 */
  getFootnoteDefinitions: () => Record<string, FootnoteDefinition>
  /** 获取 Footnote 引用顺序 */
  getFootnoteReferenceOrder: () => string[]
}

/**
 * Context key
 */
const DEFINITIONS_CONTEXT_KEY = Symbol('definitionsContext')

/**
 * 设置 Definitions Context
 * 
 * @description
 * 在父组件中调用，为子组件提供 definitions context
 * 使用 $state 实现响应式状态
 * 
 * @returns 返回设置函数，用于更新 context 值
 * 
 * @example
 * ```svelte
 * <script>
 *   import { setDefinitionsContext } from '@incremark/svelte'
 *   
 *   const { setDefinations, setFootnoteDefinitions, setFootnoteReferenceOrder } = setDefinitionsContext()
 * </script>
 * ```
 */
export function setDefinitionsContext() {
  // 使用 $state 实现响应式状态（每个组件实例有独立的状态）
  let definationsState = $state<Record<string, Definition>>({})
  let footnoteDefinitionsState = $state<Record<string, FootnoteDefinition>>({})
  let footnoteReferenceOrderState = $state<string[]>([])

  const contextValue: DefinitionsContextValue = {
    getDefinations: () => definationsState,
    getFootnoteDefinitions: () => footnoteDefinitionsState,
    getFootnoteReferenceOrder: () => footnoteReferenceOrderState
  }

  setContext(DEFINITIONS_CONTEXT_KEY, contextValue)

  /**
   * 设置 definitions
   */
  function setDefinations(definitions: Record<string, Definition>) {
    definationsState = definitions
  }

  /**
   * 设置 footnote definitions
   */
  function setFootnoteDefinitions(definitions: Record<string, FootnoteDefinition>) {
    footnoteDefinitionsState = definitions
  }

  /**
   * 设置 footnote 引用顺序
   */
  function setFootnoteReferenceOrder(order: string[]) {
    footnoteReferenceOrderState = order
  }

  /**
   * 清空 definitions
   */
  function clearDefinations() {
    definationsState = {}
  }

  /**
   * 清空 footnote definitions
   */
  function clearFootnoteDefinitions() {
    footnoteDefinitionsState = {}
  }

  /**
   * 清空 footnote 引用顺序
   */
  function clearFootnoteReferenceOrder() {
    footnoteReferenceOrderState = []
  }

  /**
   * 清空所有 definitions
   */
  function clearAllDefinations() {
    clearDefinations()
    clearFootnoteDefinitions()
    clearFootnoteReferenceOrder()
  }

  return {
    setDefinations,
    setFootnoteDefinitions,
    setFootnoteReferenceOrder,
    clearDefinations,
    clearFootnoteDefinitions,
    clearFootnoteReferenceOrder,
    clearAllDefinations
  }
}

/**
 * 获取 Definitions Context
 * 
 * @description
 * 在子组件中调用，获取父组件提供的 definitions context
 * 
 * @returns Definitions context 值
 * 
 * @throws 如果 context 不存在，抛出错误
 * 
 * @example
 * ```svelte
 * <script>
 *   import { getDefinitionsContext } from '@incremark/svelte'
 *   
 *   const context = getDefinitionsContext()
 *   // 使用 getter 获取值（在模板或 $derived 中使用会自动追踪依赖）
 *   const definitions = $derived(context.getDefinations())
 * </script>
 * ```
 */
export function getDefinitionsContext(): DefinitionsContextValue {
  const context = getContext<DefinitionsContextValue>(DEFINITIONS_CONTEXT_KEY)
  
  if (!context) {
    throw new Error('DefinitionsContext not found. Make sure to call setDefinitionsContext() in a parent component.')
  }
  
  return context
}
