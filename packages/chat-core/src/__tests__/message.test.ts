import { describe, it, expect } from 'vitest';
import {
  createTextMessage,
  createStreamingMessage,
  isTextPart,
  isToolCallPart,
  isUIPart,
  isReasoningPart
} from '../protocol/message.js';

describe('Message Protocol', () => {
  describe('Message Creation', () => {
    it('should create a text message', () => {
      const message = createTextMessage('user', 'Hello world');

      expect(message.role).toBe('user');
      expect(message.parts).toHaveLength(1);
      expect(message.parts[0].type).toBe('text');
      expect(isTextPart(message.parts[0]) && message.parts[0].content).toBe('Hello world');
      expect(message.status).toBe('success');
    });

    it('should create a streaming message', () => {
      const message = createStreamingMessage('assistant');

      expect(message.role).toBe('assistant');
      expect(message.parts).toHaveLength(0);
      expect(message.status).toBe('streaming');
    });
  });

  describe('Type Guards', () => {
    const textPart = { type: 'text' as const, content: 'Hello' };
    const toolCallPart = {
      type: 'tool-call' as const,
      toolCallId: 'tc_1',
      toolName: 'search',
      args: {},
      state: 'input-available' as const
    };
    const uiPart = { type: 'ui' as const, component: 'Button', props: {} };
    const reasoningPart = { type: 'reasoning' as const, content: 'Thinking...' };

    it('should identify text parts', () => {
      expect(isTextPart(textPart)).toBe(true);
      expect(isTextPart(toolCallPart)).toBe(false);
    });

    it('should identify tool call parts', () => {
      expect(isToolCallPart(toolCallPart)).toBe(true);
      expect(isToolCallPart(textPart)).toBe(false);
    });

    it('should identify UI parts', () => {
      expect(isUIPart(uiPart)).toBe(true);
      expect(isUIPart(textPart)).toBe(false);
    });

    it('should identify reasoning parts', () => {
      expect(isReasoningPart(reasoningPart)).toBe(true);
      expect(isReasoningPart(textPart)).toBe(false);
    });
  });
});
