/**
 * Definition 管理器
 *
 * 职责：
 * - 从 AST 节点中提取 definitions
 * - 管理 Definition 映射表
 * - 提供访问 Definition 的方法
 */

import type { ParsedBlock, DefinitionMap } from '../../types'
import { collectAstNodes, isDefinitionNode } from '../../utils'

/**
 * Definition 管理器
 */
export class DefinitionManager {
  private definitions: DefinitionMap = {}

  /**
   * 从已完成的 blocks 中提取 definitions
   *
   * @param blocks 已完成的块
   */
  extractFromBlocks(blocks: ParsedBlock[]): void {
    for (const block of blocks) {
      const newDefinitions = this.findDefinitions(block)
      this.definitions = {
        ...this.definitions,
        ...newDefinitions
      }
    }
  }

  /**
   * 从 block 中提取 definitions
   *
   * @param block 解析块
   * @returns Definition 映射表
   */
  private findDefinitions(block: ParsedBlock): DefinitionMap {
    // 使用通用遍历工具收集 definition 节点
    const definitions = collectAstNodes(block.node, isDefinitionNode)

    return definitions.reduce<DefinitionMap>((acc, node) => {
      acc[node.identifier] = node
      return acc
    }, {})
  }

  /**
   * 获取所有 definitions
   *
   * @returns Definition 映射表
   */
  getAll(): DefinitionMap {
    return this.definitions
  }

  /**
   * 清空所有 definitions
   */
  clear(): void {
    this.definitions = {}
  }
}

