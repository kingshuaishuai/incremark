/**
 * ChatEngine - Core engine for managing chat state and streaming
 * Framework-agnostic implementation
 */

import { nanoid } from 'nanoid';
import type {
  ChatMessage,
  MessagePart,
  MessageStatus,
  StreamPart,
  ChatTransport,
  TextPart,
  ToolCallPart,
  UIPart,
  ReasoningPart
} from '../protocol/index.js';

/**
 * State update listener type
 */
export type StateListener = (state: ChatEngineState) => void;

/**
 * Engine state snapshot
 */
export interface ChatEngineState {
  messages: ChatMessage[];
  status: MessageStatus;
  error?: string;
}

/**
 * ID generator function type
 */
export type IDGenerator = () => string;

/**
 * Default ID generator using nanoid
 */
export const defaultIDGenerator: IDGenerator = () => `msg_${nanoid()}`;

/**
 * Configuration for ChatEngine
 */
export interface ChatEngineConfig {
  transport: ChatTransport;
  initialMessages?: ChatMessage[];
  idGenerator?: IDGenerator;
}

/**
 * Core engine for chat functionality
 * - Manages message history
 * - Handles streaming responses
 * - Emits state updates
 */
export class ChatEngine {
  private messages: ChatMessage[] = [];
  private currentMessage: ChatMessage | null = null;
  private status: MessageStatus = 'success';
  private error: string | undefined;
  private listeners: Set<StateListener> = new Set();
  private transport: ChatTransport;
  private abortController: AbortController | null = null;
  private idGenerator: IDGenerator;

  constructor(config: ChatEngineConfig) {
    this.transport = config.transport;
    this.idGenerator = config.idGenerator || defaultIDGenerator;
    if (config.initialMessages) {
      this.messages = [...config.initialMessages];
    }
  }

  /**
   * Get current state (immutable snapshot)
   */
  getState(): ChatEngineState {
    return {
      messages: [...this.messages],
      status: this.status,
      error: this.error
    };
  }

  /**
   * Subscribe to state updates
   * @returns Unsubscribe function
   */
  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Send a text message and process the streaming response
   */
  async sendMessage(text: string): Promise<void> {
    // Create user message
    const userMessage: ChatMessage = {
      id: this.generateId(),
      role: 'user',
      parts: [{ type: 'text', content: text, format: 'plain' }],
      status: 'success',
      createdAt: Date.now()
    };

    this.messages.push(userMessage);
    this.emitUpdate();

    // Create assistant message placeholder
    const assistantMessage: ChatMessage = {
      id: this.generateId(),
      role: 'assistant',
      parts: [],
      status: 'streaming',
      createdAt: Date.now()
    };

    this.messages.push(assistantMessage);
    this.currentMessage = assistantMessage;
    this.status = 'streaming';
    this.error = undefined;
    this.emitUpdate();

    // Process stream
    try {
      await this.processStream();
      assistantMessage.status = 'success';
      this.status = 'success';
    } catch (err) {
      assistantMessage.status = 'error';
      this.status = 'error';
      this.error = err instanceof Error ? err.message : String(err);
    } finally {
      this.currentMessage = null;
      this.emitUpdate();
    }
  }

  /**
   * Abort current streaming
   */
  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.transport.abort?.();
  }

  /**
   * Process streaming response from transport
   */
  private async processStream(): Promise<void> {
    this.abortController = new AbortController();

    for await (const part of this.transport.send(this.messages)) {
      if (this.abortController.signal.aborted) {
        throw new Error('Aborted by user');
      }

      this.handleStreamPart(part);
    }
  }

  /**
   * Handle individual stream part
   */
  private handleStreamPart(part: StreamPart): void {
    if (!this.currentMessage) return;

    switch (part.type) {
      case 'text':
        this.handleTextPart(part);
        break;

      case 'tool-call':
        this.handleToolCallPart(part);
        break;

      case 'ui':
        this.handleUIPart(part);
        break;

      case 'reasoning':
        this.handleReasoningPart(part);
        break;

      case 'done':
        // Stream completed
        break;

      case 'error':
        throw new Error(part.error);
    }

    this.emitUpdate();
  }

  /**
   * Handle text stream part - incrementally update last text part or create new one
   */
  private handleTextPart(part: StreamPart & { type: 'text' }): void {
    if (!this.currentMessage) return;

    const lastPart = this.currentMessage.parts[this.currentMessage.parts.length - 1];

    // If last part is text, append to it (incremental update)
    if (lastPart && lastPart.type === 'text') {
      lastPart.content += part.content;
    } else {
      // Otherwise create new text part
      this.currentMessage.parts.push({
        type: 'text',
        content: part.content,
        format: part.format || 'markdown'
      });
    }
  }

  /**
   * Handle tool call part
   */
  private handleToolCallPart(part: StreamPart & { type: 'tool-call' }): void {
    if (!this.currentMessage) return;

    this.currentMessage.parts.push({
      type: 'tool-call',
      toolCallId: part.toolCallId || this.generateId(),
      toolName: part.toolName,
      args: part.args,
      state: 'input-available'
    });
  }

  /**
   * Handle UI part
   */
  private handleUIPart(part: StreamPart & { type: 'ui' }): void {
    if (!this.currentMessage) return;

    this.currentMessage.parts.push({
      type: 'ui',
      component: part.component,
      props: part.props
    });
  }

  /**
   * Handle reasoning part
   */
  private handleReasoningPart(part: StreamPart & { type: 'reasoning' }): void {
    if (!this.currentMessage) return;

    this.currentMessage.parts.push({
      type: 'reasoning',
      content: part.content
    });
  }

  /**
   * Emit state update to all listeners
   */
  private emitUpdate(): void {
    const state = this.getState();
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (err) {
        console.error('Error in state listener:', err);
      }
    });
  }

  /**
   * Generate unique ID using configured generator
   */
  private generateId(): string {
    return this.idGenerator();
  }
}
