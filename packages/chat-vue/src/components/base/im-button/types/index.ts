/** Button 变体 */
export type ButtonVariant = 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link';

/** Button 颜色 */
export type ButtonColor = 'primary' | 'neutral' | 'success' | 'warning' | 'error';

/** Button 尺寸 */
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** Button 组件 Props */
export interface ImButtonProps {
  /** 变体样式 */
  variant?: ButtonVariant;
  /** 颜色主题 */
  color?: ButtonColor;
  /** 尺寸 */
  size?: ButtonSize;
  /** 禁用状态 */
  disabled?: boolean;
  /** 加载状态 */
  loading?: boolean;
  /** 块级按钮（占满宽度） */
  block?: boolean;
  /** 方形按钮（等宽高） */
  square?: boolean;
  /** 圆形按钮 */
  circle?: boolean;
  /** 激活/选中状态 */
  active?: boolean;
}
