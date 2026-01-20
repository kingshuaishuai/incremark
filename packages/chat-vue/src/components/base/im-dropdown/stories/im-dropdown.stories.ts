/**
 * im-dropdown.stories.ts
 *
 * ImDropdown 组件的 Storybook 注册文件
 */

import type { Meta, StoryObj } from '@storybook/vue3';
import ImDropdown from '../im-dropdown.vue';
import DefaultStory from './default.story.vue';
import WithDividerStory from './with-divider.story.vue';
import WithDisabledStory from './with-disabled.story.vue';
import PlacementsStory from './placements.story.vue';
import DisabledStory from './disabled.story.vue';
import WithIconStory from './with-icon.story.vue';

const meta = {
  title: 'Chat-UI/Base/ImDropdown',
  component: ImDropdown,
  argTypes: {
    items: {
      control: 'object',
      description: '菜单项列表'
    },
    placement: {
      control: 'select',
      options: ['bottom-start', 'bottom', 'bottom-end', 'top-start', 'top', 'top-end'],
      description: '位置'
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用'
    }
  }
} satisfies Meta<typeof ImDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

// 基础用法
export const Default: Story = {
  render: () => ({
    components: { DefaultStory },
    template: '<DefaultStory />'
  }),
  args: {
    items: [],
    placement: 'bottom-start'
  }
};

// 带分割线
export const WithDivider: Story = {
  render: () => ({
    components: { WithDividerStory },
    template: '<WithDividerStory />'
  }),
  args: {
    items: [],
    placement: 'bottom-start'
  }
};

// 禁用项
export const WithDisabled: Story = {
  render: () => ({
    components: { WithDisabledStory },
    template: '<WithDisabledStory />'
  }),
  args: {
    items: [],
    placement: 'bottom-start'
  }
};

// 不同位置
export const Placements: Story = {
  render: () => ({
    components: { PlacementsStory },
    template: '<PlacementsStory />'
  }),
  args: {
    items: [],
    placement: 'bottom-start'
  }
};

// 禁用状态
export const Disabled: Story = {
  render: () => ({
    components: { DisabledStory },
    template: '<DisabledStory />'
  }),
  args: {
    items: [],
    disabled: true
  }
};

// 带图标
export const WithIcon: Story = {
  render: () => ({
    components: { WithIconStory },
    template: '<WithIconStory />'
  }),
  args: {
    items: [],
    placement: 'bottom-start'
  }
};
