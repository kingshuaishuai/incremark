import type { DevToolsState, DevToolsOptions, AppendRecord } from './types'
import { styles } from './styles'

const NODE_TYPE_COLORS: Record<string, string> = {
  heading: '#3b82f6',
  paragraph: '#22c55e',
  code: '#f59e0b',
  list: '#8b5cf6',
  table: '#ec4899',
  blockquote: '#06b6d4',
  thematicBreak: '#6b7280'
}

export class IncremarkDevTools {
  private container: HTMLElement | null = null
  private state: DevToolsState | null = null
  private isOpen = false
  private activeTab: 'overview' | 'blocks' | 'ast' | 'timeline' = 'overview'
  private selectedBlockId: string | null = null
  private appendHistory: AppendRecord[] = []
  private lastMarkdownLength = 0
  private options: Required<DevToolsOptions>
  private styleElement: HTMLStyleElement | null = null

  constructor(options: DevToolsOptions = {}) {
    this.options = {
      open: options.open ?? false,
      position: options.position ?? 'bottom-right',
      theme: options.theme ?? 'dark'
    }
    this.isOpen = this.options.open
  }

  /**
   * 挂载 DevTools 到 DOM
   */
  mount(target: HTMLElement | string = 'body'): this {
    const parent = typeof target === 'string' 
      ? document.querySelector(target) 
      : target

    if (!parent) {
      console.warn('[IncremarkDevTools] Mount target not found')
      return this
    }

    // 注入样式
    if (!this.styleElement) {
      this.styleElement = document.createElement('style')
      this.styleElement.textContent = styles
      document.head.appendChild(this.styleElement)
    }

    // 创建容器
    this.container = document.createElement('div')
    this.container.className = `incremark-devtools ${this.options.position} ${this.options.theme}`
    this.render()
    parent.appendChild(this.container)

    return this
  }

  /**
   * 卸载 DevTools
   */
  unmount(): this {
    if (this.container) {
      this.container.remove()
      this.container = null
    }
    if (this.styleElement) {
      this.styleElement.remove()
      this.styleElement = null
    }
    return this
  }

  /**
   * 更新状态
   */
  update(state: DevToolsState): this {
    // 检测 reset（markdown 长度减少）
    if (state.markdown.length < this.lastMarkdownLength) {
      this.appendHistory = []
      this.lastMarkdownLength = 0
    }

    // 记录 append 历史
    if (state.markdown.length > this.lastMarkdownLength) {
      const chunk = state.markdown.slice(this.lastMarkdownLength)
      this.appendHistory.push({
        timestamp: Date.now(),
        chunk,
        completedCount: state.completedBlocks.length,
        pendingCount: state.pendingBlocks.length
      })
      this.lastMarkdownLength = state.markdown.length
    }

    this.state = state
    this.render()
    return this
  }

  /**
   * 重置状态
   */
  reset(): this {
    this.state = null
    this.appendHistory = []
    this.lastMarkdownLength = 0
    this.selectedBlockId = null
    this.render()
    return this
  }

  /**
   * 打开面板
   */
  open(): this {
    this.isOpen = true
    this.render()
    return this
  }

  /**
   * 关闭面板
   */
  close(): this {
    this.isOpen = false
    this.render()
    return this
  }

  /**
   * 切换面板
   */
  toggle(): this {
    this.isOpen = !this.isOpen
    this.render()
    return this
  }

  private render(): void {
    if (!this.container) return

    const state = this.state

    this.container.innerHTML = `
      <button class="devtools-trigger" title="Incremark DevTools">
        <span>🔧</span>
        ${state?.isLoading ? '<span class="loading-dot"></span>' : ''}
      </button>
      <div class="devtools-panel ${this.isOpen ? 'open' : ''}">
        <header class="devtools-header">
          <h3>Incremark DevTools</h3>
          <div class="devtools-tabs">
            ${['overview', 'blocks', 'ast', 'timeline'].map(tab => `
              <button class="${this.activeTab === tab ? 'active' : ''}" data-tab="${tab}">
                ${tab}
              </button>
            `).join('')}
          </div>
          <button class="close-btn">×</button>
        </header>
        <main class="devtools-content">
          ${this.renderTabContent()}
        </main>
      </div>
    `

    this.bindEvents()
  }

  private renderTabContent(): string {
    const state = this.state

    if (!state) {
      return '<div style="color: #888; text-align: center;">等待数据...</div>'
    }

    switch (this.activeTab) {
      case 'overview':
        return this.renderOverview(state)
      case 'blocks':
        return this.renderBlocks(state)
      case 'ast':
        return this.renderAst(state)
      case 'timeline':
        return this.renderTimeline()
      default:
        return ''
    }
  }

  private renderOverview(state: DevToolsState): string {
    const nodeTypeStats: Record<string, number> = {}
    for (const block of state.blocks) {
      const type = block.node.type
      nodeTypeStats[type] = (nodeTypeStats[type] || 0) + 1
    }

    return `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${state.markdown.length}</div>
          <div class="stat-label">字符</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${state.blocks.length}</div>
          <div class="stat-label">总块数</div>
        </div>
        <div class="stat-card completed">
          <div class="stat-value">${state.completedBlocks.length}</div>
          <div class="stat-label">已完成</div>
        </div>
        <div class="stat-card pending">
          <div class="stat-value">${state.pendingBlocks.length}</div>
          <div class="stat-label">待处理</div>
        </div>
      </div>

      <div class="section">
        <h4>节点类型分布</h4>
        <div class="type-bars">
          ${Object.entries(nodeTypeStats).map(([type, count]) => `
            <div class="type-bar">
              <span class="type-color" style="background: ${NODE_TYPE_COLORS[type] || '#9ca3af'}"></span>
              <span class="type-name">${type}</span>
              <span class="type-count">${count}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="section">
        <h4>状态</h4>
        <div class="status-indicator ${state.isLoading ? 'loading' : ''}">
          ${state.isLoading ? '🔄 解析中...' : '✅ 空闲'}
        </div>
      </div>
    `
  }

  private renderBlocks(state: DevToolsState): string {
    const selectedBlock = state.blocks.find(b => b.id === this.selectedBlockId)

    return `
      <div class="blocks-list">
        ${state.blocks.map(block => `
          <div class="block-item ${block.id === this.selectedBlockId ? 'selected' : ''}" 
               data-block-id="${block.id}">
            <span class="block-status ${block.status}"></span>
            <span class="block-type" style="color: ${NODE_TYPE_COLORS[block.node.type] || '#9ca3af'}">
              ${block.node.type}
            </span>
            <span class="block-preview">${this.truncate(block.rawText, 50)}</span>
          </div>
        `).join('')}
      </div>
      ${selectedBlock ? `
        <div class="block-detail">
          <h4>块详情</h4>
          <div class="detail-row">
            <span class="label">ID:</span>
            <span class="value">${selectedBlock.id}</span>
          </div>
          <div class="detail-row">
            <span class="label">类型:</span>
            <span class="value">${selectedBlock.node.type}</span>
          </div>
          <div class="detail-row">
            <span class="label">状态:</span>
            <span class="value ${selectedBlock.status}">${selectedBlock.status}</span>
          </div>
          <div class="detail-row">
            <span class="label">范围:</span>
            <span class="value">${selectedBlock.startOffset} - ${selectedBlock.endOffset}</span>
          </div>
          <h5>原始文本</h5>
          <pre class="raw-text">${this.escapeHtml(selectedBlock.rawText)}</pre>
          <h5>AST 节点</h5>
          <pre class="ast-json">${this.escapeHtml(JSON.stringify(selectedBlock.node, null, 2))}</pre>
        </div>
      ` : ''}
    `
  }

  private renderAst(state: DevToolsState): string {
    return `<pre class="ast-tree">${this.escapeHtml(JSON.stringify(state.ast, null, 2))}</pre>`
  }

  private renderTimeline(): string {
    return `
      <div class="timeline-header">
        <span>共 ${this.appendHistory.length} 次 append</span>
        <button data-action="clear-history">清空</button>
      </div>
      <div class="timeline-list">
        ${this.appendHistory.map((record, i) => `
          <div class="timeline-item">
            <span class="time">${this.formatTime(record.timestamp)}</span>
            <span class="chunk">${this.escapeHtml(this.truncate(record.chunk.replace(/\n/g, '↵'), 30))}</span>
            <span class="stats">✅${record.completedCount} ⏳${record.pendingCount}</span>
          </div>
        `).join('')}
      </div>
    `
  }

  private bindEvents(): void {
    if (!this.container) return

    // Toggle button
    const trigger = this.container.querySelector('.devtools-trigger')
    trigger?.addEventListener('click', () => this.toggle())

    // Close button
    const closeBtn = this.container.querySelector('.close-btn')
    closeBtn?.addEventListener('click', () => this.close())

    // Tab buttons
    const tabs = this.container.querySelectorAll('.devtools-tabs button')
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab') as typeof this.activeTab
        if (tabName) {
          this.activeTab = tabName
          this.render()
        }
      })
    })

    // Block items
    const blockItems = this.container.querySelectorAll('.block-item')
    blockItems.forEach(item => {
      item.addEventListener('click', () => {
        const blockId = item.getAttribute('data-block-id')
        if (blockId) {
          this.selectedBlockId = blockId
          this.render()
        }
      })
    })

    // Clear history
    const clearBtn = this.container.querySelector('[data-action="clear-history"]')
    clearBtn?.addEventListener('click', () => {
      this.appendHistory = []
      this.render()
    })
  }

  private truncate(str: string, len: number): string {
    if (str.length <= len) return str
    return str.slice(0, len) + '...'
  }

  private formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString()
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }
}

/**
 * 创建 DevTools 实例
 */
export function createDevTools(options?: DevToolsOptions): IncremarkDevTools {
  return new IncremarkDevTools(options)
}

/**
 * 一行代码挂载 DevTools
 *
 * @example
 * ```ts
 * import { createIncremarkParser } from '@incremark/core'
 * import { mountDevTools } from '@incremark/devtools'
 *
 * const parser = createIncremarkParser({
 *   onChange: mountDevTools()  // 就这一行！
 * })
 * ```
 *
 * @example
 * ```ts
 * // 或者自定义选项
 * const parser = createIncremarkParser({
 *   onChange: mountDevTools({ position: 'bottom-left', theme: 'light' })
 * })
 * ```
 */
export function mountDevTools(options?: DevToolsOptions) {
  const devtools = new IncremarkDevTools(options)

  // 自动挂载
  if (typeof document !== 'undefined') {
    // 等待 DOM 就绪
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => devtools.mount())
    } else {
      devtools.mount()
    }
  }

  // 返回 onChange 回调函数
  return (state: {
    completedBlocks: any[]
    pendingBlocks: any[]
    markdown: string
    ast: any
  }) => {
    // 转换为 DevToolsState 格式
    const blocks = [
      ...state.completedBlocks,
      ...state.pendingBlocks
    ]

    devtools.update({
      blocks,
      completedBlocks: state.completedBlocks,
      pendingBlocks: state.pendingBlocks,
      markdown: state.markdown,
      ast: state.ast,
      isLoading: state.pendingBlocks.length > 0
    })
  }
}

