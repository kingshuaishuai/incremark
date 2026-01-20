/**
 * 提交类型
 * - enter: 按 Enter 发送，Shift+Enter 换行
 * - shiftEnter: 按 Shift+Enter 发送，Enter 换行
 * - manual: 仅通过按钮发送
 */
export type SenderSubmitType = 'enter' | 'shiftEnter' | 'manual';

export interface SenderInputProps {
  placeholder?: string;
  disabled?: boolean;
  bordered?: boolean;
  maxHeight?: string | number;
  /** 提交方式 */
  submitType?: SenderSubmitType;
}

export interface SenderInputEmits {
  (e: 'focus', event: FocusEvent): void;
  (e: 'blur', event: FocusEvent): void;
  (e: 'change', value: string): void;
  (e: 'paste'): void;
  (e: 'pasteFile', files: File[]): void;
  /** 提交事件（Enter 键触发） */
  (e: 'submit'): void;
}