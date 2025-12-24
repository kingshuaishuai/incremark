import React from 'react'

export interface CustomInfoContainerProps {
  name: string
  options?: Record<string, any>
  children?: React.ReactNode
}

export const CustomInfoContainer: React.FC<CustomInfoContainerProps> = ({ options, children }) => {
  return (
    <div className="custom-info-container">
      <div className="custom-info-header">
        <span className="custom-info-icon">ℹ️</span>
        <span className="custom-info-title">
          {options?.title || '信息'}
        </span>
      </div>
      <div className="custom-info-content">
        {children}
      </div>
    </div>
  )
}

