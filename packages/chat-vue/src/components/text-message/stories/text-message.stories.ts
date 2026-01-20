/**
 * text-message.stories.ts
 *
 * TextMessage 组件的 Storybook 注册文件
 */

import type { Meta, StoryObj } from '@storybook/vue3';
import TextMessage from '../text-message.vue';
import type { TextPart } from '@incremark/chat-core';

const meta = {
  title: 'Chat-UI/TextMessage',
  component: TextMessage,
  argTypes: {
    part: {
      control: 'object',
      description: 'TextPart 数据'
    },
    streaming: {
      control: 'boolean',
      description: '是否正在流式渲染'
    }
  }
} satisfies Meta<typeof TextMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

// Markdown 格式
export const Markdown: Story = {
  args: {
    part: {
      type: 'text',
      content: `# Hello World

This is a **markdown** example with:

- Lists
- **Bold** and *italic*
- \`inline code\`

\`\`\`javascript
console.log('Hello from Incremark!');
\`\`\`

[Link](https://example.com)`,
      format: 'markdown',
      state: 'done'
    } as TextPart,
    streaming: false
  }
};

// 纯文本格式
export const Plain: Story = {
  args: {
    part: {
      type: 'text',
      content: 'This is plain text without markdown formatting.',
      format: 'plain',
      state: 'done'
    } as TextPart,
    streaming: false
  }
};

// 流式渲染中
export const Streaming: Story = {
  args: {
    part: {
      type: 'text',
      content: 'This text is still streaming...',
      format: 'markdown',
      state: 'streaming'
    } as TextPart,
    streaming: true
  }
};

// 复杂 Markdown
export const ComplexMarkdown: Story = {
  args: {
    part: {
      type: 'text',
      content: `## Features

1. **Incremental Rendering** - See content appear as it generates
2. **Syntax Highlighting** - Beautiful code blocks
3. **Math Support** - $E = mc^2$
4. **Tables**

| Feature | Status |
|---------|--------|
| Markdown | ✅ |
| Code | ✅ |
| Math | ✅ |

> "The best way to predict the future is to create it." - Peter Drucker`,
      format: 'markdown',
      state: 'done'
    } as TextPart,
    streaming: false
  }
};
