/**
 * Transport layer protocol for chat communication
 * Inspired by Vercel AI SDK 5.0+ transport architecture
 */

import type { ChatMessage } from './message.js';

/**
 * Stream part - chunks of data received during streaming
 */
export type StreamPart =
  | TextStreamPart
  | ToolCallStreamPart
  | UIStreamPart
  | ReasoningStreamPart
  | DoneStreamPart
  | ErrorStreamPart;

/**
 * Text content stream part
 */
export interface TextStreamPart {
  type: 'text';
  content: string;
  format?: 'markdown' | 'plain';
}

/**
 * Tool call stream part
 */
export interface ToolCallStreamPart {
  type: 'tool-call';
  toolCallId?: string;
  toolName: string;
  args: Record<string, any>;
}

/**
 * UI component stream part
 */
export interface UIStreamPart {
  type: 'ui';
  component: string;
  props: Record<string, any>;
}

/**
 * Reasoning stream part
 */
export interface ReasoningStreamPart {
  type: 'reasoning';
  content: string;
}

/**
 * Stream completion marker
 */
export interface DoneStreamPart {
  type: 'done';
}

/**
 * Error stream part
 */
export interface ErrorStreamPart {
  type: 'error';
  error: string;
}

/**
 * Transport interface for sending messages and receiving stream
 * This is the key abstraction that allows different implementations:
 * - HTTP streaming
 * - WebSocket
 * - Server-Sent Events (SSE)
 * - Mock for testing
 */
export interface ChatTransport {
  /**
   * Send messages and return async generator of stream parts
   *
   * @param messages - Full conversation history (or context window)
   * @returns Async generator yielding stream parts
   */
  send(messages: ChatMessage[]): AsyncGenerator<StreamPart>;

  /**
   * Abort the current stream (optional)
   */
  abort?(): void;
}

/**
 * Simple mock transport for testing
 */
export class MockTransport implements ChatTransport {
  private aborted = false;

  async *send(messages: ChatMessage[]): AsyncGenerator<StreamPart> {
    const lastMessage = messages[messages.length - 1];

    // Simulate streaming response
    const response = "This is a mock response from the AI assistant.";
    const words = response.split(' ');

    for (const word of words) {
      if (this.aborted) {
        yield { type: 'error', error: 'Aborted by user' };
        return;
      }

      yield {
        type: 'text',
        content: word + ' ',
        format: 'markdown'
      };

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    yield { type: 'done' };
  }

  abort(): void {
    this.aborted = true;
  }
}
