import type { ChatMessage } from '../protocol/message.js';
import type { StreamPart } from '../protocol/transport.js';

// ============================================================================
// Engine State
// ============================================================================

export type EngineStatus = 'idle' | 'streaming' | 'error';

export interface ChatEngineState {
  messages: readonly ChatMessage[];
  status: EngineStatus;
  error?: string;
}

// ============================================================================
// Error Types
// ============================================================================

export type EngineErrorType = 'abort' | 'network' | 'stream';

export interface EngineError {
  type: EngineErrorType;
  original: unknown;
  message: string;
}

// ============================================================================
// Stream Processor
// ============================================================================

export interface ProcessorActions {
  replaceMessageId(oldId: string, newId: string): void;
  updateMessage(id: string, updater: (msg: ChatMessage) => void): void;
  removeMessages(predicate: (msg: ChatMessage) => boolean): void;
  getMessages(): readonly ChatMessage[];
  emit(hookName: string, payload: unknown): void;
}

export interface StreamProcessor {
  name: string;
  process(event: StreamPart, actions: ProcessorActions): StreamPart | null;
}

// ============================================================================
// Event Hooks
// ============================================================================

export type EngineEventMap = {
  stateChange: ChatEngineState;
  error: EngineError;
  done: void;
  'unknown-event': StreamPart;
};

export type EngineEventHandler<K extends keyof EngineEventMap> =
  EngineEventMap[K] extends void ? () => void : (payload: EngineEventMap[K]) => void;

// ============================================================================
// Engine Config
// ============================================================================

export type IDGenerator = () => string;

export interface ChatEngineConfig {
  transport: import('../protocol/transport.js').ChatTransport;
  processors?: StreamProcessor[];
  initialMessages?: ChatMessage[];
  idGenerator?: IDGenerator;
}

// ============================================================================
// Engine Interface
// ============================================================================

export interface ChatEngine {
  getState(): ChatEngineState;
  subscribe(listener: (state: ChatEngineState) => void): () => void;
  send(text: string, options?: SendOptions): Promise<void>;
  abort(): void;
  replaceMessageId(oldId: string, newId: string): void;
  updateMessage(id: string, updater: (msg: ChatMessage) => void): void;
  removeMessages(predicate: (msg: ChatMessage) => boolean): void;
  on<K extends keyof EngineEventMap>(event: K, handler: EngineEventHandler<K>): () => void;
}

export interface SendOptions {
  targetMessageId?: string;
  metadata?: Record<string, unknown>;
}
