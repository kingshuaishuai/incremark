/**
 * ToolCall 组件类型定义
 */

import type { Component } from 'vue';
import type { ToolCallPart } from '@incremark/chat-core';

/**
 * 状态标签映射 - key 为任意状态字符串
 */
export type StateLabels = Record<string, string>;

/**
 * 状态分类配置 - 用于判断状态属于哪个类别
 */
export interface StateCategories {
  /** 加载中状态列表 */
  loading?: string[];
  /** 完成状态列表 */
  complete?: string[];
  /** 错误状态列表 */
  error?: string[];
  /** 拒绝状态列表 */
  denied?: string[];
  /** 等待审批状态列表 */
  approval?: string[];
}

/**
 * 工具渲染器 Props
 */
export interface ToolRendererProps {
  /** 工具调用 ID */
  toolCallId: string;
  /** 工具名称 */
  toolName: string;
  /** 工具参数 */
  args: Record<string, unknown>;
  /** 工具调用状态 */
  state: string;
  /** 工具执行结果 */
  output?: unknown;
  /** 错误信息 */
  error?: string;
}

/**
 * 输出渲染器 Props
 */
export interface OutputRendererProps {
  /** 工具名称 */
  toolName: string;
  /** 工具执行结果 */
  output: unknown;
}

/**
 * 工具渲染器注册表
 */
export type ToolRendererRegistry = Record<string, Component>;

/**
 * 输出渲染器注册表
 */
export type OutputRendererRegistry = Record<string, Component>;

/**
 * ToolCall 组件 Props
 */
export interface ToolCallProps {
  /** 工具调用 Part 数据 */
  part: ToolCallPart;
  /** 工具渲染器注册表，key 为工具名称 */
  tools?: ToolRendererRegistry;
  /** 输出渲染器注册表，key 为工具名称 */
  outputRenderers?: OutputRendererRegistry;
  /** 默认渲染器（当工具未注册时使用） */
  defaultRenderer?: Component;
  /** 状态标签映射，用于自定义状态文本 */
  stateLabels?: StateLabels;
  /** 状态分类配置，用于判断状态属于哪个类别 */
  stateCategories?: StateCategories;
  /** 是否显示参数 */
  showArgs?: boolean;
  /** 是否显示结果 */
  showOutput?: boolean;
  /** 默认是否展开 */
  defaultExpanded?: boolean;
}
