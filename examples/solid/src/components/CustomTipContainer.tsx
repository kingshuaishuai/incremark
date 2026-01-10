/* @jsxImportSource solid-js */

import type { JSX } from 'solid-js'
import { Component, Show } from 'solid-js'

export interface CustomTipContainerProps {
  name: string
  options?: Record<string, any>
  children?: JSX.Element
}

export const CustomTipContainer: Component<CustomTipContainerProps> = (props) => {
  return (
    <div class="custom-tip-container">
      <div class="custom-tip-header">
        <span class="custom-tip-icon">💡</span>
        <Show when={props.options?.title} fallback={<span class="custom-tip-title">提示</span>}>
          <span class="custom-tip-title">{props.options?.title}</span>
        </Show>
      </div>
      <div class="custom-tip-content">
        {props.children}
      </div>
    </div>
  )
}
