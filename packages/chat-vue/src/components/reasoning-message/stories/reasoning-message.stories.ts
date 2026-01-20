/**
 * ReasoningMessage 组件 Storybook
 */

import type { Meta, StoryObj } from '@storybook/vue3';
import ReasoningMessage from '../reasoning-message.vue';
import StreamingDemoStory from './streaming-demo.story.vue';

const meta = {
  title: 'Chat-UI/ReasoningMessage',
  component: ReasoningMessage,
  argTypes: {
    content: {
      control: 'text',
      description: '推理内容'
    },
    streaming: {
      control: 'boolean',
      description: '是否正在流式渲染'
    }
  }
} satisfies Meta<typeof ReasoningMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

// 简单推理内容
export const Simple: Story = {
  args: {
    content: '让我思考一下这个问题的解决方案。首先需要分析用户的需求...',
    streaming: false
  }
};

// Markdown 格式
export const WithMarkdown: Story = {
  args: {
    content: `## 问题分析

用户需要实现一个**聊天 UI 组件**，需要考虑以下方面：

1. **组件拆分** - 按照单一职责原则
2. **类型安全** - 完整的 TypeScript 支持
3. **流式渲染** - 支持 LLM 流式输出

## 解决方案

采用 **Parts-based 架构**：

\`\`\`typescript
type MessagePart = TextPart | ToolCallPart | ReasoningPart;
\`\`\`

> 这样可以灵活组合不同类型的内容块。`,
    streaming: false
  }
};

// 流式渲染中
export const Streaming: Story = {
  args: {
    content: '正在思考中...',
    streaming: true
  }
};

// 引用块样式
export const Blockquote: Story = {
  args: {
    content: `## 问题分析

用户需要实现一个**聊天 UI 组件**，需要考虑以下方面：

1. **组件拆分** - 按照单一职责原则
2. **类型安全** - 完整的 TypeScript 支持
3. **流式渲染** - 支持 LLM 流式输出

## 解决方案

采用 **Parts-based 架构**：

\`\`\`typescript
type MessagePart = TextPart | ToolCallPart | ReasoningPart;
\`\`\`

> 这样可以灵活组合不同类型的内容块。`,
    streaming: false,
    blockquote: true
  }
};

// 流式渲染演示（动态效果）
export const StreamingDemo: Story = {
  render: () => ({
    components: { StreamingDemoStory },
    template: '<StreamingDemoStory />'
  }),
  args: {
    content: '',
    streaming: false
  }
};
