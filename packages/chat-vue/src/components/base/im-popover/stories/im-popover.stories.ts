/**
 * im-popover.stories.ts
 *
 * ImPopover 组件的 Storybook 注册文件
 */

import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import ImPopover from '../im-popover.vue';
import { ImButton } from '../../im-button';
import ClickStory from './click.story.vue';
import HoverStory from './hover.story.vue';
import FocusStory from './focus.story.vue';
import WithArrowStory from './with-arrow.story.vue';
import PlacementsStory from './placements.story.vue';
import ManualStory from './manual.story.vue';
import DisabledStory from './disabled.story.vue';

const meta = {
  title: 'Chat-UI/Base/ImPopover',
  component: ImPopover,
  argTypes: {
    trigger: {
      control: 'select',
      options: ['hover', 'click', 'focus', 'manual'],
      description: '触发方式'
    },
    placement: {
      control: 'select',
      options: ['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end', 'left', 'left-start', 'left-end', 'right', 'right-start', 'right-end'],
      description: '位置'
    },
    offset: {
      control: 'number',
      description: '偏移量'
    },
    arrow: {
      control: 'boolean',
      description: '是否显示箭头'
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用'
    }
  }
} satisfies Meta<typeof ImPopover>;

export default meta;
type Story = StoryObj<typeof meta>;

// 点击触发（默认）
export const Click: Story = {
  render: () => ({
    components: { ClickStory },
    template: '<ClickStory />'
  }),
  args: {
    trigger: 'click',
    placement: 'bottom',
    offset: 8,
    arrow: false,
    disabled: false
  }
};

// 悬停触发
export const Hover: Story = {
  render: () => ({
    components: { HoverStory },
    template: '<HoverStory />'
  }),
  args: {
    trigger: 'hover',
    placement: 'top',
    offset: 8,
    arrow: true,
    disabled: false
  }
};

// 焦点触发
export const Focus: Story = {
  render: () => ({
    components: { FocusStory },
    template: '<FocusStory />'
  }),
  args: {
    trigger: 'focus',
    placement: 'bottom',
    offset: 8,
    arrow: true,
    disabled: false
  }
};

// 带箭头
export const WithArrow: Story = {
  render: () => ({
    components: { WithArrowStory },
    template: '<WithArrowStory />'
  }),
  args: {
    trigger: 'click',
    placement: 'top',
    offset: 8,
    arrow: true,
    disabled: false
  }
};

// 不同位置
export const Placements: Story = {
  render: () => ({
    components: { PlacementsStory },
    template: '<PlacementsStory />'
  })
};

// 手动控制
export const Manual: Story = {
  render: () => ({
    components: { ManualStory },
    template: '<ManualStory />'
  })
};

// 禁用状态
export const Disabled: Story = {
  render: () => ({
    components: { DisabledStory },
    template: '<DisabledStory />'
  }),
  args: {
    trigger: 'click',
    placement: 'bottom',
    offset: 8,
    arrow: false,
    disabled: true
  }
};
