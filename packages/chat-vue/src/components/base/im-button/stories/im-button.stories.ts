/**
 * im-button.stories.ts
 *
 * ImButton 组件的 Storybook 注册文件
 */

import type { Meta, StoryObj } from '@storybook/vue3';
import { Icon } from '@iconify/vue';
import ImButton from '../im-button.vue';
import { SvgIcon } from '../../../svg-icon';
import type { ButtonVariant, ButtonColor, ButtonSize } from '../types';
import VariantsStory from './variants.story.vue';
import SizesStory from './sizes.story.vue';
import WithIconStory from './with-icon.story.vue';
import IconOnlyStory from './icon-only.story.vue';
import MessageActionStyleStory from './message-action-style.story.vue';
import LoadingStory from './loading.story.vue';
import DisabledStory from './disabled.story.vue';
import BlockStory from './block.story.vue';

const meta = {
  title: 'Chat-UI/Base/ImButton',
  component: ImButton,
  argTypes: {
    variant: {
      control: 'select',
      options: ['solid', 'outline', 'soft', 'subtle', 'ghost', 'link'],
      description: '变体样式'
    },
    color: {
      control: 'select',
      options: ['primary', 'neutral', 'success', 'warning', 'error'],
      description: '颜色主题'
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: '尺寸'
    },
    disabled: {
      control: 'boolean',
      description: '禁用状态'
    },
    loading: {
      control: 'boolean',
      description: '加载状态'
    },
    block: {
      control: 'boolean',
      description: '块级按钮'
    },
    square: {
      control: 'boolean',
      description: '方形按钮'
    },
    circle: {
      control: 'boolean',
      description: '圆形按钮'
    }
  }
} satisfies Meta<typeof ImButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const variants: ButtonVariant[] = ['solid', 'outline', 'soft', 'subtle', 'ghost', 'link'];
const colors: ButtonColor[] = ['primary', 'neutral', 'success', 'warning', 'error'];
const sizes: ButtonSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

// 默认
export const Default: Story = {
  render: (args) => ({
    components: { ImButton },
    setup: () => ({ args }),
    template: '<ImButton v-bind="args">Button</ImButton>'
  }),
  args: {
    variant: 'solid',
    color: 'primary',
    size: 'md'
  }
};

// 变体展示
export const Variants: Story = {
  render: () => ({
    components: { VariantsStory },
    template: '<VariantsStory />'
  })
};

// 尺寸展示
export const Sizes: Story = {
  render: () => ({
    components: { SizesStory },
    template: '<SizesStory />'
  })
};

// 带图标
export const WithIcon: Story = {
  render: () => ({
    components: { WithIconStory },
    template: '<WithIconStory />'
  })
};

// 仅图标按钮
export const IconOnly: Story = {
  render: () => ({
    components: { IconOnlyStory },
    template: '<IconOnlyStory />'
  })
};

// Soft/Subtle 图标按钮 - 适合 Message Actions
export const MessageActionStyle: Story = {
  render: () => ({
    components: { MessageActionStyleStory },
    template: '<MessageActionStyleStory />'
  })
};

// 加载状态
export const Loading: Story = {
  render: () => ({
    components: { LoadingStory },
    template: '<LoadingStory />'
  })
};

// 禁用状态
export const Disabled: Story = {
  render: () => ({
    components: { DisabledStory },
    template: '<DisabledStory />'
  })
};

// 块级按钮
export const Block: Story = {
  render: () => ({
    components: { BlockStory },
    template: '<BlockStory />'
  })
};
