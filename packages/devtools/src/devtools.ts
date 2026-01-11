/**
 * @file devtools.ts - 框架无关的 DevTools API
 * @description 提供纯 JS API 用于从任何框架挂载 DevTools
 */

import type { IncremarkParser } from '@incremark/core'
import type { DevToolsOptions, RegisterOptions } from './types'
import { createDevToolsStore } from './stores/useDevTools.svelte'
import type { DevToolsStoreReturn } from './stores/types'
import { mount, unmount as svelteUnmount } from 'svelte'
import DevToolsComponent from './components/DevTools.svelte'

// 检测是否在浏览器环境
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'

/**
 * IncremarkDevTools - 框架无关的 DevTools 实现
 * 支持多 parser 注册和切换
 */
export class IncremarkDevTools {
  private container: HTMLElement | null = null
  private options: Required<DevToolsOptions>
  private svelteComponent: Record<string, unknown> | null = null
  private store: DevToolsStoreReturn

  // 挂载状态
  private isMounted = false
  // 待注册队列（在 mount 之前调用的 register）
  private pendingRegistrations: Array<{ parser: IncremarkParser; options: RegisterOptions }> = []

  constructor(options: DevToolsOptions = {}) {
    this.options = {
      open: options.open ?? false,
      position: options.position ?? 'bottom-right',
      theme: options.theme ?? 'dark',
      locale: options.locale ?? 'en-US'
    }
    // 创建 store
    this.store = createDevToolsStore(this.options)
  }

  /**
   * 挂载 DevTools 到 DOM
   * 注意：此方法只能在浏览器环境中调用
   * @returns Promise 完成后返回 this
   */
  mount(target: HTMLElement | string = 'body'): this {
    if (!isBrowser) {
      console.warn('[IncremarkDevTools] mount() can only be called in browser environment')
      return this
    }

    if (this.isMounted) {
      return this
    }

    const parent = typeof target === 'string'
      ? document.querySelector(target)
      : target

    if (!parent) {
      console.warn('[IncremarkDevTools] Mount target not found')
      return this
    }

    // 创建容器
    this.container = document.createElement('div')
    this.container.id = 'incremark-devtools-root'
    parent.appendChild(this.container)

    // 挂载 Svelte 组件
    this.svelteComponent = mount(DevToolsComponent, {
      target: this.container,
      props: {
        store: this.store,
        position: this.options.position,
        theme: this.options.theme
      }
    })

    this.isMounted = true

    // 处理待注册队列
    for (const { parser, options } of this.pendingRegistrations) {
      this.register(parser, options)
    }
    this.pendingRegistrations = []

    return this
  }

  /**
   * 卸载 DevTools
   */
  unmount(): this {
    if (!isBrowser) {
      return this
    }

    // 清理 store
    this.store.destroy()

    // 卸载 Svelte 组件
    if (this.svelteComponent) {
      svelteUnmount(this.svelteComponent)
      this.svelteComponent = null
    }

    if (this.container) {
      this.container.remove()
      this.container = null
    }

    this.isMounted = false
    return this
  }

  /**
   * 注册一个 parser
   */
  register(parser: IncremarkParser, options: RegisterOptions): this {
    // 如果还没挂载，加入待注册队列
    if (!this.isMounted) {
      this.pendingRegistrations.push({ parser, options })
      return this
    }

    this.store.register(parser, options)
    return this
  }

  /**
   * 注销一个 parser
   */
  unregister(id: string): this {
    this.store.unregister(id)
    return this
  }

  /**
   * 选择一个 parser
   */
  selectParser(id: string): this {
    this.store.selectParser(id)
    return this
  }

  /**
   * 打开面板
   */
  open(): this {
    this.store.open()
    return this
  }

  /**
   * 关闭面板
   */
  close(): this {
    this.store.close()
    return this
  }

  /**
   * 切换面板
   */
  toggle(): this {
    this.store.toggle()
    return this
  }
}

/**
 * 创建 DevTools 实例
 */
export function createDevTools(options?: DevToolsOptions): IncremarkDevTools {
  return new IncremarkDevTools(options)
}

/**
 * 一行代码挂载 DevTools（兼容旧 API）
 * @deprecated 请使用 createDevTools() + register() 方式
 */
export function mountDevTools(options?: DevToolsOptions) {
  const devtools = new IncremarkDevTools(options)

  // 自动挂载
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => devtools.mount())
    } else {
      devtools.mount()
    }
  }

  // 返回 onChange 回调函数（兼容旧 API）
  return () => {
    console.warn('[IncremarkDevTools] mountDevTools callback is deprecated, use register() instead')
  }
}
