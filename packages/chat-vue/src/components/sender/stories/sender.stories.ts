import type { Meta, StoryObj } from '@storybook/vue3';
import Sender from '../sender.vue';

// 导入 story 组件
import BasicStory from './basic.story.vue';
import WithActionsStory from './with-actions.story.vue';
import LoadingStory from './loading.story.vue';
import WithFileUploadStory from './with-file-upload.story.vue';
import AttachmentsPreviewStory from './attachments-preview.story.vue';
import ClaudeStyleStory from './claude-style.story.vue';
import DeepseekStyleStory from './deepseek-style.story.vue';
import PerplexityStyleStory from './perplexity-style.story.vue';
import DoubaoStyleStory from './doubao-style.story.vue';

const meta: Meta<typeof Sender> = {
  title: 'Chat-UI/Sender',
  component: Sender,
  argTypes: {
    modelValue: {
      control: 'text',
      description: '输入框内容（v-model）',
    },
    placeholder: {
      control: 'text',
      description: '占位文本',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用',
    },
    bordered: {
      control: 'boolean',
      description: '是否显示边框',
    },
    loading: {
      control: 'boolean',
      description: '是否加载中（发送中状态）',
    },
    maxHeight: {
      control: 'text',
      description: '输入框最大高度',
    },
    submitType: {
      control: 'select',
      options: ['enter', 'shiftEnter', 'manual'],
      description: '提交方式',
    },
    clearOnSubmit: {
      control: 'boolean',
      description: '是否在发送后清空输入框',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Sender>;

/**
 * 基础用法
 */
export const Basic: Story = {
  render: () => ({
    components: { BasicStory },
    template: '<BasicStory />',
  }),
};

/**
 * 带操作按钮
 * 通过 prefix 和 suffix 插槽添加自定义操作按钮
 */
export const WithActions: Story = {
  render: () => ({
    components: { WithActionsStory },
    template: '<WithActionsStory />',
  }),
};

/**
 * 加载状态
 * 发送中状态下，发送按钮变为停止按钮
 */
export const Loading: Story = {
  render: () => ({
    components: { LoadingStory },
    template: '<LoadingStory />',
  }),
};

/**
 * 文件上传
 * 使用 SenderFileButton 和 SenderAttachments 实现文件上传功能
 */
export const WithFileUpload: Story = {
  render: () => ({
    components: { WithFileUploadStory },
    template: '<WithFileUploadStory />',
  }),
};

/**
 * 附件预览
 * 独立展示 SenderAttachments 组件的各种状态
 */
export const AttachmentsPreview: Story = {
  render: () => ({
    components: { AttachmentsPreviewStory },
    template: '<AttachmentsPreviewStory />',
  }),
};

/**
 * Claude 风格
 * 模拟 Claude 的输入框布局
 */
export const ClaudeStyle: Story = {
  render: () => ({
    components: { ClaudeStyleStory },
    template: '<ClaudeStyleStory />',
  }),
};

/**
 * DeepSeek 风格
 * 模拟 DeepSeek 的输入框布局，带深度思考和联网搜索切换
 */
export const DeepseekStyle: Story = {
  render: () => ({
    components: { DeepseekStyleStory },
    template: '<DeepseekStyleStory />',
  }),
};

/**
 * Perplexity 风格
 * 模拟 Perplexity 的输入框布局，带搜索模式切换
 */
export const PerplexityStyle: Story = {
  render: () => ({
    components: { PerplexityStyleStory },
    template: '<PerplexityStyleStory />',
  }),
};

/**
 * 豆包/Coze 风格
 * 模拟豆包的输入框布局，带应用导航栏
 */
export const DoubaoStyle: Story = {
  render: () => ({
    components: { DoubaoStyleStory },
    template: '<DoubaoStyleStory />',
  }),
};
