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

export interface IncremarkRendererProps {
  node: RootContent
  components?: Partial<Record<string, React.ComponentType<{ node: RootContent }>>>
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

// 渲染 inline 子节点
function renderInlineChildren(children: ExtendedPhrasingContent[] | undefined): React.ReactNode {
  if (!children) return null

  return children.map((child, i) => {
    switch (child.type) {
      case 'text': {
        const textNode = child as TextNodeWithChunks
        // 如果有 chunks，分别渲染稳定部分和 chunk 部分
        if (textNode.chunks && textNode.chunks.length > 0) {
          return (
            <React.Fragment key={i}>
              {getStableText(textNode)}
              {textNode.chunks.map((chunk) => (
                <span key={chunk.createdAt} className="incremark-fade-in">
                  {chunk.text}
                </span>
              ))}
            </React.Fragment>
          )
        }
        return <React.Fragment key={i}>{textNode.value}</React.Fragment>
      }
      case 'strong':
        return <strong key={i}>{renderInlineChildren(child.children as ExtendedPhrasingContent[])}</strong>
      case 'emphasis':
        return <em key={i}>{renderInlineChildren(child.children as ExtendedPhrasingContent[])}</em>
      case 'inlineCode':
        return (
          <code key={i} className="incremark-inline-code">
            {child.value}
          </code>
        )
      case 'link':
        return (
          <a key={i} href={child.url} target="_blank" rel="noopener noreferrer">
            {renderInlineChildren(child.children as ExtendedPhrasingContent[])}
          </a>
        )
      case 'image':
        return <img key={i} src={child.url} alt={child.alt || ''} loading="lazy" />
      case 'break':
        return <br key={i} />
      case 'delete':
        return <del key={i}>{renderInlineChildren(child.children as ExtendedPhrasingContent[])}</del>
      case 'paragraph':
        // 段落内的内容直接展开
        return <React.Fragment key={i}>{renderInlineChildren((child as Paragraph).children as ExtendedPhrasingContent[])}</React.Fragment>
      case 'html':
        // 原始 HTML
        return <span key={i} dangerouslySetInnerHTML={{ __html: (child as HTML).value }} />
      default:
        return <span key={i}>{(child as { value?: string }).value || ''}</span>
    }
  })
}

// 默认组件
const DefaultHeading: React.FC<{ node: Heading }> = ({ node }) => {
  const Tag = `h${node.depth}` as keyof JSX.IntrinsicElements
  return <Tag className="incremark-heading">{renderInlineChildren(node.children as ExtendedPhrasingContent[])}</Tag>
}

const DefaultParagraph: React.FC<{ node: Paragraph }> = ({ node }) => (
  <p className="incremark-paragraph">{renderInlineChildren(node.children as ExtendedPhrasingContent[])}</p>
)

const DefaultCode: React.FC<{ node: Code }> = ({ node }) => (
  <div className="incremark-code">
    <div className="code-header">
      <span className="language">{node.lang || 'text'}</span>
    </div>
    <pre>
      <code>{node.value}</code>
    </pre>
  </div>
)

const DefaultList: React.FC<{ node: List }> = ({ node }) => {
  const Tag = node.ordered ? 'ol' : 'ul'
  return (
    <Tag className="incremark-list">
      {node.children?.map((item: ListItem, i: number) => (
        <li key={i}>
          {/* listItem 的 children 通常是 paragraph，需要递归渲染 */}
          {renderInlineChildren(item.children as ExtendedPhrasingContent[])}
        </li>
      ))}
    </Tag>
  )
}

const DefaultBlockquote: React.FC<{ node: Blockquote }> = ({ node }) => (
  <blockquote className="incremark-blockquote">
    {/* blockquote 的 children 是段落等块级节点 */}
    {node.children?.map((child: Blockquote['children'][number], i: number) => (
      <React.Fragment key={i}>
        {child.type === 'paragraph' ? (
          <p>{renderInlineChildren((child as Paragraph).children as ExtendedPhrasingContent[])}</p>
        ) : 'children' in child && Array.isArray(child.children) ? (
          renderInlineChildren(child.children as ExtendedPhrasingContent[])
        ) : null}
      </React.Fragment>
    ))}
  </blockquote>
)

const DefaultTable: React.FC<{ node: Table }> = ({ node }) => (
  <div className="incremark-table-wrapper">
    <table className="incremark-table">
      <thead>
        {node.children?.[0] && (
          <tr>
            {(node.children[0] as TableRow).children?.map((cell: TableCell, i: number) => (
              <th key={i}>{renderInlineChildren(cell.children as ExtendedPhrasingContent[])}</th>
            ))}
          </tr>
        )}
      </thead>
      <tbody>
        {node.children?.slice(1).map((row: TableRow, i: number) => (
          <tr key={i}>
            {row.children?.map((cell: TableCell, j: number) => (
              <td key={j}>{renderInlineChildren(cell.children as ExtendedPhrasingContent[])}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

const DefaultThematicBreak: React.FC = () => <hr className="incremark-hr" />

const DefaultDefault: React.FC<{ node: RootContent }> = ({ node }) => (
  <div className="incremark-unknown" data-type={node.type}>
    <pre>{JSON.stringify(node, null, 2)}</pre>
  </div>
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
  thematicBreak: DefaultThematicBreak as NodeComponent
}

/**
 * 渲染单个 AST 节点
 */
export const IncremarkRenderer: React.FC<IncremarkRendererProps> = ({ node, components = {} }) => {
  const mergedComponents = { ...defaultComponents, ...components }
  const Component = mergedComponents[node.type] || DefaultDefault
  return <Component node={node} />
}
