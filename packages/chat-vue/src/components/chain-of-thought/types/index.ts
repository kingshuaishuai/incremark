/**
 * ChainOfThought 组件类型定义
 */

import type { Component } from 'vue';

/**
 * 步骤状态 - 控制图标颜色
 */
export type StepStatus = 'pending' | 'active' | 'complete' | 'error';

/**
 * Loading 动画类型
 */
export type LoadingAnimation = 'pulse' | 'spin';

/**
 * ChainOfThoughtStep Props
 * 纯壳子组件，只负责布局和竖线
 */
export interface ChainOfThoughtStepProps {
  /** 步骤标题/标签 */
  label?: string;
  /** 步骤状态，控制图标颜色 */
  status?: StepStatus;
  /** 是否显示连接下一步的竖线 */
  showDivider?: boolean;
  /** 是否可折叠 */
  collapsible?: boolean;
  /** 默认是否展开（仅 collapsible 为 true 时有效） */
  defaultExpanded?: boolean;
}

/**
 * Step 数据结构（用于 steps prop）
 */
export interface StepData<T = unknown> {
  /** 步骤类型，用于匹配注册的组件 */
  type: string;
  /** 步骤标题/标签 */
  label?: string;
  /** 步骤状态 */
  status?: StepStatus;
  /** 是否显示竖线 */
  showDivider?: boolean;
  /** 是否可折叠 */
  collapsible?: boolean;
  /** 默认是否展开 */
  defaultExpanded?: boolean;
  /** 自定义图标组件 */
  icon?: Component;
  /** 传递给步骤组件的数据 */
  data?: T;
}

/**
 * 组件注册表类型
 */
export type ComponentRegistry = Record<string, Component>;

/**
 * ChainOfThought 容器 Props
 */
export interface ChainOfThoughtProps {
  /** 标题 */
  title?: string;
  /** 是否显示加载状态图标 */
  loading?: boolean;
  /** Loading 动画类型 */
  loadingAnimation?: LoadingAnimation;
  /** 思考开始时间（毫秒时间戳） */
  startTime?: number;
  /** 思考结束时间（毫秒时间戳） */
  endTime?: number;
  /** 语言环境，用于时长格式化 */
  locale?: string;
  /** 步骤数据数组（可选，与 slot 二选一） */
  steps?: StepData[];
  /** 组件注册表，将 type 映射到组件 */
  components?: ComponentRegistry;
  /** 内容区域最大高度，超出时滚动 */
  maxHeight?: string | number;
}
