/**
 * TextMessage 组件类型定义
 */

import type { Component } from 'vue';
import type { TextPart } from '@incremark/chat-core';
import type { UseIncremarkOptions } from '@incremark/vue';

/**
 * 代码块配置
 */
export interface CodeBlockConfig {
  /** 是否从一开始就接管渲染，而不是等到 completed 状态 */
  takeOver?: boolean;
}

/**
 * TextMessage 组件 Props
 */
export interface TextMessageProps {
  /** 文本 Part 数据 */
  part: TextPart;
  /** 是否正在流式渲染 */
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
}
