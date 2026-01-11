/**
 * @file useDevTools - DevTools 核心状态管理
 * @description 使用 Svelte 5 runes 管理 DevTools 状态和多 parser 注册
 */

import type { IncremarkParser, ParserState } from '@incremark/core'
import type {
  DevToolsState,
  DevToolsOptions,
  RegisterOptions,
  ParserRegistration,
  TabType
} from '../types'
import { createI18n } from '../i18n/index.svelte'

/**
 * DevTools 内部状态
 */
export interface DevToolsStore {
  /** 所有注册的 parsers */
  parsers: Map<string, ParserRegistration>
  /** 当前选中的 parser ID */
  selectedParserId: string | null
  /** 面板是否打开 */
  isOpen: boolean
  /** 当前激活的 tab */
  activeTab: TabType
  /** 选中的 block ID */
  selectedBlockId: string | null
  /** i18n */
  i18n: ReturnType<typeof createI18n>
}

/**
 * 创建 DevTools store
 */
export function createDevToolsStore(options: DevToolsOptions = {}) {
  // 初始化 i18n
  const i18n = createI18n(options.locale ?? 'en-US')

  // 响应式状态
  let parsers = $state(new Map<string, ParserRegistration>())
  let selectedParserId = $state<string | null>(null)
  let isOpen = $state(options.open ?? false)
  let activeTab = $state<TabType>('overview')
  let selectedBlockId = $state<string | null>(null)

  // 派生状态
  const parsersArray = $derived(Array.from(parsers.values()))
  const selectedParser = $derived(
    selectedParserId ? parsers.get(selectedParserId) ?? null : null
  )
  const hasLoadingParser = $derived(
    parsersArray.some(p => p.state?.isLoading)
  )

  /**
   * 更新 parser 状态
   */
  function updateParserState(id: string, parserState: ParserState): void {
    const registration = parsers.get(id)
    if (!registration) return

    const state: DevToolsState = {
      blocks: [...parserState.completedBlocks, ...parserState.pendingBlocks],
      completedBlocks: parserState.completedBlocks,
      pendingBlocks: parserState.pendingBlocks,
      markdown: parserState.markdown,
      ast: parserState.ast,
      isLoading: parserState.pendingBlocks.length > 0
    }

    // 记录 append 历史
    const oldState = registration.state
    if (oldState) {
      const lastLen = oldState.markdown.length
      const newLen = state.markdown.length

      // 检测 reset
      if (newLen < lastLen) {
        registration.appendHistory = []
      }
      // 记录新的 append
      else if (newLen > lastLen) {
        registration.appendHistory = [
          ...registration.appendHistory,
          {
            timestamp: Date.now(),
            chunk: state.markdown.slice(lastLen),
            completedCount: state.completedBlocks.length,
            pendingCount: state.pendingBlocks.length
          }
        ]
      }
    }

    // 创建新的 registration 对象以触发响应式更新
    const updatedRegistration: ParserRegistration = {
      ...registration,
      state,
      appendHistory: registration.appendHistory
    }

    // 更新 Map
    const newParsers = new Map(parsers)
    newParsers.set(id, updatedRegistration)
    parsers = newParsers
  }

  /**
   * 注册 parser
   */
  function register(parser: IncremarkParser, options: RegisterOptions): void {
    const { id, label } = options

    // 如果已存在，先注销
    if (parsers.has(id)) {
      unregister(id)
    }

    const registration: ParserRegistration = {
      id,
      label: label || id,
      parser,
      state: null,
      appendHistory: []
    }

    // 设置 onChange 回调
    parser.setOnChange((state: ParserState) => {
      updateParserState(id, state)
    })

    const newParsers = new Map(parsers)
    newParsers.set(id, registration)
    parsers = newParsers

    // 如果是第一个 parser，自动选中
    if (parsers.size === 1) {
      selectedParserId = id
    }
  }

  /**
   * 注销 parser
   */
  function unregister(id: string): void {
    const registration = parsers.get(id)
    if (registration) {
      // 清理 onChange 回调
      registration.parser.setOnChange(undefined)

      const newParsers = new Map(parsers)
      newParsers.delete(id)
      parsers = newParsers

      // 如果注销的是当前选中的，选择另一个
      if (selectedParserId === id) {
        const next = parsers.keys().next()
        selectedParserId = next.done ? null : next.value
      }
    }
  }

  /**
   * 选择 parser
   */
  function selectParser(id: string): void {
    if (parsers.has(id)) {
      selectedParserId = id
      selectedBlockId = null
    }
  }

  /**
   * 打开面板
   */
  function open(): void {
    isOpen = true
  }

  /**
   * 关闭面板
   */
  function close(): void {
    isOpen = false
  }

  /**
   * 切换面板
   */
  function toggle(): void {
    isOpen = !isOpen
  }

  /**
   * 设置激活的 tab
   */
  function setActiveTab(tab: TabType): void {
    activeTab = tab
  }

  /**
   * 选择 block
   */
  function selectBlock(id: string | null): void {
    selectedBlockId = id
  }

  /**
   * 清除历史记录
   */
  function clearHistory(): void {
    if (!selectedParserId) return
    const registration = parsers.get(selectedParserId)
    if (registration) {
      const updatedRegistration: ParserRegistration = {
        ...registration,
        appendHistory: []
      }
      const newParsers = new Map(parsers)
      newParsers.set(selectedParserId, updatedRegistration)
      parsers = newParsers
    }
  }

  /**
   * 清理所有注册
   */
  function destroy(): void {
    for (const registration of parsers.values()) {
      registration.parser.setOnChange(undefined)
    }
    parsers = new Map()
    selectedParserId = null
  }

  return {
    // 状态 getters
    get parsers() { return parsers },
    get parsersArray() { return parsersArray },
    get selectedParserId() { return selectedParserId },
    get selectedParser() { return selectedParser },
    get isOpen() { return isOpen },
    get activeTab() { return activeTab },
    get selectedBlockId() { return selectedBlockId },
    get hasLoadingParser() { return hasLoadingParser },
    get i18n() { return i18n },

    // 方法
    register,
    unregister,
    selectParser,
    open,
    close,
    toggle,
    setActiveTab,
    selectBlock,
    clearHistory,
    destroy
  }
}

export type DevToolsStoreReturn = ReturnType<typeof createDevToolsStore>
