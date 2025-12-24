import React from 'react'
import type { RootContent } from 'mdast'
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
  customContainers?: Record<string, React.ComponentType<{ name: string; options?: Record<string, any>; children?: React.ReactNode }>>
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

export const IncremarkContainer: React.FC<IncremarkContainerProps> = ({ node, customContainers }) => {
  const containerName = node.name
  const options = parseOptions(node.attributes)
  const CustomContainer = customContainers?.[containerName]

  // 如果有自定义容器组件，使用自定义组件
  if (CustomContainer) {
    return (
      <CustomContainer name={containerName} options={options}>
        {node.children?.map((child, index) => (
          <IncremarkRenderer key={index} node={child} />
        ))}
      </CustomContainer>
    )
  }

  // 如果没有自定义容器组件，使用默认渲染
  return (
    <div className={`incremark-container incremark-container-${containerName}`}>
      {node.children && node.children.length > 0 && (
        <div className="incremark-container-content">
          {node.children.map((child, index) => (
            <IncremarkRenderer key={index} node={child} />
          ))}
        </div>
      )}
    </div>
  )
}

