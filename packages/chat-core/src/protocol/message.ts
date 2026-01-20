import { nanoid } from 'nanoid'

/**
 * Message protocol types for Incremark Chat-UI
 * Based on Vercel AI SDK & TanStack AI's parts-based message structure
 *
 * Extensibility: Users can extend MessagePart via module augmentation:
 * ```ts
 * declare module '@incremark/chat-core' {
 *   interface CustomParts {
 *     'my-custom': { type: 'my-custom'; data: string };
 *   }
 * }
 * ```
 */

// ============================================================================
// Base Types
// ============================================================================

/**
 * Supported message roles
 */
export type MessageRole = 'user' | 'assistant' | 'system' | 'agent';

/**
 * Message status during lifecycle
 */
export type MessageStatus = 'pending' | 'streaming' | 'success' | 'error';

// ============================================================================
// Part Types
// ============================================================================

/**
 * Base part interface - all parts must have a type
 */
export interface BasePart {
  type: string;
}

/**
 * Text content part
 */
export interface TextPart extends BasePart {
  type: 'text';
  content: string;
  format?: 'markdown' | 'plain';
}

/**
 * Tool call state - 用户可自定义任意状态
 * 提供预定义常量供参考，但不限制用户使用其他值
 */
export type ToolCallState = string;

/**
 * 预定义的工具调用状态常量（参考 Vercel AI SDK）
 * 用户可以使用这些常量，也可以使用自定义状态
 */
export const TOOL_CALL_STATES = {
  INPUT_STREAMING: 'input-streaming',
  INPUT_AVAILABLE: 'input-available',
  APPROVAL_REQUESTED: 'approval-requested',
  APPROVAL_RESPONDED: 'approval-responded',
  EXECUTING: 'executing',
  OUTPUT_AVAILABLE: 'output-available',
  OUTPUT_ERROR: 'output-error',
  OUTPUT_DENIED: 'output-denied'
} as const;

/**
 * Tool call part (when AI wants to use a tool)
 */
export interface ToolCallPart extends BasePart {
  type: 'tool-call';
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  state: ToolCallState;
  /** 工具执行结果 */
  output?: unknown;
  /** 错误信息（当 state 为 output-error 时） */
  error?: string;
}

/**
 * Source reference type
 */
export type SourceType = 'url' | 'document';

/**
 * Source part (reference to external content)
 */
export interface SourcePart extends BasePart {
  type: 'source';
  sourceId: string;
  sourceType: SourceType;
  url?: string;
  title?: string;
  /** 文档类型（当 sourceType 为 document 时） */
  mediaType?: string;
}

/**
 * File part (generated or uploaded file)
 */
export interface FilePart extends BasePart {
  type: 'file';
  fileId: string;
  /** base64 编码的文件内容或 URL */
  data: string;
  mediaType: string;
  filename?: string;
}

/**
 * UI component part (for A2UI - Agent to UI)
 */
export interface UIPart extends BasePart {
  type: 'ui';
  component: string;
  props: Record<string, unknown>;
}

/**
 * Reasoning/thought part (for chain-of-thought display)
 */
export interface ReasoningPart extends BasePart {
  type: 'reasoning';
  content: string;
  /** 推理状态 */
  status?: 'thinking' | 'completed' | 'error';
  /** 思考开始时间（毫秒时间戳） */
  startTime?: number;
  /** 思考结束时间（毫秒时间戳） */
  endTime?: number;
  /** 思考标题 */
  title?: string;
}

// ============================================================================
// Extensibility Support
// ============================================================================

/**
 * Built-in parts registry
 */
export interface BuiltinParts {
  text: TextPart;
  'tool-call': ToolCallPart;
  source: SourcePart;
  file: FilePart;
  ui: UIPart;
  reasoning: ReasoningPart;
}

/**
 * Custom parts registry - extend via module augmentation
 * @example
 * ```ts
 * declare module '@incremark/chat-core' {
 *   interface CustomParts {
 *     'weather-card': { type: 'weather-card'; city: string; temp: number };
 *   }
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CustomParts {}

/**
 * All registered parts
 */
export type PartsRegistry = BuiltinParts & CustomParts;

/**
 * Union type for all message parts (built-in + custom)
 */
export type MessagePart = PartsRegistry[keyof PartsRegistry];

/**
 * Get part type by name
 */
export type PartByType<T extends keyof PartsRegistry> = PartsRegistry[T];

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Generic type guard for any part type
 */
export function isPartType<T extends keyof PartsRegistry>(
  part: MessagePart,
  type: T
): part is PartsRegistry[T] {
  return part.type === type;
}

/**
 * Type guard for TextPart
 */
export function isTextPart(part: MessagePart): part is TextPart {
  return part.type === 'text';
}

/**
 * Type guard for ToolCallPart
 */
export function isToolCallPart(part: MessagePart): part is ToolCallPart {
  return part.type === 'tool-call';
}

/**
 * Type guard for SourcePart
 */
export function isSourcePart(part: MessagePart): part is SourcePart {
  return part.type === 'source';
}

/**
 * Type guard for FilePart
 */
export function isFilePart(part: MessagePart): part is FilePart {
  return part.type === 'file';
}

/**
 * Type guard for UIPart
 */
export function isUIPart(part: MessagePart): part is UIPart {
  return part.type === 'ui';
}

/**
 * Type guard for ReasoningPart
 */
export function isReasoningPart(part: MessagePart): part is ReasoningPart {
  return part.type === 'reasoning';
}

// ============================================================================
// Message Types
// ============================================================================

/**
 * Complete message structure
 */
export interface ChatMessage {
  id: string;
  role: MessageRole;
  parts: MessagePart[];
  status: MessageStatus;
  createdAt: number;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a new text message
 */
export function createTextMessage(
  role: MessageRole,
  content: string,
  format: 'markdown' | 'plain' = 'markdown'
): ChatMessage {
  return {
    id: generateId(),
    role,
    parts: [{ type: 'text', content, format }],
    status: 'success',
    createdAt: Date.now()
  };
}

/**
 * Create a new empty streaming message
 */
export function createStreamingMessage(role: 'assistant' | 'agent'): ChatMessage {
  return {
    id: generateId(),
    role,
    parts: [],
    status: 'streaming',
    createdAt: Date.now()
  };
}

/**
 * Simple ID generator (can be replaced with more sophisticated one)
 */
function generateId(): string {
  return `msg-${Date.now()}-${nanoid()}`;
}
