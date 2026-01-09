/**
 * AST 构建器统一接口和类型定义
 *
 * 支持两种引擎：
 * - marked: 极速模式，速度更快
 * - micromark: 稳定模式，更可靠，支持 div 内嵌 markdown
 */

import type { Root, RootContent } from 'mdast'
import type { Extension as MicromarkExtension } from 'micromark-util-types'
import type { Extension as MdastExtension } from 'mdast-util-from-markdown'
import type { MarkedExtension } from 'marked'
import type { ParsedBlock, BlockStatus, ParserOptions, ContainerConfig } from '../../types'

/**
 * 引擎类型
 */
export type EngineType = 'marked' | 'micromark'

/**
 * AST 构建器接口
 * 所有引擎实现必须遵循此接口
 */
export interface IAstBuilder {
  /** 容器配置（用于边界检测） */
  readonly containerConfig: ContainerConfig | undefined

  /**
   * 解析文本为 AST
   * @param text Markdown 文本
   * @returns AST
   */
  parse(text: string): Root

  /**
   * 将 AST 节点转换为 ParsedBlock
   * @param generateBlockId - 接收 block 的 startOffset 参数，用于生成稳定的 id
   */
  nodesToBlocks(
    nodes: RootContent[],
    startOffset: number,
    rawText: string,
    status: BlockStatus,
    generateBlockId: (startOffset: number) => string
  ): ParsedBlock[]

  /**
   * 更新配置选项（动态更新，不需要重建实例）
   * @param options 部分配置选项
   */
  updateOptions(options: Partial<EngineParserOptions>): void
}

/**
 * Marked 引擎扩展配置
 */
export interface MarkedEngineExtension {
  /** marked 扩展列表 */
  extensions: MarkedExtension[]
}

/**
 * Micromark 引擎扩展配置
 */
export interface MicromarkEngineExtension {
  /** micromark 语法扩展 */
  extensions: MicromarkExtension[]
  /** mdast 转换扩展 */
  mdastExtensions: MdastExtension[]
}

/**
 * 统一插件格式
 *
 * 插件可以同时支持多个引擎，运行时会根据当前引擎选择对应配置
 *
 * @example
 * ```ts
 * const myPlugin: IncremarkPlugin = {
 *   name: 'my-plugin',
 *   type: 'both', // 支持两种引擎
 *   marked: {
 *     extensions: [myMarkedExtension]
 *   },
 *   micromark: {
 *     extensions: [myMicromarkExt],
 *     mdastExtensions: [myMdastExt]
 *   }
 * }
 * ```
 */
export interface IncremarkPlugin {
  /** 插件名称 */
  name: string

  /**
   * 插件支持的引擎类型
   * - 'marked': 仅支持 marked 引擎
   * - 'micromark': 仅支持 micromark 引擎
   * - 'both': 同时支持两种引擎
   */
  type: 'marked' | 'micromark' | 'both'

  /**
   * Marked 引擎配置
   * 当 type 为 'marked' 或 'both' 时必须提供
   */
  marked?: MarkedEngineExtension

  /**
   * Micromark 引擎配置
   * 当 type 为 'micromark' 或 'both' 时必须提供
   */
  micromark?: MicromarkEngineExtension
}

/**
 * 引擎特定的解析器选项
 *
 * 注意：不再包含 engine 选项，引擎切换通过注入 astBuilder 类实现
 * 这样可以确保 tree-shaking 正常工作
 */
export interface EngineParserOptions extends Omit<ParserOptions, 'extensions' | 'mdastExtensions'> {
  /**
   * 统一插件列表
   * 插件会根据当前引擎自动选择对应的扩展配置
   */
  plugins?: IncremarkPlugin[]

  /**
   * Micromark 扩展（仅 micromark 引擎使用）
   * @deprecated 建议使用 plugins 统一配置
   */
  extensions?: MicromarkExtension[]

  /**
   * Mdast 扩展（仅 micromark 引擎使用）
   * @deprecated 建议使用 plugins 统一配置
   */
  mdastExtensions?: MdastExtension[]

  /**
   * Marked 扩展（仅 marked 引擎使用）
   * @deprecated 建议使用 plugins 统一配置
   */
  markedExtensions?: MarkedExtension[]
}

/**
 * 从插件列表中提取 marked 扩展
 */
export function extractMarkedExtensions(plugins: IncremarkPlugin[]): MarkedExtension[] {
  const extensions: MarkedExtension[] = []
  for (const plugin of plugins) {
    if ((plugin.type === 'marked' || plugin.type === 'both') && plugin.marked) {
      extensions.push(...plugin.marked.extensions)
    }
  }
  return extensions
}

/**
 * 从插件列表中提取 micromark 扩展
 */
export function extractMicromarkExtensions(plugins: IncremarkPlugin[]): {
  extensions: MicromarkExtension[]
  mdastExtensions: MdastExtension[]
} {
  const extensions: MicromarkExtension[] = []
  const mdastExtensions: MdastExtension[] = []

  for (const plugin of plugins) {
    if ((plugin.type === 'micromark' || plugin.type === 'both') && plugin.micromark) {
      extensions.push(...plugin.micromark.extensions)
      mdastExtensions.push(...plugin.micromark.mdastExtensions)
    }
  }

  return { extensions, mdastExtensions }
}

/**
 * 验证插件配置是否与引擎兼容
 */
export function validatePluginsForEngine(
  plugins: IncremarkPlugin[],
  engine: EngineType
): { valid: boolean; incompatible: string[] } {
  const incompatible: string[] = []

  for (const plugin of plugins) {
    if (engine === 'marked' && plugin.type === 'micromark') {
      incompatible.push(plugin.name)
    } else if (engine === 'micromark' && plugin.type === 'marked') {
      incompatible.push(plugin.name)
    }
  }

  return {
    valid: incompatible.length === 0,
    incompatible
  }
}
