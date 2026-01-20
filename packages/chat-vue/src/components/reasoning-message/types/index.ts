/**
 * ReasoningMessage 组件类型定义
 */

import type { Component } from 'vue';
import type { UseIncremarkOptions } from '@incremark/vue';

/**
 * 代码块配置
 */
export interface CodeBlockConfig {
  /** 是否从一开始就接管渲染，而不是等到 completed 状态 */
  takeOver?: boolean;
}

/**
 * ReasoningMessage 组件 Props
 *
 * 只负责渲染推理内容（Markdown），不包含折叠逻辑
 * 折叠功能请使用 ChainOfThought 组件包裹
 */
export interface ReasoningMessageProps {
  /** 推理内容 */
  content: string;
  /** 是否正在流式渲染 */
  streaming?: boolean;
  /** 纯文本模式，不解析 Markdown */
  plainText?: boolean;
  /** 引用块样式 */
  blockquote?: boolean;
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
}
