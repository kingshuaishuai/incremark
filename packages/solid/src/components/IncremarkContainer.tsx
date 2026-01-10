/* @jsxImportSource solid-js */

import type { RootContent } from 'mdast'
import { Component, For, Show } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import type { JSX } from 'solid-js'
import { IncremarkRenderer } from './IncremarkRenderer'

/**
 * 容器节点类型定义
 * 根据 directive 解析后的结构
 */
export interface ContainerNode {
  type: 'containerDirective' | 'leafDirective' | 'textDirective'
  name: string
  attributes?: Record<string, string>
  children?: RootContent[]
}

export interface IncremarkContainerProps {
  node: ContainerNode
  customContainers?: Record<string, Component<any>>
}

/**
 * 解析 attributes 字符串为对象
 * directive 的 attributes 可能是字符串格式，需要解析
 */
function parseOptions(attributes?: Record<string, string>): Record<string, any> {
  if (!attributes) return {}

  const options: Record<string, any> = {}
  for (const [key, value] of Object.entries(attributes)) {
    // 尝试解析 JSON 值
    try {
      options[key] = JSON.parse(value)
    } catch {
      // 如果不是 JSON，直接使用字符串值
      options[key] = value
    }
  }
  return options
}

/**
 * 容器组件
 * 渲染自定义容器（如 warning, info, tip）或默认容器
 */
export const IncremarkContainer: Component<IncremarkContainerProps> = (props) => {
  const containerName = () => props.node.name
  const options = () => parseOptions(props.node.attributes)
  const CustomContainer = () => props.customContainers?.[containerName()]

  // 如果没有自定义容器组件，使用默认渲染
  const hasCustomContainer = () => !!props.customContainers?.[containerName()]

  return (
    <Show
      when={hasCustomContainer()}
      fallback={
        <div class={`incremark-container incremark-container-${containerName()}`}>
          <Show when={props.node.children && props.node.children.length > 0}>
            <div class="incremark-container-content">
              <For each={props.node.children}>
                {(child) => (
                  <IncremarkRenderer node={child} />
                )}
              </For>
            </div>
          </Show>
        </div>
      }
    >
      {/* 使用 Dynamic 组件来渲染自定义容器 */}
      <Dynamic
        component={CustomContainer()!}
        name={containerName()}
        options={options()}
      >
        {/* 将容器内容作为 children 传递 */}
        <Show when={props.node.children && props.node.children.length > 0}>
          <For each={props.node.children}>
            {(child) => (
              <IncremarkRenderer node={child} />
            )}
          </For>
        </Show>
      </Dynamic>
    </Show>
  )
}
