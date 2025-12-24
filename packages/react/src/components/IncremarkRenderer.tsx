import React from 'react'
import type { RootContent, TextChunk } from '@incremark/core'
import type { 
  PhrasingContent, 
  Text, 
  Strong, 
  Emphasis, 
  InlineCode,
  Link,
  Image,
  Break,
  Delete,
  Paragraph,
  HTML,
  Heading,
  Code,
  List,
  ListItem,
  Blockquote,
  Table,
  TableRow,
  TableCell
} from 'mdast'
import { IncremarkHeading } from './IncremarkHeading'
import { IncremarkParagraph } from './IncremarkParagraph'
import { IncremarkInline } from './IncremarkInline'
import { IncremarkCode } from './IncremarkCode'
import { IncremarkList } from './IncremarkList'
import { IncremarkBlockquote } from './IncremarkBlockquote'
import { IncremarkTable } from './IncremarkTable'
import { IncremarkThematicBreak } from './IncremarkThematicBreak'
import { IncremarkMath } from './IncremarkMath'
import { IncremarkHtmlElement, type HtmlElementNode } from './IncremarkHtmlElement'
import { IncremarkDefault } from './IncremarkDefault'
import { IncremarkContainer, type ContainerNode } from './IncremarkContainer'

export interface IncremarkRendererProps {
  node: RootContent | ContainerNode
  components?: Partial<Record<string, React.ComponentType<{ node: RootContent }>>>
  customContainers?: Record<string, React.ComponentType<{ name: string; options?: Record<string, any>; children?: React.ReactNode }>>
  customCodeBlocks?: Record<string, React.ComponentType<{ codeStr: string; lang?: string }>>
  blockStatus?: 'pending' | 'stable' | 'completed'
}

// 扩展的文本节点（支持 chunks）
interface TextNodeWithChunks extends Text {
  stableLength?: number
  chunks?: TextChunk[]
}

// 扩展的 PhrasingContent，支持 chunks
type ExtendedPhrasingContent = 
  | TextNodeWithChunks 
  | Strong 
  | Emphasis 
  | InlineCode 
  | Link 
  | Image 
  | Break 
  | Delete 
  | Paragraph 
  | HTML

/**
 * 获取文本节点的稳定部分（不需要动画）
 */
function getStableText(node: TextNodeWithChunks): string {
  if (!node.chunks || node.chunks.length === 0) {
    return node.value
  }
  return node.value.slice(0, node.stableLength ?? 0)
}

/**
 * 类型守卫：检查是否是带 chunks 的文本节点
 */
function isTextNodeWithChunks(node: ExtendedPhrasingContent): node is TextNodeWithChunks {
  return node.type === 'text' && 'chunks' in node && Array.isArray((node as TextNodeWithChunks).chunks)
}

// 渲染 inline 子节点（使用 IncremarkInline 组件）
function renderInlineChildren(children: ExtendedPhrasingContent[] | undefined): React.ReactNode {
  if (!children) return null
  
  // 分离 PhrasingContent 和其他类型
  const phrasingNodes: PhrasingContent[] = []
  const otherNodes: React.ReactNode[] = []
  
  children.forEach((child, i) => {
    if (child.type === 'paragraph') {
      otherNodes.push(
        <React.Fragment key={i}>
          <IncremarkInline nodes={(child as Paragraph).children as PhrasingContent[]} />
        </React.Fragment>
      )
    } else if (child.type === 'html') {
      otherNodes.push(
        <span key={i} dangerouslySetInnerHTML={{ __html: (child as HTML).value }} />
      )
    } else {
      phrasingNodes.push(child as PhrasingContent)
    }
  })
  
  return (
    <>
      {otherNodes}
      {phrasingNodes.length > 0 && <IncremarkInline nodes={phrasingNodes} />}
    </>
  )
}

// 默认组件
const DefaultHeading: React.FC<{ node: Heading }> = ({ node }) => {
  return <IncremarkHeading node={node} />
}

const DefaultParagraph: React.FC<{ node: Paragraph }> = ({ node }) => (
  <IncremarkParagraph node={node} />
)

const DefaultCode: React.FC<{ node: Code }> = ({ node }) => (
  <IncremarkCode node={node} />
)

const DefaultList: React.FC<{ node: List }> = ({ node }) => (
  <IncremarkList node={node} />
)

const DefaultBlockquote: React.FC<{ node: Blockquote }> = ({ node }) => (
  <IncremarkBlockquote node={node} />
)

const DefaultTable: React.FC<{ node: Table }> = ({ node }) => (
  <IncremarkTable node={node} />
)

const DefaultThematicBreak: React.FC = () => <IncremarkThematicBreak />

const DefaultMath: React.FC<{ node: any }> = ({ node }) => (
  <IncremarkMath node={node} />
)

const DefaultHtmlElement: React.FC<{ node: HtmlElementNode }> = ({ node }) => (
  <IncremarkHtmlElement node={node} />
)

const DefaultDefault: React.FC<{ node: RootContent }> = ({ node }) => (
  <IncremarkDefault node={node} />
)

// 将具体组件类型转换为通用类型
type NodeComponent = React.ComponentType<{ node: RootContent }>

const defaultComponents: Record<string, NodeComponent> = {
  heading: DefaultHeading as NodeComponent,
  paragraph: DefaultParagraph as NodeComponent,
  code: DefaultCode as NodeComponent,
  list: DefaultList as NodeComponent,
  blockquote: DefaultBlockquote as NodeComponent,
  table: DefaultTable as NodeComponent,
  thematicBreak: DefaultThematicBreak as NodeComponent,
  math: DefaultMath as NodeComponent,
  inlineMath: DefaultMath as NodeComponent,
  htmlElement: DefaultHtmlElement as NodeComponent,
  default: DefaultDefault as NodeComponent
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
 * 渲染单个 AST 节点
 */
export const IncremarkRenderer: React.FC<IncremarkRendererProps> = ({ 
  node, 
  components = {},
  customContainers,
  customCodeBlocks,
  blockStatus
}) => {
  // footnoteDefinition 节点：不渲染（由 IncremarkFootnotes 组件统一处理）
  if (node.type === 'footnoteDefinition') {
    return null
  }

  // HTML 节点：渲染为代码块显示源代码
  if (node.type === 'html') {
    return (
      <pre className="incremark-html-code">
        <code>{(node as HTML).value}</code>
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

  // 代码节点：特殊处理，传递 customCodeBlocks 和 blockStatus
  if (node.type === 'code') {
    return (
      <IncremarkCode 
        node={node as Code} 
        customCodeBlocks={customCodeBlocks}
        blockStatus={blockStatus}
      />
    )
  }

  const mergedComponents = { ...defaultComponents, ...components }
  const Component = mergedComponents[node.type] || DefaultDefault
  return <Component node={node} />
}
