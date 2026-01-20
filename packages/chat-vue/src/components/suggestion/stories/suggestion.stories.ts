/**
 * suggestion.stories.ts
 *
 * Suggestion 组件的 Storybook 注册文件
 */

import type { Meta, StoryObj } from '@storybook/vue3';
import Suggestion from '../suggestion.vue';
import type { SuggestionItem } from '../types';

const meta = {
  title: 'Chat-UI/Suggestion',
  component: Suggestion,
  argTypes: {
    items: {
      control: 'object',
      description: '建议项列表'
    },
    vertical: {
      control: 'boolean',
      description: '是否垂直排列'
    }
  }
} satisfies Meta<typeof Suggestion>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultItems: SuggestionItem[] = [
  { label: '帮我写一封邮件' },
  { label: '总结这篇文章' },
  { label: '翻译成英文' },
  { label: '解释这段代码' }
];

// 基础用法
export const Basic: Story = {
  args: {
    items: defaultItems
  }
};

// 带图标
export const WithIcon: Story = {
  args: {
    items: [
      { label: '写邮件', icon: 'mdi:email-outline' },
      { label: '写代码', icon: 'mdi:code-tags' },
      { label: '翻译', icon: 'mdi:translate' },
      { label: '总结', icon: 'mdi:text-box-outline' }
    ]
  }
};

// 带描述
export const WithDescription: Story = {
  args: {
    items: [
      { label: '写一封邮件', description: '帮你撰写专业的商务邮件', icon: 'mdi:email-outline' },
      { label: '代码审查', description: '检查代码质量和潜在问题', icon: 'mdi:code-tags' },
      { label: '文档翻译', description: '将文档翻译成其他语言', icon: 'mdi:translate' }
    ]
  }
};

// 垂直排列
export const Vertical: Story = {
  args: {
    items: [
      { label: '帮我写一封邮件', icon: 'mdi:email-outline' },
      { label: '总结这篇文章', icon: 'mdi:text-box-outline' },
      { label: '翻译成英文', icon: 'mdi:translate' }
    ],
    vertical: true
  }
};

// 禁用状态
export const Disabled: Story = {
  args: {
    items: [
      { label: '可用选项', icon: 'mdi:check' },
      { label: '禁用选项', icon: 'mdi:close', disabled: true },
      { label: '另一个可用选项', icon: 'mdi:check' }
    ]
  }
};
