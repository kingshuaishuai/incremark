/**
 * tool-call.stories.ts
 *
 * ToolCall 组件的 Storybook 注册文件
 */

import type { Meta, StoryObj } from '@storybook/vue3';
import { h, defineComponent } from 'vue';
import ToolCall from '../tool-call.vue';
import type { ToolCallPart } from '@incremark/chat-core';

const meta = {
  title: 'Chat-UI/ToolCall',
  component: ToolCall,
  argTypes: {
    part: {
      control: 'object',
      description: 'ToolCallPart 数据'
    },
    showArgs: {
      control: 'boolean',
      description: '是否显示参数'
    },
    showOutput: {
      control: 'boolean',
      description: '是否显示结果'
    },
    defaultExpanded: {
      control: 'boolean',
      description: '默认是否展开'
    }
  }
} satisfies Meta<typeof ToolCall>;

export default meta;
type Story = StoryObj<typeof meta>;

// 参数输入中
export const InputStreaming: Story = {
  args: {
    part: {
      type: 'tool-call',
      toolCallId: 'call_001',
      toolName: 'search',
      args: { query: 'Vue 3' },
      state: 'input-streaming'
    } as ToolCallPart
  }
};

// 等待执行
export const InputAvailable: Story = {
  args: {
    part: {
      type: 'tool-call',
      toolCallId: 'call_002',
      toolName: 'readFile',
      args: { path: '/src/index.ts' },
      state: 'input-available'
    } as ToolCallPart
  }
};

// 等待审批
export const ApprovalRequested: Story = {
  args: {
    part: {
      type: 'tool-call',
      toolCallId: 'call_006',
      toolName: 'deleteFile',
      args: { path: '/src/important-file.ts' },
      state: 'approval-requested'
    } as ToolCallPart
  }
};

// 审批已响应
export const ApprovalResponded: Story = {
  args: {
    part: {
      type: 'tool-call',
      toolCallId: 'call_007',
      toolName: 'deleteFile',
      args: { path: '/src/important-file.ts' },
      state: 'approval-responded'
    } as ToolCallPart
  }
};

// 执行中
export const Executing: Story = {
  args: {
    part: {
      type: 'tool-call',
      toolCallId: 'call_003',
      toolName: 'executeCode',
      args: { code: 'console.log("hello")' },
      state: 'executing'
    } as ToolCallPart
  }
};

// 执行完成
export const OutputAvailable: Story = {
  args: {
    part: {
      type: 'tool-call',
      toolCallId: 'call_004',
      toolName: 'search',
      args: { query: 'Vue 3 components' },
      state: 'output-available',
      output: { results: ['result1', 'result2'], count: 15 }
    } as ToolCallPart
  }
};

// 执行出错
export const OutputError: Story = {
  args: {
    part: {
      type: 'tool-call',
      toolCallId: 'call_005',
      toolName: 'readFile',
      args: { path: '/not/exist.ts' },
      state: 'output-error',
      error: 'File not found: /not/exist.ts'
    } as ToolCallPart
  }
};

// 用户拒绝执行
export const OutputDenied: Story = {
  args: {
    part: {
      type: 'tool-call',
      toolCallId: 'call_008',
      toolName: 'deleteFile',
      args: { path: '/src/important-file.ts' },
      state: 'output-denied'
    } as ToolCallPart
  }
};

// 自定义输出渲染器示例
const SearchResultRenderer = defineComponent({
  props: ['toolName', 'output'],
  setup(props) {
    return () => h('div', { style: 'padding: 8px; background: #f0f9ff; border-radius: 4px;' }, [
      h('div', { style: 'font-weight: 500; margin-bottom: 4px;' }, `搜索结果 (${props.output?.count || 0} 条)`),
      h('ul', { style: 'margin: 0; padding-left: 20px;' },
        (props.output?.results || []).map((r: string) => h('li', r))
      )
    ]);
  }
});

export const WithOutputRenderer: Story = {
  args: {
    part: {
      type: 'tool-call',
      toolCallId: 'call_009',
      toolName: 'search',
      args: { query: 'Vue 3 components' },
      state: 'output-available',
      output: { results: ['Vue 3 Composition API', 'Vue 3 Reactivity', 'Vue 3 SFC'], count: 3 }
    } as ToolCallPart,
    outputRenderers: {
      search: SearchResultRenderer
    }
  }
};

// 自定义状态标签（中文）
export const WithCustomStateLabels: Story = {
  args: {
    part: {
      type: 'tool-call',
      toolCallId: 'call_010',
      toolName: 'search',
      args: { query: 'Vue 3' },
      state: 'executing'
    } as ToolCallPart,
    stateLabels: {
      'input-streaming': '参数输入中...',
      'input-available': '等待执行',
      'approval-requested': '等待审批',
      'approval-responded': '审批已响应',
      'executing': '执行中...',
      'output-available': '已完成',
      'output-error': '执行失败',
      'output-denied': '已拒绝'
    }
  }
};

// 默认折叠
export const DefaultCollapsed: Story = {
  args: {
    part: {
      type: 'tool-call',
      toolCallId: 'call_011',
      toolName: 'search',
      args: { query: 'Vue 3 components' },
      state: 'output-available',
      output: { results: ['result1', 'result2'], count: 15 }
    } as ToolCallPart,
    defaultExpanded: false
  }
};
