/* @jsxImportSource solid-js */

import type { RootContent, HTML, Code } from 'mdast'
import { Component, Show } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import type { JSX } from 'solid-js'
import type { ComponentMap, CodeBlockConfig } from '../types'
import type { ContainerNode } from './IncremarkContainer'
import { IncremarkHeading } from './IncremarkHeading'
import { IncremarkParagraph } from './IncremarkParagraph'
import IncremarkCode from './IncremarkCode'
import { IncremarkList } from './IncremarkList'
import { IncremarkTable } from './IncremarkTable'
import { IncremarkBlockquote } from './IncremarkBlockquote'
import { IncremarkThematicBreak } from './IncremarkThematicBreak'
import { IncremarkMath } from './IncremarkMath'
import { IncremarkHtmlElement } from './IncremarkHtmlElement'
import { IncremarkContainer } from './IncremarkContainer'
import { IncremarkDefault } from './IncremarkDefault'

type ExtendedRootContent = RootContent | ContainerNode

export interface IncremarkRendererProps {
  node: ExtendedRootContent
  customContainers?: Record<string, Component<any>>
  customCodeBlocks?: Record<string, Component<any>>
  codeBlockConfigs?: Record<string, CodeBlockConfig>
  blockStatus?: 'pending' | 'stable' | 'completed'
  components?: ComponentMap
}

// 默认组件映射
const defaultComponentMap: Record<string, Component<any>> = {
  heading: IncremarkHeading,
  paragraph: IncremarkParagraph,
  code: IncremarkCode,
  list: IncremarkList,
  table: IncremarkTable,
  blockquote: IncremarkBlockquote,
  thematicBreak: IncremarkThematicBreak,
  math: IncremarkMath,
  inlineMath: IncremarkMath,
  htmlElement: IncremarkHtmlElement,
  containerDirective: IncremarkContainer,
  leafDirective: IncremarkContainer,
  textDirective: IncremarkContainer,
}

function getComponent(type: string, customComponents?: ComponentMap): Component<any> {
  const map = { ...defaultComponentMap, ...customComponents }
  return map[type] || IncremarkDefault
}

/**
 * 类型守卫：检查是否是容器节点
 */
function isContainerNode(node: ExtendedRootContent): node is ContainerNode {
  const type = (node as any).type
  return type === 'containerDirective' ||
         type === 'leafDirective' ||
         type === 'textDirective'
}

/**
 * 类型守卫：检查是否是 html 节点
 */
function isHtmlNode(node: ExtendedRootContent): node is HTML {
  return node.type === 'html'
}

/**
 * IncremarkRenderer 组件
 * 路由不同节点类型到适当的组件
 */
export const IncremarkRenderer: Component<IncremarkRendererProps> = (props) => {
  return (
    <>
      {/* HTML 节点：渲染为代码块显示源代码 */}
      <Show when={isHtmlNode(props.node)}>
        <pre class="incremark-html-code"><code>{(props.node as HTML).value}</code></pre>
      </Show>

      {/* 容器节点：使用容器组件，传递 customContainers */}
      <Show when={isContainerNode(props.node) && !isHtmlNode(props.node)}>
        <IncremarkContainer
          node={props.node as ContainerNode}
          customContainers={props.customContainers}
        />
      </Show>

      {/* 代码节点：特殊处理，传递 customCodeBlocks、codeBlockConfigs 和 blockStatus */}
      <Show
        when={(props.node as RootContent).type === 'code' && !isHtmlNode(props.node) && !isContainerNode(props.node)}
      >
        <IncremarkCode
          node={props.node as Code}
          customCodeBlocks={props.customCodeBlocks}
          codeBlockConfigs={props.codeBlockConfigs}
          blockStatus={props.blockStatus}
          defaultCodeComponent={props.components?.['code']}
        />
      </Show>

      {/* 列表节点：传递所有 props */}
      <Show
        when={(props.node as RootContent).type === 'list' && !isHtmlNode(props.node) && !isContainerNode(props.node)}
      >
        <IncremarkList
          node={props.node as any}
          components={props.components}
          customContainers={props.customContainers}
          customCodeBlocks={props.customCodeBlocks}
          codeBlockConfigs={props.codeBlockConfigs}
          blockStatus={props.blockStatus}
        />
      </Show>

      {/* 引用块节点：传递所有 props */}
      <Show
        when={(props.node as RootContent).type === 'blockquote' && !isHtmlNode(props.node) && !isContainerNode(props.node)}
      >
        <IncremarkBlockquote
          node={props.node as any}
          components={props.components}
          customContainers={props.customContainers}
          customCodeBlocks={props.customCodeBlocks}
          codeBlockConfigs={props.codeBlockConfigs}
          blockStatus={props.blockStatus}
        />
      </Show>

      {/* 其他节点：使用对应组件 */}
      <Show
        when={
          (props.node as RootContent).type !== 'code' &&
          (props.node as RootContent).type !== 'list' &&
          (props.node as RootContent).type !== 'blockquote' &&
          !isHtmlNode(props.node) &&
          !isContainerNode(props.node)
        }
      >
        <Dynamic
          component={getComponent((props.node as RootContent).type, props.components)}
          node={props.node as RootContent}
        />
      </Show>
    </>
  )
}

export default IncremarkRenderer
