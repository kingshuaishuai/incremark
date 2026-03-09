import { describe, it, expect, vi } from 'vitest';
import { serverIdMapping } from '../processors/server-id-mapping.js';
import { toolResultProcessor } from '../processors/tool-result-processor.js';
import type { ProcessorActions } from '../engine/types.js';

function createMockActions(overrides?: Partial<ProcessorActions>): ProcessorActions {
  return {
    replaceMessageId: vi.fn(),
    updateMessage: vi.fn(),
    removeMessages: vi.fn(),
    getMessages: vi.fn(() => []),
    emit: vi.fn(),
    ...overrides,
  };
}

describe('serverIdMapping', () => {
  const processor = serverIdMapping();

  it('should consume user-message-saved and replace id', () => {
    const actions = createMockActions();
    const result = processor.process(
      { type: 'user-message-saved', tempId: 'temp-1', messageId: 'real-1' } as any,
      actions
    );
    expect(result).toBeNull();
    expect(actions.replaceMessageId).toHaveBeenCalledWith('temp-1', 'real-1');
  });

  it('should consume assistant-message-created and replace id', () => {
    const actions = createMockActions();
    const result = processor.process(
      { type: 'assistant-message-created', tempId: 'temp-2', messageId: 'real-2' } as any,
      actions
    );
    expect(result).toBeNull();
    expect(actions.replaceMessageId).toHaveBeenCalledWith('temp-2', 'real-2');
  });

  it('should pass through other events', () => {
    const actions = createMockActions();
    const event = { type: 'text' as const, content: 'hello' };
    const result = processor.process(event, actions);
    expect(result).toBe(event);
  });
});

describe('toolResultProcessor', () => {
  const processor = toolResultProcessor();

  it('should update tool-call state to output-available', () => {
    const updateMessage = vi.fn();
    const actions = createMockActions({
      updateMessage,
      getMessages: vi.fn(() => [
        {
          id: 'msg-1',
          role: 'assistant' as const,
          parts: [
            { type: 'tool-call' as const, toolCallId: 'tc-1', toolName: 'test', args: {}, state: 'executing' },
          ],
          status: 'streaming' as const,
          createdAt: Date.now(),
        },
      ]),
    });

    const result = processor.process(
      { type: 'tool-result', toolCallId: 'tc-1', output: 'result data' } as any,
      actions
    );

    expect(result).toBeNull();
    expect(updateMessage).toHaveBeenCalledWith('msg-1', expect.any(Function));

    // Verify the updater function behavior
    const updater = updateMessage.mock.calls[0][1];
    const mockMsg = {
      parts: [
        { type: 'tool-call', toolCallId: 'tc-1', toolName: 'test', args: {}, state: 'executing' },
      ],
    };
    updater(mockMsg);
    expect(mockMsg.parts[0].state).toBe('output-available');
    expect((mockMsg.parts[0] as any).output).toBe('result data');
  });

  it('should pass through other events', () => {
    const actions = createMockActions();
    const event = { type: 'text' as const, content: 'hi' };
    expect(processor.process(event, actions)).toBe(event);
  });
});
