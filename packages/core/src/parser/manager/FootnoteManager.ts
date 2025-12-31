/**
 * Footnote 管理器
 *
 * 职责：
 * - 从 AST 节点中提取 footnote definitions
 * - 收集脚注引用顺序
 * - 管理 Footnote Definition 映射表
 * - 提供访问 Footnote 的方法
 */

import type { RootContent, FootnoteDefinition } from 'mdast'
import type { FootnoteDefinitionMap, ParsedBlock } from '../../types'
import { collectAstNodes, isFootnoteDefinitionNode, traverseAst } from '../../utils'

/**
 * Footnote 管理器
 */
export class FootnoteManager {
  private definitions: FootnoteDefinitionMap = {}
  private referenceOrder: string[] = []

  /**
   * 从已完成的 blocks 中提取 footnote definitions
   *
   * @param blocks 已完成的块
   */
  extractDefinitionsFromBlocks(blocks: ParsedBlock[]): void {
    for (const block of blocks) {
      const newDefinitions = this.findFootnoteDefinitions(block)
      this.definitions = {
        ...this.definitions,
        ...newDefinitions
      }
    }
  }

  /**
   * 从 block 中提取 footnote definitions
   *
   * @param block 解析块
   * @returns Footnote Definition 映射表
   */
  private findFootnoteDefinitions(block: ParsedBlock): FootnoteDefinitionMap {
    // 使用通用遍历工具收集 footnote definition 节点
    const definitions = collectAstNodes(block.node, isFootnoteDefinitionNode)

    return definitions.reduce<FootnoteDefinitionMap>((acc, node) => {
      acc[node.identifier] = node
      return acc
    }, {})
  }

  /**
   * 收集 AST 中的脚注引用（按出现顺序）
   *
   * @param nodes AST 节点列表
   */
  collectReferences(nodes: RootContent[]): void {
    nodes.forEach((node) => {
      traverseAst(node, (n) => {
        // 检查是否是脚注引用
        if (n.type === 'footnoteReference') {
          const identifier = n.identifier
          // 去重：只记录第一次出现的位置
          if (!this.referenceOrder.includes(identifier)) {
            this.referenceOrder.push(identifier)
          }
        }
      })
    })
  }

  /**
   * 获取所有 footnote definitions
   *
   * @returns Footnote Definition 映射表
   */
  getDefinitions(): FootnoteDefinitionMap {
    return this.definitions
  }

  /**
   * 获取脚注引用顺序
   *
   * @returns 脚注引用顺序
   */
  getReferenceOrder(): string[] {
    return this.referenceOrder
  }

  /**
   * 清空所有 footnote definitions 和引用顺序
   */
  clear(): void {
    this.definitions = {}
    this.referenceOrder = []
  }
}

