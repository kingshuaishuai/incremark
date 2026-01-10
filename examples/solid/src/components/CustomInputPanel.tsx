/* @jsxImportSource solid-js */

import { Component } from 'solid-js'

export interface CustomInputPanelProps {
  value: string
  t: {
    customInput: string
    inputPlaceholder: string
    useExample: string
  }
  onChange: (value: string) => void
  onUseExample: () => void
}

export const CustomInputPanel: Component<CustomInputPanelProps> = (props) => {
  return (
    <div class="input-panel">
      <div class="input-header">
        <span>✏️ {props.t.customInput}</span>
        <button class="use-example-btn" onClick={props.onUseExample}>
          {props.t.useExample}
        </button>
      </div>
      <textarea
        value={props.value}
        placeholder={props.t.inputPlaceholder}
        class="markdown-input"
        rows="8"
        onInput={(e) => props.onChange(e.currentTarget.value)}
      />
    </div>
  )
}
