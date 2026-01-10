/* @jsxImportSource solid-js */

import type { JSX } from 'solid-js'
import { Component, Show } from 'solid-js'

export interface CustomInfoContainerProps {
  name: string
  options?: Record<string, any>
  children?: JSX.Element
}

export const CustomInfoContainer: Component<CustomInfoContainerProps> = (props) => {
  return (
    <div class="custom-info-container">
      <div class="custom-info-header">
        <span class="custom-info-icon">ℹ️</span>
        <Show when={props.options?.title} fallback={<span class="custom-info-title">信息</span>}>
          <span class="custom-info-title">{props.options?.title}</span>
        </Show>
      </div>
      <div class="custom-info-content">
        {props.children}
      </div>
    </div>
  )
}
