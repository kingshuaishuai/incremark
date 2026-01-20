/**
 * file-preview.stories.ts
 *
 * FilePreview 组件的 Storybook 注册文件
 */

import type { Meta, StoryObj } from '@storybook/vue3';
import FilePreview from '../file-preview.vue';
import type { FilePart } from '@incremark/chat-core';

const meta = {
  title: 'Chat-UI/FilePreview',
  component: FilePreview,
  argTypes: {
    part: {
      control: 'object',
      description: 'FilePart 数据'
    },
    maxWidth: {
      control: 'number',
      description: '最大预览宽度'
    },
    maxHeight: {
      control: 'number',
      description: '最大预览高度'
    }
  }
} satisfies Meta<typeof FilePreview>;

export default meta;
type Story = StoryObj<typeof meta>;

// 图片预览
export const Image: Story = {
  args: {
    part: {
      type: 'file',
      fileId: 'file_001',
      data: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzQyYjg4MyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyNCI+SW1hZ2U8L3RleHQ+PC9zdmc+',
      mediaType: 'image/svg+xml',
      filename: 'example.svg'
    } as FilePart
  }
};

// 其他文件
export const OtherFile: Story = {
  args: {
    part: {
      type: 'file',
      fileId: 'file_002',
      data: '',
      mediaType: 'application/pdf',
      filename: 'document.pdf'
    } as FilePart
  }
};

// 无文件名
export const WithoutFilename: Story = {
  args: {
    part: {
      type: 'file',
      fileId: 'file_003',
      data: '',
      mediaType: 'text/plain'
    } as FilePart
  }
};
