import { describe, it, expect, vi } from 'vitest';
import type { StreamProcessor, ProcessorActions } from '../engine/types.js';
import type { StreamPart } from '../protocol/transport.js';

describe('StreamProcessor interface', () => {
  it('should pass through events when returning event', () => {
    const processor: StreamProcessor = {
      name: 'passthrough',
      process(event) {
        return event;
      },
    };

    const event: StreamPart = { type: 'text', content: 'hello' };
    expect(processor.process(event, {} as ProcessorActions)).toBe(event);
  });

  it('should consume events when returning null', () => {
    const processor: StreamProcessor = {
      name: 'consumer',
      process(event) {
        if (event.type === 'done') return null;
        return event;
      },
    };

    expect(processor.process({ type: 'done' }, {} as ProcessorActions)).toBeNull();
    expect(processor.process({ type: 'text', content: 'hi' }, {} as ProcessorActions)).toEqual({
      type: 'text',
      content: 'hi',
    });
  });

  it('should be able to call actions', () => {
    const replaceMessageId = vi.fn();
    const actions: ProcessorActions = {
      replaceMessageId,
      updateMessage: vi.fn(),
      removeMessages: vi.fn(),
      getMessages: vi.fn(() => []),
      emit: vi.fn(),
    };

    const processor: StreamProcessor = {
      name: 'id-mapper',
      process(event, actions) {
        if (event.type === 'text') {
          actions.replaceMessageId('old-id', 'new-id');
          return null;
        }
        return event;
      },
    };

    processor.process({ type: 'text', content: '' }, actions);
    expect(replaceMessageId).toHaveBeenCalledWith('old-id', 'new-id');
  });
});
