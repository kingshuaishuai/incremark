import { describe, it, expect, vi } from 'vitest';
import { createChatEngine } from '../engine/create-chat-engine.js';
import type { ChatTransport } from '../protocol/transport.js';
import type { StreamProcessor } from '../engine/types.js';

// ============================================================================
// Helpers
// ============================================================================

let idCounter = 0;
function deterministicId(): string {
  return `test_${++idCounter}`;
}

function resetIdCounter() {
  idCounter = 0;
}

// ============================================================================
// 1. State management
// ============================================================================

describe('State management', () => {
  it('should have initial state with empty messages and idle status', () => {
    const transport: ChatTransport = {
      async *send() {
        yield { type: 'done' as const };
      },
    };

    const engine = createChatEngine({ transport });
    const state = engine.getState();

    expect(state.messages).toEqual([]);
    expect(state.status).toBe('idle');
    expect(state.error).toBeUndefined();
  });

  it('should support initial messages', () => {
    const transport: ChatTransport = {
      async *send() {
        yield { type: 'done' as const };
      },
    };

    const initialMessages = [
      {
        id: 'msg1',
        role: 'user' as const,
        parts: [{ type: 'text' as const, content: 'hello', format: 'plain' as const }],
        status: 'success' as const,
        createdAt: 1000,
      },
    ];

    const engine = createChatEngine({ transport, initialMessages });
    const state = engine.getState();

    expect(state.messages).toHaveLength(1);
    expect(state.messages[0].id).toBe('msg1');
  });

  it('should not mutate initial messages array', () => {
    const transport: ChatTransport = {
      async *send() {
        yield { type: 'done' as const };
      },
    };

    const initialMessages = [
      {
        id: 'msg1',
        role: 'user' as const,
        parts: [{ type: 'text' as const, content: 'hello', format: 'plain' as const }],
        status: 'success' as const,
        createdAt: 1000,
      },
    ];

    const engine = createChatEngine({ transport, initialMessages });

    // getState should return a copy
    const state = engine.getState();
    expect(state.messages).not.toBe(initialMessages);
  });

  it('should notify subscribers on state change', async () => {
    const transport: ChatTransport = {
      async *send() {
        yield { type: 'text' as const, content: 'hi' };
        yield { type: 'done' as const };
      },
    };

    resetIdCounter();
    const engine = createChatEngine({ transport, idGenerator: deterministicId });
    const listener = vi.fn();
    engine.subscribe(listener);

    await engine.send('hello');

    expect(listener.mock.calls.length).toBeGreaterThan(0);
    // Last call should have idle status
    const lastState = listener.mock.calls[listener.mock.calls.length - 1][0];
    expect(lastState.status).toBe('idle');
  });

  it('should unsubscribe correctly', async () => {
    const transport: ChatTransport = {
      async *send() {
        yield { type: 'text' as const, content: 'hi' };
        yield { type: 'done' as const };
      },
    };

    resetIdCounter();
    const engine = createChatEngine({ transport, idGenerator: deterministicId });
    const listener = vi.fn();
    const unsub = engine.subscribe(listener);

    unsub();

    await engine.send('hello');

    expect(listener).not.toHaveBeenCalled();
  });
});

// ============================================================================
// 2. Stream consumption
// ============================================================================

describe('Stream consumption', () => {
  it('should accumulate text into one text part', async () => {
    const transport: ChatTransport = {
      async *send() {
        yield { type: 'text' as const, content: 'Hello ' };
        yield { type: 'text' as const, content: 'world' };
        yield { type: 'done' as const };
      },
    };

    resetIdCounter();
    const engine = createChatEngine({ transport, idGenerator: deterministicId });
    await engine.send('hi');

    const state = engine.getState();
    const assistant = state.messages.find(m => m.role === 'assistant');
    expect(assistant).toBeDefined();

    const textParts = assistant!.parts.filter(p => p.type === 'text');
    expect(textParts).toHaveLength(1);
    expect(textParts[0].type === 'text' && textParts[0].content).toBe('Hello world');
  });

  it('should handle tool-call with state = executing, cleaned up to output-available on done', async () => {
    const transport: ChatTransport = {
      async *send() {
        yield {
          type: 'tool-call' as const,
          toolName: 'search',
          args: { q: 'test' },
        };
        yield { type: 'done' as const };
      },
    };

    resetIdCounter();
    const engine = createChatEngine({ transport, idGenerator: deterministicId });

    // Track intermediate states
    const states: any[] = [];
    engine.subscribe(s => states.push(JSON.parse(JSON.stringify(s))));

    await engine.send('search something');

    // Find intermediate state where tool-call was executing
    const streamingState = states.find(
      s => s.status === 'streaming' && s.messages.some(
        (m: any) => m.role === 'assistant' && m.parts.some(
          (p: any) => p.type === 'tool-call' && p.state === 'executing'
        )
      )
    );
    expect(streamingState).toBeDefined();

    // Final state should have output-available
    const finalState = engine.getState();
    const assistant = finalState.messages.find(m => m.role === 'assistant');
    const toolPart = assistant!.parts.find(p => p.type === 'tool-call');
    expect(toolPart).toBeDefined();
    expect(toolPart!.type === 'tool-call' && toolPart!.state).toBe('output-available');
  });

  it('should incrementally merge reasoning parts', async () => {
    const transport: ChatTransport = {
      async *send() {
        yield { type: 'reasoning' as const, content: 'Let me ' };
        yield { type: 'reasoning' as const, content: 'think...' };
        yield { type: 'done' as const };
      },
    };

    resetIdCounter();
    const engine = createChatEngine({ transport, idGenerator: deterministicId });
    await engine.send('why?');

    const state = engine.getState();
    const assistant = state.messages.find(m => m.role === 'assistant');
    const reasoningParts = assistant!.parts.filter(p => p.type === 'reasoning');
    expect(reasoningParts).toHaveLength(1);
    expect(reasoningParts[0].type === 'reasoning' && reasoningParts[0].content).toBe('Let me think...');
  });

  it('should handle UI parts', async () => {
    const transport: ChatTransport = {
      async *send() {
        yield {
          type: 'ui' as const,
          component: 'WeatherCard',
          props: { city: 'Beijing', temp: 25 },
        };
        yield { type: 'done' as const };
      },
    };

    resetIdCounter();
    const engine = createChatEngine({ transport, idGenerator: deterministicId });
    await engine.send('weather?');

    const state = engine.getState();
    const assistant = state.messages.find(m => m.role === 'assistant');
    const uiParts = assistant!.parts.filter(p => p.type === 'ui');
    expect(uiParts).toHaveLength(1);
    expect(uiParts[0].type === 'ui' && uiParts[0].component).toBe('WeatherCard');
    expect(uiParts[0].type === 'ui' && uiParts[0].props).toEqual({ city: 'Beijing', temp: 25 });
  });

  it('should set assistant message status to success after stream completes', async () => {
    const transport: ChatTransport = {
      async *send() {
        yield { type: 'text' as const, content: 'done' };
        yield { type: 'done' as const };
      },
    };

    resetIdCounter();
    const engine = createChatEngine({ transport, idGenerator: deterministicId });
    await engine.send('test');

    const state = engine.getState();
    const assistant = state.messages.find(m => m.role === 'assistant');
    expect(assistant!.status).toBe('success');
    expect(state.status).toBe('idle');
  });
});

// ============================================================================
// 3. Processor pipeline
// ============================================================================

describe('Processor pipeline', () => {
  it('should run processors before built-in handling', async () => {
    const order: string[] = [];

    const processor: StreamProcessor = {
      name: 'test-processor',
      process(event, _actions) {
        order.push('processor');
        return event;
      },
    };

    const transport: ChatTransport = {
      async *send() {
        yield { type: 'text' as const, content: 'hi' };
        yield { type: 'done' as const };
      },
    };

    resetIdCounter();
    const engine = createChatEngine({
      transport,
      processors: [processor],
      idGenerator: deterministicId,
    });

    // Subscribe to detect state changes (which happen after built-in handling)
    engine.subscribe(() => order.push('notify'));

    await engine.send('test');

    // Processor should appear before notify entries
    const firstProcessor = order.indexOf('processor');
    const firstNotifyAfterProcessor = order.indexOf('notify', firstProcessor);
    expect(firstProcessor).toBeLessThan(firstNotifyAfterProcessor);
  });

  it('should consume event when processor returns null', async () => {
    const processor: StreamProcessor = {
      name: 'null-processor',
      process(event) {
        if (event.type === 'text') return null;
        return event;
      },
    };

    const transport: ChatTransport = {
      async *send() {
        yield { type: 'text' as const, content: 'should be filtered' };
        yield { type: 'done' as const };
      },
    };

    resetIdCounter();
    const engine = createChatEngine({
      transport,
      processors: [processor],
      idGenerator: deterministicId,
    });
    await engine.send('test');

    const state = engine.getState();
    const assistant = state.messages.find(m => m.role === 'assistant');
    // Text events were consumed, so no text parts
    const textParts = assistant!.parts.filter(p => p.type === 'text');
    expect(textParts).toHaveLength(0);
  });

  it('should allow processor to call actions', async () => {
    const processor: StreamProcessor = {
      name: 'action-processor',
      process(event, actions) {
        if (event.type === 'text') {
          // Use actions to emit a custom event
          actions.emit('done', undefined);
        }
        return event;
      },
    };

    const transport: ChatTransport = {
      async *send() {
        yield { type: 'text' as const, content: 'hi' };
        yield { type: 'done' as const };
      },
    };

    const doneHandler = vi.fn();
    resetIdCounter();
    const engine = createChatEngine({
      transport,
      processors: [processor],
      idGenerator: deterministicId,
    });
    engine.on('done', doneHandler);
    await engine.send('test');

    // done should have been called by processor + by engine's own done emission
    expect(doneHandler.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('should chain multiple processors', async () => {
    const calls: string[] = [];

    const p1: StreamProcessor = {
      name: 'p1',
      process(event) {
        calls.push('p1');
        return event;
      },
    };

    const p2: StreamProcessor = {
      name: 'p2',
      process(event) {
        calls.push('p2');
        return event;
      },
    };

    const transport: ChatTransport = {
      async *send() {
        yield { type: 'text' as const, content: 'hi' };
        yield { type: 'done' as const };
      },
    };

    resetIdCounter();
    const engine = createChatEngine({
      transport,
      processors: [p1, p2],
      idGenerator: deterministicId,
    });
    await engine.send('test');

    // Both processors should run in order for each event
    expect(calls.filter(c => c === 'p1').length).toBeGreaterThanOrEqual(2);
    expect(calls.filter(c => c === 'p2').length).toBeGreaterThanOrEqual(2);
    // p1 should always come before p2
    for (let i = 0; i < calls.length - 1; i++) {
      if (calls[i] === 'p2') {
        expect(calls[i - 1]).toBe('p1');
      }
    }
  });
});

// ============================================================================
// 4. Abort handling
// ============================================================================

describe('Abort handling', () => {
  it('should keep message with content on abort, status = success', async () => {
    const transport: ChatTransport = {
      async *send(_msgs, options) {
        yield { type: 'text' as const, content: 'partial' };
        await new Promise((_, reject) => {
          options?.signal?.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError'))
          );
        });
      },
    };

    resetIdCounter();
    const engine = createChatEngine({ transport, idGenerator: deterministicId });

    const sendPromise = engine.send('test');

    // Wait a tick for the stream to yield, then abort
    await new Promise(r => setTimeout(r, 10));
    engine.abort();

    await sendPromise;

    const state = engine.getState();
    expect(state.status).toBe('idle');

    const assistant = state.messages.find(m => m.role === 'assistant');
    expect(assistant).toBeDefined();
    expect(assistant!.status).toBe('success');
    expect(assistant!.parts.some(p => p.type === 'text')).toBe(true);
  });

  it('should remove empty placeholder on abort without content', async () => {
    const transport: ChatTransport = {
      async *send(_msgs, options) {
        // Never yield any content, just wait for abort
        await new Promise((_, reject) => {
          options?.signal?.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError'))
          );
        });
      },
    };

    resetIdCounter();
    const engine = createChatEngine({ transport, idGenerator: deterministicId });

    const sendPromise = engine.send('test');

    await new Promise(r => setTimeout(r, 10));
    engine.abort();

    await sendPromise;

    const state = engine.getState();
    expect(state.status).toBe('idle');

    // Only user message should remain; empty assistant removed
    const assistants = state.messages.filter(m => m.role === 'assistant');
    expect(assistants).toHaveLength(0);
    expect(state.messages).toHaveLength(1);
    expect(state.messages[0].role).toBe('user');
  });
});

// ============================================================================
// 5. Error handling
// ============================================================================

describe('Error handling', () => {
  it('should set error state when stream throws', async () => {
    const transport: ChatTransport = {
      async *send() {
        yield { type: 'text' as const, content: 'partial' };
        throw new Error('Stream failed');
      },
    };

    const errorHandler = vi.fn();
    resetIdCounter();
    const engine = createChatEngine({ transport, idGenerator: deterministicId });
    engine.on('error', errorHandler);

    await engine.send('test');

    const state = engine.getState();
    expect(state.status).toBe('error');
    expect(state.error).toBe('Stream failed');

    expect(errorHandler).toHaveBeenCalledTimes(1);
    expect(errorHandler.mock.calls[0][0].message).toBe('Stream failed');
    expect(errorHandler.mock.calls[0][0].type).toBe('stream');
  });

  it('should handle error stream event and set message error status', async () => {
    const transport: ChatTransport = {
      async *send() {
        yield { type: 'error' as const, error: 'Server error' };
      },
    };

    resetIdCounter();
    const engine = createChatEngine({ transport, idGenerator: deterministicId });
    await engine.send('test');

    const state = engine.getState();
    const assistant = state.messages.find(m => m.role === 'assistant');
    expect(assistant!.status).toBe('error');
    expect(assistant!.metadata?.error).toBe('Server error');
  });

  it('should classify TypeError as network error', async () => {
    const transport: ChatTransport = {
      async *send() {
        throw new TypeError('Failed to fetch');
      },
    };

    const errorHandler = vi.fn();
    resetIdCounter();
    const engine = createChatEngine({ transport, idGenerator: deterministicId });
    engine.on('error', errorHandler);

    await engine.send('test');

    expect(errorHandler).toHaveBeenCalledTimes(1);
    expect(errorHandler.mock.calls[0][0].type).toBe('network');
  });
});

// ============================================================================
// 6. Atomic operations
// ============================================================================

describe('Atomic operations', () => {
  it('should replace message id via replaceMessageId', async () => {
    const transport: ChatTransport = {
      async *send() {
        yield { type: 'text' as const, content: 'hello' };
        yield { type: 'done' as const };
      },
    };

    resetIdCounter();
    const engine = createChatEngine({ transport, idGenerator: deterministicId });
    await engine.send('hi');

    const state = engine.getState();
    const userMsgId = state.messages[0].id;

    const listener = vi.fn();
    engine.subscribe(listener);

    engine.replaceMessageId(userMsgId, 'new-id');

    const newState = engine.getState();
    expect(newState.messages[0].id).toBe('new-id');
    expect(listener).toHaveBeenCalled();
  });

  it('should update message via updater function', async () => {
    const transport: ChatTransport = {
      async *send() {
        yield { type: 'text' as const, content: 'hello' };
        yield { type: 'done' as const };
      },
    };

    resetIdCounter();
    const engine = createChatEngine({ transport, idGenerator: deterministicId });
    await engine.send('hi');

    const state = engine.getState();
    const assistantId = state.messages.find(m => m.role === 'assistant')!.id;

    engine.updateMessage(assistantId, msg => {
      msg.metadata = { ...msg.metadata, custom: true };
    });

    const newState = engine.getState();
    const assistant = newState.messages.find(m => m.role === 'assistant');
    expect(assistant!.metadata?.custom).toBe(true);
  });

  it('should remove messages by predicate', async () => {
    const transport: ChatTransport = {
      async *send() {
        yield { type: 'text' as const, content: 'hello' };
        yield { type: 'done' as const };
      },
    };

    resetIdCounter();
    const engine = createChatEngine({ transport, idGenerator: deterministicId });
    await engine.send('hi');

    expect(engine.getState().messages).toHaveLength(2);

    const listener = vi.fn();
    engine.subscribe(listener);

    engine.removeMessages(m => m.role === 'user');

    const state = engine.getState();
    expect(state.messages).toHaveLength(1);
    expect(state.messages[0].role).toBe('assistant');
    expect(listener).toHaveBeenCalled();
  });

  it('should not notify when removeMessages removes nothing', async () => {
    const transport: ChatTransport = {
      async *send() {
        yield { type: 'done' as const };
      },
    };

    const engine = createChatEngine({ transport });
    const listener = vi.fn();
    engine.subscribe(listener);

    engine.removeMessages(() => false);
    expect(listener).not.toHaveBeenCalled();
  });
});

// ============================================================================
// 7. Event hooks
// ============================================================================

describe('Event hooks', () => {
  it('should fire done event on successful completion', async () => {
    const transport: ChatTransport = {
      async *send() {
        yield { type: 'text' as const, content: 'hi' };
        yield { type: 'done' as const };
      },
    };

    resetIdCounter();
    const engine = createChatEngine({ transport, idGenerator: deterministicId });
    const doneHandler = vi.fn();
    engine.on('done', doneHandler);

    await engine.send('test');

    expect(doneHandler).toHaveBeenCalledTimes(1);
  });

  it('should fire unknown-event for unrecognized stream events', async () => {
    const transport: ChatTransport = {
      async *send() {
        yield { type: 'custom-thing' as any, data: 123 } as any;
        yield { type: 'done' as const };
      },
    };

    resetIdCounter();
    const engine = createChatEngine({ transport, idGenerator: deterministicId });
    const unknownHandler = vi.fn();
    engine.on('unknown-event', unknownHandler);

    await engine.send('test');

    expect(unknownHandler).toHaveBeenCalledTimes(1);
    expect(unknownHandler.mock.calls[0][0]).toEqual({ type: 'custom-thing', data: 123 });
  });

  it('should return unsubscribe function from on()', async () => {
    const transport: ChatTransport = {
      async *send() {
        yield { type: 'text' as const, content: 'hi' };
        yield { type: 'done' as const };
      },
    };

    resetIdCounter();
    const engine = createChatEngine({ transport, idGenerator: deterministicId });
    const doneHandler = vi.fn();
    const unsub = engine.on('done', doneHandler);

    unsub();

    await engine.send('test');

    expect(doneHandler).not.toHaveBeenCalled();
  });

  it('should fire stateChange event', async () => {
    const transport: ChatTransport = {
      async *send() {
        yield { type: 'done' as const };
      },
    };

    resetIdCounter();
    const engine = createChatEngine({ transport, idGenerator: deterministicId });
    const stateChangeHandler = vi.fn();
    engine.on('stateChange', stateChangeHandler);

    await engine.send('test');

    expect(stateChangeHandler.mock.calls.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// 8. Send options / targetMessageId
// ============================================================================

describe('Send options / targetMessageId', () => {
  it('should reset existing assistant message when targetMessageId matches', async () => {
    const transport: ChatTransport = {
      async *send() {
        yield { type: 'text' as const, content: 'new response' };
        yield { type: 'done' as const };
      },
    };

    resetIdCounter();
    const engine = createChatEngine({ transport, idGenerator: deterministicId });

    // First send to create an assistant message
    await engine.send('first');

    const state1 = engine.getState();
    const assistantMsg = state1.messages.find(m => m.role === 'assistant')!;
    const targetId = assistantMsg.id;

    // Verify initial content
    expect(assistantMsg.parts.some(p => p.type === 'text')).toBe(true);
    expect(assistantMsg.status).toBe('success');

    // Track intermediate states to verify streaming reset
    const states: any[] = [];
    engine.subscribe(s => states.push(JSON.parse(JSON.stringify(s))));

    // Send again targeting the existing assistant message
    await engine.send('second', { targetMessageId: targetId });

    // The first streaming notification should show the target message reset
    const firstStreamingState = states.find(s => s.status === 'streaming');
    expect(firstStreamingState).toBeDefined();
    const targetInStreaming = firstStreamingState.messages.find(
      (m: any) => m.id === targetId
    );
    expect(targetInStreaming).toBeDefined();
    expect(targetInStreaming.status).toBe('streaming');

    // Final state: the same message ID should now have new content
    const state2 = engine.getState();
    const updatedMsg = state2.messages.find(m => m.id === targetId)!;
    expect(updatedMsg).toBeDefined();
    expect(updatedMsg.status).toBe('success');
    const textPart = updatedMsg.parts.find(p => p.type === 'text');
    expect(textPart).toBeDefined();
    expect(textPart!.type === 'text' && textPart!.content).toBe('new response');
  });

  it('should create a new assistant message with given ID when targetMessageId does not match', async () => {
    const transport: ChatTransport = {
      async *send() {
        yield { type: 'text' as const, content: 'new response' };
        yield { type: 'done' as const };
      },
    };

    resetIdCounter();
    const engine = createChatEngine({ transport, idGenerator: deterministicId });

    const customId = 'custom-assistant-id';

    await engine.send('hello', { targetMessageId: customId });

    const state = engine.getState();

    // Should have user message + assistant message with custom ID
    expect(state.messages).toHaveLength(2);
    expect(state.messages[0].role).toBe('user');

    const assistant = state.messages.find(m => m.id === customId);
    expect(assistant).toBeDefined();
    expect(assistant!.role).toBe('assistant');
    expect(assistant!.status).toBe('success');

    const textPart = assistant!.parts.find(p => p.type === 'text');
    expect(textPart).toBeDefined();
    expect(textPart!.type === 'text' && textPart!.content).toBe('new response');
  });
});
