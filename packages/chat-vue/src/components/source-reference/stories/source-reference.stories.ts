/**
 * source-reference.stories.ts
 *
 * SourceReference 组件的 Storybook 注册文件
 */

import type { Meta, StoryObj } from '@storybook/vue3';
import SourceReference from '../source-reference.vue';
import type { SourcePart } from '@incremark/chat-core';

const meta = {
  title: 'Chat-UI/SourceReference',
  component: SourceReference,
  argTypes: {
    part: {
      control: 'object',
      description: 'SourcePart 数据'
    },
    openInNewTab: {
      control: 'boolean',
      description: '是否在新窗口打开链接'
    }
  }
} satisfies Meta<typeof SourceReference>;

export default meta;
type Story = StoryObj<typeof meta>;

// URL 来源
export const UrlSource: Story = {
  args: {
    part: {
      type: 'source',
      sourceId: 'src_001',
      sourceType: 'url',
      url: 'https://vuejs.org/guide/introduction.html',
      title: 'Vue.js Introduction'
    } as SourcePart
  }
};

// 文档来源
export const DocumentSource: Story = {
  args: {
    part: {
      type: 'source',
      sourceId: 'src_002',
      sourceType: 'document',
      title: 'API Reference',
      mediaType: 'application/pdf'
    } as SourcePart
  }
};

// 无标题 URL
export const UrlWithoutTitle: Story = {
  args: {
    part: {
      type: 'source',
      sourceId: 'src_003',
      sourceType: 'url',
      url: 'https://example.com/docs/api'
    } as SourcePart
  }
};

// ============ 文件类型示例 ============

// PDF 文档
export const PDFDocument: Story = {
  args: {
    part: {
      type: 'source',
      sourceId: 'src_pdf',
      sourceType: 'document',
      title: 'Technical Specification.pdf',
      mediaType: 'application/pdf'
    } as SourcePart
  }
};

// Word 文档
export const WordDocument: Story = {
  args: {
    part: {
      type: 'source',
      sourceId: 'src_word',
      sourceType: 'document',
      title: 'Project Proposal.docx',
      mediaType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    } as SourcePart
  }
};

// Excel 表格
export const ExcelSpreadsheet: Story = {
  args: {
    part: {
      type: 'source',
      sourceId: 'src_excel',
      sourceType: 'document',
      title: 'Financial Report.xlsx',
      mediaType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    } as SourcePart
  }
};

// PowerPoint 演示
export const PowerPointPresentation: Story = {
  args: {
    part: {
      type: 'source',
      sourceId: 'src_ppt',
      sourceType: 'document',
      title: 'Sales Deck.pptx',
      mediaType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    } as SourcePart
  }
};

// 图片文件
export const ImageFile: Story = {
  args: {
    part: {
      type: 'source',
      sourceId: 'src_image',
      sourceType: 'document',
      title: 'Product Screenshot.png',
      mediaType: 'image/png'
    } as SourcePart
  }
};

// 视频文件
export const VideoFile: Story = {
  args: {
    part: {
      type: 'source',
      sourceId: 'src_video',
      sourceType: 'document',
      title: 'Demo Video.mp4',
      mediaType: 'video/mp4'
    } as SourcePart
  }
};

// 音频文件
export const AudioFile: Story = {
  args: {
    part: {
      type: 'source',
      sourceId: 'src_audio',
      sourceType: 'document',
      title: 'Podcast Episode.mp3',
      mediaType: 'audio/mpeg'
    } as SourcePart
  }
};

// 压缩文件
export const ArchiveFile: Story = {
  args: {
    part: {
      type: 'source',
      sourceId: 'src_archive',
      sourceType: 'document',
      title: 'Project Files.zip',
      mediaType: 'application/zip'
    } as SourcePart
  }
};

// 代码文件
export const CodeFile: Story = {
  args: {
    part: {
      type: 'source',
      sourceId: 'src_code',
      sourceType: 'document',
      title: 'utils.ts',
      mediaType: 'text/javascript'
    } as SourcePart
  }
};

// Markdown 文件
export const MarkdownFile: Story = {
  args: {
    part: {
      type: 'source',
      sourceId: 'src_md',
      sourceType: 'document',
      title: 'README.md',
      mediaType: 'text/markdown'
    } as SourcePart
  }
};

// ============ URL 扩展名推断示例 ============

// PDF URL（通过扩展名推断）
export const PDFUrl: Story = {
  args: {
    part: {
      type: 'source',
      sourceId: 'src_pdf_url',
      sourceType: 'url',
      url: 'https://example.com/documents/report.pdf',
      title: 'Annual Report'
    } as SourcePart
  }
};

// 图片 URL（通过扩展名推断）
export const ImageUrl: Story = {
  args: {
    part: {
      type: 'source',
      sourceId: 'src_img_url',
      sourceType: 'url',
      url: 'https://example.com/images/photo.jpg',
      title: 'Team Photo'
    } as SourcePart
  }
};
