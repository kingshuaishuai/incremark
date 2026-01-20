/**
 * part-renderer.stories.ts
 *
 * PartRenderer 组件的 Storybook 注册文件
 */

import type { Meta, StoryObj } from '@storybook/vue3';
import { h, defineComponent } from 'vue';
import PartRenderer from '../part-renderer.vue';
import type { TextPart, ToolCallPart, ReasoningPart, UIPart } from '@incremark/chat-core';
import WithSlotStory from './with-slot.story.vue';

const meta = {
  title: 'Chat-UI/PartRenderer',
  component: PartRenderer,
  argTypes: {
    part: {
      control: 'object',
      description: 'MessagePart 数据'
    },
    streaming: {
      control: 'boolean',
      description: '是否正在流式渲染'
    }
  }
} satisfies Meta<typeof PartRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

// TextPart - Markdown 格式
export const TextMarkdown: Story = {
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
\`\`\``,

      format: 'markdown'
    } as TextPart,
    streaming: false
  }
};

// TextPart - 纯文本格式
export const TextPlain: Story = {
  args: {
    part: {
      type: 'text',
      content: 'This is plain text without markdown formatting.',
      format: 'plain'
    } as TextPart,
    streaming: false
  }
};

// ToolCallPart
export const ToolCall: Story = {
  args: {
    part: {
      type: 'tool-call',
      toolName: 'search',
      toolCallId: 'call_123',
      args: { query: 'Vue 3 Composition API' },
      state: 'output-available',
      output: { results: ['result1', 'result2'] }
    } as ToolCallPart,
    streaming: false
  }
};

// ReasoningPart
export const Reasoning: Story = {
  args: {
    part: {
      type: 'reasoning',
      content: '让我思考一下这个问题的解决方案...'
    } as ReasoningPart,
    streaming: false
  }
};

// 自定义 Part 组件
const CustomChartComponent = defineComponent({
  props: ['part'],
  setup(props) {
    return () => h('div', {
      style: 'padding: 16px; background: #f0f9ff; border-radius: 8px; border: 1px solid #0ea5e9;'
    }, [
      h('div', { style: 'font-weight: 500; margin-bottom: 8px;' }, `📊 ${props.part.component}`),
      h('pre', { style: 'margin: 0; font-size: 12px;' }, JSON.stringify(props.part.props, null, 2))
    ]);
  }
});

export const CustomPart: Story = {
  args: {
    part: {
      type: 'chart',
      component: 'BarChart',
      props: { data: [10, 20, 30, 40] }
    } as unknown as UIPart,
    parts: {
      chart: CustomChartComponent
    }
  }
};

// 使用 slot 覆盖
export const WithSlot: Story = {
  render: () => ({
    components: { WithSlotStory },
    template: '<WithSlotStory />'
  }),
  args: {
    part: {
      type: 'text',
      content: '这段文本使用 slot 自定义渲染',
      format: 'plain'
    } as TextPart
  }
};
