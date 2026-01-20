/**
 * 组件导出入口
 */

// SvgIcon
export { SvgIcon } from './svg-icon';

// Chain of Thought
export { ChainOfThought, ChainOfThoughtStep } from './chain-of-thought';
export type {
  ChainOfThoughtProps,
  ChainOfThoughtStepProps,
  StepStatus
} from './chain-of-thought';

// Text Message
export { TextMessage } from './text-message';
export type { TextMessageProps } from './text-message';

// Reasoning Message
export { ReasoningMessage } from './reasoning-message';
export type { ReasoningMessageProps } from './reasoning-message';

// Part Renderer
export { PartRenderer } from './message-renderer';
export type { PartRendererProps, PartRendererRegistry, CodeBlockConfig } from './message-renderer';

// Tool Call
export { ToolCall } from './tool-call';
export type { ToolCallProps, ToolRendererProps, ToolRendererRegistry, OutputRendererProps, OutputRendererRegistry, StateLabels, StateCategories } from './tool-call';

// Source Reference
export { SourceReference } from './source-reference';
export type { SourceReferenceProps } from './source-reference';

// File Preview
export { FilePreview } from './file-preview';
export type { FilePreviewProps } from './file-preview';

// Message Bubble
export { MessageBubble } from './message-bubble';
export type { MessageBubbleProps } from './message-bubble';

// Message Actions
export {
  MessageActions,
  MessageAction,
  MessageActionCopy,
  MessageActionFeedback,
  useCopyAction
} from './message-actions';
export type {
  MessageActionsProps,
  MessageActionProps,
  MessageActionCopyProps,
  MessageActionFeedbackProps,
  FeedbackValue,
  UseCopyActionOptions,
  UseCopyActionReturn
} from './message-actions';

// Base Components
export { ImButton, ImTooltip } from './base';
export type { ImButtonProps, ImTooltipProps } from './base';

// Sender
export {
  Sender,
  SenderInput,
  SenderActionButton,
  SenderSubmitButton,
  useSender
} from './sender';
export type {
  SenderProps,
  SenderEmits,
  SenderMessage,
  SenderAttachment,
  SenderSubmitType,
  SenderContext,
  SenderInputProps,
  SenderInputEmits,
  SenderSubmitButtonProps,
  SenderActionButtonProps
} from './sender';

// Suggestion
export { Suggestion, SuggestionItem } from './suggestion';
export type { SuggestionProps, SuggestionItem as SuggestionItemType } from './suggestion';

// ErrorMessage
export { ErrorMessage } from './error-message';
export type { ErrorMessageProps, ErrorType } from './error-message';

// Welcome
export { Welcome } from './welcome';
export type { WelcomeProps } from './welcome';
