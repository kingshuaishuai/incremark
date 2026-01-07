import React from 'react'

/**
 * SvgIcon 组件
 * 
 * 直接渲染 SVG 字符串
 */
export interface SvgIconProps {
  /** SVG 字符串内容 */
  svg: string
  /** 图标大小 class，如 incremark-icon--sm, incremark-icon--md 等 */
  sizeClass?: string
  /** 自定义类名 */
  className?: string
}

export const SvgIcon: React.FC<SvgIconProps> = ({
  svg,
  sizeClass,
  className
}) => {
  return (
    <span
      className={`incremark-icon ${sizeClass || ''} ${className || ''}`.trim()}
      dangerouslySetInnerHTML={{ __html: svg }}
      aria-hidden="true"
    />
  )
}
