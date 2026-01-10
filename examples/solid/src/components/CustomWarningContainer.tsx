/* @jsxImportSource solid-js */

import type { JSX } from 'solid-js'
import { Component, Show } from 'solid-js'

export interface CustomWarningContainerProps {
  name: string
  options?: Record<string, any>
  children?: JSX.Element
}

export const CustomWarningContainer: Component<CustomWarningContainerProps> = (props) => {
  return (
    <div class="custom-warning-container">
      <div class="custom-warning-header">
        <span class="custom-warning-icon">⚠️</span>
        <Show when={props.options?.title} fallback={<span class="custom-warning-title">警告</span>}>
          <span class="custom-warning-title">{props.options?.title}</span>
        </Show>
      </div>
      <div class="custom-warning-content">
        {props.children}
      </div>
    </div>
  )
}
