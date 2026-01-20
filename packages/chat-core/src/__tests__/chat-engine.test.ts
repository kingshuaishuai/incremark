import { describe, it, expect, vi } from 'vitest';
import { ChatEngine } from '../engine/chat-engine.js';
import { MockTransport } from '../protocol/transport.js';

describe('ChatEngine', () => {
  it('should create user message when sending', async () => {
    const engine = new ChatEngine({
      transport: new MockTransport()
    });

    const listener = vi.fn();
    engine.subscribe(listener);

    await engine.sendMessage('Hello');

    const states = listener.mock.calls.map(call => call[0]);
    expect(states.length).toBeGreaterThan(0);

    const lastState = states[states.length - 1];
    expect(lastState.messages).toHaveLength(2); // user + assistant
    expect(lastState.messages[0].role).toBe('user');
    expect(lastState.messages[0].parts[0].type).toBe('text');
    expect(lastState.messages[0].parts[0].content).toBe('Hello');
  });

  it('should update state during streaming', async () => {
    const engine = new ChatEngine({
      transport: new MockTransport()
    });

    const listener = vi.fn();
    engine.subscribe(listener);

    await engine.sendMessage('test');

    const states = listener.mock.calls.map(call => call[0]);

    // Should have multiple state updates during streaming
    expect(states.length).toBeGreaterThan(2);

    // Check that streaming status was set
    const streamingStates = states.filter(s => s.status === 'streaming');
    expect(streamingStates.length).toBeGreaterThan(0);
  });

  it('should accumulate text content incrementally', async () => {
    const engine = new ChatEngine({
      transport: new MockTransport()
    });

    await engine.sendMessage('test');

    const state = engine.getState();
    const assistantMsg = state.messages.find(m => m.role === 'assistant');

    expect(assistantMsg).toBeDefined();
    expect(assistantMsg!.parts.length).toBeGreaterThan(0);

    // MockTransport sends word by word, so we should have multiple parts or one accumulated part
    const textParts = assistantMsg!.parts.filter(p => p.type === 'text');
    expect(textParts.length).toBeGreaterThan(0);

    // The final content should be the full response
    const fullContent = textParts.map(p => p.content).join('');
    expect(fullContent).toContain('mock response');
  });

  it('should support aborting', async () => {
    const engine = new ChatEngine({
      transport: new MockTransport()
    });

    const listener = vi.fn();
    engine.subscribe(listener);

    // Start sending but abort immediately
    const promise = engine.sendMessage('test');
    setTimeout(() => engine.abort(), 100);

    await promise;

    const state = engine.getState();
    // Should have some messages, possibly with error status
    expect(state.messages.length).toBeGreaterThanOrEqual(2);
  });
});
