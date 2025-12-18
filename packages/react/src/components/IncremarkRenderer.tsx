import React from 'react'
import type { RootContent, TextChunk } from '@incremark/core'

export interface IncremarkRendererProps {
  node: RootContent
  components?: Partial<Record<string, React.ComponentType<{ node: any }>>>
}

// 扩展的文本节点类型（支持 chunks）
interface TextNodeWithChunks {
  type: 'text'
  value: string
  stableLength?: number
  chunks?: TextChunk[]
}

/**
 * 获取文本节点的稳定部分（不需要动画）
 */
function getStableText(node: TextNodeWithChunks): string {
  if (!node.chunks || node.chunks.length === 0) {
    return node.value
  }
  return node.value.slice(0, node.stableLength ?? 0)
}

// 渲染 inline 子节点
function renderInlineChildren(children: any[]): React.ReactNode {
  if (!children) return null

  return children.map((child, i) => {
    switch (child.type) {
      case 'text': {
        const textNode = child as TextNodeWithChunks
        // 如果有 chunks，分别渲染稳定部分和 chunk 部分
        if (textNode.chunks && textNode.chunks.length > 0) {
          return (
            <React.Fragment key={i}>
              {/* 稳定文本（无动画） */}
              {getStableText(textNode)}
              {/* 新增的 chunk 部分（带渐入动画） */}
              {textNode.chunks.map((chunk, chunkIdx) => (
                <span key={chunkIdx} className="incremark-fade-in">
                  {chunk.text}
                </span>
              ))}
            </React.Fragment>
          )
        }
        return <React.Fragment key={i}>{child.value}</React.Fragment>
      }
      case 'strong':
        return <strong key={i}>{renderInlineChildren(child.children)}</strong>
      case 'emphasis':
        return <em key={i}>{renderInlineChildren(child.children)}</em>
      case 'inlineCode':
        return (
          <code key={i} className="incremark-inline-code">
            {child.value}
          </code>
        )
      case 'link':
        return (
          <a key={i} href={child.url} target="_blank" rel="noopener noreferrer">
            {renderInlineChildren(child.children)}
          </a>
        )
      case 'image':
        return <img key={i} src={child.url} alt={child.alt || ''} loading="lazy" />
      case 'break':
        return <br key={i} />
      case 'delete':
        return <del key={i}>{renderInlineChildren(child.children)}</del>
      case 'paragraph':
        // 段落内的内容直接展开
        return <React.Fragment key={i}>{renderInlineChildren(child.children)}</React.Fragment>
      case 'html':
        // 原始 HTML
        return <span key={i} dangerouslySetInnerHTML={{ __html: child.value }} />
      default:
        return <span key={i}>{child.value || ''}</span>
    }
  })
}

// 渲染块级子节点（递归）
function renderBlockChildren(children: any[], components: Record<string, React.ComponentType<{ node: any }>>): React.ReactNode {
  if (!children) return null

  return children.map((child, i) => {
    const Component = components[child.type]
    if (Component) {
      return <Component key={i} node={child} />
    }
    // 回退到 inline 渲染
    if (child.children) {
      return <React.Fragment key={i}>{renderInlineChildren(child.children)}</React.Fragment>
    }
    return <span key={i}>{child.value || ''}</span>
  })
}

// 默认组件
const DefaultHeading: React.FC<{ node: any }> = ({ node }) => {
  const Tag = `h${node.depth}` as keyof JSX.IntrinsicElements
  return <Tag className="incremark-heading">{renderInlineChildren(node.children)}</Tag>
}

const DefaultParagraph: React.FC<{ node: any }> = ({ node }) => (
  <p className="incremark-paragraph">{renderInlineChildren(node.children)}</p>
)

const DefaultCode: React.FC<{ node: any }> = ({ node }) => (
  <div className="incremark-code">
    <div className="code-header">
      <span className="language">{node.lang || 'text'}</span>
    </div>
    <pre>
      <code>{node.value}</code>
    </pre>
  </div>
)

const DefaultList: React.FC<{ node: any }> = ({ node }) => {
  const Tag = node.ordered ? 'ol' : 'ul'
  return (
    <Tag className="incremark-list">
      {node.children?.map((item: any, i: number) => (
        <li key={i}>
          {/* listItem 的 children 通常是 paragraph，需要递归渲染 */}
          {renderInlineChildren(item.children)}
        </li>
      ))}
    </Tag>
  )
}

const DefaultBlockquote: React.FC<{ node: any }> = ({ node }) => (
  <blockquote className="incremark-blockquote">
    {/* blockquote 的 children 是段落等块级节点 */}
    {node.children?.map((child: any, i: number) => (
      <React.Fragment key={i}>
        {child.type === 'paragraph' ? (
          <p>{renderInlineChildren(child.children)}</p>
        ) : (
          renderInlineChildren(child.children || [])
        )}
      </React.Fragment>
    ))}
  </blockquote>
)

const DefaultTable: React.FC<{ node: any }> = ({ node }) => (
  <div className="incremark-table-wrapper">
    <table className="incremark-table">
      <thead>
        {node.children?.[0] && (
          <tr>
            {node.children[0].children?.map((cell: any, i: number) => (
              <th key={i}>{renderInlineChildren(cell.children)}</th>
            ))}
          </tr>
        )}
      </thead>
      <tbody>
        {node.children?.slice(1).map((row: any, i: number) => (
          <tr key={i}>
            {row.children?.map((cell: any, j: number) => (
              <td key={j}>{renderInlineChildren(cell.children)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

const DefaultThematicBreak: React.FC = () => <hr className="incremark-hr" />

const DefaultDefault: React.FC<{ node: any }> = ({ node }) => (
  <div className="incremark-unknown" data-type={node.type}>
    <pre>{JSON.stringify(node, null, 2)}</pre>
  </div>
)

const defaultComponents: Record<string, React.ComponentType<{ node: any }>> = {
  heading: DefaultHeading,
  paragraph: DefaultParagraph,
  code: DefaultCode,
  list: DefaultList,
  blockquote: DefaultBlockquote,
  table: DefaultTable,
  thematicBreak: DefaultThematicBreak
}

/**
 * 渲染单个 AST 节点
 */
export const IncremarkRenderer: React.FC<IncremarkRendererProps> = ({ node, components = {} }) => {
  const mergedComponents = { ...defaultComponents, ...components }
  const Component = mergedComponents[node.type] || DefaultDefault
  return <Component node={node} />
}
