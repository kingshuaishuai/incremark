/**
 * message-bubble.stories.ts
 *
 * MessageBubble 组件的 Storybook 注册文件
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import MessageBubble from '../message-bubble.vue'
import MessageActions from '../../message-actions/message-actions.vue'
import MessageActionCopy from '../../message-actions/message-action-copy.vue'
import MessageActionFeedback from '../../message-actions/message-action-feedback.vue'
import ChatProvider from '../../../provider/ChatProvider.vue'
import StreamingMarkdownStory from './streaming-markdown.story.vue'
import ReasoningAnswerStory from './reasoning-answer.story.vue'
import ToolCallAnswerStory from './tool-call-answer.story.vue'
import FullConversationStory from './full-conversation.story.vue'
import type { FeedbackValue } from '../../message-actions/types'

const meta = {
  title: 'Chat-UI/MessageBubble',
  component: MessageBubble,
  decorators: [
    () => ({
      components: { ChatProvider },
      template: '<ChatProvider><story /></ChatProvider>'
    })
  ],
  argTypes: {
    placement: {
      control: 'select',
      options: ['start', 'end'],
      description: '气泡位置'
    },
    variant: {
      control: 'select',
      options: ['filled', 'outlined', 'borderless'],
      description: '样式变体'
    },
    shape: {
      control: 'select',
      options: ['default', 'round'],
      description: '形状'
    },
    loading: {
      control: 'boolean',
      description: '加载状态'
    },
    streaming: {
      control: 'boolean',
      description: '流式传输状态'
    }
  }
} satisfies Meta<typeof MessageBubble>

export default meta
type Story = StoryObj<typeof meta>

// 基础用法 - Assistant 消息
export const Basic: Story = {
  args: {
    placement: 'start',
    variant: 'filled',
    shape: 'default'
  },
  render: (args) => ({
    components: { MessageBubble },
    setup() {
      return { args }
    },
    template: `
      <MessageBubble v-bind="args">
        <p style="margin: 0;">Hello! How can I help you today?</p>
      </MessageBubble>
    `
  })
}

// 用户消息 - 右对齐
export const UserMessage: Story = {
  args: {
    placement: 'end',
    variant: 'filled',
    shape: 'default'
  },
  render: (args) => ({
    components: { MessageBubble },
    setup() {
      return { args }
    },
    template: `
      <MessageBubble v-bind="args">
        <p style="margin: 0;">Can you explain how React hooks work?</p>
      </MessageBubble>
    `
  })
}

// 带头像
export const WithAvatar: Story = {
  args: {
    placement: 'start',
    variant: 'filled'
  },
  render: (args) => ({
    components: { MessageBubble },
    setup() {
      return { args }
    },
    template: `
      <MessageBubble v-bind="args">
        <template #avatar>
          <div style="width: 32px; height: 32px; border-radius: 50%; background: #6366f1; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">AI</div>
        </template>
        <p style="margin: 0;">I'm an AI assistant. Nice to meet you!</p>
      </MessageBubble>
    `
  })
}

// 带头部和底部
export const WithHeaderFooter: Story = {
  args: {
    placement: 'start',
    variant: 'filled'
  },
  render: (args) => ({
    components: { MessageBubble, MessageActions, MessageActionCopy, MessageActionFeedback },
    setup() {
      const feedback = ref<FeedbackValue>('default')
      return { args, feedback }
    },
    template: `
      <MessageBubble v-bind="args">
        <template #avatar>
          <div style="width: 32px; height: 32px; border-radius: 50%; background: #6366f1; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">AI</div>
        </template>
        <template #header>
          <span>Assistant · 2 min ago</span>
        </template>
        <p style="margin: 0;">Here's the information you requested.</p>
        <template #footer>
          <MessageActions>
            <MessageActionCopy text="Here's the information you requested." />
            <MessageActionFeedback v-model:value="feedback" />
          </MessageActions>
        </template>
      </MessageBubble>
    `
  })
}

// Outlined 变体
export const Outlined: Story = {
  args: {
    placement: 'start',
    variant: 'outlined',
    shape: 'default'
  },
  render: (args) => ({
    components: { MessageBubble },
    setup() {
      return { args }
    },
    template: `
      <MessageBubble v-bind="args">
        <p style="margin: 0;">This is an outlined message bubble.</p>
      </MessageBubble>
    `
  })
}

// Borderless 变体
export const Borderless: Story = {
  args: {
    placement: 'start',
    variant: 'borderless'
  },
  render: (args) => ({
    components: { MessageBubble },
    setup() {
      return { args }
    },
    template: `
      <MessageBubble v-bind="args">
        <p style="margin: 0;">This is a borderless message bubble.</p>
      </MessageBubble>
    `
  })
}

// Round 形状
export const Round: Story = {
  args: {
    placement: 'end',
    variant: 'filled',
    shape: 'round'
  },
  render: (args) => ({
    components: { MessageBubble },
    setup() {
      return { args }
    },
    template: `
      <MessageBubble v-bind="args">
        <p style="margin: 0;">Round shape message</p>
      </MessageBubble>
    `
  })
}

// 对话示例
export const Conversation: Story = {
  render: () => ({
    components: { MessageBubble },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 600px;">
        <MessageBubble placement="end" variant="filled">
          <p style="margin: 0;">Hi! Can you help me with JavaScript?</p>
        </MessageBubble>
        <MessageBubble placement="start" variant="filled">
          <template #avatar>
            <div style="width: 32px; height: 32px; border-radius: 50%; background: #6366f1; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">AI</div>
          </template>
          <p style="margin: 0;">Of course! I'd be happy to help you with JavaScript. What would you like to know?</p>
        </MessageBubble>
        <MessageBubble placement="end" variant="filled">
          <p style="margin: 0;">How do async/await work?</p>
        </MessageBubble>
        <MessageBubble placement="start" variant="filled">
          <template #avatar>
            <div style="width: 32px; height: 32px; border-radius: 50%; background: #6366f1; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">AI</div>
          </template>
          <p style="margin: 0;">Async/await is syntactic sugar for working with Promises. The <code>async</code> keyword makes a function return a Promise, and <code>await</code> pauses execution until the Promise resolves.</p>
        </MessageBubble>
      </div>
    `
  })
}

// ============ 场景演示 ============

// 流式 Markdown 输出
export const StreamingMarkdown: Story = {
  render: () => ({
    components: { StreamingMarkdownStory },
    template: '<StreamingMarkdownStory />'
  })
}

// 思考 + 回答
export const ReasoningThenAnswer: Story = {
  render: () => ({
    components: { ReasoningAnswerStory },
    template: '<ReasoningAnswerStory />'
  })
}

// 工具调用 + 回答
export const ToolCallThenAnswer: Story = {
  render: () => ({
    components: { ToolCallAnswerStory },
    template: '<ToolCallAnswerStory />'
  })
}

// 完整多轮对话
export const FullConversation: Story = {
  render: () => ({
    components: { FullConversationStory },
    template: '<FullConversationStory />'
  })
}
