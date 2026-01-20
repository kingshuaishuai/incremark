/**
 * ChainOfThought 组件 Storybook
 */

import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import { Icon } from '@iconify/vue';
import ChainOfThought from '../chain-of-thought.vue';
import ChainOfThoughtStep from '../chain-of-thought-step.vue';
import StreamingStory from './streaming.story.vue';
import BasicStory from './basic.story.vue';
import MultiStepStory from './multi-step.story.vue';
import LoadingStory from './loading.story.vue';
import SpinAnimationStory from './spin-animation.story.vue';
import CustomIconStory from './custom-icon.story.vue';
import WithDurationStory from './with-duration.story.vue';
import CollapsedStory from './collapsed.story.vue';
import WithErrorStory from './with-error.story.vue';
import CollapsibleStepStory from './collapsible-step.story.vue';
import WithMaxHeightStory from './with-max-height.story.vue';

const meta = {
  title: 'Chat-UI/ChainOfThought',
  component: ChainOfThought,
  argTypes: {
    title: {
      control: 'text',
      description: '标题'
    },
    loading: {
      control: 'boolean',
      description: '是否显示加载状态'
    },
    loadingAnimation: {
      control: 'select',
      options: ['pulse', 'spin'],
      description: 'Loading 动画类型'
    },
    startTime: {
      control: 'number',
      description: '思考开始时间'
    },
    endTime: {
      control: 'number',
      description: '思考结束时间'
    },
    locale: {
      control: 'select',
      options: ['en', 'zh']
    },
    maxHeight: {
      control: 'text',
      description: '内容区域最大高度，超出时滚动'
    }
  },
  tags: ['chat-ui']
} satisfies Meta<typeof ChainOfThought>;

export default meta;
type Story = StoryObj<typeof ChainOfThought>;

// 基础用法
export const Basic: Story = {
  args: {
    title: '思考过程'
  },
  render: () => ({
    components: { BasicStory },
    template: '<BasicStory />'
  })
};

// 多步骤
export const MultiStep: Story = {
  args: {
    title: '思考过程'
  },
  render: () => ({
    components: { MultiStepStory },
    template: '<MultiStepStory />'
  })
};

// 加载状态
export const Loading: Story = {
  args: {
    title: '思考中...',
    loading: true
  },
  render: () => ({
    components: { LoadingStory },
    template: '<LoadingStory />'
  })
};

// 旋转动画
export const SpinAnimation: Story = {
  args: {
    title: '思考中...',
    loading: true,
    loadingAnimation: 'spin'
  },
  render: () => ({
    components: { SpinAnimationStory },
    template: '<SpinAnimationStory />'
  })
};

// 自定义图标
export const CustomIcon: Story = {
  args: {
    title: '已完成'
  },
  render: () => ({
    components: { CustomIconStory },
    template: '<CustomIconStory />'
  })
};

// 显示时长
export const WithDuration: Story = {
  args: {
    title: '思考过程',
    startTime: Date.now() - 5432,
    endTime: Date.now()
  },
  render: () => ({
    components: { WithDurationStory },
    template: '<WithDurationStory />'
  })
};

// 默认折叠
export const Collapsed: Story = {
  args: {
    title: '思考过程'
  },
  render: () => ({
    components: { CollapsedStory },
    template: '<CollapsedStory />'
  })
};

// 错误状态
export const WithError: Story = {
  args: {
    title: '思考过程'
  },
  render: () => ({
    components: { WithErrorStory },
    template: '<WithErrorStory />'
  })
};

// 可折叠步骤
export const CollapsibleStep: Story = {
  args: {
    title: '思考过程'
  },
  render: () => ({
    components: { CollapsibleStepStory },
    template: '<CollapsibleStepStory />'
  })
};

// 流式输出模拟
export const Streaming: Story = {
  render: () => ({
    components: { StreamingStory },
    template: '<StreamingStory />'
  })
};

// 限制最大高度
export const WithMaxHeight: Story = {
  args: {
    title: '思考过程',
    maxHeight: 200
  },
  render: () => ({
    components: { WithMaxHeightStory },
    template: '<WithMaxHeightStory />'
  })
};
