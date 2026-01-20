/**
 * welcome.stories.ts
 *
 * Welcome 组件的 Storybook 注册文件
 */

import type { Meta, StoryObj } from '@storybook/vue3';
import Welcome from '../welcome.vue';
import type { SuggestionItem } from '../../suggestion/types';

const meta = {
  title: 'Chat-UI/Welcome',
  component: Welcome,
  argTypes: {
    title: {
      control: 'text',
      description: '标题'
    },
    description: {
      control: 'text',
      description: '副标题/描述'
    },
    icon: {
      control: 'text',
      description: 'Iconify 图标名'
    },
    suggestions: {
      control: 'object',
      description: '建议项列表'
    },
    hint: {
      control: 'text',
      description: '底部提示文字'
    }
  }
} satisfies Meta<typeof Welcome>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultSuggestions: SuggestionItem[] = [
  { label: '帮我写一封邮件', icon: 'mdi:email-outline' },
  { label: '总结这篇文章', icon: 'mdi:text-box-outline' },
  { label: '翻译成英文', icon: 'mdi:translate' },
  { label: '解释这段代码', icon: 'mdi:code-tags' }
];

// 基础用法
export const Basic: Story = {
  args: {
    suggestions: defaultSuggestions
  }
};

// 完整示例
export const Full: Story = {
  args: {
    title: '你好，我是 AI 助手',
    description: '我可以帮你写作、编程、翻译、回答问题等等',
    suggestions: defaultSuggestions,
    hint: 'AI 生成的内容可能存在错误，请注意甄别'
  }
};

// 自定义图标
export const CustomIcon: Story = {
  args: {
    title: '开始对话',
    icon: 'mdi:chat-processing-outline',
    suggestions: [
      { label: '今天天气怎么样？' },
      { label: '给我讲个笑话' },
      { label: '推荐一部电影' }
    ]
  }
};

// 无建议项
export const NoSuggestions: Story = {
  args: {
    title: '欢迎使用',
    description: '在下方输入框中输入您的问题'
  }
};

// 带描述的建议项
export const WithDescriptions: Story = {
  args: {
    title: '选择一个场景开始',
    suggestions: [
      { label: '写作助手', description: '帮你撰写各类文档', icon: 'mdi:pencil-outline' },
      { label: '代码助手', description: '编程问题解答', icon: 'mdi:code-tags' },
      { label: '学习助手', description: '知识点讲解', icon: 'mdi:school-outline' }
    ]
  }
};
