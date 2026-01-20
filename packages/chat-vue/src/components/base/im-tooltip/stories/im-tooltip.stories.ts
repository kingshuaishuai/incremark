/**
 * im-tooltip.stories.ts
 *
 * ImTooltip 组件的 Storybook 注册文件
 */

import type { Meta, StoryObj } from '@storybook/vue3';
import ImTooltip from '../im-tooltip.vue';
import { ImButton } from '../../im-button';
import DefaultStory from './default.story.vue';
import PlacementsStory from './placements.story.vue';
import LongContentStory from './long-content.story.vue';
import NoContentStory from './no-content.story.vue';
import OnIconStory from './on-icon.story.vue';
import AlignmentVariantsStory from './alignment-variants.story.vue';

const meta = {
  title: 'Chat-UI/Base/ImTooltip',
  component: ImTooltip,
  argTypes: {
    content: {
      control: 'text',
      description: '提示内容'
    },
    placement: {
      control: 'select',
      options: ['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end', 'left', 'left-start', 'left-end', 'right', 'right-start', 'right-end'],
      description: '位置'
    }
  }
} satisfies Meta<typeof ImTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

// 基础用法
export const Default: Story = {
  render: () => ({
    components: { DefaultStory },
    template: '<DefaultStory />'
  }),
  args: {
    content: '这是提示内容',
    placement: 'top'
  }
};

// 不同位置
export const Placements: Story = {
  render: () => ({
    components: { PlacementsStory },
    template: '<PlacementsStory />'
  })
};

// 长文本
export const LongContent: Story = {
  render: () => ({
    components: { LongContentStory },
    template: '<LongContentStory />'
  }),
  args: {
    content: '这是一段比较长的提示文本，用于测试 Tooltip 组件对长文本的处理效果。',
    placement: 'top'
  }
};

// 无内容时直接渲染子元素
export const NoContent: Story = {
  render: () => ({
    components: { NoContentStory },
    template: '<NoContentStory />'
  })
};

// 在图标上使用
export const OnIcon: Story = {
  render: () => ({
    components: { OnIconStory },
    template: '<OnIconStory />'
  })
};

// 对齐变体
export const AlignmentVariants: Story = {
  render: () => ({
    components: { AlignmentVariantsStory },
    template: '<AlignmentVariantsStory />'
  })
};
