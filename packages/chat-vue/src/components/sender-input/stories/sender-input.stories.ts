/**
 * sender-input.stories.ts
 *
 * SenderInput 组件的 Storybook 注册文件
 */

import type { Meta, StoryObj } from '@storybook/vue3';
import SenderInput from '../sender-input.vue';

const meta = {
  title: 'Chat-UI/SenderInput',
  component: SenderInput,
  argTypes: {
    bordered: {
      control: 'boolean',
      description: '是否显示边框'
    },
    placeholder: {
      control: 'text',
      description: '占位符文本'
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用'
    },
    modelValue: {
      control: 'text',
      description: 'v-model 绑定的值'
    }
  }
} satisfies Meta<typeof SenderInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// 基础用法
export const Basic: Story = {
  args: {
    bordered: true,
    disabled: false,
    modelValue: ''
  }
};

// 禁用状态
export const Disabled: Story = {
  args: {
    bordered: true,
    disabled: true,
  }
};

// 自定义占位符
export const CustomPlaceholder: Story = {
  args: {
    bordered: true,
    placeholder: 'Custom placeholder',
  }
};

// 带初始值
export const WithValue: Story = {
  args: {
    bordered: true,
    modelValue: 'Hello, this is some **markdown** content!',
  }
};
