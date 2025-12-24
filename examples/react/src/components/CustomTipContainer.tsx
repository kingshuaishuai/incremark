import React from 'react'

export interface CustomTipContainerProps {
  name: string
  options?: Record<string, any>
  children?: React.ReactNode
}

export const CustomTipContainer: React.FC<CustomTipContainerProps> = ({ options, children }) => {
  return (
    <div className="custom-tip-container">
      <div className="custom-tip-header">
        <span className="custom-tip-icon">💡</span>
        <span className="custom-tip-title">
          {options?.title || '提示'}
        </span>
      </div>
      <div className="custom-tip-content">
        {children}
      </div>
    </div>
  )
}

