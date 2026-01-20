/**
 * PartRenderer 组件类型定义
 */

import type { Component } from 'vue';
import type { MessagePart } from '@incremark/chat-core';
import type { UseIncremarkOptions } from '@incremark/vue';

/**
 * 代码块配置
 */
export interface CodeBlockConfig {
  takeOver?: boolean;
}

/**
 * Part 组件注册表
 */
export type PartRendererRegistry = Record<string, Component>;

/**
 * PartRenderer 组件 Props
 */
export interface PartRendererProps {
  /** 消息 Part 数据 */
  part: MessagePart;
  /** 是否流式渲染中 */
  streaming?: boolean;
  /** Incremark 渲染选项 */
  incremarkOptions?: UseIncremarkOptions;
  /** 自定义容器组件映射 */
  customContainers?: Record<string, Component>;
  /** 自定义代码块组件映射 */
  customCodeBlocks?: Record<string, Component>;
  /** 代码块配置映射 */
  codeBlockConfigs?: Record<string, CodeBlockConfig>;
  /** 流式渲染中的 pending 文本的 CSS 类名 */
  pendingClass?: string;
  /** 自定义 Part 组件注册表，key 为 part.type */
  parts?: PartRendererRegistry;
}
