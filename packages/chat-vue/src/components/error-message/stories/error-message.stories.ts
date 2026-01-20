/**
 * error-message.stories.ts
 *
 * ErrorMessage 组件的 Storybook 注册文件
 */

import type { Meta, StoryObj } from '@storybook/vue3';
import ErrorMessage from '../error-message.vue';

const meta = {
  title: 'Chat-UI/ErrorMessage',
  component: ErrorMessage,
  argTypes: {
    title: {
      control: 'text',
      description: '错误标题'
    },
    message: {
      control: 'text',
      description: '错误消息'
    },
    type: {
      control: 'select',
      options: ['network', 'rate-limit', 'server', 'auth', 'unknown'],
      description: '错误类型'
    },
    retryable: {
      control: 'boolean',
      description: '是否显示重试按钮'
    },
    retryText: {
      control: 'text',
      description: '重试按钮文本'
    }
  }
} satisfies Meta<typeof ErrorMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

// 基础用法
export const Basic: Story = {
  args: {
    message: '请求失败，请稍后重试。'
  }
};

// 网络错误
export const NetworkError: Story = {
  args: {
    type: 'network',
    message: '无法连接到服务器，请检查您的网络连接。',
    retryable: true
  }
};

// 限流错误
export const RateLimitError: Story = {
  args: {
    type: 'rate-limit',
    message: '您的请求过于频繁，请稍后再试。'
  }
};

// 服务器错误
export const ServerError: Story = {
  args: {
    type: 'server',
    message: '服务器内部错误，我们正在努力修复。',
    retryable: true
  }
};

// 认证错误
export const AuthError: Story = {
  args: {
    type: 'auth',
    message: '您的登录已过期，请重新登录。'
  }
};

// 自定义标题
export const CustomTitle: Story = {
  args: {
    title: '连接超时',
    type: 'network',
    message: '服务器响应时间过长，请稍后重试。',
    retryable: true,
    retryText: '重新连接'
  }
};

// 带重试按钮
export const WithRetry: Story = {
  args: {
    message: '发送消息失败，请重试。',
    retryable: true,
    retryText: '重新发送'
  }
};
