/**
 * ErrorMessage 组件类型定义
 */

/**
 * 错误类型
 */
export type ErrorType = 'network' | 'rate-limit' | 'server' | 'auth' | 'unknown';

/**
 * ErrorMessage 组件 Props
 */
export interface ErrorMessageProps {
  /** 错误标题 */
  title?: string;
  /** 错误消息 */
  message: string;
  /** 错误类型 */
  type?: ErrorType;
  /** 是否显示重试按钮 */
  retryable?: boolean;
  /** 重试按钮文本 */
  retryText?: string;
}
