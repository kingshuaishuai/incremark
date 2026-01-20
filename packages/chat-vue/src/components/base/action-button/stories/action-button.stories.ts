/**
 * action-button.stories.ts
 *
 * ActionButton 组件的 Storybook 注册文件
 */

import type { Meta, StoryObj } from '@storybook/vue3';
import ActionButton from '../action-button.vue';
import DefaultStory from './default.story.vue';
import IntentsStory from './intents.story.vue';
import SizesStory from './sizes.story.vue';
import IconOnlyStory from './icon-only.story.vue';
import ActiveStory from './active.story.vue';
import DisabledStory from './disabled.story.vue';
import LoadingStory from './loading.story.vue';

const meta = {
  title: 'Chat-UI/Base/ActionButton',
  component: ActionButton,
  argTypes: {
    intent: {
      control: 'select',
      options: ['action', 'primary', 'secondary', 'danger'],
      description: '按钮意图',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
      description: '尺寸',
    },
    square: {
      control: 'boolean',
      description: '正方形按钮（仅图标时使用）',
    },
    circle: {
      control: 'boolean',
      description: '圆形按钮',
    },
    disabled: {
      control: 'boolean',
      description: '禁用状态',
    },
    loading: {
      control: 'boolean',
      description: '加载状态',
    },
    active: {
      control: 'boolean',
      description: '选中/激活状态',
    },
    ariaLabel: {
      control: 'text',
      description: '无障碍标签',
    },
  },
} satisfies Meta<typeof ActionButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// 默认
export const Default: Story = {
  render: () => ({
    components: { DefaultStory },
    template: '<DefaultStory />',
  }),
};

// 意图展示
export const Intents: Story = {
  render: () => ({
    components: { IntentsStory },
    template: '<IntentsStory />',
  }),
};

// 尺寸展示
export const Sizes: Story = {
  render: () => ({
    components: { SizesStory },
    template: '<SizesStory />',
  }),
};

// 仅图标按钮
export const IconOnly: Story = {
  render: () => ({
    components: { IconOnlyStory },
    template: '<IconOnlyStory />',
  }),
};

// 选中状态
export const Active: Story = {
  render: () => ({
    components: { ActiveStory },
    template: '<ActiveStory />',
  }),
};

// 禁用状态
export const Disabled: Story = {
  render: () => ({
    components: { DisabledStory },
    template: '<DisabledStory />',
  }),
};

// 加载状态
export const Loading: Story = {
  render: () => ({
    components: { LoadingStory },
    template: '<LoadingStory />',
  }),
};
