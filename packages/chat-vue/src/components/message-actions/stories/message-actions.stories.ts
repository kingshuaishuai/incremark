/**
 * MessageActions Stories
 */

import type { Meta, StoryObj } from '@storybook/vue3';
import MessageActions from '../message-actions.vue';
import ChatProvider from '../../../provider/ChatProvider.vue';
import BasicStory from './basic.story.vue';
import FilledStory from './filled.story.vue';
import OutlinedStory from './outlined.story.vue';
import CustomActionStory from './custom-action.story.vue';
import CopyOnlyStory from './copy-only.story.vue';
import FeedbackOnlyStory from './feedback-only.story.vue';
import LikedStory from './liked.story.vue';
import DislikedStory from './disliked.story.vue';
import WithMoreActionsStory from './with-more-actions.story.vue';
import FullExampleStory from './full-example.story.vue';
import ConfigBasicStory from './config-basic.story.vue';
import ConfigAutoCollapseStory from './config-auto-collapse.story.vue';
import ConfigFullStory from './config-full.story.vue';

const meta = {
  title: 'Chat-UI/MessageActions',
  component: MessageActions,
  decorators: [
    () => ({
      components: { ChatProvider },
      template: '<ChatProvider><story /></ChatProvider>'
    })
  ],
  argTypes: {
    variant: {
      control: 'select',
      options: ['borderless', 'filled', 'outlined'],
      description: '变体样式'
    }
  }
} satisfies Meta<typeof MessageActions>;

export default meta;
type Story = StoryObj<typeof meta>;

// 基础用法
export const Basic: Story = {
  args: {
    variant: 'borderless'
  },
  render: () => ({
    components: { BasicStory },
    template: '<BasicStory />'
  })
};

// Filled 变体
export const Filled: Story = {
  args: {
    variant: 'filled'
  },
  render: () => ({
    components: { FilledStory },
    template: '<FilledStory />'
  })
};

// Outlined 变体
export const Outlined: Story = {
  args: {
    variant: 'outlined'
  },
  render: () => ({
    components: { OutlinedStory },
    template: '<OutlinedStory />'
  })
};

// 自定义按钮
export const CustomAction: Story = {
  render: () => ({
    components: { CustomActionStory },
    template: '<CustomActionStory />'
  })
};

// 仅复制按钮
export const CopyOnly: Story = {
  render: () => ({
    components: { CopyOnlyStory },
    template: '<CopyOnlyStory />'
  })
};

// 仅反馈按钮
export const FeedbackOnly: Story = {
  render: () => ({
    components: { FeedbackOnlyStory },
    template: '<FeedbackOnlyStory />'
  })
};

// 已点赞状态
export const Liked: Story = {
  render: () => ({
    components: { LikedStory },
    template: '<LikedStory />'
  })
};

// 已点踩状态
export const Disliked: Story = {
  render: () => ({
    components: { DislikedStory },
    template: '<DislikedStory />'
  })
};

// 带更多操作
export const WithMoreActions: Story = {
  render: () => ({
    components: { WithMoreActionsStory },
    template: '<WithMoreActionsStory />'
  })
};

// 完整示例
export const FullExample: Story = {
  render: () => ({
    components: { FullExampleStory },
    template: '<FullExampleStory />'
  })
};

// ==================== 配置方式 ====================

// 配置方式 - 基础用法
export const ConfigBasic: Story = {
  render: () => ({
    components: { ConfigBasicStory },
    template: '<ConfigBasicStory />'
  })
};

// 配置方式 - 自动折叠
export const ConfigAutoCollapse: Story = {
  render: () => ({
    components: { ConfigAutoCollapseStory },
    template: '<ConfigAutoCollapseStory />'
  })
};

// 配置方式 - 完整示例
export const ConfigFull: Story = {
  render: () => ({
    components: { ConfigFullStory },
    template: '<ConfigFullStory />'
  })
};
