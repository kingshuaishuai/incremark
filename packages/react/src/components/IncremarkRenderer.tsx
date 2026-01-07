import React from 'react'
import type { RootContent, HTML, Code } from 'mdast'
import type { ReactNode } from 'react'
import { IncremarkHeading } from './IncremarkHeading'
import { IncremarkParagraph } from './IncremarkParagraph'
import { IncremarkCode } from './IncremarkCode'
import { IncremarkList } from './IncremarkList'
import { IncremarkBlockquote } from './IncremarkBlockquote'
import { IncremarkTable } from './IncremarkTable'
import { IncremarkThematicBreak } from './IncremarkThematicBreak'
import { IncremarkMath } from './IncremarkMath'
import { IncremarkHtmlElement } from './IncremarkHtmlElement'
import { IncremarkContainer, type ContainerNode } from './IncremarkContainer'
import { IncremarkDefault } from './IncremarkDefault'

export interface IncremarkRendererProps {
  node: RootContent | ContainerNode
  components?: Partial<Record<string, React.ComponentType<{ node: any }>>>
  customContainers?: Record<string, React.ComponentType<{ name: string; options?: Record<string, any>; children?: ReactNode }>>
  customCodeBlocks?: Record<string, React.ComponentType<{ codeStr: string; lang?: string; completed?: boolean; takeOver?: boolean }>>
  codeBlockConfigs?: Record<string, { takeOver?: boolean }>
  blockStatus?: 'pending' | 'stable' | 'completed'
}

// 更通用的组件类型，允许不同的 node 类型
type NodeComponent = React.ComponentType<{ node: any }>

// 默认组件映射
const defaultComponents: Record<string, NodeComponent> = {
  heading: IncremarkHeading as NodeComponent,
  paragraph: IncremarkParagraph as NodeComponent,
  list: IncremarkList as NodeComponent,
  blockquote: IncremarkBlockquote as NodeComponent,
  table: IncremarkTable as NodeComponent,
  thematicBreak: IncremarkThematicBreak as NodeComponent,
  math: IncremarkMath as NodeComponent,
  inlineMath: IncremarkMath as NodeComponent,
  htmlElement: IncremarkHtmlElement as NodeComponent,
  containerDirective: IncremarkContainer as NodeComponent,
  leafDirective: IncremarkContainer as NodeComponent,
  textDirective: IncremarkContainer as NodeComponent
}

/**
 * 检查是否是容器节点
 */
function isContainerNode(node: RootContent | ContainerNode): node is ContainerNode {
  return (node as any).type === 'containerDirective' ||
         (node as any).type === 'leafDirective' ||
         (node as any).type === 'textDirective'
}

/**
 * 检查是否是 HTML 节点
 */
function isHtmlNode(node: RootContent | ContainerNode): node is HTML {
  return node.type === 'html'
}

/**
 * 获取组件
 */
function getComponent(type: string, userComponents: Partial<Record<string, NodeComponent>>): NodeComponent {
  return userComponents[type] || defaultComponents[type] || IncremarkDefault
}

/**
 * 渲染单个 AST 节点
 */
export const IncremarkRenderer: React.FC<IncremarkRendererProps> = ({
  node,
  components = {},
  customContainers,
  customCodeBlocks,
  codeBlockConfigs,
  blockStatus
}) => {
  // footnoteDefinition 节点：不渲染（由 IncremarkFootnotes 组件统一处理）
  if (node.type === 'footnoteDefinition') {
    return null
  }

  // HTML 节点：渲染为代码块显示源代码
  if (isHtmlNode(node)) {
    return (
      <pre className="incremark-html-code">
        <code>{node.value}</code>
      </pre>
    )
  }

  // 容器节点：使用容器组件，传递 customContainers
  if (isContainerNode(node)) {
    return (
      <IncremarkContainer
        node={node}
        customContainers={customContainers}
      />
    )
  }

  // 代码节点：特殊处理，传递 customCodeBlocks、codeBlockConfigs 和 blockStatus
  if (node.type === 'code') {
    return (
      <IncremarkCode
        node={node as Code}
        customCodeBlocks={customCodeBlocks}
        codeBlockConfigs={codeBlockConfigs}
        blockStatus={blockStatus}
        defaultCodeComponent={components?.['code'] as any}
      />
    )
  }

  // 其他节点：使用对应组件
  const Component = getComponent(node.type, components)
  return <Component node={node} />
}
