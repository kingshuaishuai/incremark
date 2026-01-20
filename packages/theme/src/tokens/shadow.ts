/**
 * 阴影 Token 类型定义
 *
 * 阴影使用深蓝色基底 rgba(0, 19, 48, ...) 而非纯黑，更有质感
 */

/** 方向性阴影 */
export interface DirectionalShadow {
  /** 向下投影 */
  down: string;
  /** 向上投影 */
  up: string;
  /** 向左投影 */
  left: string;
  /** 向右投影 */
  right: string;
}

export interface ShadowTokens {
  /** 小阴影 - 用于按钮、卡片等轻微层级 */
  sm: string;
  /** 中等阴影 - 用于下拉框、弹出层等 */
  md: string;
  /** 大阴影 - 用于模态框、侧边栏等 */
  lg: string;
  /** 居中阴影 - 四周均匀 */
  center: string;
  /** 一级方向性阴影 - 轻量 */
  level1: DirectionalShadow;
  /** 二级方向性阴影 - 中等 */
  level2: DirectionalShadow;
  /** 三级方向性阴影 - 强调 */
  level3: DirectionalShadow;
  /** 品牌色卡片阴影 */
  brandCard: string;
}
