/**
 * Engine module exports
 */

// Legacy (keep for backward compat)
export { ChatEngine, defaultIDGenerator } from './chat-engine.js';
export type { StateListener } from './chat-engine.js';

// New API
export { createChatEngine } from './create-chat-engine.js';
export type {
  ChatEngine as ChatEngineInterface,
  ChatEngineConfig,
  ChatEngineState,
  EngineError,
  EngineErrorType,
  EngineStatus,
  EngineEventMap,
  EngineEventHandler,
  StreamProcessor,
  ProcessorActions,
  SendOptions,
  IDGenerator,
} from './types.js';
