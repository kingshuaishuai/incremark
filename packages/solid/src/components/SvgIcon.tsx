/* @jsxImportSource solid-js */

import type { Component } from 'solid-js'

export interface SvgIconProps {
  /** SVG 字符串内容 */
  svg: string
  /** 图标大小 class，如 incremark-icon--sm, incremark-icon--md 等 */
  sizeClass?: string
}

/**
 * SvgIcon 组件
 *
 * 直接渲染 SVG 字符串
 */
export const SvgIcon: Component<SvgIconProps> = (props) => {
  return (
    <span
      classList={{
        'incremark-icon': true,
        [props.sizeClass || '']: !!props.sizeClass
      }}
      innerHTML={props.svg}
      aria-hidden="true"
    />
  )
}
